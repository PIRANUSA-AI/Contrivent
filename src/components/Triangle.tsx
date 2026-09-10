import { useEffect, useRef } from 'react';
import { triangle } from '../content';
import { bindScrollProgress } from '../lib/progress';

// Vertices in the SVG's 600×540 viewBox: top = Scout, bottom-right = Forge, bottom-left = Orchestrate.
const PATH = 'M300 40 L560 490 L40 490 Z';

/** The finale: the three acts connect into one triangle, then the payoff line appears in the middle. */
export default function Triangle() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    return bindScrollProgress(sectionRef.current);
  }, []);

  return (
    <section className="tri" ref={sectionRef} aria-label="How Contrivent works">
      <div className="tri__stage">
        <p className="mono-label mono-label--center">
          <span className="dot" /> The Contrivent triangle
        </p>

        <div className="tri__figure">
          <svg className="tri__svg" viewBox="0 0 600 540" aria-hidden="true">
            <defs>
              <linearGradient id="tri-stroke" gradientUnits="userSpaceOnUse" x1="300" y1="40" x2="300" y2="490">
                <stop offset="0" stopColor="#38d6e8" />
                <stop offset="1" stopColor="#4f8cff" />
              </linearGradient>
              <radialGradient id="tri-fill" gradientUnits="userSpaceOnUse" cx="300" cy="340" r="300">
                <stop offset="0" stopColor="#4f8cff" stopOpacity="0.22" />
                <stop offset="1" stopColor="#4f8cff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path className="tri__fill" d={PATH} />
            <path className="tri__guide" d={PATH} />
            <path className="tri__edge" d={PATH} pathLength={100} />
          </svg>

          {triangle.vertices.map((vertex) => (
            <div key={vertex.title} className={`tri__node tri__node--${vertex.position}`} data-from={vertex.from} data-to={1}>
              <span className="tri__dot" />
              <span className="tri__text">
                <span className="tri__num">{vertex.index}</span>
                <strong>{vertex.title}</strong>
                <em>{vertex.role}</em>
              </span>
            </div>
          ))}

          <p className="tri__center" data-from={triangle.center.from} data-to={1}>
            {triangle.center.lead}
            <em>{triangle.center.emphasis}</em>
          </p>
        </div>

        <p className="tri__outro" data-from={triangle.outro.from} data-to={1}>
          {triangle.outro.text}
        </p>
      </div>
    </section>
  );
}
