import { useEffect, useRef } from 'react';
import { manifesto } from '../content';
import { gsap } from '../lib/scroll';

let inEmphasis = false;
const words = manifesto.split(' ').map((raw) => {
  if (raw.startsWith('*')) inEmphasis = true;
  const word = { text: raw.replace(/\*/g, ''), emphasis: inEmphasis };
  if (/\*[.,!?;:]*$/.test(raw)) inEmphasis = false;
  return word;
});

export default function Manifesto() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto__word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section manifesto" ref={rootRef}>
      <p className="mono-label">
        <span className="dot" /> What we do
      </p>
      <p className="manifesto__text">
        {words.map((word, i) =>
          word.emphasis ? (
            <em className="manifesto__word" key={i}>
              {word.text}
            </em>
          ) : (
            <span className="manifesto__word" key={i}>
              {word.text}
            </span>
          ),
        )}
      </p>
    </section>
  );
}
