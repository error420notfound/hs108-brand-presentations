# HS108 Brand Work Showcase and Handover System

**Feature paper · Revised concept and technical specification**  
**29 September 2026 · Working definition**

## 1. Product thesis

HS108 will publish identity-led work as an editorial web presentation that also serves as a usable brand handover. A single project supplies the initial content. From that project, the system composes three deliberate editions: a 15-page public sales showcase, a 20-page standard client handover, and a 30-page full implementation guide.

Each edition has a distinct job. The public edition demonstrates the quality and business relevance of the work to a prospective client. The handover editions explain the system, codify rules, and provide approved assets. All three share a project source, component vocabulary, responsive grid, and presentation engine. They do **not** have to share identical copy, every image, or an identical final page.

The interface is a guided presentation on desktop, with one composed frame visible at a time and no ordinary page scroll at the supported presentation size. On mobile, the same page sequence becomes a readable portrait composition with vertical scrolling inside pages where content needs room. Users can advance pages, navigate sections, pause motion, and inspect media. Presentation mode can request browser fullscreen, while the book remains functional in a normal tab.

## 2. Initial scope and future catalogue

### Initial release: one project

The first release stores one example project locally in the Astro repository. It is the only source for all three editions. Project data includes story, visual assets, media, brand tokens, asset manifest, page selections, and project-specific fonts. There is no catalogue API, database, project picker, or general CMS in this phase.

The code should nevertheless accept a project object keyed by a stable `projectId`. Routes and presentation manifests should derive from that object, so a later catalogue can supply more projects without rewriting the renderer. Avoid pretending the catalogue exists now or hard-coding a network fetch to a nonexistent endpoint.

### Later release: catalogue-backed work

A future catalogue can index multiple projects, metadata, media references, and edition availability. The content adapter can then load a chosen project at build time from a database or CMS. The template and runtime should consume the same validated project contract used for the first local example. Public showcases and client handovers may have different publishing and access requirements even when they refer to the same project.

## 3. Three editions

| Edition | Audience and primary use | Narrative emphasis | Final action |
|---|---|---|---|
| **15 pages** | Public website and sales conversations | Outcome, strategic signal, strongest applications, proof of range | Contact or selected services |
| **20 pages** | Standard client handover | Identity explanation, selected applications, essential rules | Final asset hub |
| **30 pages** | Full client handover across teams and vendors | Detailed rules, touchpoints, production and implementation guidance | Asset hub and implementation notes |

The 15-page public version is a conversion tool. It does not expose exhaustive technical tables, client downloads, or internal production notes. Its pages should each answer why this project demonstrates work HS108 can produce for a similar client.

The two client editions use a deeper narrative and include practical rules. They can reuse media and core story material from the public edition while changing captions or explanations to suit their audience. Their asset downloads must be served only through an appropriately protected delivery route when the work is confidential; hiding a button in a publicly deployed static page does not protect the underlying file.

### 3.1 Core story spine

The page library supports: cover; premise; context or challenge; distilled strategic direction; brand idea; controlled identity reveal; logo system; logo behaviour; colour; typography; optional graphic language; applications; optional digital expression; optional system in motion; and closing or handover. A project chooses the modules that fit its actual work.

### 3.2 Exact 15-page website sequence

| # | Page | Purpose |
|---:|---|---|
| 1 | Cover | Project, category, concise proposition. |
| 2 | Brand premise | What the brand needed to become. |
| 3 | Challenge / opportunity | Commercial or perceptual problem, only at useful depth. |
| 4 | Brand idea | Central thought connecting strategy to expression. |
| 5 | Identity reveal | Controlled GSAP logo reveal. |
| 6 | Identity overview | Primary identity, supporting system, and character. |
| 7 | Colour and type snapshot | Recognizable system in one composed frame. |
| 8 | Application: hero | Strongest use and its business purpose. |
| 9 | Application: contrast | Show range in a different context. |
| 10 | Application: system | Show consistency across a set. |
| 11 | Application: detail | Demonstrate quality at close range. |
| 12 | Application: environment | Show the work operating in a real touchpoint. |
| 13 | Digital / motion highlight | A digital screen, interaction, film, or motion result if relevant. |
| 14 | System depth / making | Selective sketch, construction, or governing principle as proof of rigor. |
| 15 | Closing CTA | Outcome statement, HS108 credit, relevant contact and services links. |

Pages 8–12 are purpose-specific slots, not a mandate for five generic mockups. A project can choose the strongest evidence for each slot. If a particular medium is absent, use another application with a distinct point.

### 3.3 Exact 20-page handover sequence

Pages 1–14 follow the public story spine with client-appropriate text and media. **Page 15 becomes an identity recap and bridge into usage rules**, replacing the public CTA. Then:

| # | Page | Purpose |
|---:|---|---|
| 16 | Logo variants and lockups | Approved forms and where each belongs. |
| 17 | Logo usage rules | Clear space, minimum size, permitted and incorrect use. |
| 18 | Full colour palette | Roles, HEX, Display P3, CMYK and copy controls where values are approved. |
| 19 | Typography hierarchy | Styles, specimens, source links and licensing notes. |
| 20 | Handover hub | Downloadable final package, copyable tokens, usage notes, credits and version. |

### 3.4 Exact 30-page full handover sequence

Pages 1–14 carry the same project story with client-appropriate text. Page 15 again becomes an identity recap and transition. Then:

| # | Page | Purpose |
|---:|---|---|
| 16 | Logo architecture and variants | Family relationships and lockups. |
| 17 | Logo clearance and scaling | Construction, spacing and minimum sizes. |
| 18 | Logo misuse | Clear, labelled counterexamples. |
| 19 | Primary palette | Core roles and approved values. |
| 20 | Extended palette and technical values | Extended colors, formats and reproduction guidance. |
| 21 | Typography hierarchy | Type roles, weights and scale. |
| 22 | Typography in use | Editorial compositions and real examples. |
| 23 | Graphic devices | Patterns, iconography or illustrative language, as applicable. |
| 24 | Image art direction | Subject, crop, lighting, treatment and exclusions. |
| 25 | Layout and composition | Grid, proportion, density and spacing principles. |
| 26 | Packaging system | Hierarchy and variant logic where relevant. |
| 27 | Print and physical use | Specifications and representative applications. |
| 28 | Digital expression | Website, product UI or digital implementation guidance. |
| 29 | Motion system | Principles, timing and examples. |
| 30 | Handover hub | Assets, implementation notes, vendor guidance, credits and version. |

If a project genuinely lacks a named medium, replace that slot with a relevant optional module while keeping the agreed edition length. The page count is an editorial constraint, not a reason to invent work.

### 3.5 Optional modules

Naming rationale; brand architecture; verbal identity; illustration and icons; photography; packaging hierarchy; spatial and signage systems; digital UI; launch campaign; motion principles; and production/vendor specifications. Modules have inclusion rules, audience permissions, page templates, and content requirements. An editor chooses them per project and edition.

## 4. Layout system: one source, responsive compositions

The supplied layout sheet shows seven related grid variants in desktop landscape and phone portrait. They include a narrow rail beside a dominant image, a top band above media, a dominant full-frame field, and two- or three-panel galleries. The phone equivalents rearrange these into a vertical sequence: accent or header first, followed by one or more image fields, with a lower accent or footer where relevant.

These should become **layout variants**, each with named content regions rather than fixed pixel positions:

| Variant | Desktop composition | Mobile composition |
|---|---|---|
| Split field | Narrow information or colour rail + large visual field | Rail becomes header or introductory band; visual follows. |
| Header field | Wide header band above large visual | Header remains first; visual gains readable height. |
| Framed image | Large visual with small top/bottom rules | Same hierarchy as stacked bands and image. |
| Double gallery | Two equal image fields beneath a band | Two full-width image fields in sequence. |
| Triple gallery | Three equal image fields beneath a band | Three full-width fields in sequence. |
| Pure comparison | Two fields without ornamental copy | Two stacked, clearly labelled fields. |
| Full field | Single dominant visual with restrained annotation | Single image or crop with annotation placed safely inside reading flow. |

A page references a variant and supplies semantic slots such as `intro`, `hero`, `secondary`, `caption`, `footer`, and `controls`. CSS Grid maps those slots across widths. Content order in the HTML must already make sense on mobile and to screen readers; CSS only changes its visual arrangement. Use image focal points and optional art-directed mobile crops where an automatic crop would remove the subject.

Desktop frames use the available viewport and reserve space for controls. A defined minimum supported presentation viewport prevents type from becoming tiny. Below that threshold, the frame may reflow or permit contained scrolling. On mobile, vertical page content can scroll naturally; advancing to the next page should not unexpectedly fire while the viewer is scrolling within the current one.

### Safe areas and viewport behavior

Set `viewport-fit=cover` and use CSS `env(safe-area-inset-top/right/bottom/left)` in addition to deliberate design margins for controls and text. Account for the notch or Dynamic Island, home indicator, browser bars, landscape orientation, and virtual keyboard. Use dynamic viewport units (`dvh`) carefully and test real browser chrome changes. Keep navigation and pause controls above the lower safe area and away from full-bleed media hotspots. Do not rely on fullscreen being available on a particular mobile browser.

## 5. Interaction and motion

### Navigation controls

Provide visible previous and next controls, a page counter, section index, play/pause control for active animation or video, and an optional “Present” control. Desktop also supports keyboard arrows, Home/End where appropriate, Escape for overlays, and browser back/forward. Mobile provides large touch targets and clear swipes only where they do not compete with vertical reading or a gallery gesture. Deep links should identify `project + edition + pageId`, not merely a fragile numeric position.

### Playback model

The presentation controller owns current page, transition state, media state and requested fullscreen state. Navigation interrupts or finishes the current transition deterministically; rapid repeated inputs must not stack timelines. Pausing freezes controllable GSAP timelines and supported Lottie/video playback. The player should distinguish “pause animation” from “pause all media” in accessible labels, and avoid autoplay with sound. A page with no active motion can hide or disable pause.

### Motion direction

The default frame should feel editorial: considered typography, generous pacing, precise captions and calm image treatment. GSAP can reveal the logo, sequence grid entries, animate a bento expansion on hover or click, and transition between pages. Clicking a visual can open a fullscreen inspection overlay with appropriate zoom or detail. Lottie/dotLottie carries authored vector animation, while video handles photographic or more complex motion. CSS handles simple states. Respect reduced-motion preferences; provide a static final state or restrained crossfade.

Transitions must preserve the viewer’s mental map. Use a small family of named transitions (`cut`, `fade`, `slide`, `reveal`) with restrained durations. Avoid autoplay progression by default: the viewer or presenter controls pacing. Lazy-load media beyond the near pages and prefetch the next page’s critical image to make navigation feel immediate.

## 6. Content and data architecture

The project is the source; the editions are **curated manifests** selecting pages, copy variants and capabilities. This avoids maintaining three unrelated documents and prevents public pages from accidentally importing private asset data.

```ts
type EditionId = 'web15' | 'client20' | 'client30';
type Audience = 'public' | 'client';

type PageDefinition = {
  id: string;
  template: string;
  layout: string;
  sourceKeys: string[];
  audience: Audience[];
  transition?: 'cut' | 'fade' | 'slide' | 'reveal';
  media?: { autoplay?: boolean; loop?: boolean; controls?: boolean };
};

type EditionManifest = {
  id: EditionId;
  audience: Audience;
  title: string;
  pages: PageDefinition[];
};

type Project = {
  id: string;
  slug: string;
  metadata: { name: string; category: string; proposition: string };
  theme: { fontDisplay: string; fontBody: string; tokens: Record<string, string> };
  content: Record<string, unknown>;
  media: Record<string, MediaAsset>;
  colorRefs: ColorReference[];
  editions: Record<EditionId, EditionManifest>;
};
```

Build validation checks 15/20/30 page counts, unique IDs, valid layout variants, available media, required alt text, color references, and that public manifests cannot reach client-only content. `sourceKeys` are conceptual; the final implementation should use a typed schema for page content instead of unrestricted `unknown` in production.

### Chroma catalogue color source

The project’s color data should originate from the user’s [`chroma-catalogue` repository](https://github.com/error420notfound/chroma-catalogue). In the initial build, use an explicit versioned snapshot or a pinned source revision and map it into the presentation’s validated `ColorReference` contract. Do not pull an uncontrolled `main` branch during every build. The provided repository URL could not be inspected in this environment, so its exact directory structure and schema are **unverified**. Implement the adapter against the repository’s actual files after inspection; do not invent field names or assume CMYK values exist.

Keep semantic palette roles and per-project selections in the showcase project, referencing canonical catalogue IDs where the catalogue supports them. HEX and Display P3 can be displayed and copied when supplied or reliably derived under an explicit conversion policy. **CMYK is production data**: store the approved profile, conversion conditions and validated values; do not present a generic RGB-to-CMYK calculation as a print specification. Color buttons should announce what was copied and offer sensible fallbacks where clipboard access is unavailable.

### Fonts

Fonts vary by project. Store display/body family names, weights, specimens, source URLs and license notes in project configuration. Use Google Fonts for eligible typefaces initially, loading only the weights and subsets each book needs and including a fallback stack. Download links in client handover must point to legitimate sources or licensed packages; Google Fonts usage does not imply every future project font is distributable.

### Assets

Each media item records type, source, caption, alt text, aspect ratio, focal point, rights and optional mobile crop. Public and client assets use separate build inputs and output paths. Logo files for handover include meaningful filenames, version metadata and intended uses. Asset links should reference actual packaged files, with checks during build so the final hub cannot point to missing downloads.

## 7. Technology map

| Responsibility | Proposed technology | How it is used |
|---|---|---|
| Site and routes | Astro with its Vite build pipeline | Generate edition routes and static HTML from the initial project. |
| Narrative authoring | MDX + Astro content collections | Write story pages and place approved editorial components; validate metadata. |
| Project contracts | TypeScript + schema validation | Validate project, edition manifests, page templates, media and colors at build time. |
| Layout | CSS Grid, custom properties, container/media queries | Implement the seven compositional variants and responsive reflow. |
| Fonts | Google Fonts initially | Load a project-specific, licensed type selection and fallback. |
| Image delivery | Astro image tools and SVG assets | Responsive images, optimized formats, focal crops and scalable logo rules. |
| Presentation state | Small TypeScript controller | Page navigation, history, controls, overlays, fullscreen and playback. |
| Choreography | GSAP | Page transitions, logo reveal, staged grids, interaction timelines. |
| Authored vector motion | dotLottie/Lottie player | Play, pause and reset suitable motion assets. |
| Film | Native HTML video | Playback, poster, captions and accessible controls. |
| Fullscreen | Browser Fullscreen API | User-triggered presentation and inspection where supported. |
| Color source | Pinned Chroma data adapter | Resolve selected catalogue entries and approved output values. |
| Delivery | Static hosting for public work; protected hosting for private handovers | Publish according to the audience and access requirements. |
| Verification | Build checks + focused browser tests | Validate edition length, access boundaries, breakpoints, controls and overflow. |

React is unnecessary for the first renderer if the presentation controller remains contained. A hydrated island is justified later for complex interactive specimens or a browser-based authoring interface. A CMS or database joins the architecture when the work catalogue and publishing workflow actually require one.

## 8. Routes, publishing and access

Possible public route: `/work/{projectSlug}/`. Possible client routes: `/handover/{projectSlug}/standard/` and `/handover/{projectSlug}/full/`. Each edition exposes stable page IDs in the URL, for example a route segment or hash, allowing direct links and browser history. Build only the approved editions for each release.

A static site is appropriate for the public version. An unlisted link alone does not secure client assets. For the client versions, use authenticated delivery or a protected host if confidential files or rules are included. The public deployment must not contain private packages anywhere in its output, even if its UI never links to them. This separation should be checked in the build pipeline.

## 9. Production workflow

1. Configure the single project’s identity, fonts, media, tokens and approved Chroma references.
2. Write core narrative content in MDX and structured page data.
3. Curate the 15-page sales manifest; edit each page for the desired commercial signal.
4. Adapt the shared story for client use; add the 20-page rules and final handover hub.
5. Add the expanded 30-page modules and production guidance where the project warrants them.
6. Review every desktop variant and its phone portrait counterpart against the attached layout grammar.
7. Check safe areas, browser zoom, reduced motion, keyboard navigation, media pause, links and asset integrity.
8. Publish public and protected outputs to their respective destinations.
9. Record edition versions and the pinned Chroma revision used for each build.

## 10. Initial deliverable and acceptance criteria

The first deliverable demonstrates one real or approved example project with all three curated editions. It includes the seven responsive layout variants, page navigation, user-triggered presentation mode, page transitions, one controlled identity reveal, at least one interactive gallery/inspection view, one playable motion asset, color copying, project-specific Google Fonts, and a client download hub with actual files in an appropriately protected build.

It passes review when:

- manifests contain exactly 15, 20 and 30 pages with stable IDs;
- public output has no client-only assets or download URLs;
- desktop target viewports have no clipped essential content or unintended page scroll;
- portrait phones preserve reading order and keep controls clear of safe areas;
- next/previous, pause/play, fullscreen fallback and browser history behave predictably;
- reduced motion shows all essential content;
- copied values match the approved, pinned source data;
- every client download resolves and every font source/licence is recorded.

## 11. Design decisions to validate in the prototype

**Fixed pages versus long content.** The desktop composition should stay readable. If a rule cannot fit, choose a denser template, split it into a separate page slot, or permit a contained detail view. Never scale body copy to poster-caption size simply to preserve no-scroll behavior.

**Shared story versus audience edits.** Reuse source material and assets, but allow edition-specific copy and curated sequences. The 15-page CTA is replaced by a recap in client editions, whose final page is the handover hub.

**Motion controls.** Treat navigation and playback as explicit product controls with visible state. Keep hover interactions available on touch through click or tap, and do not let a paused page trap navigation.

**Catalog integration.** Keep the color adapter small and versioned. The broader work catalogue is future scope; it should not delay shipping one excellent project.

## 12. Suggested repository shape

```text
hs108-brand-presentations/
├── src/
│   ├── content.config.ts
│   ├── projects/
│   │   └── example-project/
│   │       ├── project.ts
│   │       ├── editions.ts
│   │       ├── story/*.mdx
│   │       ├── media.ts
│   │       ├── colors.ts
│   │       └── assets/
│   ├── adapters/chroma.ts
│   ├── schemas/
│   ├── components/pages/
│   ├── components/blocks/
│   ├── components/controls/
│   ├── layouts/
│   ├── styles/
│   ├── scripts/presentation-controller.ts
│   └── pages/
├── scripts/validate-editions.ts
└── tests/
```

The final file boundaries may change during implementation. The important boundary is between the project source, the three curated manifests, the layout renderer, and the playback/navigation controller.

## Appendix — Primary technical references

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [GSAP documentation](https://gsap.com/docs/v3/)
- [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [dotLottie web player](https://docs.lottiefiles.com/en/runtimes/distributions/js)
- [Chroma catalogue repository supplied for this project](https://github.com/error420notfound/chroma-catalogue) — schema pending inspection
