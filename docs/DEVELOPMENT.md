# Contrivent - development notes

Teknis: cara render video, arsitektur scroll engine, deploy, caching, font, audio, SEO.
Untuk gambaran project, lihat [README](../README.md).

## Jalankan

```bash
npm install
npm run frames     # butuh ffmpeg di PATH: videos/*.mp4 -> public/frames/
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build -> dist/
```

`public/frames/` (±123 MB) tidak di-commit ke git - itu build artifact dari `videos/*.mp4`. Clone repo lalu `npm run frames` dulu sebelum dev/build. Gambar buat README di `docs/images/` ikut ke-commit (±630 KB).

## Struktur

| Path | Isi |
| --- | --- |
| `src/content.ts` | Semua copy, beats tiap babak, angka simulasi, urutan klip |
| `src/components/ScrollSequence.tsx` | Engine: pin, preload bertahap, crossfade, gambar frame ke canvas |
| `src/components/Act.tsx` | Kerangka tiap babak (judul besar, beats, panel instrumen) |
| `src/components/Scout.tsx` / `Forge.tsx` / `Orchestrate.tsx` | Panel instrumen khas tiap babak |
| `src/components/Triangle.tsx` | Finale: segitiga Scout, Forge, Orchestrate tergambar sesuai scroll |
| `src/components/Music.tsx` + `src/lib/audio.ts` | Backsound global + tombol mute |
| `src/lib/progress.ts` | Scroll ke `--p`, `--local`, `.is-active`, dan counter `data-count` |
| `src/lib/frames.ts` | Loader manifest + frame (urutan kasar ke halus, concurrency 8) |
| `src/lib/placeholder.ts` | Scene prosedural saat frame belum ada |
| `src/styles/global.css` | Tokens dan semua styling |
| `src/styles/fonts.css` | `@font-face` Clash Display + Satoshi (self-host) |
| `scripts/extract-frames.mjs` | Video ke frame WebP + `manifest.json` |
| `Dockerfile` + `deploy/nginx.conf` | Deploy statis dua stage |

## Scroll story

Satu section, satu canvas. Lima klip (scout, transition-1, forge, transition-2, orchestrate) diputar berurutan dengan crossfade; semua teks/HUD ditumpuk di atas frame.

1. Video sumber di `videos/`. Opsi reverse / mulai dari tengah per klip ada di `videos/clips.json`.
2. `npm run frames` menghasilkan WebP dua varian (desktop maks 1920px, mobile 960px) + `manifest.json`.
   Opsi: `-- --only=scout`, `--fps=12`, `--desktop=1600`, `--mobile=720`.
3. Urutan, panjang scroll tiap klip (vh), dan crossfade diatur di `src/content.ts` → `storySegments`, `storyCrossfade`.

Section yang di-pin menulis progress 0-1 ke `--p`. Elemen dengan `data-from`/`data-to` mendapat `--local` (0-1 dalam rentangnya) dan class `.is-active`; tambah `data-count="100"` supaya angkanya menghitung naik. Pinning pakai CSS `position: sticky`, bukan ScrollTrigger pin.

## Video hero

`src/assets/hero.mp4` adalah video asli; halaman memakai `hero-loop.mp4` (sama, diputar maju lalu mundur, jadi loop biasa = play → reverse → play). Ganti hero? Render ulang:

```bash
ffmpeg -i hero.mp4 -filter_complex "[0:v]split[f][b];[b]reverse,trim=start_frame=1:end_frame=<N-1>,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[out]" -map "[out]" -an -c:v libx264 -crf 22 -movflags +faststart hero-loop.mp4
ffmpeg -i hero.mp4 -frames:v 1 -c:v libwebp -quality 80 hero-poster.webp
```

## Berat halaman

Desktop 71,7 MB (889 frame), mobile 46,7 MB - tapi tidak dimuat sekaligus. Payload awal ±8,9 MB: video hero 3,9 MB + backsound 4,2 MB + JS 384 KB (gzip 128 KB) + CSS + font. Frame sisanya nyicil pas section story mendekat.

Cara nurunin: `npm run frames -- --fps=12 --desktop=1280 --mobile=640`. 12 fps tetap mulus karena ScrollSequence mencampur dua frame berdasar posisi sub-frame.

## Font

Semua self-host, nol request pihak ketiga. Vite memberi tanda tangan pada woff2 → cache aman selamanya.

| Peran | Font | Sumber |
| --- | --- | --- |
| Display (judul, wordmark) | Clash Display 500/600/700 | `src/assets/fonts/` (Fontshare, lisensi bebas) |
| UI / body | Satoshi 400/500/700 | `src/assets/fonts/` (Fontshare) |
| HUD / angka | Geist Mono (variable) | npm `@fontsource-variable/geist-mono` |
| Aksen miring | Instrument Serif | npm `@fontsource/instrument-serif` |

PENTING: Clash Display dan Satoshi tidak punya tabular figures. Angka count-up (`data-count`: `.preloader__count`, `.readouts dd`, `.tally dd`) wajib `--font-mono` biar tidak bergoyang. Ganti font display? Unduh woff2 dari Fontshare ke `src/assets/fonts/`, tambah blok `@font-face` di `fonts.css`, cek lagi `font-variant-numeric`.

## Backsound (Neon Pulse)

`src/assets/neon-pulse.mp3` (4,2 MB, 178 detik), loop, fade-in 1,2 detik. Volume default di `MUSIC_VOLUME` (`src/lib/audio.ts`) - sekarang 0,15; skala linear terasa logaritmik di kuping, 0,35 masih kedengeran nendang buat track yang di-master keras.

Browser melarang autoplay bersuara sebelum visitor berinteraksi:

1. Saat load, `startMusic()` langsung coba `play()` (Chrome/Safari biasanya menolak).
2. Kalau ditolak, listener `pointerdown`/`keydown`/`touchstart`/`wheel` dipasang; interaksi pertama bikin musik nyala sendiri, lalu listener dilepas.
3. Klik pada tombol musik dilewati unlock global (satu klik tidak boleh unlock sekaligus toggle).
4. Preferensi mute disimpan di `localStorage` kunci `contrivent-music`.

Ganti lagu: taruh mp3 baru di `src/assets/`, ubah satu baris `import musicUrl`. Nama file di-hash Vite → cache auto-bust. Debug state: `window.__music` di console. `preload="auto"` mengunduh 4,2 MB di awal; kalau bandwidth ketat turunkan ke `"metadata"`.

## Deploy ke VPS

Statis: `dist/` di-serve nginx, tanpa Node runtime.

```bash
docker build -t contrivent .
docker run -d --name contrivent -p 80:80 --restart unless-stopped contrivent
```

Non-Docker: `npm ci && npm run build` lalu `rsync -avz --delete dist/ user@vps:/var/www/contrivent/`, arahkan root nginx ke sana, pakai `deploy/nginx.conf`.

Isi `deploy/nginx.conf`: gzip teks (WebP/MP4 tidak, sudah termampatkan); `/assets/*` (hashed) immutable 1 tahun; `/frames/*` 30 hari; `index.html` no-cache.

**Trap cache frame:** nama frame (`frame_0001.webp`) stabil antar render, jadi kalau konten klip diganti, visitor lama masih pegang frame basi sampai 30 hari. Bust dengan mengubah nama folder di `storySegments` (`content.ts`) atau turunkan `max-age`.

HTTPS: Caddy atau certbot di depan container.

## SEO / GEO

Yang terpasang di `index.html` + `public/`:

- Title + meta description berbasis kata kunci, canonical.
- Open Graph + Twitter card (`public/og-cover.webp`, 1280x720 dari poster hero).
- JSON-LD `ProfessionalService` (logo = helm `favicon-512.png`).
- `<noscript>` berisi ringkasan Scout/Forge/Orchestrate sebagai teks nyata.
- `robots.txt` (Disallow `/frames/`), `sitemap.xml`, `llms.txt` (ringkasan bisnis buat AI crawler / GEO).
- Favicon set dari helm: `favicon.ico`, `favicon-32.png`, apple-touch 180, 512.

Sebelum launch:

- Ganti `https://contrivent.com` di `index.html` (canonical, og, JSON-LD), `robots.txt`, `sitemap.xml` dengan domain asli, lalu daftar Google Search Console + submit sitemap.
- File di `public/` tidak di-hash Vite: ganti `og-cover.webp`/favicon → tambah `?v=2` di referensinya.
- JSON-LD bisa lebih tajam dengan alamat + telepon asli.
