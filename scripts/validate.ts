import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { z } from 'zod';
import { catalogueProject, assetUrl, type EditionId } from '../src/lib/catalogue.ts';
import { chromaRevision, resolveColors } from '../src/lib/chroma.ts';

const root = resolve(process.cwd());
const pins = z.object({ catalogue: z.string().regex(/^[0-9a-f]{40}$/), chroma: z.string().regex(/^[0-9a-f]{40}$/) })
  .parse(JSON.parse(readFileSync(join(root, 'source-pins.json'), 'utf8')));
const failures: string[] = [];
const fail = (message: string) => failures.push(message);
const checkUnique = (ids: string[], label: string) => {
  if (new Set(ids).size !== ids.length) fail(`Duplicate ${label} ID`);
};

for (const [name, expected] of Object.entries(pins)) {
  const local = join(root, 'vendor', name === 'catalogue' ? 'hs108-brand-catalogue' : 'chroma-catalogue');
  const actual = execFileSync('git', ['-C', local, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (actual !== expected) fail(`${name} submodule is ${actual}, expected ${expected}`);
}
if (chromaRevision() !== pins.chroma) fail('Catalogue Chroma pin differs from the checked-out Chroma submodule');

const project = catalogueProject;
checkUnique(project.content.map((item) => item.id), 'content');
checkUnique(project.assets.map((item) => item.id), 'asset');
checkUnique(project.colorRefs.map((item) => item.role), 'color role');
const content = new Map(project.content.map((item) => [item.id, item]));
const assets = new Map(project.assets.map((item) => [item.id, item]));
const colors = resolveColors(project);
if (colors.length !== project.colorRefs.length) fail('Unresolved project palette');

for (const asset of project.assets) {
  const path = resolve(root, 'vendor/hs108-brand-catalogue', asset.path);
  const catalogueRoot = resolve(root, 'vendor/hs108-brand-catalogue');
  if (!path.startsWith(catalogueRoot + sep) || !existsSync(path)) fail(`Missing or unsafe asset ${asset.id}`);
  if (!asset.alt.trim()) fail(`Missing alt text for ${asset.id}`);
  if (asset.path.includes('/assets/client/') && asset.audience.includes('public')) fail(`Client asset marked public: ${asset.id}`);
  if (asset.download && !asset.audience.includes('client')) fail(`Public download marked client: ${asset.id}`);
  if (asset.motion && !assets.has(asset.motion.posterAssetId)) fail(`Missing poster for ${asset.id}`);
}

for (const block of project.content) {
  for (const id of block.assetIds) {
    const asset = assets.get(id);
    if (!asset) fail(`Content ${block.id} references missing asset ${id}`);
    else for (const audience of block.audience) if (!asset.audience.includes(audience)) fail(`Content ${block.id} leaks ${id} to ${audience}`);
  }
  for (const role of block.colorRoles) if (!colors.some((item) => item.role === role)) fail(`Unknown color role ${role}`);
}

const expectedCounts: Record<EditionId, number> = { web15: 15, client20: 20, client30: 30 };
const allPageIds: string[] = [];
for (const editionId of Object.keys(expectedCounts) as EditionId[]) {
  const edition = project.editions[editionId];
  if (edition.pages.length !== expectedCounts[editionId]) fail(`${editionId}: expected ${expectedCounts[editionId]} pages`);
  checkUnique(edition.pages.map((page) => page.id), `${editionId} page`);
  allPageIds.push(...edition.pages.map((page) => page.id));
  if (edition.pages[14]?.template !== (editionId === 'web15' ? 'closing-cta' : 'identity-recap')) fail(`${editionId}: wrong page 15`);
  if (editionId !== 'web15' && edition.pages.at(-1)?.template !== 'handover-hub') fail(`${editionId}: missing final handover hub`);
  for (const page of edition.pages) {
    if (!page.audience.includes(edition.audience)) fail(`${page.id}: wrong audience`);
    for (const ref of page.contentRefs) {
      const block = content.get(ref);
      if (!block || !block.audience.includes(edition.audience)) fail(`${page.id}: invalid content ${ref}`);
    }
  }
}
checkUnique(allPageIds, 'global page');

function* files(path: string): Generator<string> {
  for (const entry of readdirSync(path)) {
    const child = join(path, entry);
    if (statSync(child).isDirectory()) yield* files(child);
    else yield child;
  }
}

const outputArg = process.argv.indexOf('--output');
if (outputArg >= 0) {
  const edition = process.argv[outputArg + 1] as EditionId;
  if (!expectedCounts[edition]) fail(`Unknown output edition ${edition}`);
  else {
    const outRoot = resolve(root, 'dist', edition === 'web15' ? 'public' : edition);
    if (!existsSync(outRoot)) fail(`Output does not exist: ${outRoot}`);
    else if (edition === 'web15') {
      const forbidden = [
        '/assets/client/',
        ...project.assets.filter((asset) => !asset.audience.includes('public')).map((asset) => basename(asset.path)),
        ...project.content.filter((block) => !block.audience.includes('public')).map((block) => block.title)
      ];
      for (const path of files(outRoot)) {
        if (path.includes(`${sep}assets${sep}client${sep}`)) fail(`Client asset in public output: ${path}`);
        if (/\.(html|js|css|json|md|svg|txt|xml)$/i.test(path)) {
          const text = readFileSync(path, 'utf8');
          for (const token of forbidden) if (text.includes(token)) fail(`Public output references client-only content ${token} in ${path}`);
        }
      }
    } else {
      for (const asset of project.assets.filter((item) => item.download)) {
        const path = resolve(outRoot, assetUrl(asset).slice(1));
        if (!path.startsWith(outRoot + sep) || !existsSync(path)) fail(`Missing handover download: ${asset.id}`);
      }
      const html = readFileSync(resolve(outRoot, 'work', project.slug, edition, 'index.html'), 'utf8');
      for (const asset of project.assets.filter((item) => item.download)) {
        if (!html.includes(assetUrl(asset))) fail(`Handover hub omits download: ${asset.id}`);
      }
    }
  }
}

if (failures.length) {
  for (const message of failures) console.error(`Validation: ${message}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${project.metadata.name}: 15/20/30 pages, ${colors.length} Chroma colors, ${project.assets.length} assets${outputArg >= 0 ? ', output boundaries' : ''}.`);
}
