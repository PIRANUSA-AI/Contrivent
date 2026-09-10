import { useEffect, useRef } from 'react';
import heroVideo from '../assets/hero-loop.mp4';
import heroPoster from '../assets/hero-poster.webp';
import { bindScrollProgress } from '../lib/progress';
import { gsap, prefersReducedMotion } from '../lib/scroll';

const WORDMARK = 'Contrivent';

export default function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const unbind = bindScrollProgress(section);

    // hero-loop.mp4 is hero.mp4 played forward then reversed, so a plain loop gives play → reverse → play.
    video.muted = true;
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !prefersReducedMotion) video.play().catch(() => undefined);
      else video.pause();
    });
    visibility.observe(section);

    return () => {
      unbind();
      visibility.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!ready || prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
        .from('.hero__char', { yPercent: 115, rotate: 6, duration: 1.6, stagger: 0.05 })
        .from('.hero__reveal', { y: 28, opacity: 0, duration: 1.2, stagger: 0.12 }, '-=1.1');
    }, sectionRef);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="home" ref={sectionRef} className="hero-section">
      <div className="hero-section__stage">
        <video
          ref={videoRef}
          className="hero__video"
          src={heroVideo}
          poster={heroPoster}
          muted
          loop
          playsInline
          preload="auto"
          data-hero-video
          aria-hidden="true"
        />
        <div className="hero__shade" aria-hidden="true" />

        <div className="hero">
          {/* Scroll-driven transforms live on the layers; intro animations on their children. */}
          <div className="hero__layer hero__layer--word">
            <h1 className="hero__word" aria-label={WORDMARK}>
              {WORDMARK.split('').map((char, i) => (
                <span className="hero__clip" key={i} aria-hidden="true">
                  <span className="hero__char">{char}</span>
                </span>
              ))}
            </h1>
          </div>

          <div className="hero__layer hero__layer--sides">
            <div className="hero__side hero__side--left hero__reveal">
              <p className="hero__eyebrow">
                AI that works
                <br />
                with you
              </p>
              <span className="rule" />
            </div>
            <div className="hero__side hero__side--right hero__reveal">
              <span className="rule rule--muted" />
              <p>
                Turn ideas into progress.
                <br />
                <em>Together.</em>
              </p>
            </div>
          </div>

          <div className="hero__layer hero__layer--hud">
            <div className="hero__hud hero__hud--left hero__reveal">
              <span className="blink" /> Systems online
            </div>
            <div className="hero__cue hero__reveal">
              <span>Scroll to initialize</span>
              <span className="hero__cue-line" />
            </div>
            <div className="hero__hud hero__hud--right hero__reveal">Scout · Forge · Orchestrate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
