import { useEffect, useRef, useState } from 'react';

const MIN_DURATION = 1400;
/** Proceed once the hero video can play, even if it hasn't fully buffered. */
const GIVE_UP_AFTER = 6000;
/** Never keep visitors on the loader longer than this. */
const HARD_LIMIT = 12000;

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'gone'>('loading');
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>('video[data-hero-video]');
    const buffered = () => {
      if (!video || video.error || video.readyState >= 4) return 1;
      if (video.duration > 0 && video.buffered.length) return video.buffered.end(video.buffered.length - 1) / video.duration;
      return 0;
    };

    let shown = 0;
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const canPlay = !!video && video.readyState >= 2;
      const available = elapsed > HARD_LIMIT || (elapsed > GIVE_UP_AFTER && canPlay) ? 1 : buffered();
      const goal = Math.min(available, elapsed / MIN_DURATION);
      shown += (goal - shown) * 0.1;
      if (goal >= 1 && shown > 0.995) shown = 1;

      if (countRef.current) countRef.current.textContent = String(Math.floor(shown * 100)).padStart(3, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`;

      if (shown >= 1) {
        onDone();
        setPhase('leaving');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = setTimeout(() => setPhase('gone'), 1300);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div className={`preloader ${phase === 'leaving' ? 'is-leaving' : ''}`} role="status" aria-label="Loading Contrivent">
      <div className="preloader__corner preloader__corner--tl">
        <span>Contrivent</span>
        <span>Systems boot</span>
      </div>
      <div className="preloader__corner preloader__corner--tr">
        <span>Loading hero footage</span>
      </div>
      <div className="preloader__center">
        <span className="preloader__count" ref={countRef}>
          000
        </span>
        <span className="preloader__bar">
          <span ref={barRef} />
        </span>
      </div>
      <div className="preloader__corner preloader__corner--bl">
        <span>AI that works with you</span>
      </div>
      <div className="preloader__corner preloader__corner--br">
        <span>contrivent.com</span>
      </div>
    </div>
  );
}
