import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { drawCover, getSequence, nearestLoaded, type Sequence } from '../lib/frames';
import { drawPlaceholder } from '../lib/placeholder';
import { bindScrollProgress } from '../lib/progress';
import { segmentRanges, totalLength, type Segment } from '../lib/timeline';

type Props = {
  id?: string;
  /** Clips played back to back on one pinned canvas. */
  segments: Segment[];
  /** Scroll distance (vh) over which one clip dissolves into the next. */
  crossfade?: number;
  className?: string;
  /** Overlay drawn above every frame. Receives `--p` (0-1 over the whole story) etc., see bindScrollProgress. */
  children?: ReactNode;
};

type Layer = { name: string; local: number; alpha: number };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Pins a full-screen canvas and scrubs a chain of image sequences with scroll, crossfading between clips. */
export default function ScrollSequence({ id, segments, crossfade = 0, className = '', children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = totalLength(segments);
  const ranges = segmentRanges(segments);
  const timelineKey = segments.map((s) => `${s.name}:${s.length}`).join('|');

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!section || !canvas || !ctx) return;

    const clips = segmentRanges(segments);
    const fade = crossfade / totalLength(segments);
    /** undefined = still loading · null = no frames for this clip. */
    const loaded = new Map<string, Sequence | null>();

    let progress = 0;
    let drawnKey = '';
    let visible = false;
    let raf = 0;
    let alive = true;

    /** Which clip frames make up the picture at progress p (two layers while crossfading). */
    const layersAt = (p: number): Layer[] => {
      const i = Math.max(0, clips.findIndex((clip) => p < clip.end));
      const clip = clips[i] ?? clips[clips.length - 1];
      const local = clamp01((p - clip.start) / (clip.end - clip.start));
      const half = fade / 2;

      if (fade > 0 && i < clips.length - 1 && p > clip.end - half) {
        return [
          { name: clip.name, local, alpha: 1 },
          { name: clips[i + 1].name, local: 0, alpha: clamp01((p - (clip.end - half)) / fade) },
        ];
      }
      if (fade > 0 && i > 0 && p < clip.start + half) {
        return [
          { name: clips[i - 1].name, local: 1, alpha: 1 },
          { name: clip.name, local, alpha: clamp01((p - (clip.start - half)) / fade) },
        ];
      }
      return [{ name: clip.name, local, alpha: 1 }];
    };

    const render = (now: number) => {
      raf = visible ? requestAnimationFrame(render) : 0;
      const layers = layersAt(progress);
      const picks: { img: HTMLImageElement; alpha: number; key: string }[] = [];

      for (const layer of layers) {
        const sequence = loaded.get(layer.name);
        if (sequence === undefined) return; // keep the last picture until frames arrive
        if (sequence === null) {
          drawPlaceholder(ctx, canvas.width, canvas.height, progress, now / 1000, layers[layers.length - 1].name);
          drawnKey = '';
          return;
        }

        // Scroll usually lands between two frames: blend them by the remainder so motion stays fluid at display refresh rate.
        const position = layer.local * (sequence.meta.frames - 1);
        const before = Math.floor(position);
        const after = Math.min(before + 1, sequence.meta.frames - 1);
        const mix = position - before;
        const exact = sequence.images[before] && sequence.images[after];
        const base = exact ? before : nearestLoaded(sequence, Math.round(position));
        if (base < 0) return;

        picks.push({ img: sequence.images[base]!, alpha: layer.alpha, key: `${layer.name}#${base}@${layer.alpha.toFixed(3)}` });
        if (exact && after !== before && mix > 0.02) {
          picks.push({
            img: sequence.images[after]!,
            alpha: layer.alpha * mix,
            key: `${layer.name}#${after}@${(layer.alpha * mix).toFixed(2)}`,
          });
        }
      }

      const key = picks.map((pick) => pick.key).join('|');
      if (key === drawnKey) return;
      drawnKey = key;
      for (const pick of picks) {
        ctx.globalAlpha = pick.alpha;
        drawCover(ctx, pick.img, canvas.width, canvas.height);
      }
      ctx.globalAlpha = 1;
    };
    const wake = () => {
      if (visible && !raf) raf = requestAnimationFrame(render);
    };

    // Frames are at most 1920px wide, so a larger canvas only costs time per draw.
    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const scale = Math.max(0.5, Math.min(window.devicePixelRatio || 1, 1920 / width));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      drawnKey = '';
      wake();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        wake();
      },
      { rootMargin: '10% 0px' },
    );
    visibility.observe(section);

    // Start fetching frames once the story is within ~1.5 screens.
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        preload.disconnect();
        for (const clip of clips) {
          getSequence(clip.name).then((sequence) => {
            if (!alive) return;
            loaded.set(clip.name, sequence);
            drawnKey = '';
          });
        }
      },
      { rootMargin: '150% 0px' },
    );
    preload.observe(section);

    const unbind = bindScrollProgress(section, (p) => {
      progress = p;
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      preload.disconnect();
      unbind();
    };
    // Segments are compared by timelineKey so a new array with the same clips doesn't restart loading.
  }, [timelineKey, crossfade]);

  return (
    <section id={id} ref={sectionRef} className={`seq ${className}`} style={{ '--len': `${total + 100}vh` } as CSSProperties}>
      {ranges
        .filter((range) => range.id)
        .map((range) => (
          <span
            key={range.id}
            id={range.id}
            className="seq__anchor"
            style={{ top: `${range.offset}vh`, height: `${range.length}vh` }}
            aria-hidden="true"
          />
        ))}
      <div className="seq__stage">
        <canvas ref={canvasRef} className="seq__canvas" aria-hidden="true" />
        <div className="seq__shade" aria-hidden="true" />
        <div className="seq__overlay">{children}</div>
      </div>
    </section>
  );
}
