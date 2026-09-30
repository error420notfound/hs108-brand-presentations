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
const presentation = book.querySelector<HTMLElement>('.presentation')!;
const transport = book.querySelector<HTMLElement>('.transport')!;
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
  goToAndPlay(frame: number, isFrame: boolean): void;
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
let motionVersion = 0;

function setControlLabel(button: HTMLButtonElement, label: string): void {
  button.querySelector<HTMLElement>('.control-label')!.textContent = label;
  button.setAttribute('aria-label', label);
  if (button === playToggle) button.classList.toggle('is-playing', label.startsWith('Pause'));
}

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
  motionVersion++;
  reveal?.kill();
  reveal = null;
  player?.destroy();
  player = null;
  playerLoading = null;
  playing = false;
  pages[index]?.querySelector<HTMLElement>('.motion-poster')?.removeAttribute('hidden');
  const container = pages[index]?.querySelector<HTMLElement>('.lottie-container');
  if (container) container.replaceChildren();
  playToggle.disabled = false;
  playToggle.removeAttribute('aria-busy');
  setControlLabel(playToggle, 'Play animation');
}

function closeSections(restoreFocus = false): void {
  if (sectionPanel.hidden) return;
  sectionPanel.hidden = true;
  sectionToggle.setAttribute('aria-expanded', 'false');
  presentation.inert = false;
  transport.inert = false;
  if (restoreFocus) sectionToggle.focus();
}

function openSections(): void {
  sectionPanel.hidden = false;
  sectionToggle.setAttribute('aria-expanded', 'true');
  presentation.inert = true;
  transport.inert = true;
  (sectionLinks.find((link) => link.getAttribute('aria-current') === 'page') ?? sectionClose).focus();
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
  if (index >= 0 && !book.classList.contains('is-presenting')) scrollPositions.set(pageIdAt(index), window.scrollY);
  transition?.kill();
  transition = null;
  stopMotion();
  for (const page of pages) {
    const targets = [page.querySelector('.slot-intro'), ...page.querySelectorAll('.media-panel, .hub-panel')].filter(Boolean);
    gsap.killTweensOf(targets);
    gsap.set(targets, { clearProps: 'opacity,visibility,transform' });
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

  const intro = page.querySelector<HTMLElement>('.slot-intro');
  const evidence = Array.from(page.querySelectorAll<HTMLElement>('.media-panel, .hub-panel'));
  if (!reducedMotion.matches) {
    transition = gsap.timeline({ onComplete: () => {
      gsap.set([intro, ...evidence].filter(Boolean), { clearProps: 'opacity,visibility,transform' });
      transition = null;
    } });
    if (intro) transition.fromTo(intro, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' });
    if (evidence.length) transition.fromTo(evidence, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.05, ease: 'power2.out' }, 0.07);
  }

  requestAnimationFrame(() => {
    if (book.classList.contains('is-presenting')) book.scrollTop = 0;
    else window.scrollTo(0, scrollPositions.get(pageIdAt(index)) ?? 0);
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
  const version = motionVersion;
  const video = page.querySelector<HTMLVideoElement>('video');
  if (video) {
    if (video.paused) {
      try { await video.play(); playing = true; }
      catch { announcement.textContent = 'Video playback is unavailable. Use the still image.'; return; }
    } else { video.pause(); playing = false; }
    setControlLabel(playToggle, playing ? 'Pause video' : 'Play video');
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
      playToggle.disabled = true;
      playToggle.setAttribute('aria-busy', 'true');
      playerLoading ??= (async () => {
        const [{ default: lottie }, response] = await Promise.all([import('lottie-web'), fetch(stage.dataset.lottieSrc!)]);
        if (!response.ok) throw new Error('Animation could not be loaded');
        const animationData = await response.json();
        if (version !== motionVersion || stage !== pages[index].querySelector('[data-motion-stage]')) throw new Error('Page changed');
        const item = lottie.loadAnimation({ container: stage.querySelector<HTMLElement>('.lottie-container')!, renderer: 'svg', loop: false, autoplay: false, animationData });
        item.addEventListener('complete', () => {
          if (version !== motionVersion) return;
          playing = false;
          setControlLabel(playToggle, 'Replay animation');
        });
        return item;
      })();
      const loading = playerLoading;
      let loaded: MotionPlayer;
      try { loaded = await loading; }
      catch {
        if (version === motionVersion) {
          announcement.textContent = 'Animation is unavailable. The still image remains visible.';
          if (playerLoading === loading) playerLoading = null;
          playToggle.disabled = false;
          playToggle.removeAttribute('aria-busy');
        }
        return;
      }
      if (version !== motionVersion) { loaded.destroy(); return; }
      player = loaded;
      playToggle.disabled = false;
      playToggle.removeAttribute('aria-busy');
      stage.querySelector<HTMLElement>('.motion-poster')?.setAttribute('hidden', '');
      reveal = gsap.timeline({ paused: true }).fromTo(stage.querySelector('.lottie-container'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: 'power2.out' });
    }
    if (playToggle.querySelector('.control-label')?.textContent === 'Replay animation') player.goToAndPlay(0, true);
    else player.play();
    reveal?.play();
    playing = true;
  }
  setControlLabel(playToggle, playing ? 'Pause animation' : 'Play animation');
}

function updateFullscreen(): void {
  const wasActive = book.classList.contains('is-presenting');
  const active = Boolean(document.fullscreenElement) || book.classList.contains('window-present');
  setControlLabel(fullscreenToggle, active ? 'Exit presentation' : 'Present');
  fullscreenToggle.setAttribute('aria-label', active ? 'Exit presentation mode' : 'Enter presentation mode');
  book.classList.toggle('is-presenting', active);
  if (active && !wasActive) pages[index]?.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
  else if (!active && wasActive) fullscreenToggle.focus({ preventScroll: true });
}

previous.addEventListener('click', () => showPage(index - 1));
next.addEventListener('click', () => showPage(index + 1));
sectionToggle.addEventListener('click', () => {
  if (sectionPanel.hidden) openSections();
  else closeSections(true);
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
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch { announcement.textContent = 'Could not exit fullscreen. Use Escape.'; } }
  else if (book.classList.contains('window-present')) book.classList.remove('window-present');
  else {
    try { if (!book.requestFullscreen) throw new Error('Fullscreen unavailable'); await book.requestFullscreen(); }
    catch { book.classList.add('window-present'); announcement.textContent = 'Presentation mode is open in this window.'; }
  }
  updateFullscreen();
});
document.addEventListener('fullscreenchange', updateFullscreen);
window.addEventListener('focus', updateFullscreen);

book.addEventListener('click', (event) => {
  const trigger = (event.target as Element).closest<HTMLElement>('[data-inspect-src]');
  if (!trigger) return;
  lastInspectorTrigger = trigger;
  inspectorImage.src = trigger.dataset.inspectSrc!;
  inspectorImage.alt = trigger.dataset.inspectAlt ?? '';
  inspectorCaption.textContent = trigger.dataset.inspectCaption ?? '';
  inspector.showModal();
  if (!reducedMotion.matches) gsap.fromTo(inspectorImage, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'power2.out' });
  book.querySelector<HTMLButtonElement>('#inspector-close')?.focus();
});
book.querySelector('#inspector-close')?.addEventListener('click', () => inspector.close());
inspector.addEventListener('close', () => { gsap.killTweensOf(inspectorImage); gsap.set(inspectorImage, { clearProps: 'opacity,visibility,transform' }); inspectorImage.removeAttribute('src'); lastInspectorTrigger?.focus(); });
inspector.addEventListener('click', (event) => { if (event.target === inspector) inspector.close(); });

book.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy-value]');
  if (!button) return;
  const value = button.dataset.copyValue!;
  try {
    await navigator.clipboard.writeText(value);
    announcement.textContent = `Copied ${value}`;
    const original = button.getAttribute('aria-label');
    button.setAttribute('aria-label', `Copied ${value}`);
    window.setTimeout(() => { if (original) button.setAttribute('aria-label', original); }, 1400);
  } catch { announcement.textContent = `Copy unavailable. Value: ${value}`; }
});

document.addEventListener('keydown', (event) => {
  if (inspector.open) return;
  if (!sectionPanel.hidden) {
    if (event.key === 'Escape') { event.preventDefault(); closeSections(true); }
    else if (event.key === 'Tab') {
      const focusables = [sectionClose, ...sectionLinks];
      const first = focusables[0];
      const last = focusables.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return;
  }
  if (event.key === 'Escape') {
    if (book.classList.contains('window-present')) { book.classList.remove('window-present'); updateFullscreen(); fullscreenToggle.focus(); }
    else if (document.fullscreenElement) {
      event.preventDefault();
      void document.exitFullscreen().catch(() => { announcement.textContent = 'Could not exit fullscreen. Use the Exit presentation button.'; }).finally(updateFullscreen);
    }
    else if (book.classList.contains('is-presenting')) window.setTimeout(updateFullscreen, 100);
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.target as Element).closest('button, a, input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); showPage(index + 1); }
  else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); showPage(index - 1); }
  else if (event.key === 'Home') { event.preventDefault(); showPage(0); }
  else if (event.key === 'End') { event.preventDefault(); showPage(pages.length - 1); }
});
window.addEventListener('popstate', () => showPage(indexFromHash(), 'none', false));
window.addEventListener('hashchange', () => { if (indexFromHash() !== index) showPage(indexFromHash(), 'none', false); });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    transition?.kill();
    transition = null;
    const page = pages[index];
    gsap.set([page.querySelector('.slot-intro'), ...page.querySelectorAll('.media-panel, .hub-panel')].filter(Boolean), { clearProps: 'opacity,visibility,transform' });
    stopMotion();
  }
  updateTransport();
});
history.scrollRestoration = 'manual';
showPage(indexFromHash(), 'replace', false);
