import { defineConfig } from 'astro/config';

const edition = process.env.PRESENTATION_EDITION || 'web15';
const githubPages = process.env.GITHUB_PAGES === 'true';
const base = githubPages ? '/hs108-brand-presentations' : '/';
if (!['web15', 'client20', 'client30'].includes(edition)) {
  throw new Error(`Unknown presentation edition: ${edition}`);
}

export default defineConfig({
  base,
  output: 'static',
  trailingSlash: 'always',
  publicDir: `./.build-assets/${edition}`,
  outDir: `./dist/${edition === 'web15' ? 'public' : edition}`,
  vite: {
    server: { fs: { allow: ['.'] } }
  }
});
