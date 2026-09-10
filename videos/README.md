# videos/

Video sumber untuk scroll story. Jalankan `npm run frames` setelah menambah atau mengganti video.

Semua klip diputar berurutan di **satu canvas** (lihat `storySegments` di `src/content.ts`), dengan crossfade di tiap sambungan:

| Urutan | File               | Isi                                   | Opsi (`clips.json`)  |
| ------ | ------------------ | ------------------------------------- | -------------------- |
| 1      | `scout.mp4`        | Scene 1: Scout                        |                      |
| 2      | `transition-1.mp4` | Transisi Scout → Forge                | `reverse`            |
| 3      | `forge.mp4`        | Scene 2: Forge                        |                      |
| 4      | `transition-2.mp4` | Transisi Forge → Orchestrate          | `reverse`            |
| 5      | `orchestrate.mp4`  | Scene 3: Orchestrate                  | `start: "middle"`    |

`clips.json` mengatur per klip: `reverse: true` memutar mundur sebelum frame dibuat, `start: "middle"` atau angka detik untuk melewati bagian awal.
Video asli tidak diubah, efeknya hanya diterapkan saat generate frame.
