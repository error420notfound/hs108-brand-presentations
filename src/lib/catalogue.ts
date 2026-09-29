import { project, projectSchema } from '../../vendor/hs108-brand-catalogue/src/index.ts';
import type { Asset, ContentBlock, Edition, Page, Project } from '../../vendor/hs108-brand-catalogue/src/contract.ts';

export type EditionId = 'web15' | 'client20' | 'client30';
export type { Asset, ContentBlock, Edition, Page, Project };

export const catalogueProject: Project = projectSchema.parse(project);

export function getEdition(id: EditionId): Edition {
  return catalogueProject.editions[id];
}

export function assetUrl(asset: Asset): string {
  const fragment = asset.path.split('/assets/')[1];
  if (!fragment || fragment.includes('..')) throw new Error(`Invalid asset path: ${asset.path}`);
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/assets/${fragment}`;
}

export function getAsset(id: string, audience: 'public' | 'client'): Asset {
  const asset = catalogueProject.assets.find((item) => item.id === id);
  if (!asset || !asset.audience.includes(audience)) throw new Error(`Asset ${id} is unavailable to ${audience}`);
  return asset;
}

export function getContent(id: string, audience: 'public' | 'client'): ContentBlock {
  const block = catalogueProject.content.find((item) => item.id === id);
  if (!block || !block.audience.includes(audience)) throw new Error(`Content ${id} is unavailable to ${audience}`);
  return block;
}
