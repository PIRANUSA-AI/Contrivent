// Converts every video in ./videos into a scroll-sequence of WebP frames under ./public/frames.
//
//   npm run frames                      convert all videos at their own frame rate
//   npm run frames -- --only=scout      convert one (by file name, without extension)
//   npm run frames -- --fps=15          cap the frame rate = fewer frames, lighter page
//
// Per-clip options live in videos/clips.json:
//   { "transition-1": { "reverse": true }, "orchestrate": { "start": "middle" } }
//   reverse: play the clip backwards · start: "middle" or seconds to skip from the beginning
//
// Output: public/frames/<name>/{desktop,mobile}/frame_0001.webp + public/frames/manifest.json
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, parse } from 'node:path';

const ROOT = process.cwd();
const VIDEOS = join(ROOT, 'videos');
const CLIP_OPTIONS = join(VIDEOS, 'clips.json');
const OUT = join(ROOT, 'public', 'frames');
const MANIFEST = join(OUT, 'manifest.json');
const EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.mkv', '.m4v']);

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const [key, value = 'true'] = arg.slice(2).split('=');
      return [key, value];
    }),
);

/** Omit to keep every source frame. */
const FPS_CAP = args.fps ? Number(args.fps) : null;
const VARIANTS = [
  { name: 'desktop', maxWidth: Number(args.desktop ?? 1920), quality: 76 },
  { name: 'mobile', maxWidth: Number(args.mobile ?? 960), quality: 70 },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw new Error(`Could not run ${command}. Is ffmpeg installed and on PATH?`);
  if (result.status !== 0) throw new Error(`${command} failed:\n${result.stderr}`);
  return result.stdout;
}

if (!existsSync(VIDEOS)) {
  console.error('No ./videos folder found.');
  process.exit(1);
}

const clipOptions = existsSync(CLIP_OPTIONS) ? JSON.parse(readFileSync(CLIP_OPTIONS, 'utf8')) : {};

const files = readdirSync(VIDEOS)
  .filter((file) => EXTENSIONS.has(extname(file).toLowerCase()))
  .filter((file) => !args.only || slugify(parse(file).name) === args.only);

if (files.length === 0) {
  console.log('No videos to convert. Put your clips in ./videos.');
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
manifest.sequences ??= {};

for (const file of files) {
  const input = join(VIDEOS, file);
  const name = slugify(parse(file).name);
  const options = clipOptions[name] ?? {};

  const probe = JSON.parse(
    run('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
      '-of', 'json',
      input,
    ]),
  );
  const { width: sourceWidth, height: sourceHeight, r_frame_rate: rate } = probe.streams[0];
  const [rateNum, rateDen = 1] = rate.split('/').map(Number);
  const sourceFps = rateNum / rateDen;
  const fps = FPS_CAP ? Math.min(FPS_CAP, sourceFps) : sourceFps;
  const duration = Number(probe.format.duration);
  const start = options.start === 'middle' ? duration / 2 : Number(options.start ?? 0);

  const notes = [options.reverse && 'reversed', start > 0 && `starts at ${start.toFixed(2)}s`].filter(Boolean).join(', ');
  console.log(
    `\n> ${file} -> ${name}  (${sourceWidth}x${sourceHeight}, ${duration.toFixed(2)}s, ${fps.toFixed(2)} fps${notes ? `, ${notes}` : ''})`,
  );

  const entry = { fps: Number(fps.toFixed(3)), frames: 0, variants: {} };

  for (const variant of VARIANTS) {
    const capped = Math.min(variant.maxWidth, sourceWidth);
    const width = capped - (capped % 2);
    const height = Math.round((width * sourceHeight) / sourceWidth / 2) * 2;
    const dir = join(OUT, name, variant.name);
    const filters = [
      ...(fps < sourceFps ? [`fps=${fps}`] : []),
      `scale=${width}:${height}:flags=lanczos`,
      ...(options.reverse ? ['reverse'] : []),
    ];

    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    run('ffmpeg', [
      '-v', 'error',
      '-y',
      ...(start > 0 ? ['-ss', start.toFixed(3)] : []),
      '-i', input,
      '-an',
      '-vf', filters.join(','),
      '-fps_mode', 'passthrough',
      '-c:v', 'libwebp',
      '-quality', String(variant.quality),
      '-compression_level', '5',
      '-f', 'image2',
      join(dir, 'frame_%04d.webp'),
    ]);

    const frames = readdirSync(dir).filter((f) => f.endsWith('.webp'));
    const bytes = frames.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
    entry.frames = entry.frames ? Math.min(entry.frames, frames.length) : frames.length;
    entry.variants[variant.name] = { width, height, path: `frames/${name}/${variant.name}` };
    console.log(`  ${variant.name.padEnd(8)} ${frames.length} frames  ${width}x${height}  ${(bytes / 1e6).toFixed(1)} MB`);
  }

  manifest.sequences[name] = entry;
}

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nManifest written to public/frames/manifest.json`);
