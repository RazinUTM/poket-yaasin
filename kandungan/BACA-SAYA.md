# Panduan kandungan Poket Yaasin

Semua kandungan app ditulis dalam fail YAML/TSV dalam folder ini. App tidak membaca fail ini secara terus: `tools/bina.py` menyemak semuanya, kemudian menjana `docs/data/kandungan.js`.

```
python3 -I tools/bina.py          # semak + jana docs/data/kandungan.js (gagal jika ada ralat)
python3 -I tools/bina.py --semak  # semak sahaja
python3 -I tools/semak_hadis.py   # semak lafaz doa hadis dengan teks hadis asal (sunnah.com)
```

## Fail

| Fail | Isi |
|---|---|
| `doa/01-buku.yaml` | Doa dan zikir daripada buku *Surah Yaasiin, Tahlil & Doa* (ISBN 983-046-278-1) |
| `doa/02-harian.yaml` | Doa harian daripada hadis |
| `doa/03-hajat.yaml` | Doa hajat: kesusahan, rezeki, ilmu, keluarga, sakit, kematian |
| `doa/04-semasa.yaml` | Doa cuaca, bencana, ummah, musim |
| `doa/05-quran.yaml` | Doa daripada ayat al-Quran |
| `doa/06-zikir-selawat.yaml` | Zikir harian daripada hadis sahih (bilangan hanya jika disebut hadis) dan selawat, termasuk selawat susunan ulama (Tafrijiyah, Syifa') dengan nota pandangan |
| `templat.yaml` | Baris yang berubah ikut nama arwah (`{NAMA}`, `{BAPA}`) dan kata ganti |
| `susunan.yaml` | Susunan bacaan (Yaasin, Tahlil lengkap, Tahlil ringkas, Nisfu Syaaban) |
| `majlis.yaml` | Templat Pembina Majlis |
| `kalendar.yaml` | Peraturan cadangan "Untuk saat ini" di skrin Utama |
| `hijri.yaml` | Tarikh mula bulan Hijri di Malaysia (mengatasi kalendar Umm al-Qura) |
| `kategori.yaml` | Kategori doa: label, warna, ikon |
| `nota.yaml` | Nota hukum, adab dan kaedah (menu Nota) |
| `rumi.yaml` | Dasar Rumi: lafaz zikir/diksi yang Rumi-nya dikekalkan |
| `perkata.tsv` | Makna setiap perkataan ayat (BM). **DRAF: perlu disemak guru** |
| `hafalan.yaml` | Senarai hafalan: surah pilihan, bacaan asas, surah lazim. Teks surah TIDAK dimuatkan (Akta 326). `audio: false` = dijejak sahaja dalam Mod Selamat (audio dalam Smart Quran) |
| `dasar.yaml` | Dasar kandungan al-Quran: `mod_selamat: true` mengira teks + audio dalam had satu juzuk. Tukar hanya selepas jawapan bertulis LPPPQ |
| `avatar.yaml` | Pek watak TERBINA (awam), sengaja kosong. Imej keluarga masuk melalui pek peribadi yang diimport dalam telefon (`tools/pek.py`, folder `peribadi/` yang tidak di-commit) |
| `sinonim.yaml` | Kamus carian pintar: kumpulan istilah yang dianggap sama maksud (perkataan harian, ejaan Rumi). Istilah pertama = label |
| `laman.yaml` | Laman rasmi (domain) untuk "Cari dalam laman rasmi"; `negeri` = awalan kod zon JAKIM |
| `khat.yaml` | Senarai selawat dan zikir untuk kad khat harian di skrin Utama. Bukan petikan ayat al-Quran |
| `mushaf.yaml` | Sempadan juz dan muka surat Mushaf Madinah (metadata, dijana sekali daripada quran-meta) |
| `zon-solat.yaml` | 60 zon waktu solat JAKIM dengan titik tengah (untuk kiraan anggaran) |

## Doa

```yaml
- id: musibah                       # unik, huruf kecil dan sengkang; menjadi URL #/doa/musibah
  tajuk: Ketika ditimpa musibah
  subtajuk: (pilihan)
  kat: [jiwa, kematian]             # mesti wujud dalam kategori.yaml
  tag: [musibah, sabar]             # kata kunci carian tambahan
  bila: "Ketika menerima berita kematian"   # (pilihan) dipaparkan dalam kotak "Bila"
  ulang: 3                          # (pilihan) bilangan ulangan seluruh doa
  lihat: [tahlil]                   # (pilihan) pautan ke nota.yaml
  sumber:
    jenis: hadis                    # hadis | buku | athar | ulama | quran
    ruj: "Sahih Muslim, no. 918a"   # format ini dibaca oleh semak_hadis.py
    darjat: Sahih                   # Sahih | Hasan | Diperselisihkan | Dha'if | Athar | ulama | amalan
    url: https://sunnah.com/muslim:918a
    nota: "(pilihan)"
  teks: "إِنَّا لِلَّهِ ... | اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي"
  frasa: "Sesungguhnya kami milik Allah ... | Ya Allah, berilah aku pahala dalam musibahku"
  rumi: "Innaa lillaahi ... Allaahumma'jurnii fii mushiibatii."
  makna: "Maksud penuh."
  nota: "(pilihan) boleh guna {{2:156}} dan [[tahlil|pautan nota]]"
```

- `|` memisahkan frasa. **Bilangan frasa Arab mesti sama dengan bilangan frasa BM**, jika tidak bina gagal.
- Doa panjang dipecah kepada `bahagian:` (senarai). Setiap bahagian boleh ada `tajuk`, `teks`, `frasa`, `rumi`, `makna`, `ulang`, `pilihan: true`, atau salah satu daripada:
  - `quran: "36:82-83"`: petikan ayat. Teks diambil daripada mushaf, **tiada Rumi**, ada audio.
  - `arwah: khusus-doa`: baris nama arwah daripada `templat.yaml` (diulang bagi setiap nama).
  - `varian: arwah-ampun`: baris yang kata gantinya dipilih ikut bilangan/jantina arwah (`l`, `p`, `d`, `r`, `rp`).
- `semak: false` melangkau semakan hadis (cth. athar yang tiada dalam pangkalan). `semak_kecuali: ["frasa"]` mengecualikan frasa tertentu, dengan nota sebab.

## Rujukan ayat

`2:255` satu ayat, `2:284-286` julat, `2:201#4-` perkataan ke-4 hingga hujung ayat, `3:191#13-, 3:192-194` gabungan. Dalam teks bebas: `{{36:58}}` menjadi pautan ayat.

## Dasar Rumi

Ayat al-Quran tidak diberi Rumi (Muzakarah Fatwa Kebangsaan ke-24, 1989). `bina.py` mengesan secara automatik frasa doa yang sama dengan sekurang-kurangnya 12 huruf rasm berturut-turut daripada mana-mana ayat. Setiap petikan mesti diputuskan:

1. sembunyikan dalam Rumi dengan tanda `⟨36:82⟩` (atau `⟨4:69,1:7⟩`), app memaparkan cip "ayat 36:82" yang membuka ayat itu; atau
2. tambah lafaz ke `rumi.yaml` (`kekal`) jika ia zikir yang diajar hadis atau ungkapan doa lazim, beserta sebab.

Laporan setiap keputusan: `tools/laporan-petikan-ayat.md`. Senarai `kekal` ialah keputusan editorial dan perlu disahkan guru.

## Makna perkataan (`perkata.tsv`)

```
36:1	Yaa Siin
2:201#4-	Wahai Tuhan kami|berilah kami|di|dunia|...
```

Satu baris = satu ayat (atau julat perkataan), TAB, kemudian makna setiap perkataan dipisah `|`. Bilangan makna mesti sama dengan bilangan perkataan Uthmani; `bina.py` menyemaknya.

## Kalendar (`kalendar.yaml`)

```yaml
- id: malam-jumaat
  tajuk: Malam Jumaat
  jenis: amalan                     # waktu | amalan | musim | semasa (menentukan warna dan susunan)
  bila: [{hari: [4], dari: "19:15"}, {hari: [5], hingga: "05:45"}]   # mana-mana satu syarat
  pesan: "Teks ringkas. [[yaasin-jumaat|Baca nota]]"
  cadang: [majlis:yaasin-jumaat, doa:selawat-11]
```

Syarat: `hari` (0 = Ahad), `dari`/`hingga` (24 jam, boleh melintasi tengah malam), `hijri: {bulan, hari: [a, b]}`, `tarikh: ["YYYY-MM-DD", "YYYY-MM-DD"]`, `sentiasa: true`. Kemas kini peristiwa `semasa` (monsun, peperiksaan, seruan solat hajat) setiap kali menerbit.

## Nota (`nota.yaml`)

`id`, `kumpulan` (hukum | amalan | adab | kaedah), `tajuk`, `ringkas`, `kata` (pilihan: kata kunci carian, cth. ejaan lain dan frasa harian), `disemak` (tarikh), `isi` (perenggan, `- ` senarai, `**tebal**`, `{{s:a}}`, `[[id]]`), `sumber` (senarai `{t: tajuk, p: penerbit dan tarikh, u: URL}`). Ringkaskan sumber dengan kata-kata sendiri; jangan salin perenggan. Setiap perenggan dan butir senarai menjadi satu unit carian: hasil carian membuka nota pada butir yang sepadan, jadi satu butir = satu topik (cth. satu solat sunat).

Nombor hadis mengikut penomboran sunnah.com (artikel mufti kadang-kadang memakai penomboran cetakan lain). Darjat hadis sunan: sebut penilai (cth. "hasan menurut Darussalam", "sahih menurut al-Albani"). Tulis rujukan sebagai "Koleksi nombor" (cth. "Sahih Muslim 1144b", "Jami' at-Tirmizi 746"; dalam `pesan` kalendar boleh "Sahih al-Bukhari no. 935"); hadis Muslim yang bernombor huruf mesti disertakan hurufnya. `python3 tools/semak_hadis.py` menyemak setiap rujukan sebegini dalam `nota.yaml` dan `kalendar.yaml` wujud dalam pangkalan sunnah.com tempatan.

Pautan ke perenggan tertentu (`#/nota/{id}?b={n}`) mengira perenggan dan butir senarai dari 0. Diari memaut `puasa-nabi?b=11` dan `?b=16`, dan skrin Waktu Solat memaut `waktu-solat?b=9`; jika perenggan sebelum itu ditambah atau dibuang, kemas kini nombor dalam `docs/app/poket.js` (ujian akan gagal jika tersasar).
