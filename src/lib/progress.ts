import { ScrollTrigger } from './scroll';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Maps a tall section's scroll (top of section at top of viewport → bottom at bottom) to 0-1 and exposes it to CSS:
 * - `--p` on the section
 * - `--local` (0-1 within its range) and `.is-active` on descendants with `data-from` / `data-to`
 * - descendants that also have `data-count` show a number counting up to that value across their range
 * Pinning itself is done with CSS `position: sticky`. Returns a cleanup.
 */
export function bindScrollProgress(section: HTMLElement, onProgress?: (p: number) => void) {
  const markers = Array.from(section.querySelectorAll<HTMLElement>('[data-from]')).map((el) => ({
    el,
    from: Number(el.dataset.from),
    to: Number(el.dataset.to ?? 1),
    count: el.dataset.count === undefined ? null : Number(el.dataset.count),
    shown: '',
  }));

  const apply = (p: number) => {
    section.style.setProperty('--p', p.toFixed(4));
    for (const marker of markers) {
      const local = clamp01((p - marker.from) / (marker.to - marker.from));
      marker.el.style.setProperty('--local', local.toFixed(4));
      marker.el.classList.toggle('is-active', p >= marker.from && p <= marker.to);
      if (marker.count !== null) {
        const text = Math.round(local * marker.count).toLocaleString('en-US');
        if (text !== marker.shown) marker.el.textContent = marker.shown = text;
      }
    }
    onProgress?.(p);
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => apply(self.progress),
    onRefresh: (self) => apply(self.progress),
  });

  return () => trigger.kill();
}
