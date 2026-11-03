# Ringkasan AI: cara memasang Worker

Ciri "Ringkasan AI" di skrin Cari memberi jawapan ringkas (bawah 150 perkataan) dengan rujukan laman mufti dan JAKIM.
App di telefon TIDAK memegang kunci API. Kunci disimpan dalam Cloudflare Worker (pelayan kecil percuma), dan Worker
hanya melayan app di `https://razinutm.github.io` yang menghantar kod keluarga yang betul.

```
Telefon (app) ──soalan + kod keluarga──► Cloudflare Worker ──kunci API──► Claude (Haiku) + carian web
                                          (pelayan/ringkasan-ai.js)       hanya domain mufti/JAKIM
Telefon ◄── ringkasan + [1][2] + senarai sumber ──────────────────────────┘
```

Langkah ini dibuat sekali sahaja, kira-kira 15 minit, dari komputer.

## A. Claude Console (platform.claude.com)

1. **Hidupkan web search** untuk organisasi: buka Settings dan cari tetapan web search (privacy / capabilities),
   kemudian hidupkan. Tanpa ini, Claude menolak permintaan yang memakai alat carian.
2. **Had belanja (disyorkan)**: jika ada pilihan Workspace, cipta workspace "Poket Yaasin" dengan had bulanan,
   contohnya USD 10. Anggaran kos: kira-kira 1 hingga 2 sen USD setiap soalan baharu (soalan yang sama dijawab
   daripada simpanan telefon tanpa kos).
3. **Get API key**: namakan `poket-yaasin-worker` (dalam workspace di atas jika dicipta). Salin kunci itu. Ia hanya
   dipaparkan sekali. JANGAN tampal kunci dalam chat, e-mel, WhatsApp atau repo.

## B. Cloudflare Worker (dash.cloudflare.com, pelan percuma)

1. Daftar akaun Cloudflare (percuma; tiada kad kredit diperlukan untuk Workers Free).
2. Pergi ke **Workers & Pages**, tekan **Create**, pilih templat **Hello World** (Worker), namakan `poket-ai`,
   kemudian **Deploy**.
3. Tekan **Edit code**. Padam semua kod contoh, kemudian tampal keseluruhan kandungan fail
   `pelayan/ringkasan-ai.js` daripada repo
   (https://github.com/RazinUTM/poket-yaasin/blob/main/pelayan/ringkasan-ai.js, butang "Copy raw file").
   Tekan **Deploy**.
4. Pergi ke **Settings > Variables and Secrets** Worker itu dan tambah dua item jenis **Secret**:
   - `ANTHROPIC_API_KEY` = kunci dari langkah A3
   - `KOD_KELUARGA` = kod laluan pilihan Razin (cadangan: tiga atau empat perkataan rawak, contohnya
     `teratai-subuh-pelita-91`). Kod ini yang dimasukkan dalam Tetapan app setiap ahli keluarga.
   Simpan dan deploy semula jika diminta.
5. Salin URL Worker, contohnya `https://poket-ai.NAMA-AKAUN.workers.dev`. Buka URL itu dalam pelayar:
   jika keluar `{"ralat":"Guna POST."}`, Worker sudah berjalan.

## C. Sambungkan ke app

1. Masukkan URL Worker dalam `kandungan/dasar.yaml` (medan `ringkasan_ai`), kemudian jalankan langkah keluaran
   biasa (`bina.py`, ujian, `terbit.py`, commit). URL ini bukan rahsia; kod keluarga dan kunci API ialah rahsia.
2. Dalam app setiap telefon: **Tetapan > Ringkasan AI > Kod keluarga**.
3. Di skrin Cari, taip soalan (contohnya "hukum puasa hari Jumaat sahaja"), tekan **Dapatkan ringkasan**.

## Pilihan lain dalam Worker (jenis Text, tidak wajib)

- `MODEL`: lalai `claude-haiku-5-5` (paling murah dan pantas). Jika Claude menolak model atau alat carian,
  mesej ralat penuh dipaparkan dalam respons Worker (`butiran`).
- `ASAL`: lalai `https://razinutm.github.io`. Tukar hanya jika app dipindahkan ke domain lain.

## Menukar atau membatalkan

- Kod keluarga bocor: tukar `KOD_KELUARGA` dalam Cloudflare; kod lama terus tidak berfungsi.
- Kunci API bocor: padam kunci dalam Claude Console, buat kunci baharu, kemas kini `ANTHROPIC_API_KEY`.
- Matikan ciri sepenuhnya: kosongkan `ringkasan_ai` dalam `dasar.yaml` dan terbitkan semula.

## Peraturan kandungan (dikuatkuasakan dalam kod Worker)

- Carian web dihadkan kepada domain dalam `kandungan/laman.yaml` (`bina.py` gagal jika senarai berbeza).
- Tiada teks ayat, hadis atau doa: tulisan Arab dibuang daripada jawapan; arahan sistem melarang Rumi ayat.
- Jawapan tanpa petikan sumber, atau `TIADA_SUMBER`, dipaparkan sebagai "tiada jawapan yang jelas", bukan rekaan.
- Setiap jawapan dilabel sebagai ringkasan AI yang perlu disemak dengan sumbernya.
