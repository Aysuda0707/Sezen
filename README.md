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
- Static build (no backend) — deployed to Vercel

## How the audio works

No audio files are bundled with this project. At runtime the app queries the
**public iTunes Search API** for each song and streams Apple's 30-second
preview from Apple's CDN. The game plays a growing segment (1s → 6s) starting
from the offset defined in `previewStart` for each song.

- Lookup + caching: [`src/lib/itunes.ts`](src/lib/itunes.ts)
- Player: [`src/hooks/useClipPlayer.ts`](src/hooks/useClipPlayer.ts)
- Catalog (title, album, year, previewStart): [`src/data/songs.ts`](src/data/songs.ts)

> ⚠️ **Copyright:** Apple's preview clips are copyrighted. This project is for
> **private / educational** use only. Do not redistribute the audio or present
> it as your own. If you deploy publicly, consider enabling Vercel's
> Deployment Protection (see below).

If a preview cannot be found, the app shows a friendly message instead of
crashing.

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

## Project structure

```
src/
  data/songs.ts          # song catalog (id, title, album, year, previewStart)
  lib/text.ts            # Turkish-aware normalisation + fuzzy matching
  lib/game.ts            # song selection, feedback rules, stats, share grid
  lib/itunes.ts          # iTunes preview lookup + caching
  lib/storage.ts         # localStorage persistence
  hooks/useGame.ts       # round state machine
  hooks/useClipPlayer.ts # cumulative-reveal audio player
  components/            # GuessInput, GuessList, StatsPanel, ShareButton
  App.tsx                # layout + mode switching
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
2. Repository name: `Sezen`
3. Keep it **Private** (recommended).
4. Do **not** initialise with a README.
5. Click **Create repository**.

### 4. Push the project

```bash
git init
git add .
git commit -m "Initial commit: Sezen Aksu song guessing game"
git branch -M main
git remote add origin https://github.com/<your-username>/Sezen.git
git push -u origin main
```

### 5. Create a Vercel account

1. Go to https://vercel.com/signup
2. Choose **Continue with GitHub** and authorise.

### 6. Import and deploy

1. On the Vercel dashboard click **Add New… → Project**.
2. If `Sezen` is not listed, click **Adjust GitHub App Permissions** and grant
   Vercel access to the repository (or go to
   https://github.com/settings/installations → Vercel → Configure).
3. Select `Sezen` and click **Import**.
4. Confirm:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

### 7. Automatic redeploys

Every `git push` to `main` triggers a new deployment automatically.

```bash
git add .
git commit -m "Update songs"
git push
```

### 8. (Optional) Password-protect the site

1. Vercel project → **Settings → Deployment Protection**.
2. Enable **Vercel Authentication** (or Password Protection on paid plans).

## Notes

- The daily song is derived from the date, so everyone sees the same song
  without a backend.
- Stats and streaks are stored in the browser's `localStorage`.
- This project is for private/educational use only.
