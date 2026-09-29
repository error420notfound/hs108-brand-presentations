import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { z } from 'zod';
import type { Project } from './catalogue.ts';

const colorSchema = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  oklch: z.object({ l: z.number(), c: z.number(), h: z.number(), alpha: z.number().optional() }),
  displayP3: z.object({ r: z.number(), g: z.number(), b: z.number(), alpha: z.number().optional() }).optional()
});
const scaleSchema = z.object({
  id: z.string(), type: z.literal('scale'), name: z.string(),
  steps: z.array(z.object({ step: z.number(), color: colorSchema })),
  referenceColors: z.array(z.object({ id: z.string(), label: z.string(), color: colorSchema })).optional()
});
const indexSchema = z.object({
  schemaVersion: z.number(), catalogue: z.string(),
  scales: z.object({ index: z.string(), count: z.number() })
});
const sectionSchema = z.object({
  catalogue: z.string(), version: z.number(),
  scales: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), file: z.string() }))
});
const pinSchema = z.object({ revision: z.string().regex(/^[0-9a-f]{40}$/) });

const root = resolve(process.cwd(), 'vendor/chroma-catalogue/data');
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));

function checkedPath(base: string, relative: string): string {
  const path = resolve(base, relative);
  if (!path.startsWith(base + sep)) throw new Error(`Chroma path escapes its directory: ${relative}`);
  return path;
}

export type ResolvedColor = {
  role: string;
  catalogueId: string;
  sourceLabel: string;
  hex: string;
  oklch: string;
  displayP3?: string;
  note: string;
};

export function chromaRevision(): string {
  const pin = pinSchema.parse(readJson(resolve(process.cwd(), 'vendor/hs108-brand-catalogue/src/chroma/pin.json')));
  return pin.revision;
}

export function resolveColors(project: Project): ResolvedColor[] {
  const rootIndex = indexSchema.parse(readJson(resolve(root, 'index.json')));
  const scalesDir = checkedPath(root, rootIndex.scales.index.replace(/^\.\//, ''));
  const section = sectionSchema.parse(readJson(scalesDir));
  const scaleBase = resolve(scalesDir, '..');
  const cache = new Map<string, z.infer<typeof scaleSchema>>();

  return project.colorRefs.map((reference) => {
    const entry = section.scales.find((item) => item.id === reference.catalogueId);
    if (!entry) throw new Error(`Missing Chroma scale ${reference.catalogueId}`);
    let scale = cache.get(entry.id);
    if (!scale) {
      scale = scaleSchema.parse(readJson(checkedPath(scaleBase, entry.file)));
      if (scale.id !== entry.id) throw new Error(`Chroma ID mismatch: ${entry.id}`);
      cache.set(entry.id, scale);
    }
    const selected = reference.step !== undefined
      ? scale.steps.find((item) => item.step === reference.step)
      : scale.referenceColors?.find((item) => item.id === reference.referenceColorId);
    if (!selected) throw new Error(`Missing Chroma value for ${reference.role}`);
    const color = selected.color;
    const label = reference.step !== undefined ? `${scale.name} ${reference.step}` : `${scale.name} ${'label' in selected ? selected.label : reference.referenceColorId}`;
    return {
      role: reference.role,
      catalogueId: reference.catalogueId,
      sourceLabel: label,
      hex: color.hex.toUpperCase(),
      oklch: `oklch(${color.oklch.l} ${color.oklch.c} ${color.oklch.h})`,
      displayP3: color.displayP3 ? `color(display-p3 ${color.displayP3.r} ${color.displayP3.g} ${color.displayP3.b})` : undefined,
      note: reference.note
    };
  });
}
