import { useEffect, useState } from 'react';
import { isMusicOn, startMusic, subscribeMusic, toggleMusic } from '../lib/audio';

/**
 * Fixed music toggle, bottom right. The track tries to start on load;
 * where the browser blocks that, the first gesture does (see lib/audio.ts).
 * The animated bars double as the "is it playing?" indicator.
 */
export default function Music() {
  const [playing, setPlaying] = useState(isMusicOn());

  useEffect(() => {
    startMusic();
    return subscribeMusic(setPlaying);
  }, []);

  return (
    <button
      type="button"
      className={`music${playing ? ' is-playing' : ''}`}
      aria-pressed={playing}
      aria-label={playing ? 'Mute music' : 'Play music'}
      title={playing ? 'Music on · click to mute' : 'Music off · click to play'}
      onClick={() => toggleMusic()}
    >
      <span className="music__bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="music__label">{playing ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
