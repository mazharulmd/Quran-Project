# কুরআন পাঠশালা — Quranic Learning App

An ayah-by-ayah Qur'an learning web app in Bangla: per-ayah recitation audio,
tajweed colour-coded Arabic, Bangla উচ্চারণ (transliteration) and translation,
per-ayah tafsir, word-by-word breakdown, a mind map of the surah's linguistic
patterns, and a memorisation workshop with progress tracking.

The first surah is **Al-Falaq (113)**, recited by Shaykh Yasser Al-Dosari.

## Features

| Section | What it does |
| --- | --- |
| **পাঠ** (Read) | Tajweed-coloured Arabic, Bangla উচ্চারণ, Latin transliteration, Bangla translation, per-ayah play button, tajweed notes and a memorisation hook for every ayah. |
| **শব্দে শব্দে** (Word by word) | Every word with its Arabic, উচ্চারণ, Bangla + English meaning, trilateral root, root sense and grammatical role. Words flow right-to-left, as recited. Repeated words are surfaced separately. |
| **তাফসীর** (Tafsir) | শানে নুযূল, ফযীলত, and a per-ayah commentary drawn from mainstream tafsir works and authenticated hadith. |
| **মাইন্ড ম্যাপ** (Mind map) | The surah as one stem and four branches, plus the linguistic patterns (repeated stem, general→specific ordering, the `إِذَا` pairs, the qalqalah rhyme) that make it memorable. |
| **মুখস্থ** (Memorise) | Four drills — listen & repeat, progressive word masking, ayah chaining, next-word quiz — with Leitner-spaced review tracking saved in the browser. |

Global controls: light/dark theme, tajweed colours on/off, উচ্চারণ /
transliteration / translation toggles, Arabic font size, playback speed
(0.5×–1.5×), repeat count, and a silent gap after each repetition so you can
recite back.

## Per-ayah audio

The app ships one full-surah MP3 and plays segments of it. Segment boundaries
live in the data file (`ayah.audio = { start, end }`) and were measured from the
recording's energy envelope — the five breath pauses fall at 2.4–2.8s, 5.2–5.5s,
9.4–9.7s and 14.1–14.5s. A `requestAnimationFrame` loop stops each clip exactly
at its boundary; `timeupdate` fires only ~4×/s and would overshoot audibly.

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

## Adding another surah

1. Drop the recording in `public/audio/`.
2. Copy `src/data/surah-113-al-falaq.ts` and fill in the ayahs. Each ayah needs
   its tajweed `spans` (concatenating every `t` must reproduce the ayah exactly),
   `uccharon`, `translit`, `bn`, `en`, `audio` timings, `words`, `tafsir`,
   `tajweedNotes` and a `memoryHook`.
3. Register it in `SURAHS` in `src/data/index.ts`.

Every view is data-driven, so nothing else needs to change.

## Notes on the content

- Arabic is written in the Imlaei (simplified) orthography for consistent
  rendering everywhere; the sukūn on `مِنْ` is kept explicit because the ikhfāʾ
  lesson depends on seeing it.
- Tajweed colours cover ইখফা, গুন্নাহ, কলকলা, মাদ্দে তবীয়ী, ইযহার, লাম
  শামসিয়্যাহ and লাম কমারিয়্যাহ, each with a Bangla explanation in the legend.
- Tafsir is a condensed presentation based on mainstream works (Ibn Kathir,
  Tabari, Sa'di) and hadith from Bukhari, Muslim, Tirmidhi, Abu Dawud and
  Nasa'i. It is a study aid, not a substitute for the primary works or a
  qualified teacher.
