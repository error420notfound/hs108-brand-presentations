import { defineCollection } from 'astro:content';
import { contentSchema } from '../vendor/hs108-brand-catalogue/src/contract.ts';
import { catalogueProject } from './lib/catalogue.ts';

// The catalogue remains the authoring source. Astro validates and indexes its blocks.
const story = defineCollection({
  loader: async () => catalogueProject.content.map((block) => ({ ...block })),
  schema: contentSchema
});

export const collections = { story };
