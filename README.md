# Sezen Aksu Şarkı Tahmin Oyunu

A Wordle/Swiftle-style music guessing game built around Sezen Aksu songs.

A random song is played in 6 rounds. The clip starts at the same point each
time but grows by one second per attempt: **1s, 2s, 3s, 4s, 5s, 6s**. The
player types the song title (with search/autocomplete) and gets Wordle-style
feedback:

- 🟩 **Green** – correct song
- 🟨 **Yellow** – different song, but same album
- 🟥 **Red** – wrong

Two modes: **Günün Şarkısı** (daily, same song for everyone) and **Sınırsız**
(endless practice). Daily mode keeps local stats, streaks, and a shareable
emoji result.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- Static build (no backend) — deployable to Vercel

## Local development

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

Build for production:

```bash
npm run build
npm run preview
```

## Adding the audio clips

The app expects one pre-cut clip per song at:

```
public/clips/<song-id>.mp3
```

The `<song-id>` values are defined in [`src/data/songs.ts`](src/data/songs.ts).
For example `kutlama.mp3`, `hadi-bakalim.mp3`, `sen-aglama.mp3`.

### How to source and cut clips (private / educational use only)

> ⚠️ **Copyright:** Sezen Aksu's recordings are owned by her label. Only do
> this for a **private, non-public, educational** project. Do not publicly
> distribute the audio. Consider keeping the Vercel deployment password
> protected (see below).

1. Obtain the source audio **legally** for your own private use (e.g. a CD or
   a licensed download you own).
2. Install [ffmpeg](https://ffmpeg.org/download.html) (on Windows:
   `winget install Gyan.FFmpeg`).
3. Cut a 6-second clip starting at the offset listed in `clipStart`:

   ```bash
   ffmpeg -ss 45 -i "kutlama-source.mp3" -t 6 -c copy public/clips/kutlama.mp3
   ```

   - `-ss 45` = start at 45 seconds (use the song's `clipStart`)
   - `-t 6` = 6 seconds long
   - `-c copy` = no re-encode (fast, lossless)

4. Repeat for each song. The game reveals 1s → 6s from the **start** of each
   clip, so make sure the first second is recognisable.

If a clip is missing, the app shows a friendly "Klip dosyası bulunamadı"
message instead of crashing.

## Project structure

```
src/
  data/songs.ts        # song catalog (id, title, album, year, clipStart)
  lib/text.ts          # Turkish-aware normalisation + fuzzy matching
  lib/game.ts          # song selection, feedback rules, stats, share grid
  lib/storage.ts       # localStorage persistence
  hooks/useGame.ts     # round state machine
  hooks/useClipPlayer.ts # cumulative-reveal audio player
  components/          # GuessInput, GuessList, StatsPanel, ShareButton
  App.tsx              # layout + mode switching
public/clips/          # <song-id>.mp3 files (not committed)
```

## Deploying to Vercel (step by step)

### 1. Install Git (Windows)

Open **PowerShell** and run:

```powershell
winget install --id Git.Git -e --source winget
```

Close and reopen your terminal, then verify:

```bash
git --version
```

### 2. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 3. Create the GitHub repository

1. Go to https://github.com/new
2. Repository name: `sezen`
3. Keep it **Private** (recommended, because of the audio).
4. Do **not** initialise with a README.
5. Click **Create repository** and copy the repo URL.

### 4. Push the project

From the project folder:

```bash
git init
git add .
git commit -m "Initial commit: Sezen Aksu song guessing game"
git branch -M main
git remote add origin https://github.com/<your-username>/sezen.git
git push -u origin main
```

### 5. Create a Vercel account

1. Go to https://vercel.com/signup
2. Choose **Continue with GitHub** and authorise.

### 6. Import and deploy

1. On the Vercel dashboard click **Add New… → Project**.
2. Select your `sezen` repository and click **Import**.
3. Vercel auto-detects Vite. Confirm:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click **Deploy**. After a minute you get a live URL.

### 7. Automatic redeploys

Every `git push` to `main` triggers a new deployment automatically.

```bash
git add .
git commit -m "Update songs"
git push
```

### 8. (Optional) Password-protect the site

Because the audio is copyrighted, you can restrict access:

1. Vercel project → **Settings → Deployment Protection**.
2. Enable **Vercel Authentication** (or Password Protection on paid plans).

## Notes

- The daily song is derived from the date, so everyone sees the same song
  without a backend.
- Stats and streaks are stored in the browser's `localStorage`.
- This project is for private/educational use only.
