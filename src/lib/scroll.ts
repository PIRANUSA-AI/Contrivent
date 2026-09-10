import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Softens decorative animation (intros, reveals, video autoplay). Smooth scrolling stays on regardless. */
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

/**
 * Inertia scrolling: every wheel/trackpad scroll glides and eases to a stop instead of halting.
 * Driven by GSAP's ticker so ScrollTrigger stays in sync. Returns a cleanup.
 */
export function startSmoothScroll() {
  if (lenis) return () => {};

  const instance = new Lenis({
    smoothWheel: true,
    // Lower = longer glide before it settles.
    lerp: 0.07,
    wheelMultiplier: 0.9,
  });
  lenis = instance;
  if (document.documentElement.classList.contains('is-locked')) instance.stop();

  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

export function setScrollLocked(locked: boolean) {
  document.documentElement.classList.toggle('is-locked', locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export function scrollToTarget(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.8 });
  else target.scrollIntoView({ behavior: 'smooth' });
}

export { gsap, ScrollTrigger };
