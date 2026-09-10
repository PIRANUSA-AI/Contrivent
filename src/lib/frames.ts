// Loads image sequences produced by `npm run frames` (see scripts/extract-frames.mjs).

export type Variant = { width: number; height: number; path: string };

export type SequenceMeta = {
  fps: number;
  frames: number;
  variants: { desktop: Variant; mobile: Variant };
};

type Manifest = { sequences: Record<string, SequenceMeta> };

type Listener = (loaded: number, total: number) => void;

export type Sequence = {
  name: string;
  meta: SequenceMeta;
  /** Sparse until loading finishes; use `nearestLoaded` to pick a drawable frame. */
  images: (HTMLImageElement | null)[];
  loaded: number;
  subscribe: (listener: Listener) => () => void;
};

const BASE = import.meta.env.BASE_URL;
/** Shared across all sequences so a long story doesn't flood the network. */
const CONCURRENCY = 8;

let manifestPromise: Promise<Manifest> | null = null;
const sequences = new Map<string, Promise<Sequence | null>>();

type Job = { queue: number[]; load: (index: number) => void };
const jobs: Job[] = [];
let active = 0;
let turn = 0;

/** Round-robin across sequences, so every clip gets its coarse frames early. */
function pump() {
  while (active < CONCURRENCY) {
    const open = jobs.filter((job) => job.queue.length);
    if (!open.length) return;
    const job = open[turn++ % open.length];
    active++;
    job.load(job.queue.shift()!);
  }
}

function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch(`${BASE}frames/manifest.json`, { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data?.sequences ? (data as Manifest) : { sequences: {} }))
    .catch(() => ({ sequences: {} }));
  return manifestPromise;
}

/** Resolves to null when the sequence has no frames (the page then shows the simulation). */
export function getSequence(name: string): Promise<Sequence | null> {
  let promise = sequences.get(name);
  if (!promise) {
    promise = loadManifest().then(({ sequences: all }) => (all[name] ? createSequence(name, all[name]) : null));
    sequences.set(name, promise);
  }
  return promise;
}

/** Coarse-to-fine order: first and last frame, then every 24th, 8th, 4th, 2nd, 1st. Scrubbing works early. */
function loadOrder(total: number) {
  const seen = new Uint8Array(total);
  const order: number[] = [];
  const push = (i: number) => {
    if (!seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(total - 1);
  for (const stride of [24, 8, 4, 2, 1]) for (let i = 0; i < total; i += stride) push(i);
  return order;
}

function createSequence(name: string, meta: SequenceMeta): Sequence {
  const variant = window.matchMedia('(max-width: 768px)').matches ? meta.variants.mobile : meta.variants.desktop;
  const listeners = new Set<Listener>();

  const sequence: Sequence = {
    name,
    meta,
    images: new Array(meta.frames).fill(null),
    loaded: 0,
    subscribe(listener) {
      listeners.add(listener);
      listener(sequence.loaded, meta.frames);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  jobs.push({
    queue: loadOrder(meta.frames),
    load(index) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${BASE}${variant.path}/frame_${String(index + 1).padStart(4, '0')}.webp`;
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (img.naturalWidth) sequence.images[index] = img;
          sequence.loaded++;
          active--;
          listeners.forEach((listener) => listener(sequence.loaded, meta.frames));
          pump();
        });
    },
  });
  pump();

  return sequence;
}

export function nearestLoaded(sequence: Sequence, index: number) {
  const { images } = sequence;
  for (let d = 0; d < images.length; d++) {
    if (images[index - d]) return index - d;
    if (images[index + d]) return index + d;
  }
  return -1;
}

/** Draws like `object-fit: cover`. */
export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
}
