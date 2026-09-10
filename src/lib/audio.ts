// Site-wide background music: one looping track at a fixed low volume.
//
// Browsers block audible autoplay until the visitor interacts with the page
// (Chrome/Safari autoplay policy), so this tries to start immediately and,
// when that is refused, retries on the very first gesture. The visitor's
// mute choice is remembered, so someone who turns it off is not re-forced
// the music on the next visit.

import musicUrl from '../assets/neon-pulse.mp3';

/** Default level. 0.35 linear still reads loud on a heavily mastered track,
 * so this sits near "quiet background music"; tweak one number to taste. */
export const MUSIC_VOLUME = 0.15;

const STORAGE_KEY = 'contrivent-music';
const FADE_MS = 1200;
const GESTURES = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;

type Listener = (playing: boolean) => void;

let audio: HTMLAudioElement | null = null;
let started = false;
let playing = false;
let wantOn = true;
let fadeTimer = 0;
const listeners = new Set<Listener>();

function readStoredPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true; // private mode / blocked storage: keep the default
  }
}

function storePreference(on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((listener) => listener(playing));
}

/** Volume ramps up so a track that starts on a scroll does not snap at the ears. */
function fadeIn() {
  if (!audio) return;
  window.clearInterval(fadeTimer);
  const from = audio.volume;
  const start = performance.now();
  fadeTimer = window.setInterval(() => {
    if (!audio) {
      window.clearInterval(fadeTimer);
      return;
    }
    const t = Math.min(1, (performance.now() - start) / FADE_MS);
    audio.volume = from + (MUSIC_VOLUME - from) * t;
    if (t >= 1) window.clearInterval(fadeTimer);
  }, 1000 / 30);
}

function stopFade() {
  window.clearInterval(fadeTimer);
}

/** Resolves true when playback actually began (false = browser still blocking). */
function attemptPlay(): Promise<boolean> {
  if (!audio || !wantOn) return Promise.resolve(false);
  // Already running: replaying here would restart the fade and dip the volume.
  if (playing && !audio.paused) return Promise.resolve(true);
  stopFade();
  audio.volume = 0;
  return audio
    .play()
    .then(() => {
      playing = true;
      fadeIn();
      emit();
      return true;
    })
    .catch(() => {
      playing = false;
      emit();
      return false;
    });
}

function armGestureFallback() {
  const unlock = (event: Event) => {
    // A click on the music button is handled by the button itself; unlocking
    // here first would make the same click toggle the track straight back off.
    if (event.target instanceof Element && event.target.closest('.music')) return;
    attemptPlay().then((began) => {
      // Still blocked (e.g. a keypress without activation) - keep waiting.
      if (began) GESTURES.forEach((type) => window.removeEventListener(type, unlock));
    });
  };
  GESTURES.forEach((type) => window.addEventListener(type, unlock, { passive: true }));
}

function ensureAudio() {
  if (audio) return;
  audio = new Audio(musicUrl);
  audio.loop = true;
  audio.volume = MUSIC_VOLUME;
  audio.preload = 'auto';
  audio.addEventListener('error', () => {
    stopFade();
    playing = false;
    emit();
  });
  // Handy when checking playback state from the console during development.
  (window as unknown as { __music?: HTMLAudioElement }).__music = audio;
}

/** Call once on page load. Safe to call twice. */
export function startMusic() {
  if (started) return;
  started = true;
  wantOn = readStoredPreference();
  if (!wantOn) return;

  ensureAudio();
  attemptPlay().then((began) => {
    if (!began) armGestureFallback();
  });
}

/** Button behaviour: playing → mute; anything else (blocked or muted) → try to play.
 * The resulting state is reported to subscribers once playback resolves. */
export function toggleMusic(): void {
  wantOn = !playing;
  storePreference(wantOn);
  if (!wantOn) {
    stopFade();
    audio?.pause();
    playing = false;
    emit();
    return;
  }
  ensureAudio();
  void attemptPlay();
}

export function subscribeMusic(listener: Listener) {
  listeners.add(listener);
  listener(playing);
  return () => {
    listeners.delete(listener);
  };
}

export const isMusicOn = () => playing;
