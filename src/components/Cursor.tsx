import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/scroll';

const INTERACTIVE = 'a, button, label, select, [role="button"]';
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]';

/** HUD cursor: a dot on the pointer and a bracket frame that trails it. Mouse / trackpad only. */
export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!root || !ring || !dot || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const html = document.documentElement;
    html.classList.add('has-cursor');

    const follow = prefersReducedMotion ? 1 : 0.2;
    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let started = false;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!started) {
        ringX = x;
        ringY = y;
        started = true;
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      root.classList.remove('is-hidden');

      const target = event.target instanceof Element ? event.target : null;
      root.classList.toggle('is-text', !!target?.closest(TEXT_FIELD));
      root.classList.toggle('is-hover', !!target?.closest(INTERACTIVE));
    };
    const onDown = () => root.classList.add('is-press');
    const onUp = () => root.classList.remove('is-press');
    const onLeave = () => root.classList.add('is-hidden');

    const loop = () => {
      ringX += (x - ringX) * follow;
      ringY += (y - ringY) * follow;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    html.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      html.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="cursor is-hidden" ref={rootRef} aria-hidden="true">
      <div className="cursor__ring" ref={ringRef}>
        <span className="cursor__frame" />
      </div>
      <div className="cursor__dot" ref={dotRef}>
        <span />
      </div>
    </div>
  );
}
