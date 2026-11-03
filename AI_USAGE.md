# How AI was used

Poket Yaasin was built by Ahmad Razin Zainal Abidin with Claude (Anthropic) as coding and research assistant, over several sessions from October 2026.

- **Decisions** (features, what to include or leave out, Mod Selamat, privacy of family images and voices, the letter to LPPPQ): the author.
- **Code** (`docs/app/`, `docs/sw.js`, `tools/*.py`, `tests/asap.cjs`): drafted by AI from the author's requests, checked by the automated tests and reviewed by the author.
- **Religious text is never typed by AI.** Quranic text comes unaltered from the KFGQPC data and is cross-checked letter by letter at every build. Hadith Arabic is copied from the sunnah.com database and every phrase is matched against the cited hadith (`tools/semak_hadis.py`). Doa from the book follow the book.
- **Notes** (`kandungan/nota.yaml`), calendar messages and the search synonym list: drafted with AI from cited official sources, mainly Pejabat Mufti Wilayah Persekutuan, in AI's own words. Every numbered hadith reference is checked to exist in the local sunnah.com database. They still need review by a qualified teacher.
- **Word-by-word Malay meanings**: AI drafts, marked as drafts in the app.
- **Runtime AI (optional "Ringkasan AI", from 3 Nov 2026)**: when a user taps "Dapatkan ringkasan" on the Search screen, the question goes through the family's own Cloudflare Worker (`pelayan/ringkasan-ai.js`) to Claude Haiku with web search restricted to the mufti and JAKIM domains in `kandungan/laman.yaml`. The answer is a short summary with numbered source links, labelled as AI output to be checked against its sources. It never supplies Quranic, hadith or doa text: Arabic script is stripped from the output, and answers without citations are discarded. The API key stays in the Worker, never in the app or repository. Offline search does not use any language model.
