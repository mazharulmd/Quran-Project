# কুরআন পাঠশালা — Quranic Learning App

An ayah-by-ayah Qur'an learning web app in Bangla: per-ayah recitation audio,
tajweed colour-coded Arabic, Bangla উচ্চারণ (transliteration) and translation,
per-ayah tafsir, word-by-word breakdown, a mind map of the surah's linguistic
patterns, and a memorisation workshop with progress tracking.

Surahs included so far, all recited by Shaykh Yasser Al-Dosari:

| # | Surah | Ayahs | Audio |
| --- | --- | --- | --- |
| 1 | Al-Fatiha (আল-ফাতিহা) | 7 | 46s |
| 93 | Ad-Duha (আদ-দুহা) | 11 | 47s |
| 107 | Al-Ma'un (আল-মা‘উন) | 7 | 26s |
| 113 | Al-Falaq (আল-ফালাক) | 5 | 21s |

## Features

| Section | What it does |
| --- | --- |
| **পাঠ** (Read) | Tajweed-coloured Arabic, Bangla উচ্চারণ, Latin transliteration, Bangla translation, per-ayah play button, tajweed notes and a memorisation hook for every ayah. |
| **শব্দে শব্দে** (Word by word) | Every word with its Arabic, উচ্চারণ, Bangla + English meaning, trilateral root, root sense and grammatical role. Words flow right-to-left, as recited. Repeated words are surfaced separately. |
| **তাফসীর** (Tafsir) | শানে নুযূল, ফযীলত, and a per-ayah commentary drawn from mainstream tafsir works and authenticated hadith. |
| **মাইন্ড ম্যাপ** (Mind map) | The surah as a root ayah with branches growing from it, plus the linguistic patterns that make it memorable — Al-Falaq's repeated `مِنْ شَرِّ` stem and qalqalah rhyme, Ad-Duha's mirror of three favours against three commands. |
| **মুখস্থ** (Memorise) | Four drills — listen & repeat, progressive word masking, ayah chaining, next-word quiz — with Leitner-spaced review tracking saved in the browser. |

Global controls: light/dark theme, tajweed colours on/off, উচ্চারণ /
transliteration / translation toggles, Arabic font size, playback speed
(0.5×–1.5×), repeat count, and a silent gap after each repetition so you can
recite back.

## Per-ayah audio

The app ships one full-surah MP3 per surah and plays segments of it. Segment
boundaries live in the data file (`ayah.audio = { start, end }`) and were
measured by locating the reciter's breath pauses in the recording's energy
envelope. Neither recording contains a basmalah.

A `requestAnimationFrame` loop stops each clip exactly at its boundary;
`timeupdate` fires only ~4×/s and would overshoot audibly. Seeking into a region
the browser has not buffered yet is clamped by the browser, which would silently
play the wrong audio, so the seek is re-attempted as more of the file arrives.

This keeps one HTTP request per surah instead of one per ayah, and repeat/gap/
chaining all fall out of the same segment plan.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router (HashRouter).
No backend, no external API calls — fonts (Scheherazade New, Amiri, Hind
Siliguri, Noto Sans Bengali) are bundled via `@fontsource`, so the build is a
fully static, offline-capable site.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
npm run lint
```

`base` is `./` and routing is hash-based, so `dist/` can be dropped on GitHub
Pages, S3, Netlify or any sub-path without configuration.

### Deployment

The app is deployed and publicly available at:

**https://mazharulislam.me/Quran-Project/**

`.github/workflows/deploy.yml` runs on every push to `main` or the current
default branch, and on manual `workflow_dispatch`. It publishes the built
`dist/` twice over, so the site stays live under either Pages setting:

- it force-pushes `dist/` to the `gh-pages` branch (works when
  **Settings → Pages → Source** is *"Deploy from a branch"*), and
- it uploads the same build as a Pages artifact (works when Source is
  *"GitHub Actions"*).

Only one path is ever active; the other is a harmless no-op. Both exist because
`GITHUB_TOKEN` cannot flip that setting itself, and serving the repository
source instead of the build yields a blank page.

Because `base` is `./` and routing is hash-based, the same build works at a
repository sub-path, a domain root, or a custom-domain sub-path such as
`/Quran-Project/`.

### Deployment hardening

Three build-time measures exist so a deployed page cannot fail silently:

- **The entry chunk is inlined into `index.html`** (`inlineEntryScript` in
  `vite.config.ts`). A separate `<script src>` is the one request whose failure
  produces a blank page with a correct-looking tab title, since the HTML and
  its `<title>` still arrive. Inlining removes that failure mode; the build
  throws if the inline ever silently reverts to an external script.
- **`404.html` is a copy of `index.html`**, so unknown or deep-linked paths
  boot the app instead of showing GitHub's 404.
- **A fallback panel in `index.html`** reveals itself if `#root` is still empty
  after 5s, printing the captured error — a white screen is never silent.

The stylesheet stays external on purpose: if it fails the page is unstyled but
still readable, and keeping it out of the HTML leaves its font URLs resolving
against `assets/` where they belong.

## Adding another surah

1. Drop the recording in `public/audio/`.
2. Copy an existing file such as `src/data/surah-093-ad-duha.ts` and fill in the
   ayahs. Each ayah needs its tajweed `spans` (concatenating every `t` must
   reproduce the ayah exactly), `uccharon`, `translit`, `bn`, `en`, `audio`
   timings, `words`, `tafsir`, `tajweedNotes` and a `memoryHook`. The `mindMap`
   needs an `intro`, a `rootAyah` and its branches.
3. Register it in `SURAHS` in `src/data/index.ts`.

Every view is data-driven, so nothing else needs to change.

## Notes on the content

- Arabic is written in the Imlaei (simplified) orthography for consistent
  rendering everywhere; the sukūn on `مِنْ` is kept explicit because the ikhfāʾ
  lesson depends on seeing it.
- Tajweed colours cover ten rules — ইখফা, গুন্নাহ, ইদগাম, ইযহার, কলকলা, মাদ্দে
  তবীয়ী, মাদ্দে মুত্তাসিল (৪–৫ হরকত), মাদ্দে লাযিম (৬ হরকত), লাম শামসিয়্যাহ and
  লাম কমারিয়্যাহ — each with a Bangla explanation in the legend. The three madd
  lengths are distinguished rather than collapsed, so ضَالًّا (6 counts) and
  عَائِلًا (4–5) are not mislabelled as ordinary 2-count madd.
- Tafsir is a condensed presentation based on mainstream works (Ibn Kathir,
  Tabari, Sa'di) and hadith from Bukhari, Muslim, Tirmidhi, Abu Dawud and
  Nasa'i. It is a study aid, not a substitute for the primary works or a
  qualified teacher.
