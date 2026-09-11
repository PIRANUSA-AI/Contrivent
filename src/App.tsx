import { useCallback, useEffect, useState } from 'react';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hud from './components/Hud';
import Music from './components/Music';
import Hero from './components/Hero';
import Divider from './components/Divider';
import Manifesto from './components/Manifesto';
import Story from './components/Story';
import Triangle from './components/Triangle';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { gsap, prefersReducedMotion, ScrollTrigger, scrollToTarget, setScrollLocked, startSmoothScroll } from './lib/scroll';

export default function App() {
  const [ready, setReady] = useState(false);
  const handleLoaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.fonts.ready.then(() => ScrollTrigger.refresh());

    // Route in-page anchor clicks through the smooth scroller.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute('href');
      if (event.defaultPrevented || !hash || hash.length < 2) return;
      event.preventDefault();
      scrollToTarget(hash);
    };
    document.addEventListener('click', onClick);

    const stopSmoothScroll = startSmoothScroll();
    return () => {
      document.removeEventListener('click', onClick);
      stopSmoothScroll();
    };
  }, []);

  useEffect(() => {
    setScrollLocked(!ready);
    if (!ready) return;
    ScrollTrigger.refresh();
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    });
    return () => ctx.revert();
  }, [ready]);

  return (
    <>
      <Preloader onDone={handleLoaded} />
      <Nav />
      <Hud />
      <main>
        <Hero ready={ready} />
        <Divider />
        <Manifesto />
        <Divider />
        <Story />
        <Divider />
        <Triangle />
        <About />
        <Divider />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
      <Music />
      <Cursor />
    </>
  );
}
