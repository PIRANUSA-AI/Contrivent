import ScrollSequence from './ScrollSequence';
import Scout from './Scout';
import Forge from './Forge';
import Orchestrate from './Orchestrate';
import { storyCrossfade, storySegments, storyTransitions } from '../content';
import { segmentRanges, type Range } from '../lib/timeline';

const ranges = segmentRanges(storySegments);
const rangeOf = (name: string) => ranges.find((range) => range.name === name)!;

/**
 * Scout → transition → Forge → transition → Orchestrate on a single pinned canvas.
 * Every act, transition label, and HUD element is layered above the frames.
 */
export default function Story() {
  return (
    <ScrollSequence segments={storySegments} crossfade={storyCrossfade} anchorPad={0.06} className="story">
      <Scout range={rangeOf('scout')} />
      <Transition range={rangeOf('transition-1')} />
      <Forge range={rangeOf('forge')} />
      <Transition range={rangeOf('transition-2')} />
      <Orchestrate range={rangeOf('orchestrate')} />

      <div className="story__rail" aria-hidden="true">
        {ranges
          .filter((range) => range.id)
          .map((range, i) => (
            <span key={range.name} className="rail-tick" data-from={range.start} data-to={range.end}>
              {String(i + 1).padStart(2, '0')} {range.name}
            </span>
          ))}
      </div>
      <span className="story__progress" aria-hidden="true">
        <span />
      </span>
    </ScrollSequence>
  );
}

function Transition({ range }: { range: Range }) {
  const copy = storyTransitions[range.name];
  if (!copy) return null;

  return (
    <div className="transition" data-from={range.start} data-to={range.end} aria-hidden="true">
      <p className="transition__route">
        <span>{copy.from}</span>
        <span className="transition__line">
          <span />
        </span>
        <span>{copy.to}</span>
      </p>
      <p className="transition__status">
        <span className="blink" /> {copy.status}
      </p>
    </div>
  );
}
