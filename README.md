# Poket Yaasin, Tahlil & Doa

App web phone-first untuk bacaan Surah Yaasin, susunan tahlil arwah dan himpunan doa harian, hajat serta doa semasa. Setiap doa disertakan makna per frasa, sumber (ayat, hadis bernombor atau buku) dan nota hukum ringkas daripada pihak berautoriti. Berfungsi tanpa internet selepas dibuka sekali.

Live (GitHub Pages dari folder `docs/`): https://razinutm.github.io/poket-yaasin/

## Ciri utama

- **Skrin Utama gaya telefon**: widget jam, tarikh Masihi dan Hijri, solat seterusnya dan jalur enam waktu solat hari itu (yang seterusnya ditonjolkan; selepas Isyak, waktu esok); ikon untuk setiap bahagian; kad **khat selawat atau zikir harian** (khat Riq'ah, bergilir setiap hari, Jumaat sentiasa selawat, bacaan bertanda bintang lebih kerap, butang Kira ke Tasbih); dok Yaasin, Tahlil, Doa, Majlis.
- **Carian pintar** (skrin Cari): berjalan dalam telefon tanpa internet dan tanpa model bahasa. Faham perkataan harian dan sinonim ("anak demam" → doa orang sakit, "solat malam" → tahajjud), akar kata Bahasa Melayu, ejaan Rumi yang berbeza ("tafrijiah", "qiamullail"), salah ejaan, dan memberi jawapan pantas daripada data app (waktu solat, puasa sunat seterusnya, tarikh Hijri). Merentas doa, zikir, nota, surah, majlis dan alat; hasil nota menunjuk perenggan yang sepadan. Untuk soalan hukum atau topik yang tiada, butang carian terhad kepada laman rasmi mufti (Mufti WP, e-SMAF JAKIM dan mufti negeri ikut zon).
- **Waktu solat**: waktu e-Solat JAKIM bagi 60 zon (pilih zon atau kesan lokasi), disimpan sebulan untuk luar talian; tanpa data, waktu anggaran kiraan ditanda jelas. Peringatan sebelum waktu dan ketika masuk waktu (kad dalam app, notifikasi jika dibenarkan) dan fail kalendar `.ics` 30 hari dengan penggera. Bunyi peringatan: selawat ringkas sebelum waktu dan takbir "Allaahu akbar" dua kali ketika masuk waktu, daripada rakaman suara sendiri (mikrofon) atau fail audio dalam telefon; tanpa klip, loceng. Klip dimainkan hingga habis (Irsyad al-Fatwa PMWP Siri 59) dan hanya ketika app dibuka; app tidak membekalkan rakaman pihak ketiga.
- **Hafalan (tanpa teks surah)**: surah pilihan (Al-Kahfi, As-Sajdah, Yaasin, Ar-Rahman, Al-Waqi'ah, Al-Mulk, Al-Insan), bacaan asas (Al-Fatihah, Ayat al-Kursi, Akhir al-Baqarah), 22 surah lazim Ad-Dhuha hingga An-Nas, dan mana-mana surah lain. Setiap surah ialah grid butang nombor ayat ikut muka surat Mushaf Madinah. **Mod Selamat** (lalai): audio dalam app hanya untuk Yaasin, bacaan asas dan surah lazim (kecuali Al-'Alaq dan Al-Bayyinah) supaya teks + audio kekal di bawah satu juzuk; surah panjang dan surah tambahan dijejak sahaja (tanda hafal, murajaah, rekod bacaan), dengan butang ke aplikasi Smart Quran yang diperakui KDN untuk audio. Sentuh nombor ayat untuk mendengar ayat itu (contohnya apabila tersangkut); ayat yang kerap dirujuk ditanda dan boleh diulang. Mod Dengar (ulang 1 hingga 10 kali, jeda), Ikut (qari, kemudian giliran anda) dan Uji (giliran anda dahulu, kemudian qari menyemak). Giliran dimainkan sebagai audio senyap dengan bunyi isyarat, jadi sesi terus berjalan apabila skrin padam; butang sebelum/seterusnya pada stereng, skrin kereta, fon telinga atau skrin kunci menukar ayat (Media Session). Sambung dari ayat terakhir, tanda ayat dihafal, murajaah berjarak (1, 3, 7, 14, 30, 60, 120 hari), cip Al-Kahfi pada hari Jumaat.
- **Diari**: kalendar bulanan Masihi dan Hijri untuk menanda puasa (sunat, ganti, Ramadan, nazar), dengan hari sunat dan hari dilarang berpuasa ditanda, dan peringatan jika berpuasa sunat pada hari Jumaat, Sabtu atau Ahad sahaja; rekod mengaji ikut muka surat atau surah dan ayat, kedudukan khatam, bilangan khatam, kadar dan anggaran tarikh khatam; catatan harian; sandaran fail JSON. Data kekal dalam telefon.
- **Keluarga**: profil ahli (nama, peranan, gambar, watak daripada pek keluarga atau huruf awal), diari dan hafalan berasingan bagi setiap ahli, papan kemajuan 7 hari, nama keluarga dan avatar di skrin Utama. Gambar dikecilkan kepada 240 px dan disimpan dalam telefon sahaja (tidak dimuat naik, tidak dalam repo).
- **Pek watak keluarga (peribadi)**: ilustrasi keluarga diimport sebagai satu fail JSON dalam telefon (Keluarga > Import pek) dan disimpan dalam telefon sahaja; ia tidak berada dalam repo atau GitHub Pages (kedua-duanya awam). Pek yang sama diimport di setiap telefon: app bertanya "Telefon ini milik siapa?", kemudian watak lain menjadi profil ahli keluarga. Watak dipaparkan separuh badan (hingga peha) di skrin Utama, Keluarga, Hafalan, Diari, Cari, Nota, Waktu Solat dan mesej kejayaan; gambar berkumpulan di widget foto Utama (bertukar setiap hari), Keluarga, Hafalan, Diari, Cari, papan kemajuan dan doa Perjalanan. Tiada pelekat di skrin bacaan ayat. Pek dibina dengan `tools/avatar.py` (potong helaian) dan `tools/pek.py` dalam folder `peribadi/` (dalam `.gitignore`), dan termasuk dalam sandaran. Pek juga boleh membawa klip bunyi peringatan keluarga (selawat dan takbir, MP3 atau M4A).
- **Tasbih**: pengira zikir dengan sasaran daripada doa dalam app (33/33/33 selepas solat, 100, 11), getaran, skrin kekal menyala, kiraan disimpan.
- **Rujukan & penafian**: senarai semua laman mufti, JAKIM, KDN dan kitab hadis yang dipetik, dikumpul ikut penerbit; penafian dipaparkan sekali semasa mula guna.
- **Yaasin**: teks Mushaf Madinah (KFGQPC, Hafs), terjemahan Basmeih, makna setiap perkataan (sentuh perkataan), audio empat qari dengan ikut-ayat automatik, tanda bacaan terakhir.
- **Tahlil**: susunan lengkap dan ringkas mengikut buku *Surah Yaasiin, Tahlil & Doa*. Isi nama arwah sekali; nama disebut dalam doa dan kata ganti (dia lelaki/perempuan, berdua, mereka) dipilih automatik.
- **Doa**: 165 doa dengan carian pintar (BM, Rumi atau Arab tanpa baris), penapis kategori, label darjat (Al-Quran, Sahih, Hasan, Diperselisihkan, Dha'if, Athar, Susunan ulama), pautan ke sunnah.com, simpan (bintang) dan **Doa Saya** (doa sendiri, disimpan dalam telefon).
- **Untuk saat ini**: widget di skrin Utama mencadangkan doa ikut waktu, hari, tarikh Hijri (dilaraskan dengan takwim Malaysia) dan peristiwa semasa (monsun, SPM/STPM, jerebu, Palestin).
- **Pembina Majlis**: 19 templat (tahlil, doa selamat, pindah rumah, perkahwinan, aqiqah, peperiksaan, musafir, ziarah, solat hajat bencana/Palestin/jerebu dan lain-lain). Susun semula, tambah bacaan, kongsi melalui pautan + kod QR, cetak buku kecil A5.
- **Mod Majlis**: skrin penuh gelap untuk imam/pembaca, langkah demi langkah, pengira zikir (×33, ×100), skrin kekal menyala.
- **Nota**: 23 nota hukum, amalan dan kaedah (status hadis fadhilat Yaasin, hukum tahlil termasuk pandangan Perlis, Nisfu Syaaban, Rumi, Akta 326, waktu mustajab, adab doa, solat sunat, amalan harian Nabi ﷺ, selawat termasuk Tafrijiyah dan Syifa') dengan nombor hadis, darjat dan pautan artikel mufti.
- **Zikir dan selawat harian**: zikir daripada hadis sahih (bilangan hanya jika disebut hadis, contohnya tasbih dan tahlil 100 kali sehari), Selawat Ibrahimiyah, serta selawat susunan ulama dengan nota pandangan rasmi.
- **Dasar Rumi**: ayat al-Quran tidak diberi Rumi (Muzakarah Fatwa Kebangsaan ke-24, 1989); petikan ayat dalam doa dikesan secara automatik dan Rumi-nya diganti pautan ayat.

## Struktur

```
docs/                 ← GitHub Pages
  index.html          kerangka (shell)
  app/poket.js        keseluruhan app, satu fail, vanilla JS
  app/poket.css       gaya, termasuk mod malam dan cetak A5
  data/kandungan.js   DIJANA oleh tools/bina.py, jangan edit
  sw.js               service worker (luar talian)
  version.json        versi untuk banner "Versi baharu"
  fonts/ img/ js/vendor/
kandungan/            sumber kandungan (YAML/TSV), lihat kandungan/BACA-SAYA.md
tools/
  bina.py             semak + jana data (semakan silang teks al-Quran, petikan ayat, rujukan, had 1 juzuk, kad khat bukan ayat)
  semak_hadis.py      semak setiap frasa doa hadis dengan teks hadis asal, dan rujukan hadis bernombor dalam nota dan kalendar
  terbit.py           naikkan versi sebelum push
  avatar.py           potong helaian ilustrasi keluarga kepada muka dan gambar WebP (keluaran ke peribadi/avatar/)
  pek.py              bina pek keluarga peribadi (watak, gambar dan klip bunyi peringatan; JSON untuk diimport dalam telefon) daripada peribadi/pek.yaml
  laporan-petikan-ayat.md   dijana: setiap petikan ayat dalam doa dan keputusan Rumi
  senarai-ayat-dalam-app.md dijana: semua ayat dalam app ikut surah dan baki perkataan sebelum 1 juzuk (lampiran surat kepada LPPPQ/KDN)
tests/asap.cjs        ujian Playwright (390 px, mod cerah/gelap, luar talian, audio tiruan, mikrofon tiruan, pek sintetik)
peribadi/             TIDAK di-commit (.gitignore): pek.yaml, avatar/*.webp, bunyi/*.m4a, pek-keluarga.json
THIRD_PARTY_LICENSES.md  bahan pihak ketiga dan lesennya (English)
AI_USAGE.md           bagaimana AI digunakan (English)
```

## Kemas kini kandungan

```bash
pip install pyyaml                      # sekali sahaja
# edit kandungan/*.yaml
python3 -I tools/bina.py                # semak + jana docs/data/kandungan.js
python3 -I tools/semak_hadis.py         # semak lafaz hadis (muat turun pangkalan ~38 MB kali pertama)
node tests/asap.cjs                     # ujian (perlu: npm i -D playwright && npx playwright install chromium)
python3 -I tools/terbit.py              # naikkan versi (hanya jika kod/data berubah)
git add -A && git commit -m "..." && git push
```

Sumber teks al-Quran, terjemahan dan pangkalan hadis dimuat turun sekali ke `tools/sumber/` (tidak di-commit).

## Menerbitkan di GitHub Pages

1. Cipta repo kosong `poket-yaasin` di GitHub, kemudian push.
2. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: `main`, folder `/docs`.
3. Tunggu 1–2 minit, kemudian buka `https://<nama-pengguna>.github.io/poket-yaasin/`.
4. Butang "Lapor" dalam app membuka GitHub Issues repo yang ditetapkan dalam `REPO` di `docs/app/poket.js`.

## Status dan had

- **Makna perkataan (BM) ialah draf** dan perlu disemak oleh guru yang bertauliah sebelum diedarkan secara meluas.
- **Akta Pencetakan Teks Al-Qur'an 1986 (Akta 326)**: kandungan kurang daripada satu juzuk ("bahan Al-Qur'an"), tetapi seksyen 14 tetap terpakai (tiada kesilapan, Rasm Uthmani). App ini belum disemak atau diperakui KDN. Dapatkan pengesahan bertulis LPPPQ/KDN sebelum diedarkan secara meluas. Lihat nota "Al-Quran digital dan Akta 326" dalam app.
- Senarai pengecualian Rumi (`kandungan/rumi.yaml`) ialah keputusan editorial, bukan fatwa.
- Audio dimainkan terus daripada EveryAyah.com dan quran.com, jadi memerlukan internet. EveryAyah tidak menerbitkan lesen menyeluruh bagi rakamannya.
- **Audio juga dikawal oleh Akta 326**: takrif "dokumen" termasuk rakaman bunyi dan pemancaran; KDN memperakui terbitan audio dan pernah menyita produk audio 30 juzuk. App tidak menyimpan audio (ia memainkan fail daripada pelayan EveryAyah). Sebab itu **Mod Selamat** (`kandungan/dasar.yaml`, `mod_selamat: true`) mengira teks DAN audio yang boleh dimainkan bersama dalam had satu juzuk; surah bertanda `audio: false` dalam `hafalan.yaml` dijejak sahaja. Sama ada pemain seperti ini perlukan perakuan ditanya kepada LPPPQ; tukar `mod_selamat` kepada `false` hanya selepas jawapan bertulis.
- **Waktu solat** bergantung pada API komuniti waktusolat.app (data JAKIM). Jika API berhenti, app memaparkan waktu anggaran. Peringatan ketika app ditutup tidak dijamin tanpa pelayan push; gunakan fail kalendar.
- **Kegunaan peribadi/keluarga tidak dikecualikan oleh Akta 326**: s.5 (lesen untuk mencetak atau menerbitkan teks ≥ 1 juzuk) tiada pengecualian kegunaan peribadi; "menerbitkan" tidak ditakrif. Sebab itu modul Hafalan tidak memuatkan teks surah langsung. Soalan ini dimasukkan dalam surat kepada LPPPQ.
- **Had satu juzuk**: teks ayat dalam app (Yaasin, Tahlil, doa) kini ≈ 0.81 juzuk; teks + audio ≈ 0.96 juzuk (baki 95 perkataan). `bina.py` gagal jika had dilepasi, dan gagal jika `hafalan.yaml` cuba memuatkan teks. Menambah audio surah lain dalam Mod Selamat memerlukan audio lain dibuang dahulu.
- **App tidak diindeks enjin carian** (`<meta name="robots" content="noindex">` dalam `docs/index.html`) kerana ia untuk kegunaan peribadi dan keluarga. Pautan masih boleh dikongsi; buang baris itu jika mahu app ditemui melalui carian.
- **Imej keluarga tidak boleh berada dalam repo**: repo dan GitHub Pages awam, dan fail yang pernah di-push kekal dalam sejarah git. Folder `docs/avatar/` dibuang pada versi 2026-11-02a; jangan kembalikan.
- **Diari tiada sandaran automatik**: data hanya dalam localStorage telefon. Padam data pelayar atau tukar telefon tanpa sandaran = data hilang.
- **Penafian bukan pengecualian undang-undang**: ia menerangkan sumber, tetapi Akta 326 s.14 tetap terpakai. Langkah perakuan KDN: lihat dokumen panduan berasingan.

## Sumber dan lesen

Waktu solat: e-Solat JAKIM melalui waktusolat.app (projek komuniti mptwaktusolat). Zon: kod dan nama zon JAKIM melalui data projek yang sama; titik tengah zon dikira sendiri daripada sempadan daerah. Teks al-Quran: KFGQPC (pengekodan Khaled Hosny). Terjemahan: Abdullah Muhammad Basmeih melalui Tanzil.net (bukan komersial). Hadis: sunnah.com. Audio: EveryAyah.com, quran.com. Fon: Amiri, Amiri Quran, Aref Ruqaa, Atkinson Hyperlegible Next (SIL OFL 1.1). QR: qrcode-generator (MIT). Butiran dalam nota "Sumber data dan lesen" dalam app.
