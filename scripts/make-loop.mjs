// Builds a seamless "forward then reverse" (palindrome) loop from a clip in ./videos.
//
//   node scripts/make-loop.mjs deska          -> src/assets/deska-loop.mp4
//   node scripts/make-loop.mjs yoel           -> src/assets/yoel-loop.mp4
//   node scripts/make-loop.mjs "the team"     -> src/assets/the-team-loop.mp4
//
// The middle frame is dropped from the reversed half so the join does not linger,
// and the last frame is dropped so looping back to the first is seamless. Output is
// silent H.264 yuv420p, matching the hero loop (see README "Video hero").
//
// These are <video> background sources, NOT scroll sequences, so they are not fed to
// extract-frames.mjs and are not listed in videos/clips.json.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
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

const targets = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
if (targets.length === 0) {
  console.error('Usage: node scripts/make-loop.mjs <video-name> [more...]   (name = file in videos/, without extension)');
  process.exit(1);
}

for (const target of targets) {
  const input = join(ROOT, 'videos', `${target}.mp4`);
  if (!existsSync(input)) {
    console.error(`No such video: videos/${target}.mp4`);
    process.exit(1);
  }

  const count = Number(
    run('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0', '-count_frames',
      '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', input,
    ]).trim(),
  );
  if (!Number.isFinite(count) || count < 2) {
    console.error(`Could not count frames in videos/${target}.mp4`);
    process.exit(1);
  }

  const name = slugify(target);
  const output = join(ROOT, 'src', 'assets', `${name}-loop.mp4`);
  // [0:v] minus first frame, then the reversed half minus its first frame (= original last).
  const filter = `[0:v]split[a][b];[a]trim=start_frame=1,setpts=PTS-STARTPTS[af];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[br];[af][br]concat=n=2:v=1:a=0,format=yuv420p[out]`;

  console.log(`\n> ${target}.mp4 (${count} frames) -> src/assets/${name}-loop.mp4`);
  run('ffmpeg', [
    '-v', 'error', '-y',
    '-i', input,
    '-filter_complex', filter,
    '-map', '[out]',
    '-an', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart',
    output,
  ]);
}

console.log('\nDone. Import the *-loop.mp4 files from src/assets in your component.');
