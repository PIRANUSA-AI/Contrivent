<div align="center">

<img src="docs/images/helmet.png" alt="The Contrivent helmet" width="110" />

# Contrivent

**AI systems that run your busywork.**

We find what matters in your business, build the machine around it, and keep it running long after launch.

[contrivent.com](https://contrivent.com) · hello@contrivent.com

</div>

![A mecha unit from the Contrivent hero footage](docs/images/hero.webp)

## Not a services list. The work itself.

Most agency homepages say "we do discovery, delivery, operations" and show three cards with icons. Contrivent's page refuses to do that. It is one continuous story told through short films that scrub with your scroll: real footage, frame by frame, with the numbers, logs, and findings layered directly on top of it. You don't read what the company does. You watch a signal get found, forged into a system, and set loose to run.

The site is fully static. No backend, no database, nothing to babysit. Every figure that counts up on screen is choreographed to your scroll position, and the footage keeps time with you like a record needle.

## The story, act by act

### 01 · Scout - find the signal

A discovery pass rendered as a deep-space scan. Sources get mapped, records fly past at machine speed, and the panel surfaces three concrete findings as the clip plays: weekly reporting that eats 30 hours by hand, leads going cold after 48 hours, know-how trapped in nine different tools.

![Scout: the scan panel over the discovery footage](docs/images/scout.webp)

### 02 · Forge - shape it into a system

The build phase as an assembly line. Architecture, data pipelines, agents and models, evaluation - each step fills to 100% as you scroll, locked in step with the footage of the machine being put together.

![Forge: the assembly panel over the build footage](docs/images/forge.webp)

### 03 · Orchestrate - set it in motion

Production day, simulated live. An agent log ticks through the morning: 14 leads detected, scored, and routed; follow-ups drafted; 38 tickets resolved with 2 handed to humans; 1,204 transactions reconciled. Two tallies count up tasks automated and hours returned while the system conducts itself.

![Orchestrate: the live agent log over the operations footage](docs/images/orchestrate.webp)

### The triangle

The finale draws the three acts into one figure: Scout finds it, Forge builds it, Orchestrate runs it. At its center sits the whole thesis in two lines: **systems that run without you.**

## What it feels like to visit

- **Weighted, gliding scroll.** Inertia smoothing on every wheel tick. The story section pins to the viewport and the footage scrubs frame-accurate with your position, crossfading between clips.
- **A soundtrack.** A synthwave loop (Neon Pulse) fades in at low volume as soon as the browser allows it, with a small HUD-style mute toggle in the corner. Visitor preference is remembered.
- **A cockpit, not a brochure.** A scroll-progress rail, a terminal-style preloader counting up while the hero buffers, a custom cursor, film grain over everything, and the mecha mascot standing guard inside the footer wordmark.
- **Fast where it counts.** Frames load coarse-to-fine so scrubbing works before a clip is fully downloaded; mobile gets its own lighter render; everything is cached hard after the first visit.
- **Considered defaults.** Honors `prefers-reduced-motion`, degrades to real text without JavaScript, and makes zero third-party requests. Fonts, music, footage: all self-hosted.

## Under the hood (short version)

React 19 + Vite + TypeScript, GSAP ScrollTrigger + Lenis, and a custom `ScrollSequence` engine that plays chains of WebP frames on one pinned canvas. The films in `videos/` are the source of truth; a `ffmpeg` pipeline renders them into scroll-ready frame sequences. All copy and timing lives in a single `content.ts`.

The long version - frame pipeline options, the autoplay-unlock policy, cache traps, the font licensing notes, and the VPS deploy recipe (Dockerfile + tuned nginx config are in the repo) - is in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

```bash
npm install
npm run frames   # renders videos/ into scroll frames (needs ffmpeg)
npm run dev      # http://localhost:5173
```

<div align="center">

*One team. From first signal to running system.*

</div>
