import type { CSSProperties, ReactNode } from 'react';
import type { ActContent } from '../content';
import { toGlobal, type Range } from '../lib/timeline';

/**
 * One chapter of the story, layered over its clip. Active only while its clip plays;
 * exposes the act's own 0-1 progress as `--a`.
 * Timeline inside the act: 0-0.16 giant title · 0.16-0.94 beats + instrument panel · fade out.
 */
export default function Act({ act, range, children }: { act: ActContent; range: Range; children: ReactNode }) {
  const g = toGlobal(range);

  return (
    <div
      className={`act act--${act.id}`}
      data-from={range.start}
      data-to={range.end}
      style={{ '--chars': act.title.length + 1 } as CSSProperties}
    >
      <header className="act__intro">
        <p className="mono-label mono-label--center">
          <span className="dot" /> {act.index} / 03 · {act.kicker}
        </p>
        <h2 className="act__title">
          {act.title}
          <span className="act__period">.</span>
        </h2>
        <p className="act__verb">
          <em>{act.verb}</em>
        </p>
      </header>

      <div className="act__tag">
        <span className="act__tag-index">{act.index}</span>
        <span className="act__tag-title">{act.title}</span>
        <span className="act__ticks" aria-hidden="true">
          {act.beats.map((beat) => (
            <span key={beat.label} className="rail-tick" data-from={g(beat.from)} data-to={g(beat.to)}>
              {beat.label}
            </span>
          ))}
        </span>
      </div>

      {act.beats.map((beat) => (
        <article key={beat.label} className="beat" data-from={g(beat.from)} data-to={g(beat.to)}>
          <p className="beat__label">{beat.label}</p>
          <p className="beat__text">{beat.text}</p>
        </article>
      ))}

      <div className="act__instrument panel corners">{children}</div>
    </div>
  );
}
