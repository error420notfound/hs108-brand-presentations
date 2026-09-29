import { gsap } from 'gsap';

const book = document.querySelector<HTMLElement>('[data-presentation-controller]')!;

const pages = Array.from(book.querySelectorAll<HTMLElement>('[data-page-id]')).filter((node) => node.classList.contains('story-page'));
const previous = book.querySelector<HTMLButtonElement>('[data-nav="previous"]')!;
const next = book.querySelector<HTMLButtonElement>('[data-nav="next"]')!;
const counter = book.querySelector<HTMLElement>('#page-counter')!;
const currentSection = book.querySelector<HTMLElement>('#current-section')!;
const permalink = book.querySelector<HTMLAnchorElement>('#page-permalink')!;
const sectionToggle = book.querySelector<HTMLButtonElement>('#section-toggle')!;
const sectionClose = book.querySelector<HTMLButtonElement>('#section-close')!;
const sectionPanel = book.querySelector<HTMLElement>('#section-panel')!;
const sectionLinks = Array.from(sectionPanel.querySelectorAll<HTMLAnchorElement>('[data-page-link]'));
const playToggle = book.querySelector<HTMLButtonElement>('#play-toggle')!;
const fullscreenToggle = book.querySelector<HTMLButtonElement>('#fullscreen-toggle')!;
const inspector = book.querySelector<HTMLDialogElement>('#image-inspector')!;
const inspectorImage = book.querySelector<HTMLImageElement>('#inspector-image')!;
const inspectorCaption = book.querySelector<HTMLElement>('#inspector-caption')!;
const announcement = book.querySelector<HTMLElement>('#interaction-announcement')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollPositions = new Map<string, number>();

type MotionPlayer = {
  play(): void;
  pause(): void;
  destroy(): void;
  addEventListener(name: 'complete', callback: () => void): void;
};

let index = -1;
let transition: gsap.core.Timeline | null = null;
let reveal: gsap.core.Timeline | null = null;
let player: MotionPlayer | null = null;
let playerLoading: Promise<MotionPlayer> | null = null;
let playing = false;
let lastInspectorTrigger: HTMLElement | null = null;

function pageIdAt(position: number): string {
  return pages[position]?.dataset.pageId ?? pages[0].dataset.pageId!;
}

function indexFromHash(): number {
  let hash = '';
  try { hash = decodeURIComponent(location.hash.slice(1)); } catch { /* Ignore malformed fragments. */ }
  const found = pages.findIndex((page) => page.dataset.pageId === hash);
  return found < 0 ? Math.max(index, 0) : found;
}

function stopMotion(): void {
  reveal?.kill();
  reveal = null;
  player?.destroy();
  player = null;
  playerLoading = null;
  playing = false;
  pages[index]?.querySelector<HTMLElement>('.motion-poster')?.removeAttribute('hidden');
  const container = pages[index]?.querySelector<HTMLElement>('.lottie-container');
  if (container) container.replaceChildren();
  playToggle.textContent = 'Play animation';
  playToggle.setAttribute('aria-label', 'Play animation');
}

function closeSections(restoreFocus = false): void {
  if (sectionPanel.hidden) return;
  sectionPanel.hidden = true;
  sectionToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) sectionToggle.focus();
}

function updateTransport(): void {
  const page = pages[index];
  previous.disabled = index <= 0;
  next.disabled = index >= pages.length - 1;
  counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(pages.length).padStart(2, '0')}`;
  currentSection.textContent = page.dataset.section ?? '';
  permalink.href = `#${encodeURIComponent(pageIdAt(index))}`;
  const hasMotion = Boolean(page.querySelector('[data-motion-stage], video'));
  playToggle.hidden = !hasMotion || reducedMotion.matches;
  for (const link of sectionLinks) {
    if (link.dataset.pageId === pageIdAt(index)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function showPage(position: number, historyMode: 'push' | 'replace' | 'none' = 'push', focus = true): void {
  const target = Math.max(0, Math.min(position, pages.length - 1));
  if (target === index && historyMode === 'push') return;
  if (index >= 0) scrollPositions.set(pageIdAt(index), window.scrollY);
  transition?.kill();
  transition = null;
  stopMotion();
  for (const page of pages) {
    gsap.killTweensOf(page);
    gsap.set(page, { clearProps: 'opacity,visibility,transform' });
    page.hidden = true;
  }
  index = target;
  const page = pages[index];
  page.hidden = false;
  updateTransport();
  closeSections();

  const hash = `#${encodeURIComponent(pageIdAt(index))}`;
  if (historyMode === 'push') history.pushState({ pageId: pageIdAt(index) }, '', hash);
  else if (historyMode === 'replace') history.replaceState({ pageId: pageIdAt(index) }, '', hash);

  const gallery = Array.from(page.querySelectorAll<HTMLElement>('.gallery-entry'));
  gsap.set(gallery, { clearProps: 'opacity,visibility,transform' });
  if (!reducedMotion.matches) {
    transition = gsap.timeline({ onComplete: () => {
      gsap.set(page, { clearProps: 'opacity,visibility,transform' });
      gsap.set(gallery, { clearProps: 'opacity,visibility,transform' });
      transition = null;
    } });
    transition.fromTo(page, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.44, ease: 'power2.out' });
    if (gallery.length > 1) transition.fromTo(gallery, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, 0.12);
  }

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPositions.get(pageIdAt(index)) ?? 0);
    if (focus) {
      const heading = page.querySelector<HTMLElement>('h1, h2');
      heading?.focus({ preventScroll: true });
    }
  });
  const upcoming = pages[index + 1];
  upcoming?.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; });
}

async function togglePlayback(): Promise<void> {
  const page = pages[index];
  const video = page.querySelector<HTMLVideoElement>('video');
  if (video) {
    if (video.paused) { await video.play(); playing = true; } else { video.pause(); playing = false; }
    playToggle.textContent = playing ? 'Pause video' : 'Play video';
    playToggle.setAttribute('aria-label', playToggle.textContent);
    return;
  }
  const stage = page.querySelector<HTMLElement>('[data-motion-stage]');
  if (!stage || reducedMotion.matches) return;
  if (playing) {
    player?.pause();
    reveal?.pause();
    playing = false;
  } else {
    if (!player) {
      playerLoading ??= (async () => {
        const [{ default: lottie }, response] = await Promise.all([import('lottie-web'), fetch(stage.dataset.lottieSrc!)]);
        if (!response.ok) throw new Error('Animation could not be loaded');
        const animationData = await response.json();
        if (stage !== pages[index].querySelector('[data-motion-stage]')) throw new Error('Page changed');
        const item = lottie.loadAnimation({ container: stage.querySelector<HTMLElement>('.lottie-container')!, renderer: 'svg', loop: false, autoplay: false, animationData });
        item.addEventListener('complete', () => {
          playing = false;
          playToggle.textContent = 'Replay animation';
          playToggle.setAttribute('aria-label', 'Replay animation');
        });
        return item;
      })();
      try { player = await playerLoading; }
      catch {
        announcement.textContent = 'Animation is unavailable. The still image remains visible.';
        playerLoading = null;
        return;
      }
      stage.querySelector<HTMLElement>('.motion-poster')?.setAttribute('hidden', '');
      reveal = gsap.timeline({ paused: true }).fromTo(stage.querySelector('.lottie-container'), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
    }
    player.play();
    reveal?.play();
    playing = true;
  }
  playToggle.textContent = playing ? 'Pause animation' : 'Play animation';
  playToggle.setAttribute('aria-label', playToggle.textContent);
}

function updateFullscreen(): void {
  const active = Boolean(document.fullscreenElement) || book.classList.contains('window-present');
  fullscreenToggle.textContent = active ? 'Exit presentation' : 'Present';
  fullscreenToggle.setAttribute('aria-label', active ? 'Exit presentation mode' : 'Enter presentation mode');
}

previous.addEventListener('click', () => showPage(index - 1));
next.addEventListener('click', () => showPage(index + 1));
sectionToggle.addEventListener('click', () => {
  sectionPanel.hidden = !sectionPanel.hidden;
  sectionToggle.setAttribute('aria-expanded', String(!sectionPanel.hidden));
  if (!sectionPanel.hidden) sectionLinks[0]?.focus();
});
sectionClose.addEventListener('click', () => closeSections(true));
sectionPanel.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('[data-page-link]');
  if (!link) return;
  event.preventDefault();
  showPage(pages.findIndex((page) => page.dataset.pageId === link.dataset.pageId));
});
playToggle.addEventListener('click', () => { void togglePlayback(); });
fullscreenToggle.addEventListener('click', async () => {
  if (document.fullscreenElement) await document.exitFullscreen();
  else if (book.classList.contains('window-present')) book.classList.remove('window-present');
  else {
    try { await book.requestFullscreen(); }
    catch { book.classList.add('window-present'); announcement.textContent = 'Presentation mode is open in this window.'; }
  }
  updateFullscreen();
});
document.addEventListener('fullscreenchange', updateFullscreen);

book.addEventListener('click', (event) => {
  const trigger = (event.target as Element).closest<HTMLElement>('[data-inspect-src]');
  if (!trigger) return;
  lastInspectorTrigger = trigger;
  inspectorImage.src = trigger.dataset.inspectSrc!;
  inspectorImage.alt = trigger.dataset.inspectAlt ?? '';
  inspectorCaption.textContent = trigger.dataset.inspectCaption ?? '';
  inspector.showModal();
  if (!reducedMotion.matches) gsap.fromTo(inspectorImage, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.32, ease: 'power2.out' });
  book.querySelector<HTMLButtonElement>('#inspector-close')?.focus();
});
book.querySelector('#inspector-close')?.addEventListener('click', () => inspector.close());
inspector.addEventListener('close', () => { inspectorImage.removeAttribute('src'); lastInspectorTrigger?.focus(); });
inspector.addEventListener('click', (event) => { if (event.target === inspector) inspector.close(); });

book.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy-value]');
  if (!button) return;
  const value = button.dataset.copyValue!;
  try {
    await navigator.clipboard.writeText(value);
    announcement.textContent = `Copied ${value}`;
    const original = button.textContent;
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = original; }, 1400);
  } catch { announcement.textContent = `Copy unavailable. Value: ${value}`; }
});

document.addEventListener('keydown', (event) => {
  if (inspector.open) return;
  if (event.key === 'Escape') {
    if (!sectionPanel.hidden) closeSections(true);
    else if (book.classList.contains('window-present')) { book.classList.remove('window-present'); updateFullscreen(); }
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as Element).tagName)) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); showPage(index + 1); }
  else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); showPage(index - 1); }
  else if (event.key === 'Home') { event.preventDefault(); showPage(0); }
  else if (event.key === 'End') { event.preventDefault(); showPage(pages.length - 1); }
});
window.addEventListener('popstate', () => showPage(indexFromHash(), 'none', false));
window.addEventListener('hashchange', () => { if (indexFromHash() !== index) showPage(indexFromHash(), 'none', false); });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { transition?.kill(); stopMotion(); }
  updateTransport();
});
history.scrollRestoration = 'manual';
showPage(indexFromHash(), 'replace', false);
