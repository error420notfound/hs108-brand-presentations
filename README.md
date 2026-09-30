# HS108 Brand Presentation System

An Astro presentation for **Vesper Tea**, a clearly marked fictional HS108 sample. The catalogue's structured project content and curated page manifests drive a conversion focused public showcase and two practical client handovers. The client builds are local deliverables; this repository does not configure public access to them.

## Versions and sources

| Dependency | Exact version / revision | Purpose |
| --- | --- | --- |
| Node.js LTS | `24.21.0` | Local build runtime |
| npm | `11.13.0` | Lockfile and scripts |
| Astro | `7.3.5` | Static routes, components, content collection |
| TypeScript | `5.9.3` | Typed adapters and controller |
| Zod | `4.6.5` | Catalogue and Chroma validation |
| GSAP | `3.15.0` | Interruptible presentation and inspection transitions |
| Bootstrap Icons | `1.13.1` | Individually imported viewer control icons |
| lottie-web | `5.13.0` | Playback of the authored vector reveal |
| tsx | `4.23.15` | Run validation and asset preparation scripts |
| @astrojs/check | `0.9.10` | Astro and TypeScript diagnostics |
| @types/node | `24.19.0` | Node script types |
| @playwright/test | `1.63.0` | Browser tooling for local checks |
| [HS108 catalogue](https://github.com/error420notfound/hs108-brand-catalogue) | `0c4562f789a00e2f737b51009389e6f4487996be` (local commit; publish before clean clone) | Project contract, content, pages, assets |
| [Chroma catalogue](https://github.com/error420notfound/chroma-catalogue) | `22b9004f8042737a484c909ba7fe678b0a7e8f27` | Palette values |

The public `web15` edition deploys to GitHub Pages on pushes to `main` and through manual workflow dispatch. The workflow publishes only `dist/public`; client handover outputs are not uploaded. The workflow adds `.nojekyll` so Astro's `_astro` asset directory is served. For this repository, the project site URL is `https://error420notfound.github.io/hs108-brand-presentations/` after Pages is enabled with **GitHub Actions** as its build source in repository Settings → Pages.

Both catalogues are Git submodules. `source-pins.json` records the required commits, and `npm run validate` fails if either checkout has drifted. Chroma's pinned data supplies HEX, OKLCH, and optional Display P3. It does not supply approved CMYK, so this presentation displays no inferred print values.

## Start locally

Use Node `24.21.0` and npm `11.13.0`.

```powershell
git clone --recurse-submodules https://github.com/error420notfound/hs108-brand-presentations.git
cd hs108-brand-presentations
npm.cmd ci
npm.cmd run dev
```

For an existing checkout:

```powershell
git submodule update --init --recursive
npm.cmd ci
npm.cmd run dev
```

On this Windows environment, Git's default Windows TLS backend failed with `SEC_E_NO_CREDENTIALS` during submodule fetch; `git -c http.sslBackend=openssl submodule update --init --recursive` succeeded. PowerShell script policy may also require `npm.cmd` instead of `npm`.

Open the public route at `/work/vesper-tea/web15/#web-cover`. The client development scripts are `npm.cmd run dev:client20` and `npm.cmd run dev:client30`, with matching routes. Each script serves one edition at a time.

## Builds and validation

```powershell
npm.cmd run check
npm.cmd run validate
npm.cmd run build
```

`build` writes three separate static outputs: `dist/public`, `dist/client20`, and `dist/client30`. Individual commands are `build:public`, `build:client20`, and `build:client30`; `preview:public`, `preview:client20`, and `preview:client30` serve an existing output locally. Never publish a client directory on an unprotected static host if it contains confidential work. A hidden link is not access control; use an authenticated delivery environment before distributing real client material.

The build validates the source contract, pinned commits, Chroma references, page IDs and exact edition counts (15/20/30), asset audience, and download paths. It then stages only assets allowed for that edition in `.build-assets/<edition>`. After each build it scans the public output for client asset paths, client-only filenames, and handover-only content, or checks that every client handover download exists and is linked. The structured catalogue content is exposed through an Astro content collection; MDX is unnecessary for this ID-addressed source.

## Viewer system and presentation behavior

`src/styles/tailwind.css` is the viewer's single active stylesheet. Tailwind theme tokens define the neutral interface, spacing and control states; shared `@apply` rules define the seven catalogue layouts, with local utility classes in components. Project colors and fonts remain in artwork, color values and type specimens. The layouts share a 12-column desktop grid with `clamp(10px, 1.25vw, 20px)` gutters and `clamp(20px, 3.2vw, 56px)` outer margins. Statement pages allocate four columns to the message and eight to evidence; gallery pages place the message above aligned media. Captions and technical details follow in a supporting row. Below 900px the layout reads vertically; below 600px media panels occupy the full width. Short windows scroll without clipping content.

Use the visible previous/next controls, Contents panel, page permalink, or Left/Right, Page Up/Down, Home/End keys. The URL fragment is a stable catalogue page ID, and Back/Forward restores page state. Motion is user started, pausable, and suppressed under reduced motion. The image inspection dialog has a visible close button and Escape support. Present uses the Fullscreen API after a click and falls back to an in-window mode if denied. The public and client outputs share templates and controls but have separate asset packages.

## Updating pinned sources

Review each upstream change and its schema before changing commits. From the repository root:

```powershell
git -C vendor/hs108-brand-catalogue fetch origin
git -C vendor/hs108-brand-catalogue checkout <reviewed-catalogue-commit>
git -C vendor/chroma-catalogue fetch origin
git -C vendor/chroma-catalogue checkout <reviewed-chroma-commit>
```

Update `source-pins.json`, the revisions above, and any typed adapters needed for the reviewed data. Then run `npm.cmd run validate`, `npm.cmd run check`, and `npm.cmd run build`. Commit both submodule pointers with those changes. Do not fetch a floating branch during build or runtime.

## Project structure

- `vendor/`: pinned, read-only catalogue and Chroma submodules.
- `src/lib/catalogue.ts`, `src/lib/chroma.ts`: typed source adapters.
- `src/content.config.ts`: Astro collection over the catalogue's structured content.
- `src/components/PageFrame.astro`, `StoryPage.astro`: responsive page grammar and content mapping.
- `src/components/ViewerIcon.astro`, `src/styles/tailwind.css`: individually imported icons and neutral viewer tokens.
- `src/scripts/presentation-controller.ts`: navigation, media, fullscreen, history, inspection.
- `scripts/prepare-assets.ts`, `scripts/validate.ts`: audience staging and build checks.

No deployment or publishing is included.
