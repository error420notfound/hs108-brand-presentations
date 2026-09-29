import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname, resolve, sep } from 'node:path';
import { catalogueProject, type EditionId } from '../src/lib/catalogue.ts';

const edition = (process.argv[2] || 'web15') as EditionId;
if (!['web15', 'client20', 'client30'].includes(edition)) throw new Error(`Unknown edition: ${edition}`);
const audience = edition === 'web15' ? 'public' : 'client';
const root = resolve(process.cwd());
const catalogueRoot = resolve(root, 'vendor/hs108-brand-catalogue');
const stage = resolve(root, '.build-assets', edition);
if (!stage.startsWith(root + sep)) throw new Error('Asset stage path escapes the workspace');
rmSync(stage, { recursive: true, force: true });

for (const asset of catalogueProject.assets.filter((item) => item.audience.includes(audience))) {
  const source = resolve(catalogueRoot, asset.path);
  if (!source.startsWith(catalogueRoot + sep)) throw new Error(`Asset escapes catalogue: ${asset.path}`);
  const kind = asset.path.includes('/assets/client/') ? 'client' : 'public';
  if (audience === 'public' && kind === 'client') throw new Error(`Client asset in public stage: ${asset.id}`);
  const destination = resolve(stage, 'assets', kind, basename(asset.path));
  if (!destination.startsWith(stage + sep)) throw new Error(`Asset escapes stage: ${asset.id}`);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}

console.log(`Prepared ${audience} assets for ${edition}`);
