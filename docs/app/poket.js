/* Poket Yaasin, Tahlil & Doa — keseluruhan app dalam satu fail (vanilla JS, tanpa build).
   Data: window.PY_DATA daripada docs/data/kandungan.js (dijana oleh tools/bina.py; JANGAN edit terus).
   Storan telefon: localStorage berawalan "poket-" (tetapan, bintang, doa-saya, majlis-saya, arwah, terakhir). */
'use strict';
const APP_VERSION='2026-11-03a';
const REPO = 'RazinUTM/poket-yaasin';   // butang "Lapor" membuka GitHub Issues repo ini
const D = window.PY_DATA || {doa: [], ayat: {}, surah: {}, susunan: [], majlis: [], kalendar: [], nota: [], kat: {}, templat: {}, hijri: {}};

/* ================================================================ utiliti DOM */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(tag, a, ...kids) {
  const el = document.createElement(tag);
  if (a) for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;                 // HANYA untuk rentetan statik (ikon)
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'checked' || k === 'selected') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  tambah(el, kids);
  return el;
}
/* Tambah anak (nod, rentetan, tatasusunan bersarang); null/false diabaikan. GUNA INI, bukan tambah(el, ),
   kerana append() menukar null menjadi teks "null" dan tatasusunan menjadi "[object …]". */
function tambah(el, ...kids) {
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
const frag = (...k) => tambah(document.createDocumentFragment(), k);

/* ================================================================ ikon (garis, 24×24) */
const IK = {
  utama: '<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.8 9.8v9.7h12.4V9.8"/><path d="M10 19.5v-5h4v5"/>',
  yaasin: '<path d="M3.8 5.6c2.7-1.3 5.5-1.2 8.2.6 2.7-1.8 5.5-1.9 8.2-.6v13.2c-2.7-1.2-5.5-1.1-8.2.6-2.7-1.7-5.5-1.8-8.2-.6z"/><path d="M12 6.2v13.4"/>',
  tahlil: '<circle cx="12" cy="10" r="6.4" stroke-dasharray="0.1 2.95" stroke-width="2.6"/><path d="M12 16.4v3.2M10.3 21h3.4"/>',
  doa: '<path d="M7.3 20.5v-3.8C5.5 15.4 4.6 13.6 4.6 11.5V7a1.3 1.3 0 0 1 2.6 0v4.2"/><path d="M7.2 11.2l2.4 1.9c.8.6 1.2 1.5 1.2 2.5v4.9"/><path d="M16.7 20.5v-3.8c1.8-1.3 2.7-3.1 2.7-5.2V7a1.3 1.3 0 0 0-2.6 0v4.2"/><path d="M16.8 11.2l-2.4 1.9c-.8.6-1.2 1.5-1.2 2.5v4.9"/>',
  majlis: '<circle cx="9" cy="8.2" r="3"/><path d="M3.6 19.2c.6-3 2.7-4.6 5.4-4.6s4.8 1.6 5.4 4.6"/><path d="M15.8 5.4a3 3 0 0 1 0 5.6M17.3 14.8c1.6.6 2.7 2 3.1 4.4"/>',
  cari: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.6 15.6 4.6 4.6"/>',
  bintang: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  main: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  jeda: '<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
  henti: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" stroke="none"/>',
  sebelum: '<path d="M6.5 5.5v13" stroke-width="2.6"/><path d="M18.5 5.8 9 12l9.5 6.2z" fill="currentColor" stroke="none"/>',
  seterusnya: '<path d="M17.5 5.5v13" stroke-width="2.6"/><path d="M5.5 5.8 15 12l-9.5 6.2z" fill="currentColor" stroke="none"/>',
  kereta: '<path d="M4.5 16.5v-4.3l1.9-4.6a1.6 1.6 0 0 1 1.5-1h8.2a1.6 1.6 0 0 1 1.5 1l1.9 4.6v4.3z"/><path d="M4.5 12.2h15"/><circle cx="8" cy="16.6" r="1.6"/><circle cx="16" cy="16.6" r="1.6"/>',
  tetapan: '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  nota: '<path d="M6 3.8h9l3.5 3.5v12.9H6z"/><path d="M14.6 3.8v3.9h3.9M9 12h6.5M9 15.5h6.5M9 8.6h3"/>',
  kembali: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
  kongsi: '<circle cx="17.5" cy="5.8" r="2.4"/><circle cx="6.5" cy="12" r="2.4"/><circle cx="17.5" cy="18.2" r="2.4"/><path d="m8.6 10.8 6.8-3.8M8.6 13.2l6.8 3.8"/>',
  cetak: '<path d="M7 8.5V3.8h10v4.7"/><rect x="3.8" y="8.5" width="16.4" height="7.5" rx="1.6"/><path d="M7 13.5h10v6.7H7z"/>',
  salin: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5.6A1.6 1.6 0 0 0 13.9 4H5.6A1.6 1.6 0 0 0 4 5.6v8.3a1.6 1.6 0 0 0 1.6 1.6h2.9"/>',
  tambah: '<path d="M12 5v14M5 12h14"/>',
  tolak: '<path d="M5 12h14"/>',
  atas: '<path d="m6.5 14.5 5.5-5.5 5.5 5.5"/>',
  bawah: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  buang: '<path d="M4.5 6.8h15M9.5 6.8V4.6h5v2.2M6.6 6.8l.9 12.6h9l.9-12.6"/>',
  tutup: '<path d="M6 6l12 12M18 6 6 18"/>',
  pentas: '<path d="M4 8.5V4h4.5M20 8.5V4h-4.5M4 15.5V20h4.5M20 15.5V20h-4.5"/>',
  dengar: '<path d="M4.5 14v-1.8a7.5 7.5 0 0 1 15 0V14"/><rect x="3.6" y="13.4" width="4.1" height="6.5" rx="1.6"/><rect x="16.3" y="13.4" width="4.1" height="6.5" rx="1.6"/>',
  lapor: '<path d="M5.5 21V4.2M5.5 4.6h11.3l-2.3 4 2.3 4H5.5"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 18.5V20M20 14v1.5"/>',
  sunting: '<path d="M14.8 5.2l4 4L8.6 19.4H4.6v-4z"/><path d="m12.8 7.2 4 4"/>',
  tanda: '<path d="M6.5 3.8h11v16.6L12 16.6l-5.5 3.8z"/>',
  lagi: '<circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  kanan: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  hurufK: '<path d="M4 18 8.5 6h1L14 18M5.6 14h6.8"/><path d="M16 12.5h4"/>',
  hurufB: '<path d="M3.5 18 8 6h1l4.5 12M5.1 14h6.8"/><path d="M15.5 12.5h5M18 10v5"/>',
  solat: '<path d="M3.5 20.5h17"/><path d="M6.4 20.5v-5.8a5.6 5.6 0 0 1 11.2 0v5.8"/><path d="M10.3 20.5v-2.6a1.7 1.7 0 0 1 3.4 0v2.6"/><path d="M12 9.1V7.3"/><path d="M12.9 3.2a2.1 2.1 0 1 0 1 3.6 1.7 1.7 0 0 1-1-3.6z"/>',
  tasbih: '<circle cx="12" cy="13.6" r="7.2"/><path d="M12 6.4V3.6M10.2 3.6h3.6"/><rect x="8.4" y="11.6" width="7.2" height="3.8" rx=".9"/><path d="M10.6 11.6v3.8M13.4 11.6v3.8"/>',
  pagipetang: '<path d="M3 18.5h18M7.5 21.5h9"/><path d="M6.6 18.5a5.4 5.4 0 0 1 10.8 0"/><path d="M12 5v2.6M5.4 8.4l1.8 1.8M18.6 8.4l-1.8 1.8M2.9 13.9h2.3M18.8 13.9h2.3"/>',
  rujukan: '<path d="M4.5 4.5h3.8v15H4.5zM8.3 4.5h3.8v15H8.3z"/><path d="m13.5 6.2 3.7-1 3.9 14.5-3.7 1z"/><path d="M4.5 8.2h7.6M4.5 15.8h7.6"/>',
  lokasi: '<path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
  muat: '<path d="M19.4 12.6a7.5 7.5 0 1 1-2.3-6.1"/><path d="M19.6 4.2v4.4h-4.4"/>',
  loceng: '<path d="M6.5 16.6V11a5.5 5.5 0 0 1 11 0v5.6l1.6 1.9H4.9z"/><path d="M10 20.6a2.2 2.2 0 0 0 4 0"/>',
  kalendar: '<rect x="4" y="5.5" width="16" height="14.6" rx="2"/><path d="M4 10.2h16M8.5 3.4v4.2M15.5 3.4v4.2"/><path d="M8 13.6h2M14 13.6h2M8 16.8h2"/>',
  info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.3"/><circle cx="12" cy="7.9" r=".9" fill="currentColor" stroke="none"/>',
  hafalan: '<path d="M6 4.2h10.8a1.4 1.4 0 0 1 1.4 1.4v13.9H7.6A1.6 1.6 0 0 1 6 17.9z"/><path d="M6 17.9a1.6 1.6 0 0 1 1.6-1.6h10.6"/><path d="m9.4 9.7 2 2 3.8-3.9"/>',
  diari: '<rect x="4" y="5.5" width="16" height="14.6" rx="2"/><path d="M4 10.2h16M8.5 3.4v4.2M15.5 3.4v4.2"/><path d="m9.2 15.1 1.9 1.9 3.8-3.9"/>',
  semak: '<path d="m5 12.6 4.4 4.4L19 7.4"/>',
  keluarga: '<circle cx="7.6" cy="7.4" r="2.5"/><circle cx="16.4" cy="7.4" r="2.5"/><circle cx="12" cy="12.6" r="2"/><path d="M3.4 18.6c.3-3.2 1.9-5.4 4.2-5.4 1 0 1.8.3 2.5.9M20.6 18.6c-.3-3.2-1.9-5.4-4.2-5.4-1 0-1.8.3-2.5.9"/><path d="M8.6 20.4c.3-2.1 1.6-3.5 3.4-3.5s3.1 1.4 3.4 3.5"/>',
  kamera: '<path d="M4 8.4h3.1l1.6-2.6h6.6l1.6 2.6H20v11H4z"/><circle cx="12" cy="13.6" r="3.3"/>',
  kongsiIos: '<path d="M12 3.6v11M8.3 7.3 12 3.6l3.7 3.7"/><path d="M8.6 10.4H6.2v10h11.6v-10h-2.4"/>',
  mikrofon: '<rect x="9" y="3.4" width="6" height="11" rx="3"/><path d="M5.6 11.4a6.4 6.4 0 0 0 12.8 0M12 17.8v3M9 20.8h6"/>',
  muzik: '<path d="M9 17.6V5.8l10-2.2v11.6"/><circle cx="6.6" cy="17.6" r="2.4"/><circle cx="16.6" cy="15.2" r="2.4"/>',
};
function ikon(n, cls) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${IK[n] || ''}</svg>`;
}
const ib = (n, label, on, extra = {}) => h('button', Object.assign({class: 'ib', type: 'button', 'aria-label': label, title: label, html: ikon(n), onclick: on}, extra));

/* ================================================================ storan telefon */
const SIMPAN = {
  baca(k, d) { try { const v = localStorage.getItem('poket-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  tulis(k, v) { try { localStorage.setItem('poket-' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  buang(k) { try { localStorage.removeItem('poket-' + k); } catch (e) {} },
};
const T = Object.assign({tema: 'auto', skala: 1, rumi: true, frasa: true, makna: true, perkata: false, qari: 'Alafasy_128kbps', hijri: 0, ikut: true,
  zon: '', peringatan: true, minitAwal: 10, bunyi: false}, SIMPAN.baca('tetapan', {}));
const simpanT = () => SIMPAN.tulis('tetapan', T);
const senarai_ = v => Array.isArray(v) ? v : [];
let BINTANG = new Set(senarai_(SIMPAN.baca('bintang', [])).filter(x => typeof x === 'string'));
const simpanBintang = () => SIMPAN.tulis('bintang', [...BINTANG]);
let ARWAH = senarai_(SIMPAN.baca('arwah', [])).filter(x => x && typeof x === 'object');          // nama arwah untuk paparan doa & susunan di luar Pembina Majlis
const simpanArwah = () => SIMPAN.tulis('arwah', ARWAH);

/* ================================================================ data */
const DOA = new Map(D.doa.map(d => [d.id, d]));
const SUS = new Map(D.susunan.map(s => [s.id, s]));
const MJ = new Map(D.majlis.map(m => [m.id, m]));
const NOTA = new Map(D.nota.map(n => [n.id, n]));
const KAT = D.kat || {};
const QARI = [
  ['Alafasy_128kbps', 'Mishary Rashid Alafasy'],
  ['Husary_128kbps', 'Mahmoud Khalil al-Husary'],
  ['Abdul_Basit_Murattal_192kbps', 'Abdul Basit Abdul Samad'],
  ['Minshawy_Murattal_128kbps', 'Muhammad Siddiq al-Minshawi'],
];

/* Doa Saya: doa yang ditulis sendiri oleh pengguna, disimpan dalam telefon. */
function doaSaya() { return senarai_(SIMPAN.baca('doa-saya', [])).filter(x => x && typeof x === 'object' && x.id); }
function doaSayaObj(x) {
  const ar = (x.ar || '').trim();
  return {id: x.id, tj: x.tj || 'Doa saya', kat: ['saya'], tag: [], saya: true, nota: x.nota || '',
    s: {j: 'saya', d: 'Doa saya', r: 'Ditulis sendiri (disimpan dalam telefon ini)'},
    b: [{ar: ar ? [ar] : [], ru: x.ru || '', mk: x.mk || ''}],
    _c: normal([x.tj, x.mk, x.ru, x.nota].join(' ')) + ' ' + normal(ar)};
}
const DOA_SESI = new Map();   // doa saya daripada pautan kongsi yang sedang dilihat (belum disimpan)
function cariDoa(id) { if (DOA.has(id)) return DOA.get(id); const x = doaSaya().find(d => d.id === id) || DOA_SESI.get(id); return x ? doaSayaObj(x) : null; }

/* ================================================================ teks */
const AR_DIG = '٠١٢٣٤٥٦٧٨٩';
const arNum = n => String(n).replace(/\d/g, d => AR_DIG[d]);
const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const BULAN_H = ['Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jamadilawal', 'Jamadilakhir', 'Rejab', 'Syaaban', 'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah'];
const pad = (n, w = 2) => String(n).padStart(w, '0');
const isoTarikh = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function fmtMasa(d) { const j = d.getHours(), m = d.getMinutes(); return `${(j % 12) || 12}:${pad(m)} ${j < 12 ? 'AM' : 'PM'}`; }
function fmtTarikh(d) { return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; }

/* Normalisasi carian: huruf kecil, buang baris Arab, satukan bentuk alif/ya/ta marbutah (sama seperti cari_normal dalam bina.py). */
const RE_BARIS = /[ؐ-ًؚ-ٰٟۖ-ۭـ‌-‏⁠]/g;
function normal(s) {
  return String(s || '').normalize('NFKC').toLowerCase().replace(RE_BARIS, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/[ىی]/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[’'`ʿʾ]/g, '').replace(/\s+/g, ' ').trim();
}

/* ================================================================ tarikh Hijri
   Kalendar Umm al-Qura peranti (Intl), dilaraskan dengan jadual permulaan bulan Malaysia (D.hijri) dan pelarasan pengguna (T.hijri). */
const HIJRI_FMT = (() => {
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'numeric', year: 'numeric'});
    return /islamic/.test(f.resolvedOptions().calendar) ? f : null;
  } catch (e) { return null; }
})();
function umq(dt) {
  if (HIJRI_FMT) {
    const p = {}; for (const x of HIJRI_FMT.formatToParts(dt)) p[x.type] = x.value;
    return {y: parseInt(p.year, 10), m: parseInt(p.month, 10), d: parseInt(p.day, 10)};
  }
  // sandaran: kalendar Hijri tabular (anggaran ±1–2 hari)
  const jd = Math.floor(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5) + 2440588; const l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631), l1 = l0 - 10631 * n + 354;
  const j = Math.floor((10985 - l1) / 5316) * Math.floor(50 * l1 / 17719) + Math.floor(l1 / 5670) * Math.floor(43 * l1 / 15238);
  const l2 = l1 - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) - Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
  const m = Math.floor(24 * l2 / 709);
  return {y: 30 * n + j - 30, m, d: l2 - Math.floor(709 * m / 24)};
}
const blnSebelum = (y, m) => m === 1 ? [y - 1, 12] : [y, m - 1];
const blnSelepas = (y, m) => m === 12 ? [y + 1, 1] : [y, m + 1];
function mulaBulan(y, m) {
  const s = (D.hijri || {})[`${y}-${pad(m)}`]; if (!s) return null;
  const [Y, M, DD] = s.split('-').map(Number); return new Date(Y, M - 1, DD);
}
const beza = (a, b) => Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 864e5);
/* Permulaan bulan Hijri Malaysia (D.hijri), tersusun ikut tarikh. */
const MULA_HIJRI = Object.entries(D.hijri || {}).map(([k, v]) => { const [y, m] = k.split('-').map(Number), [Y, M, DD] = String(v).split('-').map(Number); return {y, m, S: new Date(Y, M - 1, DD)}; })
  .filter(x => x.y && x.m && !isNaN(x.S)).sort((a, b) => a.S - b.S);
const anjakCache = new Map();
function anjakanUmq(x) {   // bilangan hari ditambah kepada tarikh supaya Umm al-Qura memberi 1 haribulan pada permulaan Malaysia x.S
  const k = `${x.y}-${x.m}`; if (anjakCache.has(k)) return anjakCache.get(k);
  let hasil = null;
  for (const dd of [0, 1, -1, 2, -2, 3, -3]) { const u = umq(new Date(x.S.getFullYear(), x.S.getMonth(), x.S.getDate() + dd)); if (u.y === x.y && u.m === x.m && u.d === 1) { hasil = dd; break; } }
  anjakCache.set(k, hasil); return hasil;
}
const tambahH = (t, n) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
function mulaBulanHijri(y, m) {   // {S: tarikh Masihi 1 haribulan (y, m), jadual: dari jadual Malaysia?}
  const t = mulaBulan(y, m); if (t) return {S: t, jadual: true};
  const idx = y * 12 + m; let a = MULA_HIJRI[0] || null;
  for (const x of MULA_HIJRI) if (x.y * 12 + x.m <= idx) a = x;
  const dd = a ? (anjakanUmq(a) ?? 0) : 0;
  const anggar = a ? tambahH(a.S, Math.round((idx - (a.y * 12 + a.m)) * 29.5306)) : null;
  if (anggar) for (const k of [0, 1, -1, 2, -2, 3, -3]) { const t2 = tambahH(anggar, k), u = umq(tambahH(t2, dd)); if (u.y === y && u.m === m && u.d === 1) return {S: t2, jadual: false}; }
  return anggar ? {S: anggar, jadual: false} : null;
}
function hijri(tarikh = new Date()) {
  const jk = hijriJakim(tarikh); if (jk) return jk;     // takwim JAKIM daripada data waktu solat (zon dipilih, bulan disimpan)
  const dt = new Date(tarikh.getFullYear(), tarikh.getMonth(), tarikh.getDate() + (+T.hijri || 0));
  let i = -1; for (let j = 0; j < MULA_HIJRI.length; j++) if (MULA_HIJRI[j].S <= dt) i = j;
  const a = i >= 0 ? MULA_HIJRI[i] : MULA_HIJRI[0], dd = a ? (anjakanUmq(a) ?? 0) : 0;
  const u = umq(tambahH(dt, dd));
  if (!MULA_HIJRI.length) return Object.assign(u, {jadual: false});
  let y = u.y, m = u.m;
  for (let n = 0; n < 4; n++) {   // betulkan bulan dengan permulaan sebenar (jadual Malaysia) di kedua-dua hujung bulan
    const A = mulaBulanHijri(y, m), B = mulaBulanHijri(...blnSelepas(y, m)); if (!A || !B) break;
    let mula = A.S; const pjg = beza(B.S, mula);
    if (!A.jadual && pjg > 30) mula = tambahH(B.S, -30);       // bulan Hijri hanya 29 atau 30 hari
    if (!A.jadual && pjg < 29) mula = tambahH(B.S, -29);
    if (dt < mula) { [y, m] = blnSebelum(y, m); continue; }
    if (dt >= B.S) { [y, m] = blnSelepas(y, m); continue; }
    return {y, m, d: beza(dt, mula) + 1, jadual: A.jadual || B.jadual};
  }
  return Object.assign(u, {jadual: false});
}
const fmtHijri = x => `${x.d} ${BULAN_H[x.m - 1]} ${x.y}H`;

/* ================================================================ waktu solat
   Sumber utama: waktu e-Solat JAKIM melalui api.waktusolat.app (CORS dibenarkan), disimpan sebulan setiap zon.
   Sandaran luar talian: kiraan astronomi bagi titik tengah zon (Subuh 18° sejak keputusan Muzakarah MKI ke-116, 2019; Isyak 18°;
   Asar Syafi'i; ihtiyati lebih kurang seperti JAKIM), ditanda "anggaran". Ditentukur dengan 7 hari sampel JAKIM (4 zon, Jun hingga Disember): beza dalam ±2 minit. */
const API_WS = 'https://api.waktusolat.app';
const SOLAT = [['imsak', 'Imsak'], ['fajr', 'Subuh'], ['syuruk', 'Syuruk'], ['dhuha', 'Dhuha'], ['dhuhr', 'Zohor'], ['asr', 'Asar'], ['maghrib', 'Maghrib'], ['isha', 'Isyak']];
const FARDU = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const NAMA_SOLAT = Object.fromEntries(SOLAT);
const ZON = new Map((D.zon || []).map(z => [z.kod, z]));
const TZ_MY = 'Asia/Kuala_Lumpur';
const FMT_MY = new Intl.DateTimeFormat('en-GB', {timeZone: TZ_MY, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
function bahagianMY(dt) { const p = {}; for (const x of FMT_MY.formatToParts(dt)) p[x.type] = x.value; return {y: +p.year, m: +p.month, d: +p.day, j: +p.hour, mn: +p.minute}; }
const isoMY = dt => { const b = bahagianMY(dt); return `${b.y}-${pad(b.m)}-${pad(b.d)}`; };
const tarikhMY = dt => { const b = bahagianMY(dt); return new Date(b.y, b.m - 1, b.d); };   // tarikh kalendar Malaysia (untuk paparan)
const bukanMY = () => new Date().getTimezoneOffset() !== -480;                       // telefon bukan pada zon masa Malaysia
function fmtWaktu(dt, tanpaAmPm) { if (!dt) return '--:--'; const b = bahagianMY(dt); const s = `${(b.j % 12) || 12}:${pad(b.mn)}`; return tanpaAmPm ? s : `${s} ${b.j < 12 ? 'AM' : 'PM'}`; }
function bakiMasa(ms) {
  const m = Math.max(0, Math.ceil(ms / 60000)); const j = Math.floor(m / 60), mm = m % 60;
  return !m ? 'kurang seminit' : j ? `${j} jam${mm ? ` ${mm} minit` : ''}` : `${mm} minit`;
}
const kunciBulan = (zon, y, m) => `waktu-${zon}-${y}-${pad(m)}`;
/* Data bulan disimpan dalam memori dahulu, kemudian dalam storan telefon (usaha terbaik): jika storan penuh atau disekat,
   app tetap memakai salinan memori dan tidak mengambil semula tanpa henti. */
const MEM_WAKTU = new Map();
function bulanSimpan(zon, y, m) {
  const k = kunciBulan(zon, y, m);
  if (!MEM_WAKTU.has(k)) { const o = SIMPAN.baca(k, null); if (o && Array.isArray(o.p) && o.p.length) MEM_WAKTU.set(k, o); }
  return MEM_WAKTU.get(k) || null;
}
function simpanBulan(o) { const k = kunciBulan(o.zon, o.y, o.m); MEM_WAKTU.set(k, o); SIMPAN.tulis(k, o); bersihWaktuLama(); return o; }
function bulanDariApi(zon, y, m, j) {   // null jika jawapan API tidak lengkap
  if (!j || !Array.isArray(j.prayers) || !j.prayers.length) return null;
  const p = j.prayers.filter(x => x && +x.day >= 1 && +x.day <= 31 && +x.fajr > 0 && +x.isha > 0)
    .map(x => [+x.day, x.hijri || '', ...SOLAT.map(([key]) => +x[key] || 0)]);
  return p.length ? {zon, y, m, t: Date.now(), p} : null;
}
const sedangAmbil = new Map();
function ambilBulan(zon, y, m) {
  const k = kunciBulan(zon, y, m);
  if (sedangAmbil.has(k)) return sedangAmbil.get(k);
  const janji = (async () => {
    const r = await fetch(`${API_WS}/v2/solat/${encodeURIComponent(zon)}?year=${y}&month=${m}`, {cache: 'no-store'});
    if (!r.ok) throw new Error(`Pelayan waktu solat menjawab ${r.status}`);
    const o = bulanDariApi(zon, y, m, await r.json());
    if (!o) throw new Error('Data waktu solat tidak lengkap');
    return simpanBulan(o);
  })();
  sedangAmbil.set(k, janji); janji.then(() => sedangAmbil.delete(k), () => sedangAmbil.delete(k));   // ralat tetap sampai kepada pemanggil
  return janji;
}
function bersihWaktuLama() {
  try {
    const kini = bahagianMY(new Date()), had = (kini.y * 12 + kini.m) - 2;
    for (const k of Object.keys(localStorage)) {
      const m = k.match(/^poket-waktu-(\w+)-(\d{4})-(\d{2})$/);
      if (m && (+m[2] * 12 + +m[3] < had || m[1] !== T.zon)) localStorage.removeItem(k);
    }
  } catch (e) {}
}
/* Pastikan data bulan ini (dan bulan depan selepas 24 haribulan) tersimpan. */
async function pastikanWaktu(zon = T.zon) {
  if (!zon || !navigator.onLine) return false;
  const b = bahagianMY(new Date()); const perlu = [[b.y, b.m]];
  if (b.d >= 24) perlu.push(b.m === 12 ? [b.y + 1, 1] : [b.y, b.m + 1]);
  let ada = false;
  for (const [y, m] of perlu) {
    if (bulanSimpan(zon, y, m)) continue;
    try { await ambilBulan(zon, y, m); ada = !!bulanSimpan(zon, y, m); } catch (e) { console.warn(e); }
  }
  return ada;
}
/* Ambil data yang belum ada; jika data baharu diperoleh, lukis semula skrin Utama atau Waktu Solat sahaja
   (bukan skrin lain, dan bukan ketika helaian atau Mod Majlis terbuka). */
function segarWaktu() {
  return pastikanWaktu().then(ada => {
    if (ada && !helaiAktif && !pentasAktif && (hashKini === '#/' || hashKini.startsWith('#/solat'))) lukisSemula();
    return ada;
  });
}
/* Waktu solat bagi satu hari: {sumber: 'jakim'|'anggaran', hijri?, t: {fajr: Date, ...}} */
function waktuHari(tarikh = new Date(), zon = T.zon) {
  if (!zon) return null;
  const b = bahagianMY(tarikh), o = bulanSimpan(zon, b.y, b.m);
  const r = o && o.p.find(x => x[0] === b.d);
  if (r) return {sumber: 'jakim', hijri: r[1], diambil: o.t, t: Object.fromEntries(SOLAT.map(([k], i) => [k, r[i + 2] ? new Date(r[i + 2] * 1000) : null]))};
  const z = ZON.get(zon);
  return z ? {sumber: 'anggaran', t: kiraWaktu(b, z.lat, z.lon)} : null;
}
/* Solat seterusnya (fardu sahaja) mulai sekarang: {k, t: Date} */
function solatSeterusnya(kini = new Date()) {
  for (let i = 0; i < 2; i++) {
    const w = waktuHari(new Date(kini.getTime() + i * 864e5)); if (!w) return null;
    for (const k of FARDU) if (w.t[k] && w.t[k] > kini) return {k, t: w.t[k], sumber: w.sumber};
  }
  return null;
}
/* Kiraan astronomi (algoritma ringkas Jean Meeus, seperti praytimes.org). b = {y, m, d} tarikh Malaysia.
   Pelarasan (minit) dipadankan dengan sampel JAKIM: Subuh +1, Zohor +2, Asar/Maghrib/Isyak +1, dibundar ke atas; Syuruk dibundar ke bawah. */
function kiraWaktu(b, lat, lon) {
  const R = Math.PI / 180, sin = x => Math.sin(x * R), cos = x => Math.cos(x * R), tan = x => Math.tan(x * R);
  const asin = x => Math.asin(x) / R, acos = x => Math.acos(Math.max(-1, Math.min(1, x))) / R, atan2 = (y, x) => Math.atan2(y, x) / R, acot = x => Math.atan(1 / x) / R;
  const fixA = a => a - 360 * Math.floor(a / 360), fixH = h => h - 24 * Math.floor(h / 24);
  let Y = b.y, M = b.m; if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100), Bc = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + b.d + Bc - 1524.5 - lon / 360;
  const posisi = t => {
    const Dd = jd + t - 2451545.0, g = fixA(357.529 + 0.98560028 * Dd), q = fixA(280.459 + 0.98564736 * Dd);
    const L = fixA(q + 1.915 * sin(g) + 0.020 * sin(2 * g)), e = 23.439 - 0.00000036 * Dd;
    const RA = atan2(cos(e) * sin(L), cos(L)) / 15;
    return {dek: asin(sin(e) * sin(L)), eqt: q / 15 - fixH(RA)};
  };
  const tengah = t => fixH(12 - posisi(t).eqt);
  const sudut = (s, t, awal) => { const p = posisi(t), v = acos((-sin(s) - sin(p.dek) * sin(lat)) / (cos(p.dek) * cos(lat))) / 15; return tengah(t) + (awal ? -v : v); };
  const asar = (f, t) => { const p = posisi(t); return sudut(-acot(f + tan(Math.abs(lat - p.dek))), t); };
  const jam = {fajr: sudut(18, 5 / 24, true), syuruk: sudut(0.833, 6 / 24, true), dhuhr: tengah(12 / 24), asr: asar(1, 13 / 24), maghrib: sudut(0.833, 18 / 24), isha: sudut(18, 18 / 24)};
  const tambahMinit = {fajr: 1, syuruk: 0, dhuhr: 2, asr: 1, maghrib: 1, isha: 1};
  const keDate = (k, h) => { const mnt = (h + 8 - lon / 15) * 60 + tambahMinit[k], menit = k === 'syuruk' ? Math.floor(mnt) : Math.ceil(mnt); return new Date(Date.UTC(b.y, b.m - 1, b.d, 0, menit) - 8 * 3600e3); };
  const out = {}; for (const k in jam) out[k] = keDate(k, jam[k]);
  out.imsak = new Date(out.fajr.getTime() - 10 * 60000); out.dhuha = null;
  return out;
}
/* Tarikh Hijri daripada data JAKIM (jika ada untuk tarikh itu) */
function hijriJakim(tarikh) {   // dicari ikut tarikh kalendar objek Date itu, supaya sepadan dengan tarikh Masihi yang dipaparkan di sebelahnya
  if (!T.zon) return null;
  const o = bulanSimpan(T.zon, tarikh.getFullYear(), tarikh.getMonth() + 1);
  const r = o && o.p.find(x => x[0] === tarikh.getDate()); if (!r || !r[1]) return null;
  const [y, m, d] = String(r[1]).split('-').map(Number);
  return y && m && d ? {y, m, d, jadual: true, jakim: true} : null;
}
function zonDariKoordinat(lat, lon) {   // zon terdekat (anggaran tanpa pelayan); null jika di luar Malaysia
  if (lat < 0.8 || lat > 7.6 || lon < 99.5 || lon > 119.5) return null;
  if (lat > 1.15 && lat < 1.48 && lon > 103.6 && lon < 104.1) return null;   // Singapura
  let terbaik = null, jarak = Infinity;
  for (const z of ZON.values()) { const d = (z.lat - lat) ** 2 + ((z.lon - lon) * Math.cos(lat * Math.PI / 180)) ** 2; if (d < jarak) { jarak = d; terbaik = z; } }
  return jarak < 1.5 ? terbaik : null;   // lebih kurang 135 km
}
function kesanLokasi(selesai) {
  if (!('geolocation' in navigator)) return roti('Peranti ini tidak menyokong lokasi.');
  roti('Mengesan lokasi…');
  navigator.geolocation.getCurrentPosition(async pos => {
    const {latitude: lat, longitude: lon} = pos.coords;
    const tetapkan = (kod, msg) => { T.zon = kod; simpanT(); roti(msg); if (selesai) selesai(); };
    let sebab = 'tiada internet';
    if (navigator.onLine) {
      try {
        const b = bahagianMY(new Date());
        const r = await fetch(`${API_WS}/v2/solat/gps/${lat.toFixed(5)}/${lon.toFixed(5)}?year=${b.y}&month=${b.m}`, {cache: 'no-store'});
        if (r.status === 422) return roti('Lokasi ini di luar zon waktu solat JAKIM. Pilih zon daripada senarai.');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (j && ZON.has(j.zone)) {
          const o = bulanDariApi(j.zone, b.y, b.m, j); if (o) simpanBulan(o);   // jawapan tidak lengkap tidak disimpan; diambil semula kemudian
          return tetapkan(j.zone, `Zon ${j.zone}: ${ZON.get(j.zone).daerah}`);
        }
        sebab = 'zon daripada pelayan tidak dikenali';
      } catch (e) { sebab = 'pelayan waktu solat tidak dapat dihubungi'; }
    }
    const z = zonDariKoordinat(lat, lon);
    if (z) tetapkan(z.kod, `Zon dianggar ${z.kod} kerana ${sebab}. Sila sahkan dalam senarai.`);
    else roti('Lokasi ini di luar Malaysia. Pilih zon daripada senarai.');
  }, err => roti(err.code === 1 ? 'Kebenaran lokasi ditolak. Pilih zon daripada senarai.' : 'Lokasi tidak dapat dikesan. Pilih zon daripada senarai.'), {enableHighAccuracy: false, timeout: 15000, maximumAge: 600000});
}

/* ================================================================ peringatan waktu solat */
let audioKonteks = null;
const konteksAudio = () => (audioKonteks = audioKonteks || new (window.AudioContext || window.webkitAudioContext)());
function loceng() {
  try {
    const k = konteksAudio(), mula = k.currentTime + 0.02;
    [[659.25, 0], [880, 0.28]].forEach(([f, t]) => {
      const o = k.createOscillator(), g = k.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, mula + t); g.gain.exponentialRampToValueAtTime(0.18, mula + t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, mula + t + 1.2);
      o.connect(g).connect(k.destination); o.start(mula + t); o.stop(mula + t + 1.3);
    });
  } catch (e) {}
}
/* Bunyi peringatan: selawat ringkas sebelum waktu dan takbir ketika masuk waktu. Klip dirakam sendiri atau dipilih daripada
   fail dalam telefon (localStorage "poket-bunyi", ikut serta dalam fail sandaran), atau daripada pek keluarga (tools/pek.py).
   App tidak membekalkan rakaman pihak ketiga; tanpa klip, loceng dibunyikan. Klip sentiasa dimainkan hingga habis dan tidak
   dipotong (Pejabat Mufti WP, Irsyad al-Fatwa Siri 59), dan klip baharu tidak bertindih dengan klip yang sedang berbunyi. */
const SLOT_BUNYI = [['awal', 'Sebelum waktu', 'Selawat ringkas'], ['masuk', 'Masuk waktu', 'Takbir dua kali']];
const HAD_KLIP_S = 20, HAD_RAKAM_S = 15, HAD_FAIL_KLIP = 500 * 1024;
const klipSah = v => typeof v === 'string' && v.length < 700000 && /^data:audio\/[a-z0-9.+-]+(;[a-z0-9=.,+-]+)*;base64,[A-Za-z0-9+/]+=*$/i.test(v);
function normalBunyi(x) {
  const out = {};
  if (objek_(x)) for (const [k] of SLOT_BUNYI) {
    const s = x[k]; if (!objek_(s) || !klipSah(s.data)) continue;
    out[k] = {data: s.data, saat: Math.max(0, Math.min(+s.saat || 0, HAD_KLIP_S + 1)), sumber: s.sumber === 'fail' ? 'fail' : 'rakam', t: typeof s.t === 'string' ? s.t.slice(0, 10) : ''};
  }
  return out;
}
let BUNYI = null;
const bunyiTelefon = () => BUNYI || (BUNYI = normalBunyi(SIMPAN.baca('bunyi', null)));
function klipBagi(jenis) {   // rakaman dalam telefon ini > pek keluarga > tiada (loceng)
  const s = bunyiTelefon()[jenis]; if (s) return Object.assign({asal: 'telefon'}, s);
  const p = pekPeribadi(), d = p && p.bunyi && p.bunyi[jenis];
  return d ? {data: d, asal: 'pek'} : null;
}
function simpanKlip(jenis, nilai) {
  const b = Object.assign({}, bunyiTelefon()); if (nilai) b[jenis] = nilai; else delete b[jenis];
  if (Object.keys(b).length ? !SIMPAN.tulis('bunyi', b) : (SIMPAN.buang('bunyi'), false)) { roti('Storan telefon penuh: klip tidak dapat disimpan. Rakam klip yang lebih pendek.'); return false; }
  BUNYI = normalBunyi(b); return true;
}
const PENIMBAL = new Map();   // data URL → janji AudioBuffer (setiap klip dinyahkod sekali)
function baitKlip(u) { const b = atob(u.slice(u.indexOf(',') + 1)), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; }
function nyahkodAudio(buf) {   // Safari lama hanya menyokong bentuk panggil balik
  return new Promise((ok, gagal) => { try { const p = konteksAudio().decodeAudioData(buf, ok, gagal); if (p && p.then) p.then(ok, gagal); } catch (e) { gagal(e); } });
}
function penimbalKlip(data) {
  if (!PENIMBAL.has(data)) PENIMBAL.set(data, nyahkodAudio(baitKlip(data)).catch(e => { PENIMBAL.delete(data); throw e; }));
  return PENIMBAL.get(data);
}
let klipMain = null;
async function mainData(data) {
  if (klipMain) return 'sedang';
  klipMain = true;
  try {
    const ctx = konteksAudio();
    if (ctx.state !== 'running') await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 400))]);
    if (ctx.state !== 'running') throw new Error('audio belum dibenarkan');
    const src = ctx.createBufferSource(); src.buffer = await penimbalKlip(data); src.connect(ctx.destination);
    src.onended = () => { klipMain = null; }; klipMain = src; src.start(); return 'klip';
  } catch (e) {
    try { const a = new Audio(data); a.onended = a.onerror = () => { klipMain = null; }; klipMain = a; await a.play(); return 'klip'; }
    catch (e2) { klipMain = null; return 'gagal'; }
  }
}
async function mainBunyi(jenis) {
  const k = klipBagi(jenis);
  if (!k) { loceng(); return 'loceng'; }
  const r = await mainData(k.data);
  if (r === 'gagal') loceng();
  return r;
}
/* Pelayar membenarkan bunyi hanya selepas sentuhan pengguna. Pada setiap sentuhan (jika bunyi dihidupkan), sambung semula
   AudioContext dan nyahkod klip lebih awal supaya peringatan berbunyi serta-merta. pointerup/keydown ialah peristiwa yang
   memberi "user activation" pada skrin sentuh; pointerdown untuk tetikus. */
const bukaKunciAudio = () => {
  try {
    if (!T.bunyi || !T.peringatan) return;
    const k = konteksAudio(); if (k.state !== 'running') k.resume().catch(() => {});
    for (const [j] of SLOT_BUNYI) { const x = klipBagi(j); if (x && !PENIMBAL.has(x.data)) penimbalKlip(x.data).catch(() => {}); }
  } catch (e) {}
};
for (const ev of ['pointerdown', 'pointerup', 'keydown']) document.addEventListener(ev, bukaKunciAudio, {passive: true});
async function beritahu(tajuk, isi, jenis = 'awal', bunyi = true) {
  bannerSolat(tajuk, isi, jenis);
  const bunyiApp = !!T.bunyi && document.visibilityState === 'visible';
  if (T.bunyi && bunyi) mainBunyi(jenis);
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      // App di skrin dan bunyinya sendiri dimainkan: notifikasi senyap supaya bunyi telefon tidak bertindih dengan klip.
      const opt = {body: isi, icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: 'poket-solat', renotify: true, silent: bunyiApp, data: {url: '#/solat'}};
      if (reg) await reg.showNotification(tajuk, opt); else new Notification(tajuk, opt);
    } catch (e) {}
  }
}
function bannerSolat(tajuk, isi, jenis) {
  let b = $('#banner-solat');
  if (!b) { b = h('div', {id: 'banner-solat', class: 'banner-solat', role: 'alert'}); document.body.append(b); }
  b.replaceChildren(); tambah(b,
    h('a', {href: '#/solat', class: 'bs-teks', onclick: () => b.remove()}, h('b', null, tajuk), h('span', null, isi)),
    jenis === 'masuk' && cariDoa('selepas-azan') ? h('a', {class: 'bs-doa', href: '#/doa/selepas-azan', onclick: () => b.remove()}, 'Doa selepas azan') : null,
    h('button', {class: 'ib', type: 'button', 'aria-label': 'Tutup peringatan', html: ikon('tutup'), onclick: () => b.remove()}));
  clearTimeout(bannerSolat.t); bannerSolat.t = setTimeout(() => b.remove(), 15 * 60000);
}
let dahIngat = null;   // peringatan yang sudah dihantar hari ini (memori dahulu, storan sebagai usaha terbaik)
function semakPeringatan() {
  if (!T.zon || !T.peringatan) return;
  const kini = Date.now(), w = waktuHari(new Date()); if (!w) return;
  const dah = dahIngat || SIMPAN.baca('peringatan-dah', {}), hari = isoMY(new Date()), baharu = {};
  for (const [k, v] of Object.entries(dah)) if (k.startsWith(hari)) baharu[k] = v;
  for (const k of FARDU) {
    const t = w.t[k]; if (!t) continue;
    const ms = t.getTime(), awal = ms - (+T.minitAwal || 10) * 60000, id = `${hari}:${k}`;
    if (kini >= awal && kini < ms && !baharu[id + ':awal']) { baharu[id + ':awal'] = 1; beritahu(`${NAMA_SOLAT[k]} dalam ${bakiMasa(ms - kini)}`, `Masuk waktu ${fmtWaktu(t)}, zon ${T.zon}${w.sumber === 'anggaran' ? ' (anggaran)' : ''}`); }
    else if (kini >= ms && kini < ms + 10 * 60000 && !baharu[id + ':masuk']) {   // takbir hanya dalam 3 minit pertama; selepas itu kad sahaja
      baharu[id + ':masuk'] = 1; beritahu(`Sudah masuk waktu ${NAMA_SOLAT[k]}`, `${fmtWaktu(t)}, zon ${T.zon}`, 'masuk', kini - ms < 3 * 60000);
    }
  }
  dahIngat = baharu; SIMPAN.tulis('peringatan-dah', baharu);
}
/* Klip bunyi: rakam dengan mikrofon (MediaRecorder) atau pilih fail audio. Tempoh disahkan dengan menyahkod klip. */
const bolehRakam = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
const JENIS_AUDIO = {mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', webm: 'audio/webm', wav: 'audio/wav'};
const bacaDataUrl = blob => new Promise((ok, gagal) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => gagal(r.error || new Error('fail tidak dapat dibaca')); r.readAsDataURL(blob); });
async function klipDaripada(blob, sumber, saatRakam) {   // saatRakam: tempoh dikira semasa merakam, jika pelayar tidak dapat menyahkod rakamannya sendiri
  if (blob.size > HAD_FAIL_KLIP) throw new Error(`saiz ${Math.round(blob.size / 1024)} KB melebihi had ${HAD_FAIL_KLIP / 1024} KB`);
  const data = await bacaDataUrl(blob);
  if (!klipSah(data)) throw new Error('bukan fail audio');
  let buf = null;
  try { buf = await penimbalKlip(data); }
  catch (e) { if (!saatRakam) throw new Error('format audio ini tidak dapat dimainkan oleh pelayar ini; cuba MP3 atau M4A'); }
  const s = buf ? buf.duration : saatRakam;
  if (!(s >= 0.4)) { PENIMBAL.delete(data); throw new Error('klip terlalu pendek'); }
  if (s > HAD_KLIP_S + 0.5) { PENIMBAL.delete(data); throw new Error(`klip ${Math.round(s)} saat melebihi had ${HAD_KLIP_S} saat`); }
  return {data, saat: Math.round(s * 10) / 10, sumber, t: hariIniIso()};
}
function pilihFailKlip(jenis, siap) {
  const inp = h('input', {type: 'file', accept: 'audio/*', class: 'sr', tabindex: '-1'});
  inp.addEventListener('change', async () => {
    const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
    try {
      const mime = /^audio\//.test(f.type) ? f.type : JENIS_AUDIO[(String(f.name).split('.').pop() || '').toLowerCase()];
      if (!mime) throw new Error('bukan fail audio');
      const k = await klipDaripada(new Blob([f], {type: mime}), 'fail');
      if (simpanKlip(jenis, k)) { roti(`Klip disimpan (${Math.round(k.saat)} saat)`); siap(); }
    } catch (e) { roti('Fail tidak dapat digunakan: ' + e.message); }
  });
  document.body.append(inp); inp.click();
}
function helaiRakam(jenis, siap) {
  const nama = SLOT_BUNYI.find(s => s[0] === jenis)[1], d = jenis === 'awal' ? cariDoa('selawat-pendek') : null, bd = d && d.b && d.b[0];
  const panduan = h('div', {class: 'rakam-panduan'}, h('span', {class: 'rk-l'}, 'Contoh bacaan'),
    bd && (bd.ar || []).length ? h('p', {class: 'rk-ar', lang: 'ar', dir: 'rtl'}, bd.ar.join(' ')) : null,
    h('p', {class: 'rk-rumi'}, bd ? bd.ru : 'Allaahu akbar, Allaahu akbar.'),
    h('p', {class: 'kecil'}, bd ? `${bd.mk} Atau selawat ringkas lain yang anda amalkan.` : 'Allah Maha Besar, Allah Maha Besar. Takbir yang memulakan azan, sebagai isyarat masuk waktu.'));
  const status = h('p', {class: 'rakam-status', role: 'status', 'aria-live': 'polite'});
  const butang = h('div', {class: 'tindakan rakam-butang'});
  let mr = null, strim = null, bah = [], mula = 0, pemasa = 0, hasil = null, hl = null;
  const lepasMik = () => { clearInterval(pemasa); if (strim) strim.getTracks().forEach(t => t.stop()); strim = null; };
  const bersih = () => { try { if (mr && mr.state !== 'inactive') { mr.onstop = null; mr.stop(); } } catch (e) {} lepasMik(); };
  const keadaan = k => {
    butang.replaceChildren();
    if (k === 'sedia') { status.textContent = `Tekan Mula, baca dengan tenang, kemudian tekan Berhenti. Maksimum ${HAD_RAKAM_S} saat.`;
      tambah(butang, h('button', {class: 'btn utama', type: 'button', html: ikon('mikrofon') + ' Mula rakam', onclick: mulaRakam})); }
    else if (k === 'rakam') tambah(butang, h('button', {class: 'btn utama', type: 'button', html: ikon('henti') + ' Berhenti', onclick: () => { clearInterval(pemasa); if (mr && mr.state !== 'inactive') mr.stop(); }}));
    else tambah(butang,
      h('button', {class: 'btn', type: 'button', html: ikon('main') + ' Dengar', onclick: () => mainData(hasil.data)}),
      h('button', {class: 'btn utama', type: 'button', html: ikon('semak') + ' Simpan', onclick: () => { if (simpanKlip(jenis, hasil)) { tutupHelai(true); roti(`Klip ${nama.toLowerCase()} disimpan`); siap(); } }}),
      h('button', {class: 'btn', type: 'button', html: ikon('muat') + ' Rakam semula', onclick: () => keadaan('sedia')}));
  };
  async function mulaRakam() {
    try { strim = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}}); }
    catch (e) { status.textContent = e && e.name === 'NotAllowedError' ? 'Kebenaran mikrofon ditolak. Benarkan mikrofon untuk laman ini dalam tetapan pelayar, atau pilih fail audio.' : 'Mikrofon tidak dapat dibuka. Pilih fail audio sebagai ganti.'; return; }
    if (!hl || !document.contains(hl)) return lepasMik();   // helaian ditutup semasa menunggu kebenaran
    // Format yang pelayar ini boleh rakam DAN mainkan: Opus/WebM (Chrome, Firefox), AAC/MP4 (Safari).
    const main_ = t => { try { return !!new Audio().canPlayType(t.split(';')[0]); } catch (e) { return true; } };
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t) && main_(t));
    try { mr = new MediaRecorder(strim, Object.assign({audioBitsPerSecond: 40000}, mime ? {mimeType: mime} : {})); } catch (e) { mr = new MediaRecorder(strim); }
    bah = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) bah.push(e.data); };
    mr.onstop = async () => {
      lepasMik();
      try {
        hasil = await klipDaripada(new Blob(bah, {type: (mr.mimeType || (bah[0] && bah[0].type) || 'audio/webm')}), 'rakam', Math.min((Date.now() - mula) / 1000, HAD_RAKAM_S));
        keadaan('siap'); status.textContent = `Rakaman ${Math.round(hasil.saat)} saat. Dengar dahulu, kemudian simpan.`;
      } catch (e) { keadaan('sedia'); status.textContent = 'Rakaman tidak dapat digunakan: ' + e.message + '.'; }
    };
    mr.start(); mula = Date.now(); keadaan('rakam');
    status.textContent = `Merakam… 0 / ${HAD_RAKAM_S} saat`;
    pemasa = setInterval(() => {
      if (!document.contains(hl)) return bersih();
      const s = (Date.now() - mula) / 1000; status.textContent = `Merakam… ${Math.floor(s)} / ${HAD_RAKAM_S} saat`;
      if (s >= HAD_RAKAM_S && mr.state !== 'inactive') { mr.stop(); clearInterval(pemasa); }
    }, 250);
  }
  hl = bukaHelai(`Rakam: ${nama.toLowerCase()}`, h('div', {class: 'helai-rakam'}, panduan, status, butang,
    h('p', {class: 'kecil'}, 'Mikrofon digunakan hanya semasa merakam. Rakaman disimpan dalam telefon ini dan dalam fail sandaran, tidak dimuat naik.')), {onTutup: bersih});
  keadaan('sedia');
}
function panelBunyi() {
  const el = h('div', {class: 'bunyi-panel'});
  const lukisP = () => {
    el.replaceChildren();
    for (const [j, nama, isi] of SLOT_BUNYI) {
      const k = klipBagi(j), tel = bunyiTelefon()[j];
      const status = !k ? 'Loceng (belum ada klip)' : k.asal === 'pek' ? `${isi}: pek keluarga` : `${isi}: ${tel.sumber === 'fail' ? 'fail anda' : 'rakaman anda'}, ${Math.max(1, Math.round(tel.saat))} saat`;
      tambah(el, h('div', {class: 'bunyi-slot', 'data-slot': j},
        h('div', {class: 'bs-atas'}, h('span', {class: 'tx'}, h('b', null, nama), h('span', {class: 'bs-status'}, status)),
          ib('main', `Dengar bunyi ${nama.toLowerCase()}`, () => { if (T.peringatan) bukaKunciAudio(); mainBunyi(j); })),
        h('div', {class: 'bs-tindakan'},
          bolehRakam() ? h('button', {class: 'btn kecil', type: 'button', html: ikon('mikrofon') + ' Rakam', onclick: () => helaiRakam(j, lukisP)}) : null,
          h('button', {class: 'btn kecil', type: 'button', html: ikon('muzik') + ' Pilih fail', onclick: () => pilihFailKlip(j, lukisP)}),
          tel ? h('button', {class: 'btn kecil', type: 'button', html: ikon('buang') + ' Buang', onclick: () => sahkan(`Buang klip "${nama.toLowerCase()}" dalam telefon ini?`, () => { simpanKlip(j, null); lukisP(); }, 'Buang')}) : null)));
    }
    tambah(el, h('p', {class: 'kecil'}, `Rakam suara sendiri atau pilih fail audio, maksimum ${HAD_KLIP_S} saat. Klip berbunyi ketika app dibuka di skrin, dan dimainkan hingga habis. Notifikasi dan kalendar telefon memakai bunyi telefon. Elakkan peringatan berbunyi di dalam tandas. `,
      h('a', {href: '#/nota/waktu-solat?b=9'}, 'Had dan adab'), '.'));
  };
  lukisP(); return el;
}
async function mohonNotifikasi() {
  if (!('Notification' in window)) { roti('Pelayar ini tidak menyokong notifikasi. Gunakan fail kalendar.'); return; }
  try { const r = await Notification.requestPermission(); roti(r === 'granted' ? 'Notifikasi dibenarkan' : 'Notifikasi tidak dibenarkan'); }
  catch (e) { roti('Notifikasi tidak dapat diaktifkan di sini.'); }
}
/* Baris iCalendar dilipat pada 75 oktet (RFC 5545 §3.1). */
function lipatIcs(baris) {
  const enc = new TextEncoder(); if (enc.encode(baris).length <= 75) return baris;
  const out = []; let kini = '', had = 75;
  for (const c of baris) { if (enc.encode(kini + c).length > had) { out.push(kini); kini = ''; had = 74; } kini += c; }
  out.push(kini); return out.join('\r\n ');
}
/* Fail kalendar (.ics) 30 hari waktu fardu dengan penggera N minit sebelum: penggera dibunyikan oleh kalendar telefon. */
async function muatTurunKalendar(hari = 30) {
  if (!T.zon) return roti('Pilih zon dahulu.');
  const mula = new Date(), bulan = new Map();
  for (let i = 0; i < hari; i++) { const x = bahagianMY(new Date(mula.getTime() + i * 864e5)); bulan.set(`${x.y}-${x.m}`, [x.y, x.m]); }
  let tiadaBulan = 0;
  for (const [y, m] of bulan.values()) if (!bulanSimpan(T.zon, y, m)) { try { await ambilBulan(T.zon, y, m); } catch (e) { tiadaBulan++; } }
  const z = ZON.get(T.zon), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const utc = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Poket Yaasin//Waktu Solat//MS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:Waktu Solat ${T.zon}`];
  let n = 0, akhir = null;
  for (let i = 0; i < hari; i++) {
    const w = waktuHari(new Date(mula.getTime() + i * 864e5)); if (!w || w.sumber !== 'jakim') continue;
    for (const k of FARDU) {
      const t = w.t[k]; if (!t || t < mula) continue;
      akhir = t;
      L.push('BEGIN:VEVENT', `UID:${T.zon}-${isoMY(t)}-${k}@poket-yaasin`, `DTSTAMP:${stamp}`, `DTSTART:${utc(t)}`, 'DURATION:PT10M',
        `SUMMARY:${NAMA_SOLAT[k]} (${T.zon})`, `DESCRIPTION:Waktu solat JAKIM zon ${T.zon}${z ? ' (' + z.daerah.replace(/[,;]/g, ' ') + ')' : ''}. Sumber: e-Solat JAKIM melalui waktusolat.app.`,
        'TRANSP:TRANSPARENT', 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${NAMA_SOLAT[k]} dalam ${+T.minitAwal || 10} minit`, `TRIGGER:-PT${+T.minitAwal || 10}M`, 'END:VALARM', 'END:VEVENT');
      n++;
    }
  }
  L.push('END:VCALENDAR');
  if (!n) return roti(navigator.onLine ? 'Waktu JAKIM belum dapat diambil. Cuba lagi sebentar.' : 'Perlu internet untuk mengambil waktu JAKIM bagi fail kalendar.');
  const blob = new Blob([L.map(lipatIcs).join('\r\n') + '\r\n'], {type: 'text/calendar;charset=utf-8'});
  const a = h('a', {href: URL.createObjectURL(blob), download: `waktu-solat-${T.zon}-${isoMY(mula)}.ics`});
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  roti(`${n} waktu solat${tiadaBulan ? `, hingga ${fmtTarikh(tarikhMY(akhir))}` : ''} dimuat turun. Buka fail itu untuk tambah ke kalendar.`);
}

/* ================================================================ skrin Waktu Solat */
function pilihZon(onUbah) {
  const negeri = [...new Set((D.zon || []).map(z => z.negeri))];
  const kini = ZON.get(T.zon);
  const selN = h('select', {class: 'medan', id: 'pilih-negeri', 'aria-label': 'Negeri'}, h('option', {value: ''}, 'Pilih negeri'), negeri.map(n => h('option', {value: n, selected: kini && kini.negeri === n}, n)));
  const selZ = h('select', {class: 'medan', id: 'pilih-zon', 'aria-label': 'Zon'});
  const isiZon = () => {
    selZ.replaceChildren(); tambah(selZ, h('option', {value: ''}, 'Pilih zon'), (D.zon || []).filter(z => z.negeri === selN.value).map(z => h('option', {value: z.kod, selected: z.kod === T.zon}, `${z.kod}: ${z.daerah}`)));
  };
  selN.addEventListener('change', isiZon);
  selZ.addEventListener('change', () => { if (selZ.value) { T.zon = selZ.value; simpanT(); onUbah(); } });
  isiZon();
  return h('div', {class: 'pilih-zon'},
    h('label', {class: 'lbl', for: 'pilih-negeri'}, 'Negeri'), selN,
    h('label', {class: 'lbl', for: 'pilih-zon'}, 'Zon JAKIM'), selZ,
    h('button', {class: 'btn penuh', type: 'button', html: ikon('lokasi') + ' Kesan lokasi saya', onclick: () => kesanLokasi(onUbah)}));
}
function skrinSolat(skrin) {
  const z = ZON.get(T.zon);
  bar({tajuk: 'Waktu Solat', sub: z ? `${z.kod}, ${z.negeri}` : 'Pilih zon anda', kembali: '#/'});
  const lukis = () => lukisSemula();
  if (!z) {
    tambah(skrin, h('div', {class: 'kad'}, h('p', null, 'Pilih zon waktu solat JAKIM untuk tempat anda. Zon disimpan dalam telefon ini.'), pilihZon(() => { lukis(); segarWaktu(); })),
      h('p', {class: 'kecil'}, 'Waktu solat diambil daripada data e-Solat JAKIM. ', h('a', {href: '#/nota/waktu-solat'}, 'Tentang sumber dan peringatan'), '.'));
    return;
  }
  const kini = new Date(), w = waktuHari(kini), seterus = solatSeterusnya(kini);
  const status = h('p', {class: 'kecil status-solat'});
  tambah(status, w.sumber === 'jakim' ? `Sumber: e-Solat JAKIM, diambil ${fmtTarikh(new Date(w.diambil))}.` :
    navigator.onLine ? 'Mengambil waktu JAKIM. Waktu di bawah ialah anggaran kiraan.' : 'Tiada internet: waktu di bawah ialah anggaran kiraan, mungkin berbeza 1 hingga 3 minit daripada JAKIM.',
    bukanMY() ? ' Semua waktu dalam waktu Malaysia (GMT+8).' : '');
  const senarai = h('ol', {class: 'senarai-solat'}, SOLAT.map(([k, nama]) => {
    const t = w.t[k]; if (!t) return null;
    const fardu = FARDU.includes(k), next = seterus && seterus.k === k && isoMY(seterus.t) === isoMY(kini);
    return h('li', {class: (fardu ? 'fardu' : 'sunat') + (next ? ' seterus' : '') + (t < kini && !next ? ' lalu' : '')},
      h('span', {class: 'nm'}, nama), next ? h('span', {class: 'baki'}, `lagi ${bakiMasa(t - kini)}`) : null, h('span', {class: 'wk'}, fmtWaktu(t)));
  }));
  const hj = w.hijri ? w.hijri.split('-').map(Number) : null;
  const panelB = panelBunyi(); panelB.hidden = !T.bunyi;
  const plIngat = pose(ahliAktif(), 'ingat', 'pelekat-sek');
  tambah(skrin,
    h('div', {class: 'kad kad-solat'},
      h('div', {class: 'ks-atas'}, h('div', null, h('b', null, fmtTarikh(tarikhMY(kini))), h('span', null, hj ? fmtHijri({y: hj[0], m: hj[1], d: hj[2]}) : fmtHijri(hijri(tarikhMY(kini))))),
        w.sumber === 'anggaran' ? h('span', {class: 'lencana b-beza'}, 'Anggaran') : h('span', {class: 'lencana b-sahih'}, 'JAKIM')),
      senarai, status),
    h('div', {class: 'tindakan dua'},
      h('button', {class: 'btn', type: 'button', html: ikon('muat') + ' Muat semula', onclick: async () => { try { const b = bahagianMY(new Date()); await ambilBulan(T.zon, b.y, b.m); roti('Waktu JAKIM dikemas kini'); } catch (e) { roti('Tidak dapat mengambil waktu: ' + e.message); } lukis(); }}),
      h('a', {class: 'btn', href: '#/nota/waktu-solat', html: ikon('nota') + ' Tentang sumber'})),
    plIngat ? h('div', {class: 'sek-pelekat'}, h('h2', {class: 'sek'}, 'Peringatan'), plIngat) : h('h2', {class: 'sek'}, 'Peringatan'),
    h('div', {class: 'kad kad-tetapan'},
      h('label', {class: 'set'}, h('span', {class: 'tx'}, h('b', null, 'Peringatan waktu solat'), h('span', null, 'Kad sebelum waktu dan ketika masuk waktu, dan notifikasi jika dibenarkan')),
        h('input', {type: 'checkbox', class: 'suis', checked: !!T.peringatan, onchange: e => { T.peringatan = e.target.checked; simpanT(); if (T.peringatan) semakPeringatan(); }})),
      h('div', {class: 'set'}, h('span', {class: 'tx'}, h('b', null, 'Berapa minit sebelum')),
        h('select', {class: 'medan medan-kecil', 'aria-label': 'Minit sebelum waktu', onchange: e => { T.minitAwal = +e.target.value; simpanT(); }}, [5, 10, 15, 20, 30].map(n => h('option', {value: n, selected: (+T.minitAwal || 10) === n}, `${n} minit`)))),
      h('label', {class: 'set'}, h('span', {class: 'tx'}, h('b', null, 'Bunyi peringatan'), h('span', null, 'Selawat sebelum waktu dan takbir ketika masuk waktu jika ada klip; jika tiada, loceng')),
        h('input', {type: 'checkbox', class: 'suis', checked: !!T.bunyi, onchange: e => { T.bunyi = e.target.checked; simpanT(); panelB.hidden = !T.bunyi; if (T.bunyi) bukaKunciAudio(); }})),
      panelB,
      h('div', {class: 'senarai-tindakan'},
        'Notification' in window && Notification.permission !== 'granted' ? h('button', {class: 'btn penuh', type: 'button', html: ikon('loceng') + ' Benarkan notifikasi telefon', onclick: async () => { await mohonNotifikasi(); lukis(); }}) : null,
        'Notification' in window && Notification.permission === 'granted' ? h('p', {class: 'kecil'}, 'Notifikasi telefon dibenarkan. Ia dihantar ketika app dibuka atau baru ditutup.') : null,
        h('button', {class: 'btn penuh utama', type: 'button', html: ikon('kalendar') + ' Tambah ke kalendar telefon', onclick: () => muatTurunKalendar(30)}),
        h('p', {class: 'kecil'}, 'Waktu fardu 30 hari dimuat turun sebagai fail kalendar (.ics), supaya kalendar telefon memberi peringatan walaupun app ditutup. Kalendar iPhone mengekalkan penggera dalam fail; sesetengah kalendar Android (contohnya Google Calendar) memakai tetapan peringatan lalai, jadi semak selepas menambah. Ulang setiap bulan.'))),
    h('h2', {class: 'sek'}, 'Zon'),
    h('div', {class: 'kad'}, h('p', {class: 'kecil'}, `${z.kod}: ${z.daerah}`), pilihZon(() => { lukis(); segarWaktu(); })),
    jadualBulan());
  if (w.sumber !== 'jakim' && navigator.onLine) segarWaktu();
  const keadaan = n => { const s = solatSeterusnya(n), w2 = waktuHari(n); return [isoMY(n), w2 && w2.sumber, s ? s.k + isoMY(s.t) + s.sumber : ''].join('|'); };
  const asal = keadaan(kini);
  const pemasa = setInterval(() => {
    const n = new Date();
    if (keadaan(n) !== asal) return lukis();          // hari bertukar atau waktu seterusnya berubah: lukis semula sekali
    const s = solatSeterusnya(n), el = $('.senarai-solat .seterus .baki');
    if (el && s) el.textContent = `lagi ${bakiMasa(s.t - n)}`;
  }, 20000);
  bersihSkrin.push(() => clearInterval(pemasa));
}
function jadualBulan() {
  const b = bahagianMY(new Date()), o = bulanSimpan(T.zon, b.y, b.m); if (!o) return null;
  const hariIni = b.d;
  return h('details', {class: 'det jadual-bulan'}, h('summary', null, `Jadual ${BULAN[b.m - 1]} ${b.y}`),
    h('div', {class: 'jadual-wrap'}, h('table', {class: 'jadual'},
      h('thead', null, h('tr', null, h('th', null, 'Hb'), h('th', null, 'Subuh', h('small', null, 'AM')), h('th', null, 'Zohor', h('small', null, 'PM')), h('th', null, 'Asar', h('small', null, 'PM')), h('th', null, 'Maghrib', h('small', null, 'PM')), h('th', null, 'Isyak', h('small', null, 'PM')))),
      h('tbody', null, o.p.map(r => h('tr', {class: r[0] === hariIni ? 'hari-ini' : null}, h('td', null, r[0]), [3, 6, 7, 8, 9].map(i => h('td', null, r[i] ? fmtWaktu(new Date(r[i] * 1000), true) : '-'))))))),
    h('p', {class: 'kecil'}, 'Sumber: e-Solat JAKIM melalui waktusolat.app.'));
}

/* ================================================================ penanda ringkas (nota, pesan kalendar)
   Perenggan dipisah baris kosong; "- " senarai; **tebal**; *condong*; {{s:a}} pautan ayat; [[id|label]] pautan nota. */
function inline(teks) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\{\{[^}]+\}\}|\[\[[^\]]+\]\])/g;
  let last = 0, m;
  const s = String(teks || '');
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(h('b', null, t.slice(2, -2)));
    else if (t.startsWith('{{')) { const ref = t.slice(2, -2); out.push(h('button', {class: 'ref-q', type: 'button', 'data-ayat': ref}, 'ayat ' + ref)); }
    else if (t.startsWith('[[')) {
      const [id, label] = t.slice(2, -2).split('|'); const n = NOTA.get(id);
      out.push(h('a', {href: '#/nota/' + id, class: 'pautan-nota'}, label || (n ? n.tajuk : id)));
    } else out.push(h('i', null, t.slice(1, -1)));
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
function blokTeks(teks) {
  const f = document.createDocumentFragment();
  for (const blok of String(teks || '').trim().split(/\n\s*\n/)) {
    let para = [], senarai = [];
    const tutupPara = () => { if (para.length) tambah(f, h('p', null, inline(para.join(' ')))); para = []; };
    const tutupSenarai = () => { if (senarai.length) tambah(f, h('ul', null, senarai.map(x => h('li', null, inline(x))))); senarai = []; };
    for (const x of blok.split('\n').map(y => y.trim()).filter(Boolean)) {
      if (x.startsWith('- ')) { tutupPara(); senarai.push(x.slice(2)); }
      else { tutupSenarai(); para.push(x); }
    }
    tutupPara(); tutupSenarai();
  }
  return f;
}
/* ================================================================ helaian (bottom sheet), roti (toast), pengesahan */
let helaiAktif = null, fokusSebelum = null;
function bukaHelai(tajuk, isi, opt = {}) {
  tutupHelai(true);
  fokusSebelum = document.activeElement;
  const tutupB = h('button', {class: 'ib tutup-helai', type: 'button', 'aria-label': 'Tutup', html: ikon('tutup'), onclick: () => tutupHelai()});
  const hl = h('div', {class: 'helai' + (opt.kelas ? ' ' + opt.kelas : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': tajuk || 'Butiran'},
    h('div', {class: 'pegang', 'aria-hidden': 'true'}),
    h('div', {class: 'helai-atas'}, tajuk ? h('h3', null, tajuk) : h('span'), tutupB),
    isi);
  const tirai = h('div', {class: 'tirai', onclick: e => { if (e.target === tirai) tutupHelai(); }}, hl);
  document.body.append(tirai);
  helaiAktif = {tirai, onTutup: opt.onTutup};
  setTimeout(() => { const f = hl.querySelector('input,textarea,select') || tutupB; f.focus({preventScroll: true}); }, 30);
  return hl;
}
function tutupHelai(senyap) {
  if (!helaiAktif) return;
  const x = helaiAktif; helaiAktif = null; x.tirai.remove();
  if (!senyap && x.onTutup) x.onTutup();
  if (!senyap && fokusSebelum && document.contains(fokusSebelum)) fokusSebelum.focus({preventScroll: true});
}
let rotiT = 0;
function roti(msg, namaPose) {   // namaPose: pelekat watak ahli aktif (cth. 'syabas') untuk detik kejayaan
  let r = $('#roti'); if (!r) { r = h('div', {id: 'roti', class: 'roti', role: 'status', 'aria-live': 'polite'}); document.body.append(r); }
  const a = namaPose ? ahliAktif() : null;
  const pl = a ? pose(a, namaPose, 'pelekat-roti') || (a.gambar || watakBagi(a) ? avatar(a, 40, 'avatar-roti') : null) : null;
  r.replaceChildren(); tambah(r, pl, h('span', null, msg)); r.classList.toggle('ada-pelekat', !!pl);
  r.hidden = false; clearTimeout(rotiT); rotiT = setTimeout(() => { r.hidden = true; }, pl ? 3600 : 2600);
}
function sahkan(soalan, ya, butangYa = 'Ya, teruskan') {
  bukaHelai(soalan, h('div', {class: 'tindakan'},
    h('button', {class: 'btn', type: 'button', onclick: () => tutupHelai()}, 'Batal'),
    h('button', {class: 'btn utama', type: 'button', onclick: () => { tutupHelai(true); ya(); }}, butangYa)));
}
async function salin(teks, msg = 'Disalin') {
  try { await navigator.clipboard.writeText(teks); roti(msg); }
  catch (e) {
    const t = h('textarea', {style: 'position:fixed;opacity:0'}, teks); document.body.append(t); t.select();
    try { document.execCommand('copy'); roti(msg); } catch (e2) { roti('Tidak dapat menyalin'); } t.remove();
  }
}
async function kongsi(tajuk, teks, url) {
  if (navigator.share) { try { await navigator.share({title: tajuk, text: teks, url}); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  salin([teks, url].filter(Boolean).join('\n'), 'Pautan disalin');
}
const URL_ASAS = () => location.href.split('#')[0];

/* ================================================================ spesifikasi ayat & paparan al-Quran */
function parseSpec(spec) {
  const out = [];
  for (const part of String(spec).split(',')) {
    const m = part.trim().match(/^(\d+):(\d+)(?:-(\d+))?(?:#(\d+)-(\d*))?$/); if (!m) continue;
    const s = +m[1], a0 = +m[2], a1 = +(m[3] || m[2]);
    for (let a = a0; a <= a1; a++) out.push({s, a, f: m[4] ? +m[4] : 1, t: m[5] ? +m[5] : null});
  }
  return out;
}
const namaSurah = s => (D.surah[s] || (D.meta && D.meta.surah[s - 1]) || [`Surah ${s}`])[0];
function labelSpec(spec) {
  const g = new Map();
  for (const x of parseSpec(spec)) { if (!g.has(x.s)) g.set(x.s, []); g.get(x.s).push(x.a); }
  return [...g].map(([s, aa]) => `${namaSurah(s)} ${s}:${Math.min(...aa)}${aa.length > 1 ? '–' + Math.max(...aa) : ''}`).join('; ');
}
const tandaAyat = a => h('span', {class: 'am', 'aria-label': 'ayat ' + a}, '۝' + arNum(a));
/* Perkataan ayat sebagai <span class="w"> (boleh disentuh untuk makna). f/t: julat perkataan 1-based. */
function kataAyat(s, a, f = 1, t = null) {
  const A = D.ayat[`${s}:${a}`]; if (!A) return [h('span', {class: 'kecil'}, `[${s}:${a}]`)];
  const hujung = t || A.w.length, out = [];
  if (f > 1) out.push(h('span', {class: 'sambung', 'aria-hidden': 'true'}, '… '));
  for (let i = f - 1; i < hujung; i++) { out.push(h('span', {class: 'w', 'data-k': `${s}:${a}`, 'data-i': i}, A.w[i])); out.push(' '); }
  if (hujung === A.w.length) out.push(tandaAyat(a)); else out.push(h('span', {class: 'sambung', 'aria-hidden': 'true'}, ' …'));
  return out;
}
function perkataAyat(s, a, f = 1, t = null) {
  const A = D.ayat[`${s}:${a}`]; if (!A) return null;
  const box = h('div', {class: 'perkata', dir: 'rtl'}), hujung = t || A.w.length;
  for (let i = f - 1; i < hujung; i++) {
    const g = A.g && A.g[i], e = A.e && A.e[i];
    tambah(box, h('button', {class: 'pk' + (g ? '' : ' tiada'), type: 'button', 'data-k': `${s}:${a}`, 'data-i': i},
      h('span', {class: 'a'}, A.w[i]), h('span', {class: 'g'}, g || e || '—')));
  }
  if (hujung === A.w.length) tambah(box, h('span', {class: 'pk am-pk'}, tandaAyat(a)));
  return box;
}
/* Satu blok ayat penuh (Yaasin, langkah susunan): baris nombor + butang audio, teks, perkataan, terjemahan. */
function blokAyat(s, a, opt = {}) {
  const A = D.ayat[`${s}:${a}`] || {w: [], t: ''};
  const el = h('div', {class: 'ayat', id: `a${s}-${a}`, 'data-s': s, 'data-a': a},
    h('div', {class: 'no'},
      h('span', {class: 'ref'}, `${s}:${a}`),
      ib('main', `Dengar ayat ${s}:${a}`, () => AUD.main(opt.senarai ? opt.senarai.slice(Math.max(0, opt.senarai.findIndex(x => x.s === s && x.a === a))) : [{s, a}], {ikut: opt.ikut})),
      opt.lagi ? ib('lagi', `Pilihan ayat ${s}:${a}`, () => menuAyat(s, a)) : null),
    h('p', {class: 'qr', lang: 'ar'}, kataAyat(s, a, opt.f || 1, opt.t || null)));
  if (T.perkata && !opt.tanpaPerkata) tambah(el, perkataAyat(s, a, opt.f || 1, opt.t || null));
  if (T.makna && A.t) tambah(el, h('p', {class: 'terj'}, A.t));
  return el;
}
function menuAyat(s, a) {
  const A = D.ayat[`${s}:${a}`] || {w: [], t: ''};
  const isi = h('div', {class: 'senarai-tindakan'},
    h('button', {class: 'btn penuh', type: 'button', onclick: () => { tandaBaca(a, true); tutupHelai(); }, html: ikon('tanda') + ' Tanda bacaan di sini'}),
    h('button', {class: 'btn penuh', type: 'button', onclick: () => { salin(`${A.w.join(' ')}\n\n${A.t}\n(${namaSurah(s)} ${s}:${a}, terjemahan Basmeih)`); tutupHelai(); }, html: ikon('salin') + ' Salin teks dan makna'}),
    h('button', {class: 'btn penuh', type: 'button', onclick: () => { tutupHelai(); lapor(`Ayat ${s}:${a}`, `ayat:${s}:${a}`); }, html: ikon('lapor') + ' Lapor kesilapan'}));
  bukaHelai(`${namaSurah(s)} ${s}:${a}`, isi);
}
/* Popup perkataan */
function bukaKata(k, i) {
  const [s, a] = k.split(':').map(Number), A = D.ayat[k]; if (!A) return;
  i = +i; const g = A.g && A.g[i], e = A.e && A.e[i];
  $$('.w.pilih,.pk.pilih').forEach(x => x.classList.remove('pilih'));
  $$(`[data-k="${k}"][data-i="${i}"]`).forEach(x => x.classList.add('pilih'));
  const isi = frag(
    h('div', {class: 'kata-besar', lang: 'ar'}, A.w[i]),
    h('div', {class: 'kata-g'}, g || 'Makna perkataan belum disediakan'),
    e ? h('div', {class: 'kata-e', lang: 'en'}, e) : null,
    g ? h('p', {class: 'kecil tengah'}, 'Makna perkataan ialah draf yang sedang disemak.') : null,
    h('div', {class: 'tindakan tengah'},
      A.na ? null : h('button', {class: 'btn', type: 'button', onclick: () => AUD.kata(s, a, i + 1), html: ikon('dengar') + ' Dengar perkataan'}),
      h('button', {class: 'btn', type: 'button', onclick: () => AUD.main([{s, a}]), html: ikon('main') + ' Dengar ayat'})),
    A.t ? h('p', {class: 'terj kecil-terj'}, h('b', null, `${namaSurah(s)} ${s}:${a}. `), A.t) : null);
  bukaHelai(null, isi, {onTutup: () => $$('.pilih').forEach(x => x.classList.remove('pilih'))});
}
/* Popup ayat (daripada {{s:a}} dalam nota, atau tanda ⟨s:a⟩ dalam Rumi) */
function bukaAyat(spec, sebab) {
  const isi = h('div');
  if (sebab === 'rumi') tambah(isi, h('p', {class: 'amaran'}, 'Frasa doa ini memetik ayat al-Quran. Rumi tidak dipaparkan bagi ayat al-Quran; ikut teks Arab atau dengar bacaan qari. ', h('a', {href: '#/nota/rumi', onclick: () => tutupHelai(true)}, 'Kenapa?')));
  const senarai = [];
  for (const part of String(spec).split(',')) for (const x of parseSpec(part.trim())) {
    senarai.push({s: x.s, a: x.a});
    tambah(isi, blokAyat(x.s, x.a, {tanpaPerkata: true}));
  }
  if (senarai.length > 1) isi.prepend(h('div', {class: 'tindakan'}, h('button', {class: 'btn', type: 'button', onclick: () => AUD.main(senarai), html: ikon('main') + ' Dengar semua'})));
  bukaHelai(labelSpec(spec), isi);
}

/* ================================================================ audio
   Senarai langkah. {s, a} = ayat (EveryAyah). {diam: ms} = senyap tetap. {diam: 'giliran', s, a, kali} = giliran pengguna:
   senyap sepanjang audio ayat itu × kali, didahului bunyi isyarat ringkas. k = indeks ayat dalam sesi (langkah ulangan dan
   giliran bagi ayat yang sama berkongsi k). Senyap dimainkan sebagai fail WAV, bukan pemasa, supaya sesi terus berjalan
   apabila skrin dimatikan (pemasa JavaScript boleh digantung di latar) dan skrin kereta/Bluetooth kekal "sedang dimainkan".
   Butang ⏮ ⏭ (stereng, skrin kereta, fon telinga, skrin kunci) dipetakan ke ayat sebelum/seterusnya melalui Media Session.
   Chrome menganggap media < 5 saat sebagai "transient" (tiada kawalan skrin kunci/kereta): semasa sesi berbilang langkah,
   pemain kedua memainkan senyap berulang 6 saat supaya sesi kekal boleh dikawal (bukan di iOS: satu audio pada satu masa). */
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const AUD = {
  el: null, pra: null, praKunci: '', praSandaran: false, hidup: null, senarai: [], i: 0, opt: {}, cubaan: 0, durasi: new Map(), blob: null, tJeda: 0, msKini: 0, ulangLangkah: false,
  url(s, a) { return `https://everyayah.com/data/${T.qari}/${pad(s, 3)}${pad(a, 3)}.mp3`; },
  sandaran(s, a) { return `https://verses.quran.com/Alafasy/mp3/${pad(s, 3)}${pad(a, 3)}.mp3`; },
  kunci(x) { return x.s + ':' + x.a; },
  pasang() {
    if (this.el) return this.el;
    const el = this.el = new Audio(); el.preload = 'auto';
    el.addEventListener('ended', () => { if (this.ulangLangkah) { this.ulangLangkah = false; return this.mula(); } this.seterusnya(); });
    el.addEventListener('playing', () => this.praMuat());
    el.addEventListener('loadedmetadata', () => { const x = this.senarai[this.i]; if (x && !x.diam && isFinite(el.duration) && el.duration > 0) this.durasi.set(this.kunci(x), el.duration); });
    el.addEventListener('error', () => {
      const x = this.senarai[this.i]; if (!x || !el.getAttribute('src')) return;
      if (x.diam) { clearTimeout(this.tJeda); this.tJeda = setTimeout(() => { this.tJeda = 0; if (this.ulangLangkah) { this.ulangLangkah = false; this.mula(); } else this.seterusnya(); }, this.msKini || 3000); return; }   // senyap gagal: guna pemasa
      if (this.cubaan === 0) { this.cubaan = 1; el.src = this.sandaran(x.s, x.a); el.play().catch(() => {}); }
      else { roti('Audio tidak dapat dimainkan. Semak sambungan internet.'); this.henti(); }
    });
    el.addEventListener('play', () => this.kemas()); el.addEventListener('pause', () => this.kemas());
    this.pra = new Audio(); this.pra.preload = 'auto'; this.pra.muted = true;
    this.pra.addEventListener('loadedmetadata', () => { if (this.praKunci && isFinite(this.pra.duration) && this.pra.duration > 0) this.durasi.set(this.praKunci, this.pra.duration); });
    this.pra.addEventListener('error', () => {   // cuba pelayan sandaran sekali; kemudian benarkan cubaan semula kemudian
      if (!this.praKunci || !this.pra.getAttribute('src')) return;
      if (!this.praSandaran) { this.praSandaran = true; const [s, a] = this.praKunci.split(':').map(Number); this.pra.src = this.sandaran(s, a); try { this.pra.load(); } catch (e) {} }
      else this.praKunci = '';
    });
    if ('mediaSession' in navigator) {
      const set = (k, f) => { try { navigator.mediaSession.setActionHandler(k, f); } catch (e) {} };
      set('play', () => this.togol(true)); set('pause', () => this.togol(false)); set('stop', () => this.henti());
      set('previoustrack', () => this.lompat(-1)); set('nexttrack', () => this.lompat(1));
    }
    return el;
  },
  main(senarai, opt = {}) {
    this.pasang(); clearTimeout(this.tJeda); this.tJeda = 0; this.ulangLangkah = false;
    const j = +opt.jeda || 0, out = [];
    let k = -1, dulu = null;
    for (const x0 of senarai) {
      const x = Object.assign({}, x0);
      if (x.k == null) { if (x.diam) x.k = Math.max(k, 0); else { if (!dulu || this.kunci(dulu) !== this.kunci(x)) k++; x.k = k; dulu = x; } }
      if (j > 0 && out.length && !x.diam && !out[out.length - 1].diam) out.push({diam: j * 1000, k: out[out.length - 1].k});
      out.push(x);
    }
    this.senarai = out; this.i = 0; this.opt = opt;
    this.hidupkan(out.some(z => z.diam || z.k !== out[0].k));
    this.mula();
  },
  hidupkan(on) {   // pemain senyap berulang (lihat nota di atas); dimainkan hanya semasa sesi berbilang langkah sedang berjalan
    if (IOS) return;
    if (!on) { if (this.hidup) this.hidup.pause(); this.hidupAktif = false; return; }
    if (!this.hidup) { this.hidup = new Audio(); this.hidup.loop = true; this.hidup.src = this.wavSenyap(6000, false); }
    this.hidupAktif = true; this.hidup.play().catch(() => {});
  },
  mula() {
    const x = this.senarai[this.i]; if (!x) return this.henti();
    this.cubaan = 0; clearTimeout(this.tJeda); this.tJeda = 0; this.ulangLangkah = false;
    const lama = this.blob; this.blob = null; this.msKini = 0;
    if (x.diam === 'giliran' && !x.tunggu && !this.durasi.has(this.kunci(x))) {
      // tempoh ayat belum diketahui (cth. langkah pertama Ayat al-Kursi): muat ayat itu, senyap 1.5 saat, kemudian ulang langkah ini
      x.tunggu = true; this.muatPra(x); this.ulangLangkah = true;
      this.msKini = 1500; this.blob = this.wavSenyap(1500, false); this.el.src = this.blob;
    } else if (x.diam) { this.msKini = this.msDiam(x); this.blob = this.wavSenyap(this.msKini, x.diam === 'giliran'); this.el.src = this.blob; }
    else this.el.src = this.url(x.s, x.a);
    if (lama) URL.revokeObjectURL(lama);
    this.el.play().catch(e => { if (e && e.name === 'NotAllowedError') roti('Sentuh butang main sekali lagi untuk memulakan audio.'); });
    this.serlah(); this.kemas(); this.metadata();
    if (!x.diam && !x.pembuka && this.opt.pos) this.opt.pos(x.a);
  },
  msDiam(x) {   // giliran: tempoh audio ayat × kali + 0.8 s (2.5 s hingga 3 minit; ayat terpanjang, 2:282, melebihi 2 minit)
    if (typeof x.diam === 'number') return x.diam;
    const d = this.durasi.get(this.kunci(x));
    return Math.round(Math.min(180000, Math.max(2500, (d ? d * 1000 : 7000) * (x.kali || 1.5) + 800)));
  },
  wavSenyap(ms, isyarat) {   // WAV PCM 8-bit 8 kHz mono; isyarat = bunyi "tik" lembut 60 ms di awal
    const kadar = 8000, n = Math.max(1, Math.round(kadar * ms / 1000)), buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const tulis = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    tulis(0, 'RIFF'); v.setUint32(4, 36 + n, true); tulis(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, kadar, true); v.setUint32(28, kadar, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); tulis(36, 'data'); v.setUint32(40, n, true);
    const d = new Uint8Array(buf, 44); d.fill(128);
    if (isyarat) for (let i = 0; i < Math.min(n, 480); i++) d[i] = 128 + Math.round(16 * Math.sin(2 * Math.PI * 660 * i / kadar) * Math.min(1, i / 40, (480 - i) / 160));
    return URL.createObjectURL(new Blob([buf], {type: 'audio/wav'}));
  },
  praMuat() {   // selepas audio semasa mula dimainkan: muat ayat berikutnya (kurang sela antara ayat; tempoh untuk giliran)
    const x = this.senarai[this.i]; if (!x || !this.pra) return;
    if (x.diam === 'giliran' && !this.durasi.has(this.kunci(x))) return this.muatPra(x);
    const y = this.senarai.slice(this.i + 1).find(z => !z.diam && this.kunci(z) !== this.kunci(x));
    if (y && !this.durasi.has(this.kunci(y))) this.muatPra(y);
  },
  muatPra(y) {
    const k = this.kunci(y); if (!this.pra || this.praKunci === k) return;
    this.praKunci = k; this.praSandaran = false; this.pra.src = this.url(y.s, y.a);
    try { this.pra.load(); } catch (e) {}
  },
  seterusnya() { if (this.i + 1 < this.senarai.length) { this.i++; this.mula(); } else this.henti(true); },
  lompat(arah) {   // ⏭: tamatkan senyap, atau terus ke ayat berikutnya. ⏮: ulang ayat ini (jika > 2 saat), atau ke audio pertama ayat sebelumnya
    const x = this.senarai[this.i]; if (!x || !this.el) return;
    if (arah > 0) {
      if (x.diam) return this.seterusnya();
      let j = this.i + 1; while (j < this.senarai.length && this.senarai[j].k === x.k) j++;
      if (j >= this.senarai.length) return this.henti(true);
      this.i = j; return this.mula();
    }
    if (!x.diam && this.el.currentTime > 2) { this.el.currentTime = 0; this.el.play().catch(() => {}); return; }
    let j = this.i - 1; while (j >= 0 && this.senarai[j].k === x.k) j--;   // keluar daripada kumpulan ayat semasa
    if (j < 0) { if (!x.diam) { this.el.currentTime = 0; this.el.play().catch(() => {}); } return; }
    const kp = this.senarai[j].k; let m = j;
    while (m > 0 && this.senarai[m - 1].k === kp) m--;                    // awal kumpulan ayat sebelumnya
    while (m < j && this.senarai[m].diam) m++;                            // langkah audio pertamanya
    this.i = m; this.mula();
  },
  lompatKe(s, a) {   // sentuh butang ayat semasa sesi: terus ke audio ayat itu
    const j = this.senarai.findIndex(z => !z.diam && !z.pembuka && z.s === s && z.a === a);
    if (j < 0) return false;
    this.i = j; this.mula(); return true;
  },
  togol(paksa) {
    if (!this.el || !this.senarai.length) return;
    if (this.tJeda) { clearTimeout(this.tJeda); this.tJeda = 0; return this.seterusnya(); }   // senyap ikut pemasa: terus ke langkah seterusnya
    const mainkan = paksa === undefined ? this.el.paused : paksa;
    if (mainkan) { this.el.play().catch(() => {}); if (this.hidup && this.hidupAktif === false && this.senarai.some(z => z.diam || z.k !== this.senarai[0].k)) this.hidupkan(true); }
    else { this.el.pause(); if (this.hidup) this.hidup.pause(); this.hidupAktif = false; }
  },
  henti(habis = false) {
    clearTimeout(this.tJeda); this.tJeda = 0; this.ulangLangkah = false; this.hidupkan(false);
    if (this.el) { this.el.pause(); this.el.removeAttribute('src'); this.el.load(); }
    if (this.blob) { URL.revokeObjectURL(this.blob); this.blob = null; }
    const tamat = this.opt.tamat; this.senarai = []; this.opt = {};
    this.serlah(); this.kemas();
    if (tamat) tamat(habis);
  },
  serlah(skrol = true) {
    $$('.ayat.main,.ag.main').forEach(e => { e.classList.remove('main', 'giliran'); e.removeAttribute('aria-current'); });
    const x = this.senarai[this.i]; if (!x || x.pembuka) return;
    const el = document.getElementById(`a${x.s}-${x.a}`); if (!el) return;
    el.classList.add('main'); el.setAttribute('aria-current', 'true'); if (x.diam === 'giliran') el.classList.add('giliran');
    if (skrol && T.ikut && this.opt.ikut !== false) el.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: el.classList.contains('ag') ? 'nearest' : 'center'});
  },
  label(x) {
    if (x.basmalah) return 'Bismillaah';
    if (x.diam === 'giliran') return `Giliran anda: ayat ${x.a}`;
    if (x.diam) { const p = this.senarai.slice(0, this.i).reverse().find(z => !z.diam); return p ? `${namaSurah(p.s)} ${p.s}:${p.a} (jeda)` : 'Jeda'; }
    const n = this.opt.jum || (this.senarai.length ? this.senarai[this.senarai.length - 1].k + 1 : 0);
    return `${namaSurah(x.s)} ${x.s}:${x.a}` + (n > 1 && !x.pembuka ? `  (${x.k + 1}/${n})` : '');
  },
  metadata() {
    const x = this.senarai[this.i]; if (!x || !('mediaSession' in navigator) || (x.diam && x.diam !== 'giliran')) return;
    const qari = (QARI.find(q => q[0] === T.qari) || [, ''])[1];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({title: x.diam ? `Giliran anda: ayat ${x.a}` : x.basmalah ? 'Bismillaah' : `${namaSurah(x.s)}, ayat ${x.a}`,
        artist: x.diam ? namaSurah(x.s) : qari, album: this.opt.tajuk ? `Poket Yaasin: ${this.opt.tajuk}` : 'Poket Yaasin',
        artwork: [{src: 'img/icon-192.png', sizes: '192x192', type: 'image/png'}, {src: 'img/icon-512.png', sizes: '512x512', type: 'image/png'}]});
    } catch (e) {}
  },
  kemas() {
    let p = $('#pemain'); const x = this.senarai[this.i];
    const ms = 'mediaSession' in navigator ? navigator.mediaSession : null;
    if (!x) { if (p) p.remove(); if (ms) try { ms.playbackState = 'none'; } catch (e) {} return; }
    const banyak = this.senarai.some(z => z.k !== x.k || z.diam);
    if (p && p.dataset.banyak !== String(banyak)) { p.remove(); p = null; }
    if (!p) {
      p = h('div', {id: 'pemain', class: 'pemain' + (banyak ? ' banyak' : ''), role: 'region', 'aria-label': 'Pemain audio', 'data-banyak': String(banyak)},
        h('span', {class: 't'}),
        banyak ? ib('sebelum', 'Ayat sebelumnya, atau ulang ayat ini', () => this.lompat(-1)) : null,
        ib('jeda', 'Jeda atau sambung', () => this.togol(), {'data-peranan': 'togol'}),
        banyak ? ib('seterusnya', 'Ayat seterusnya', () => this.lompat(1)) : null,
        ib('henti', 'Henti audio', () => this.henti()));
      document.body.append(p);
    }
    p.classList.toggle('giliran', x.diam === 'giliran');
    const tp = $('.t', p); tp.replaceChildren();
    const sub = `${(QARI.find(q => q[0] === T.qari) || [, 'Qari'])[1]}, riwayat Hafs 'an 'Asim` + (this.opt.hafal && !x.basmalah ? `, muka surat ${halBagi(keGlobal(x.s, x.a))}` : '');
    tambah(tp, h('b', null, this.label(x)), h('span', null, x.diam === 'giliran' ? `${namaSurah(x.s)}: ${this.opt.mod === 'uji' ? 'baca dari ingatan' : 'ulang bacaan qari'}` : sub));
    const tg = $('[data-peranan="togol"]', p); const jalan = this.el && !this.el.paused;
    tg.innerHTML = ikon(jalan ? 'jeda' : 'main'); tg.setAttribute('aria-label', jalan ? 'Jeda' : 'Sambung');
    if (ms) try { ms.playbackState = jalan ? 'playing' : 'paused'; } catch (e) {}
  },
  kata(s, a, w) { const k = new Audio(`https://audio.qurancdn.com/wbw/${pad(s, 3)}_${pad(a, 3)}_${pad(w, 3)}.mp3`); k.play().catch(() => roti('Audio perkataan memerlukan internet.')); },
};

/* ================================================================ nama arwah (templat {NAMA} bin/binti {BAPA}) */
function kunciVarian(nama) {
  if (!nama.length) return 'r';
  if (nama.length === 1) return nama[0].j === 'p' ? 'p' : 'l';
  if (nama.length === 2) return 'd';
  return nama.every(x => x.j === 'p') ? 'rp' : 'r';
}
function isiNama(teks, n) {
  let t = String(teks || '');
  if (!n.b) t = t.replace(/\s*(?:بْنِ|بِنْتِ)\s*\{BAPA\}/g, '').replace(/\s*\b(?:bin|binti)\s*\{BAPA\}/g, '');
  return t;
}
/* Gantikan {NAMA}/{BAPA} dengan cip nama (ltr, terpencil daripada teks Arab). */
function denganNama(teks, n) {
  const out = []; let last = 0; const s = isiNama(teks, n); const re = /\{(NAMA|BAPA)\}/g; let m;
  while ((m = re.exec(s))) { out.push(s.slice(last, m.index)); out.push(h('bdi', {class: 'nama'}, (m[1] === 'NAMA' ? n.n : n.b) || '…')); last = m.index + m[0].length; }
  out.push(s.slice(last)); return out;
}
const tekstNama = (teks, n) => isiNama(teks, n).replace(/\{NAMA\}/g, n.n || '…').replace(/\{BAPA\}/g, n.b || '…');
function senaraiNamaRingkas(nama) {
  return nama.map(x => `${x.j === 'p' ? 'Allahyarhamah' : 'Allahyarham'} ${x.n}${x.b ? (x.j === 'p' ? ' binti ' : ' bin ') + x.b : ''}`).join(', ');
}
/* Helaian untuk menyunting senarai nama (dikongsi oleh paparan doa/susunan dan Pembina Majlis). */
function suntingNama(nama, simpan, tajuk = 'Nama arwah') {
  const kerja = nama.map(x => Object.assign({}, x));
  const senarai = h('div');
  function baris(x, i) {
    const jan = h('div', {class: 'jan', role: 'group', 'aria-label': 'Jantina'},
      ['l', 'p'].map(j => h('button', {class: 'cip', type: 'button', 'aria-pressed': String((x.j || 'l') === j), onclick: () => { x.j = j; lukis(); }}, j === 'l' ? 'Lelaki' : 'Perempuan')));
    return h('div', {class: 'arwah-l'},
      h('div', null, h('label', {class: 'lbl', for: `nm${i}`}, 'Nama arwah'),
        h('input', {class: 'medan', id: `nm${i}`, value: x.n || '', autocomplete: 'off', placeholder: 'cth. Ahmad', oninput: e => { x.n = e.target.value; }})),
      h('div', null, h('label', {class: 'lbl', for: `bp${i}`}, x.j === 'p' ? 'Binti (nama bapa)' : 'Bin (nama bapa)'),
        h('input', {class: 'medan', id: `bp${i}`, value: x.b || '', autocomplete: 'off', placeholder: 'pilihan', oninput: e => { x.b = e.target.value; }})),
      h('button', {class: 'ib', type: 'button', 'aria-label': 'Buang nama ini', html: ikon('buang'), onclick: () => { kerja.splice(i, 1); lukis(); }}),
      jan);
  }
  function lukis() { senarai.replaceChildren(...kerja.map(baris)); if (!kerja.length) tambah(senarai, h('p', {class: 'kecil'}, 'Tiada nama. Tanpa nama, doa dibaca untuk semua arwah muslimin dan muslimat.')); }
  lukis();
  bukaHelai(tajuk, frag(
    h('p', {class: 'kecil'}, 'Nama disebut dalam bahagian "khususnya kepada roh…" dan menentukan kata ganti dalam doa keampunan (dia lelaki, dia perempuan, mereka berdua, mereka). Nama hanya disimpan dalam telefon ini.'),
    senarai,
    h('button', {class: 'tambah-nama', type: 'button', html: ikon('tambah') + ' Tambah nama', onclick: () => { kerja.push({n: '', b: '', j: 'l'}); lukis(); setTimeout(() => { const i = $$('.arwah-l input', senarai); if (i.length > 1) i[i.length - 2].focus(); }, 30); }}),
    h('div', {class: 'tindakan'},
      h('button', {class: 'btn', type: 'button', onclick: () => tutupHelai()}, 'Batal'),
      h('button', {class: 'btn utama', type: 'button', onclick: () => { simpan(kerja.filter(x => (x.n || '').trim()).map(x => ({n: x.n.trim(), b: (x.b || '').trim(), j: x.j || 'l'}))); tutupHelai(true); }}, 'Simpan nama'))));
}

/* ================================================================ paparan doa */
const LENCANA = {quran: ['b-quran', 'Al-Quran'], sahih: ['b-sahih', 'Sahih'], hasan: ['b-hasan', 'Hasan'], beza: ['b-beza', 'Diperselisihkan'], dhaif: ['b-dhaif', "Dha'if"], athar: ['b-ulama', 'Athar'], ulama: ['b-ulama', 'Susunan ulama'], amalan: ['b-ulama', 'Amalan'], saya: ['b-ulama', 'Doa saya']};
function jenisLencana(d) {
  const s = d.s || {}, dj = String(s.d || '').toLowerCase();
  if (s.j === 'quran') return 'quran';
  if (s.j === 'saya') return 'saya';
  if (/sahih/.test(dj) && /athar/.test(dj)) return 'athar';
  if (/sahih/.test(dj)) return 'sahih';
  if (/hasan/.test(dj)) return 'hasan';
  if (/perselisih|beza/.test(dj)) return 'beza';
  if (/dha.?if|lemah/.test(dj)) return 'dhaif';
  if (/athar/.test(dj) || s.j === 'athar') return 'athar';
  if (/amalan/.test(dj)) return 'amalan';
  return 'ulama';
}
function lencana(d) { const [k, l] = LENCANA[jenisLencana(d)]; return h('span', {class: 'lencana ' + k}, l); }
function paparRumi(ru) {
  const p = h('p', {class: 'rumi'}); let last = 0;
  for (const m of ru.matchAll(/⟨([^⟩]+)⟩/g)) {
    tambah(p, ru.slice(last, m.index));
    tambah(p, h('button', {class: 'tanda-ayat', type: 'button', 'data-ayat': m[1], 'data-sebab': 'rumi', title: 'Petikan ayat: sentuh untuk lihat dan dengar'}, 'ayat ' + m[1].replace(/,\s*/g, ', ')));
    last = m.index + m[0].length;
  }
  tambah(p, ru.slice(last)); return p;
}
/* Satu bahagian teks doa (Arab berfrasa + makna + Rumi). nama: objek nama arwah untuk templat. */
function paparTeksDoa(b, nama) {
  const ar = (b.ar || []).map(x => nama ? denganNama(x, nama) : x);
  const fr = (b.fr || []).map(x => nama ? tekstNama(x, nama) : x);
  const el = frag();
  if (T.frasa && b.fr && b.fr.length) {
    tambah(el, h('div', {class: 'frasa'}, ar.map((a, i) => h('div', {class: 'f'}, h('div', {class: 'a', lang: 'ar'}, a), h('div', {class: 'm'}, fr[i] || '')))));
  } else if (ar.length) {
    tambah(el, h('p', {class: 'ar', lang: 'ar'}, ar.map((a, i) => [h('span', {class: 'fr', 'data-fr': fr[i] || '', tabindex: '0'}, a), ' '])));
  }
  if (T.rumi && b.ru) tambah(el, paparRumi(nama ? tekstNama(b.ru, nama) : b.ru));
  if ((!T.frasa || !b.fr || !b.fr.length) && b.mk) tambah(el, h('p', {class: 'makna'}, nama ? tekstNama(b.mk, nama) : b.mk));
  return el;
}
function paparQuranDoa(b) {
  const sp = parseSpec(b.q), el = frag();
  tambah(el, h('p', {class: 'qr', lang: 'ar'}, sp.map(x => kataAyat(x.s, x.a, x.f, x.t))));
  if (T.perkata) for (const x of sp) tambah(el, perkataAyat(x.s, x.a, x.f, x.t));
  const mk = b.mk || sp.map(x => (D.ayat[`${x.s}:${x.a}`] || {}).t).filter(Boolean).join(' ');
  if (T.makna && mk) tambah(el, h('p', {class: 'makna'}, mk));
  tambah(el, h('div', {class: 'ref-ayat'},
    h('span', null, labelSpec(b.q)),
    h('button', {class: 'btn kecil', type: 'button', onclick: () => AUD.main(sp.filter((x, i, a) => a.findIndex(y => y.s === x.s && y.a === x.a) === i).map(x => ({s: x.s, a: x.a})), {ikut: false}), html: ikon('main') + ' Dengar ayat'})));
  return el;
}
/* Semua bahagian sesuatu doa. ctx: {nama: [..], bahagian: [indeks], suntingNama: fn} */
function paparBahagian(d, ctx = {}) {
  const nama = ctx.nama || [], out = frag();
  d.b.forEach((b, i) => {
    if (ctx.bahagian && !ctx.bahagian.includes(i)) return;
    const box = h('div', {class: 'bah' + (b.q ? ' bah-q' : '')});
    const ul = b.ul ? h('span', {class: 'ul'}, `×${b.ul}`) : null;
    const tajukB = (b.tj || b.pl || ul) && !b.arwah ? h('h4', null, b.tj || (b.q ? 'Ayat' : ''), b.pl ? ' (pilihan)' : '', ul) : null;
    if (b.arwah) {
      const tp = D.templat[b.arwah] || {};
      if (!nama.length) {
        if (b.pl && !ctx.suntingNama) return;
        if (ctx.suntingNama) tambah(box, h('button', {class: 'tambah-nama', type: 'button', html: ikon('tambah') + ' Tambah nama arwah' + (b.pl ? ' (pilihan)' : ''), onclick: ctx.suntingNama}));
        else return;
      } else {
        tambah(box, h('h4', null, tp.tajuk || 'Khusus untuk arwah'));
        for (const n of nama) tambah(box, paparTeksDoa(teksTemplat(tp[n.j === 'p' ? 'p' : 'l']), n));
        if (ctx.suntingNama) tambah(box, h('button', {class: 'tambah-nama', type: 'button', html: ikon('sunting') + ' Ubah nama', onclick: ctx.suntingNama}));
      }
      tambah(out, box); return;
    }
    if (b.varian) {
      const tp = D.templat[b.varian] || {}, k = kunciVarian(nama);
      tambah(box, h('h4', null, tp.tajuk || '', ul));
      tambah(box, paparTeksDoa(teksTemplat(tp[k] || tp.r || tp.l)));
      tambah(out, box); return;
    }
    if (tajukB) tambah(box, tajukB);
    tambah(box, b.q ? paparQuranDoa(b) : paparTeksDoa(b));
    tambah(out, box);
  });
  return out;
}
function teksTemplat(t) {
  if (!t) return {ar: [], fr: []};
  return {ar: String(t.teks || '').split('|').map(x => x.trim()), fr: t.frasa ? String(t.frasa).split('|').map(x => x.trim()) : [], ru: t.rumi || '', mk: t.makna || ''};
}
/* Teks biasa (untuk salin/kongsi). */
function teksDoa(d, nama = []) {
  const L = [d.tj];
  for (const b of d.b) {
    if (b.arwah) { const tp = D.templat[b.arwah] || {}; for (const n of nama) { const t = teksTemplat(tp[n.j === 'p' ? 'p' : 'l']); L.push(t.ar.map(x => tekstNama(x, n)).join(' '), tekstNama(t.mk, n)); } continue; }
    const t = b.varian ? teksTemplat((D.templat[b.varian] || {})[kunciVarian(nama)]) : b;
    if (b.q) { L.push(parseSpec(b.q).map(x => { const A = D.ayat[`${x.s}:${x.a}`]; return A ? A.w.slice(x.f - 1, x.t || A.w.length).join(' ') : ''; }).join(' '), `(${labelSpec(b.q)})`, b.mk || ''); continue; }
    L.push((t.ar || []).join(' '));
    if (t.ru && T.rumi) L.push(t.ru.replace(/⟨([^⟩]+)⟩/g, '[ayat $1]'));
    if (t.mk) L.push(t.mk);
  }
  if (d.s && d.s.r) L.push('Sumber: ' + d.s.r);
  return L.filter(Boolean).join('\n\n');
}
/* ================================================================ kerangka: bar atas, tab bawah, penghala */
const TAB = [['utama', '#/', 'Utama'], ['yaasin', '#/yaasin', 'Yaasin'], ['tahlil', '#/tahlil', 'Tahlil'], ['doa', '#/doa', 'Doa'], ['majlis', '#/majlis', 'Majlis']];
function bar({tajuk, sub, kembali, kanan = []}) {
  const kiri = kembali ? h('a', {class: 'ib', href: kembali, 'aria-label': 'Kembali', title: 'Kembali', html: ikon('kembali'), onclick: e => { if (history.length > 1 && sejarah.length > 1) { e.preventDefault(); history.back(); } }}) : null;
  const kn = kanan.length ? kanan : [
    h('a', {class: 'ib', href: '#/nota', 'aria-label': 'Nota hukum dan sumber', title: 'Nota', html: ikon('nota')}),
    h('a', {class: 'ib', href: '#/tetapan', 'aria-label': 'Tetapan', title: 'Tetapan', html: ikon('tetapan')})];
  $('#bar').replaceChildren(h('div', {class: 'bar-in' + (kiri ? ' ada-kembali' : '')}, kiri, h('h1', null, tajuk, sub ? h('span', {class: 'sub'}, sub) : null), kn));
  document.title = tajuk === 'Poket Yaasin' ? 'Poket Yaasin, Tahlil & Doa' : `${tajuk} | Poket Yaasin`;
  requestAnimationFrame(() => document.documentElement.style.setProperty('--tinggi-bar', $('#bar').offsetHeight + 'px'));
}
const sejarah = [];             // hash yang dilawati (untuk butang kembali & pulih skrol)
const bersihSkrin = [];         // fungsi pembersih skrin semasa (pemasa, kunci skrin); dijalankan sebelum skrin dilukis semula
const skrolSimpan = new Map();
let hashKini = '';
function hala(opt) {
  const kekal = !!(opt && opt.kekal), yKini = scrollY;
  const hash = location.hash || '#/';
  if (hashKini) skrolSimpan.set(hashKini, scrollY);
  const balik = sejarah.length > 1 && sejarah[sejarah.length - 2] === hash;
  if (balik) sejarah.pop(); else if (sejarah[sejarah.length - 1] !== hash) sejarah.push(hash);
  hashKini = hash;
  tutupHelai(true);
  if (pentasAktif && !kekal) tutupPentas(true);
  for (const f of bersihSkrin.splice(0)) try { f(); } catch (e) {}
  const [laluan, qs] = hash.slice(1).split('?');
  const p = laluan.split('/').filter(Boolean).map(decodeURIComponent);
  const q = new URLSearchParams(qs || '');
  const skrin = $('#skrin'); skrin.replaceChildren();
  document.body.dataset.skrin = p[0] || 'utama';
  let tab = 'utama';
  try {
    if (!p.length) { tab = 'rumah'; skrinUtama(skrin); }
    else if (p[0] === 'yaasin') { tab = 'yaasin'; skrinYaasin(skrin, +p[1] || 0); }
    else if (p[0] === 'tahlil') { tab = 'tahlil'; skrinTahlil(skrin); }
    else if (p[0] === 'susunan') { tab = 'tahlil'; skrinSusunan(skrin, p[1]); }
    else if (p[0] === 'doa' && p[1] === 'baru') { tab = 'doa'; skrinDoaSayaBorang(skrin, p[2]); }
    else if (p[0] === 'doa' && p[1]) { tab = 'doa'; skrinDoa(skrin, p[1]); }
    else if (p[0] === 'doa') { tab = 'doa'; skrinSenaraiDoa(skrin, q); }
    else if (p[0] === 'majlis' && p[1] === 't' && p[2]) { tab = 'majlis'; skrinMajlis(skrin, majlisDaripadaTemplat(p[2]), p[3] === 'teks'); }
    else if (p[0] === 'majlis' && p[1] === 's' && p[2]) { tab = 'majlis'; const m = majlisSaya().find(x => x.id === p[2]); if (m) skrinMajlis(skrin, m, p[3] === 'teks'); else tiada(skrin); }
    else if (p[0] === 'majlis') { tab = 'majlis'; skrinSenaraiMajlis(skrin); }
    else if (p[0] === 'k' && p[1]) { tab = 'majlis'; skrinImport(skrin, p[1]); }
    else if (p[0] === 'nota' && p[1]) { skrinNota(skrin, p[1], q); tab = ''; }
    else if (p[0] === 'cari') { skrinCari(skrin, q); tab = ''; }
    else if (p[0] === 'nota') { skrinSenaraiNota(skrin); tab = ''; }
    else if (p[0] === 'tetapan') { skrinTetapan(skrin); tab = ''; }
    else if (p[0] === 'solat') { skrinSolat(skrin); tab = ''; }
    else if (p[0] === 'tasbih') { skrinTasbih(skrin, q); tab = ''; }
    else if (p[0] === 'rujukan') { skrinRujukan(skrin); tab = ''; }
    else if (p[0] === 'hafalan' && p[1]) { skrinHafalanSatu(skrin, p[1]); tab = ''; }
    else if (p[0] === 'hafalan') { skrinHafalan(skrin); tab = ''; }
    else if (p[0] === 'diari') { skrinDiari(skrin, p[1]); tab = ''; }
    else if (p[0] === 'keluarga') { skrinKeluarga(skrin); tab = ''; }
    else tiada(skrin);
  } catch (e) {
    console.error(e);
    skrin.replaceChildren(h('div', {class: 'kosong'}, h('p', null, 'Maaf, skrin ini gagal dipaparkan.'), h('p', {class: 'kecil'}, String(e && e.message || e)), h('a', {class: 'btn', href: '#/'}, 'Ke Utama')));
    if (tab === 'rumah') { tab = 'utama'; document.body.dataset.skrin = 'ralat'; }
  }
  lukisTab(tab);
  const pos = kekal ? yKini : balik ? skrolSimpan.get(hash) : null;
  if (kekal || !/^#\/yaasin\/\d/.test(hash)) requestAnimationFrame(() => scrollTo(0, pos || 0));
  if (!kekal) skrin.focus({preventScroll: true});
}
const lukisSemula = () => hala({kekal: true});
function tiada(skrin) {
  bar({tajuk: 'Tidak dijumpai', kembali: '#/'});
  tambah(skrin, h('div', {class: 'kosong'}, h('p', null, 'Halaman ini tiada atau telah dipadam.'), h('a', {class: 'btn', href: '#/'}, 'Ke Utama')));
}

/* ================================================================ Utama */
function konteksAktif(kini = new Date()) {
  const hj = hijri(kini), x = {hari: kini.getDay(), minit: kini.getHours() * 60 + kini.getMinutes(), hj, iso: isoTarikh(kini)};
  const hm = s => { const [a, b] = s.split(':').map(Number); return a * 60 + b; };
  const ok = c => {
    if (c.sentiasa) return true;
    if (c.hari && !c.hari.includes(x.hari)) return false;
    if (c.dari || c.hingga) {
      const d = c.dari ? hm(c.dari) : 0, t = c.hingga ? hm(c.hingga) : 1440;
      if (d <= t ? !(x.minit >= d && x.minit < t) : !(x.minit >= d || x.minit < t)) return false;
    }
    if (c.hijri) {
      if (c.hijri.bulan && c.hijri.bulan !== hj.m) return false;
      if (c.hijri.hari && (hj.d < c.hijri.hari[0] || hj.d > c.hijri.hari[1])) return false;
    }
    if (c.tarikh && (x.iso < String(c.tarikh[0]) || x.iso > String(c.tarikh[1]))) return false;
    return true;
  };
  const susun = {musim: 0, amalan: 1, waktu: 2, semasa: 3};
  return D.kalendar.filter(k => (k.bila || []).some(ok)).sort((a, b) => (susun[a.jenis] ?? 4) - (susun[b.jenis] ?? 4));
}
function pautanCadang(c) {
  const [j, id] = c.split(':');
  if (j === 'doa') { const d = cariDoa(id); return d && h('a', {class: 'cip', href: '#/doa/' + id}, d.tj); }
  if (j === 'majlis') { const m = MJ.get(id); return m && h('a', {class: 'cip', href: '#/majlis/t/' + id}, h('span', {class: 'ik', 'aria-hidden': 'true'}, m.ikon || '❖'), m.tajuk); }
  if (j === 'susunan') { const s = SUS.get(id); return s && h('a', {class: 'cip', href: '#/susunan/' + id}, s.tajuk); }
  if (j === 'hafalan') { const x = cariHafalan(id); return x && h('a', {class: 'cip', href: '#/hafalan/' + id}, x.tajuk); }
  return null;
}
/* ================================================================ skrin Utama (susun atur seperti skrin utama telefon)
   Widget jam & tarikh di atas, ikon aplikasi dalam grid 4 lajur, widget "Untuk saat ini", dan dok 4 aplikasi teras di bawah. */
const APL = {
  yaasin: ['Yaasin', '#/yaasin'], tahlil: ['Tahlil', '#/tahlil'], doa: ['Doa', '#/doa'], majlis: ['Majlis', '#/majlis'],
  solat: ['Waktu Solat', '#/solat'], tasbih: ['Tasbih', '#/tasbih'], pagipetang: ['Pagi & Petang', '#/doa?k=pagi-petang'],
  bintang: ['Disimpan', '#/doa?k=bintang'], sunting: ['Doa Saya', '#/doa?k=saya'], nota: ['Nota Hukum', '#/nota'],
  rujukan: ['Rujukan', '#/rujukan'], tetapan: ['Tetapan', '#/tetapan'], hafalan: ['Hafalan', '#/hafalan'], diari: ['Diari', '#/diari'], keluarga: ['Keluarga', '#/keluarga'],
};
const DOK = ['yaasin', 'tahlil', 'doa', 'majlis'];
const GRID_APL = ['solat', 'hafalan', 'diari', 'keluarga', 'tasbih', 'pagipetang', 'nota', 'tetapan'];   // Rujukan: kaki skrin & Tetapan   // Disimpan & Doa Saya: cip dalam skrin Doa
function aplIkon(k) {
  const [label, href] = APL[k];
  return h('a', {class: 'apl', href, 'data-apl': k},
    h('span', {class: 'apl-ik', 'aria-hidden': 'true', html: k === 'yaasin' ? '<span class="glif" lang="ar">يسٓ</span>' : ikon(k)}),
    h('span', {class: 'apl-l'}, label));
}
function lukisTab(aktif) {
  const tab = $('#tab'), rumah = aktif === 'rumah';
  tab.classList.toggle('dok', rumah);
  tab.setAttribute('aria-label', rumah ? 'Aplikasi teras' : 'Navigasi utama');
  if (rumah) { tab.replaceChildren(h('div', {class: 'tab-in'}, DOK.map(aplIkon))); return; }
  tab.replaceChildren(h('div', {class: 'tab-in'}, TAB.map(([k, href, label]) =>
    h('a', {href, 'aria-current': k === aktif ? 'page' : null, html: ikon(k) + `<span>${label}</span>`}))));
}
function barisKeluarga() {   // nama keluarga dan avatar ahli di atas jam; sentuh untuk tukar profil
  const k = keluarga(), aktif = ahliAktif(), lain = k.ahli.filter(a => a.id !== aktif.id).slice(0, 4);
  return h('div', {class: 'jam-atas'}, h('span', {class: 'nama-keluarga'}, k.nama || ''),
    h('button', {class: 'ahli-tumpuk', type: 'button', 'aria-label': `Profil aktif: ${aktif.nama}. Sentuh untuk tukar profil.`, onclick: bukaPilihAhli},
      lain.reverse().map(a => avatar(a, 30, 'kecil')), avatar(aktif, 40, 'aktif')));
}
function fotoKeluarga() {   // widget foto keluarga (gambar berkumpulan konteks "utama") seperti widget foto skrin utama telefon
  const g = gambarKonteks('utama', 'foto-kumpulan'); if (!g) return null;
  const k = keluarga();
  return h('a', {class: 'widget-foto', href: '#/keluarga', 'aria-label': `${k.nama || 'Keluarga'}: buka Keluarga`}, g);
}
function skrinUtama(skrin) {
  bar({tajuk: 'Poket Yaasin'});
  const kini = new Date(), terakhir = SIMPAN.baca('terakhir', {}), a = +terakhir.yaasin || 0;
  const jam = h('div', {class: 'jam'}), tarikhEl = h('div', {class: 'jam-tarikh'}), solatEl = h('a', {class: 'jam-solat', href: '#/solat'});
  const waktuEl = h('a', {class: 'jam-waktu', href: '#/solat', hidden: true});
  function kemas() {
    const n = new Date(), j = n.getHours();
    jam.replaceChildren(); tambah(jam, h('span', {class: 'jj'}, `${(j % 12) || 12}:${pad(n.getMinutes())}`), h('span', {class: 'ampm'}, j < 12 ? 'AM' : 'PM'));
    tarikhEl.replaceChildren(); tambah(tarikhEl, h('span', null, fmtTarikh(n)), h('span', {class: 'hj'}, fmtHijri(hijri(n))));
    const s = T.zon ? solatSeterusnya(n) : null;
    solatEl.replaceChildren(); tambah(solatEl, h('span', {class: 'js-ik', html: ikon('solat')}),
      s ? h('span', {class: 'js-tx'}, h('b', null, `${NAMA_SOLAT[s.k]} ${fmtWaktu(s.t)}`), h('span', null, `lagi ${bakiMasa(s.t - n)}, zon ${T.zon}${s.sumber === 'anggaran' ? ' (anggaran)' : ''}${bukanMY() ? ', waktu Malaysia' : ''}`))
        : h('span', {class: 'js-tx'}, h('b', null, 'Waktu solat'), h('span', null, 'Pilih zon untuk waktu dan peringatan')));
    lukisJalurWaktu(waktuEl, s, n);
  }
  kemas();
  let pemasa = 0;
  const jadual = () => { pemasa = setTimeout(() => { kemas(); jadual(); }, 60000 - Date.now() % 60000 + 40); };
  const lihat = () => { if (document.visibilityState === 'visible') kemas(); };
  jadual(); document.addEventListener('visibilitychange', lihat);
  bersihSkrin.push(() => { clearTimeout(pemasa); document.removeEventListener('visibilitychange', lihat); });
  if (T.zon && navigator.onLine) segarWaktu();

  const kt = konteksAktif(kini), HAD = 2, lebih = Math.max(0, kt.length - HAD), peribadi = barisPeribadi(), plJam = pose(ahliAktif(), 'sapa', 'pelekat-jam');
  const widget = (kt.length || a > 1 || peribadi.length) ? h('section', {class: 'widget', 'aria-labelledby': 'w-tajuk'},
    h('h2', {id: 'w-tajuk'}, 'Untuk saat ini'),
    a > 1 ? h('a', {class: 'w-sambung', href: `#/yaasin/${a}`},
      h('span', {class: 'tx'}, h('b', null, 'Sambung Yaasin'), h('span', null, `dari ayat ${a} daripada 83`)),
      h('span', {class: 'prog', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 83, 'aria-valuenow': a, 'aria-label': 'Kemajuan bacaan Yaasin'}, h('i', {style: `width:${Math.round(a / 83 * 100)}%`}))) : null,
    peribadi,
    kt.map((k, i) => h('div', {class: 'w-kt' + (k.jenis === 'semasa' ? ' semasa' : k.jenis === 'musim' ? ' musim' : ''), hidden: i >= HAD},
      h('h3', null, k.tajuk),
      k.pesan ? h('p', null, inline(k.pesan)) : null,
      h('div', {class: 'w-cip'}, (k.cadang || []).map(pautanCadang)))),
    lebih ? h('button', {class: 'w-lagi', type: 'button', onclick: e => { $$('.w-kt[hidden]').forEach(x => { x.hidden = false; }); e.currentTarget.remove(); }}, `Tunjuk ${lebih} lagi`) : null) : null;

  tambah(skrin, h('div', {class: 'rumah'},
    h('section', {class: 'widget-jam' + (plJam ? ' ada-pelekat' : ''), 'aria-label': 'Masa, tarikh dan waktu solat'}, barisKeluarga(), h('div', {class: 'jam-badan'}, jam, tarikhEl, solatEl, plJam), waktuEl),
    h('a', {class: 'cari-rumah', href: '#/cari?fokus=1', html: ikon('cari') + '<span>Cari doa, zikir, amalan atau waktu solat</span>'}),
    bannerPasang(),
    h('nav', {class: 'grid-apl', 'aria-label': 'Aplikasi'}, GRID_APL.map(aplIkon)),
    widgetKhat(),
    fotoKeluarga(),
    widget,
    h('p', {class: 'kaki-rumah'}, 'Poket Yaasin, Tahlil & Doa. Himpunan peribadi, bukan terbitan rasmi. ',
      h('a', {href: '#/nota/penafian'}, 'Penafian'), ' dan ', h('a', {href: '#/rujukan'}, 'senarai rujukan'), '.')));
}

/* Khat selawat & zikir harian (kandungan/khat.yaml): satu bacaan sehari, selawat dan zikir berselang hari, Jumaat sentiasa
   selawat; bacaan bertanda bintang muncul dua daripada tiga giliran. Fon khat Riq'ah hanya untuk bacaan bukan ayat al-Quran. */
function khatHari(kini = new Date()) {
  const K = D.khat || {}, hari = Math.floor(Date.UTC(kini.getFullYear(), kini.getMonth(), kini.getDate()) / 864e5);
  const jumaat = kini.getDay() === 5, jenis = jumaat || hari % 2 === 0 ? 'selawat' : 'zikir';
  const semua = (K[jenis] || []).filter(id => cariDoa(id)); if (!semua.length) return null;
  const giliran = Math.floor(hari / 2), fav = semua.filter(id => BINTANG.has(id));
  const senarai = fav.length && giliran % 3 !== 2 ? fav : semua;
  return {jenis, jumaat, id: senarai[giliran % senarai.length]};
}
function widgetKhat() {
  const k = khatHari(); if (!k) return null;
  const S = D.khat.selawat || [], urutan = [...S, ...(D.khat.zikir || [])].filter(id => cariDoa(id));
  let i = Math.max(0, urutan.indexOf(k.id));
  const el = h('section', {class: 'widget-khat', 'aria-labelledby': 'kh-t'});
  function lukis() {
    const d = cariDoa(urutan[i]), sel = S.includes(d.id), hariIni = d.id === k.id;
    const ar = d.b.filter(b => (b.ar || []).length).map(b => b.ar.join(' ')).join(' '), mk = d.b.map(b => b.mk).filter(Boolean).join(' ');
    el.replaceChildren(); tambah(el,
      h('div', {class: 'kh-atas'}, h('h2', {id: 'kh-t'}, `${sel ? 'Selawat' : 'Zikir'}${hariIni ? ' hari ini' : ''}`),
        hariIni && k.jumaat ? h('span', {class: 'kh-sebab'}, 'Jumaat: perbanyak selawat') : null),
      h('p', {class: 'kh-ar' + (ar.length > 150 ? ' panjang' : ar.length < 45 ? ' pendek' : ''), lang: 'ar', dir: 'rtl'}, ar),
      h('p', {class: 'kh-nama'}, h('b', null, d.tj), d.ul && d.s && d.s.j === 'hadis' ? h('span', null, ` ×${d.ul}`) : null),   // bilangan hanya jika daripada hadis
      mk ? h('p', {class: 'kh-makna'}, mk) : null,
      h('div', {class: 'kh-tindakan'},
        h('a', {class: 'btn kecil kh-kira', href: '#/tasbih?doa=' + encodeURIComponent(d.id), html: ikon('tasbih') + ' Kira'}),
        h('a', {class: 'btn kecil', href: '#/doa/' + d.id}, 'Baca penuh'),
        urutan.length > 1 ? h('button', {class: 'btn kecil', type: 'button', 'aria-label': `Lain (${sel ? 'selawat' : 'zikir'} seterusnya)`, onclick: () => { i = (i + 1) % urutan.length; lukis(); }}, 'Lain') : null));
  }
  lukis(); return el;
}
/* Jalur waktu solat hari itu di bawah peringatan: solat seterusnya ditonjolkan; selepas Isyak, waktu esok. Dalam Ramadan, Imsak menggantikan Syuruk. */
function lukisJalurWaktu(el, s, kini, serlah) {
  const w = T.zon ? waktuHari(s ? s.t : kini) : null;
  el.hidden = !w; el.replaceChildren(); if (!w) return;
  const esok = s && bahagianMY(s.t).d !== bahagianMY(kini).d;
  const kunci = ['fajr', hijri(kini).m === 9 ? 'imsak' : 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'];
  if (kunci[1] === 'imsak') kunci.unshift(kunci.splice(1, 1)[0]);
  el.setAttribute('aria-label', `Waktu solat ${esok ? 'esok' : 'hari ini'}, zon ${T.zon}${w.sumber === 'anggaran' ? ', anggaran' : ''}. Buka skrin waktu solat`);
  tambah(el, kunci.map(k => {
    const t = w.t[k], kelas = 'jw' + (k === (serlah || (s && s.k)) ? ' kini' : '') + (!esok && t && t <= kini ? ' lalu' : '');
    const [jm, ap] = t ? fmtWaktu(t).split(' ') : ['--:--', ''];
    return h('span', {class: kelas, 'aria-hidden': 'true'}, h('span', {class: 'jw-n'}, NAMA_SOLAT[k]), h('span', {class: 'jw-t'}, jm, ap ? h('small', null, ap) : null));
  }));
}

/* ================================================================ Tasbih: pengira zikir dengan sasaran daripada doa dalam app */
const TASBIH = [
  ['selepas-solat', 'Selepas solat', 'selepas-solat-tasbih'],
  ['tahlil', 'Laa ilaaha illallaah', 'zikir-tahlil'],
  ['tasbih-tahmid', 'Subhaanallaahi wa bihamdih', 'zikir-tasbih-tahmid'],
  ['istighfar', 'Astaghfirullaah', 'zikir-istighfar'],
  ['selawat', 'Selawat', 'selawat-11'],
  ['bebas', 'Kiraan bebas', null],
];
function langkahTasbih(doaId) {
  const d = doaId && cariDoa(doaId); if (!d) return [{ar: '', ru: '', mk: '', tj: '', ul: 0}];
  const bs = d.b.filter(b => (b.ar || []).length);
  return bs.map(b => ({ar: b.ar.join(' '), ru: b.ru || '', mk: b.mk || '', tj: b.tj || '', ul: +b.ul || (bs.length === 1 ? +d.ul : 1) || 33, ulAsli: !!(+b.ul)}));
}
const getar = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
function kunciSkrin() {   // skrin kekal menyala semasa berzikir; dilepaskan apabila keluar skrin
  let kunci = null, aktif = true;
  const mohon = async () => { try { if (aktif && 'wakeLock' in navigator && document.visibilityState === 'visible') kunci = await navigator.wakeLock.request('screen'); } catch (e) {} };
  const lihat = () => { if (document.visibilityState === 'visible') mohon(); };
  document.addEventListener('visibilitychange', lihat); mohon();
  bersihSkrin.push(() => { aktif = false; document.removeEventListener('visibilitychange', lihat); try { kunci && kunci.release(); } catch (e) {} });
}
function skrinTasbih(skrin, q) {
  bar({tajuk: 'Tasbih', sub: 'Pengira zikir', kembali: '#/'});
  const st = Object.assign({p: 'selepas-solat', i: 0, n: 0, s: 0}, SIMPAN.baca('tasbih', {}));
  const qd = q && q.get('doa');
  if (qd) {   // dari kad khat: kira bacaan itu; buang ?doa supaya lukis semula tidak menetapkan semula kiraan
    if (cariDoa(qd) && st.p !== 'doa:' + qd) { Object.assign(st, {p: 'doa:' + qd, i: 0, n: 0}); SIMPAN.tulis('tasbih', st); }
    history.replaceState(history.state, '', '#/tasbih'); sejarah[sejarah.length - 1] = '#/tasbih'; hashKini = '#/tasbih';
  }
  const dS = st.p.startsWith('doa:') ? cariDoa(st.p.slice(4)) : null;
  const pr = dS ? [st.p, dS.tj, dS.id] : TASBIH.find(x => x[0] === st.p) || TASBIH[0];
  const lk = langkahTasbih(pr[2]); if (st.i >= lk.length) { st.i = 0; st.n = 0; }
  const bebas = !!dS && !dS.ul && lk.length === 1 && !lk[0].ulAsli;   // tiada bilangan khusus: pengguna pilih sasaran
  const simpan = () => SIMPAN.tulis('tasbih', st);
  const sasaranKini = () => pr[2] && !bebas ? lk[st.i].ul : (+st.s || 0);
  const jumlahSasaran = lk.reduce((x, l) => x + l.ul, 0);

  const cips = h('div', {class: 'gulung', role: 'group', 'aria-label': 'Pilih zikir'}, (dS ? [[pr[0], dS.tj], ...TASBIH] : TASBIH).map(([id, label]) =>
    h('button', {class: 'cip', type: 'button', 'aria-pressed': String(id === pr[0]), onclick: () => { Object.assign(st, {p: id, i: 0, n: 0}); simpan(); lukisSemula(); }}, label)));
  const teks = h('div', {class: 'kad tasbih-teks', 'aria-live': 'polite'});
  const R = 46, C = 2 * Math.PI * R;
  const bil = h('b'), sub = h('span'), langkahEl = h('p', {class: 'kecil tengah tasbih-jumlah'});
  const btn = h('button', {class: 'cincin-t', type: 'button'},
    h('span', {html: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trek" cx="50" cy="50" r="${R}" fill="none" stroke-width="6"/><circle class="maju" cx="50" cy="50" r="${R}" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`}),
    h('span', {class: 'bil'}, bil, sub));
  function lukisTeks() {
    const L = lk[st.i];
    teks.replaceChildren(); tambah(teks, pr[2] ? [
      lk.length > 1 ? h('p', {class: 'kecil tasbih-langkah'}, `Bacaan ${st.i + 1} daripada ${lk.length}${L.tj ? ': ' + L.tj : ''}, ${L.ul} kali`) : h('p', {class: 'kecil tasbih-langkah'}, bebas ? 'Tiada bilangan khusus. Pilih sasaran di bawah, atau kira tanpa sasaran.' : `${L.ul} kali, mengikut doa dalam app`),
      L.ar ? h('p', {class: 'ar', lang: 'ar'}, L.ar) : null,
      T.rumi && L.ru ? h('p', {class: 'rumi'}, L.ru) : null,
      T.makna && L.mk ? h('p', {class: 'makna'}, L.mk) : null,
      h('a', {class: 'pautan-kecil', href: '#/doa/' + pr[2]}, 'Sumber dan darjat')] :
      h('p', {class: 'kecil'}, 'Kira apa-apa zikir. Pilih sasaran di bawah, atau biarkan tanpa sasaran.'));
  }
  function kemas() {
    const s = sasaranKini(), siap = s && st.n >= s;
    bil.textContent = st.n; sub.textContent = s ? `daripada ${s}` : 'tanpa sasaran';
    $('.maju', btn).setAttribute('stroke-dashoffset', String(s ? C * (1 - Math.min(1, st.n / s)) : C));
    btn.classList.toggle('siap', !!siap);
    const lagi = siap && st.i + 1 < lk.length;
    btn.setAttribute('aria-label', `${st.n}${s ? ' daripada ' + s : ''}. ${lagi ? 'Sentuh untuk bacaan seterusnya.' : 'Sentuh untuk tambah satu.'}`);
    if (lk.length > 1) { const dahBuat = lk.slice(0, st.i).reduce((x, l) => x + l.ul, 0) + Math.min(st.n, lk[st.i].ul); langkahEl.textContent = `Jumlah ${dahBuat} daripada ${jumlahSasaran}`; }
    else langkahEl.textContent = '';
  }
  btn.addEventListener('click', () => {
    const s = sasaranKini();
    if (s && st.n >= s && st.i + 1 < lk.length) { st.i++; st.n = 1; getar(12); simpan(); lukisTeks(); kemas(); return; }   // sentuhan ini dikira untuk bacaan seterusnya
    st.n++; simpan(); kemas();
    if (s && st.n === s) { getar([40, 60, 40]); roti(st.i + 1 < lk.length ? 'Selesai. Sentuh lagi untuk bacaan seterusnya.' : 'Selesai.', st.i + 1 < lk.length ? null : 'doa'); }
    else getar(10);
  });
  const tolak = h('button', {class: 'btn', type: 'button', html: ikon('tolak') + ' Tolak satu', onclick: () => {
    if (st.n > 0) st.n--; else if (st.i > 0) { st.i--; st.n = lk[st.i].ul; lukisTeks(); }
    simpan(); kemas();
  }});
  const semula = h('button', {class: 'btn', type: 'button', html: ikon('muat') + ' Mula semula', onclick: () => { st.i = 0; st.n = 0; simpan(); lukisTeks(); kemas(); }});
  const pilihSasaran = pr[2] && !bebas ? null : h('div', {class: 'baris tengah-baris', role: 'group', 'aria-label': 'Sasaran'}, [[0, 'Tiada sasaran'], [33, '33'], [100, '100'], [1000, '1000']].map(([n, l]) =>
    h('button', {class: 'cip', type: 'button', 'aria-pressed': String((+st.s || 0) === n), onclick: () => { st.s = n; simpan(); lukisSemula(); }}, l)));
  lukisTeks(); kemas(); kunciSkrin();
  tambah(skrin, cips, teks, h('div', {class: 'pengira-t'}, btn, langkahEl), pilihSasaran,
    h('div', {class: 'tindakan tengah-baris'}, tolak, semula),
    h('p', {class: 'kecil tengah'}, 'Skrin kekal menyala semasa halaman ini dibuka. Kiraan disimpan dalam telefon.'));
}

/* ================================================================ Rujukan: semua sumber yang dipetik dalam app, ikut penerbit */
const PENERBIT = [
  [/^Pejabat Mufti WP/i, 'Pejabat Mufti Wilayah Persekutuan', 'agama'],
  [/Mufti Negeri Perlis|Negeri Perlis/i, 'Jabatan Mufti Negeri Perlis', 'agama'],
  [/Mufti Negeri Kedah/i, 'Jabatan Mufti Negeri Kedah', 'agama'],
  [/Mufti Negeri Pahang/i, 'Jabatan Mufti Negeri Pahang', 'agama'],
  [/Selangor/i, 'Jabatan Mufti Negeri Selangor', 'agama'],
  [/Negeri Sembilan/i, 'Jabatan Mufti Kerajaan Negeri Sembilan', 'agama'],
  [/JHEAINS/i, 'Jabatan Hal Ehwal Agama Islam Negeri Sabah', 'agama'],
  [/^JAKIM|Jabatan Kemajuan Islam/i, 'Jabatan Kemajuan Islam Malaysia (JAKIM)', 'agama'],
  [/Ifta/i, "Dar al-Ifta' al-Misriyyah", 'agama'],
  [/^KDN/i, 'Kementerian Dalam Negeri (KDN)', 'kerajaan'],
  [/MetMalaysia/i, 'Jabatan Meteorologi Malaysia', 'kerajaan'],
  [/USIM/i, 'Universiti Sains Islam Malaysia', 'akademik'],
  [/sunnah\.com/i, 'Sunnah.com', 'data'], [/Quran\.com/i, 'Quran.com', 'data'], [/Tanzil/i, 'Tanzil.net', 'data'],
  [/EveryAyah/i, 'EveryAyah.com', 'data'], [/Hosny/i, 'Khaled Hosny (fon Amiri)', 'data'], [/Braille/i, 'Braille Institute (fon Atkinson)', 'data'],
  [/mptwaktusolat/i, 'waktusolat.app (projek komuniti)', 'data'],
  [/quran-meta|Guliyev/i, 'quran-meta (metadata mushaf)', 'data'],
];
const KUMP_PENERBIT = [['agama', 'Mufti dan pihak berkuasa agama'], ['kerajaan', 'Agensi kerajaan'], ['akademik', 'Kajian akademik'], ['data', 'Teks al-Quran, hadis, audio dan data'], ['media', 'Berita']];
const KITAB = [[/Bukhari/, 'Sahih al-Bukhari'], [/Muslim/, 'Sahih Muslim'], [/Abi Dawud|Abu Dawud/, 'Sunan Abi Dawud'], [/Tirmi/, "Jami' at-Tirmizi"], [/Nasa/, "Sunan an-Nasa'i"],
  [/Ibn Majah/, 'Sunan Ibn Majah'], [/Ahmad/, 'Musnad Ahmad'], [/Hibban/, 'Sahih Ibn Hibban'], [/Hakim/, 'Al-Mustadrak (al-Hakim)'], [/Baihaqi/, 'Al-Baihaqi']];
function skrinRujukan(skrin) {
  bar({tajuk: 'Rujukan', sub: 'Dari mana kandungan app ini datang', kembali: '#/'});
  const jenis = {}; for (const d of D.doa) jenis[d.s.j] = (jenis[d.s.j] || 0) + 1;
  const kitab = new Map();
  for (const d of D.doa) if (d.s.j === 'hadis') for (const [re, n] of KITAB) if (re.test(d.s.r || '')) kitab.set(n, (kitab.get(n) || 0) + 1);
  const kump = new Map();
  for (const n of D.nota) for (const x of (n.sumber || [])) {
    const p = String(x.p || ''), padan = PENERBIT.find(([re]) => re.test(p || x.t || ''));
    const nama = padan ? padan[1] : (p.split(',')[0].trim() || x.t), k = padan ? padan[2] : 'media';
    if (!kump.has(k)) kump.set(k, new Map());
    const m = kump.get(k); if (!m.has(nama)) m.set(nama, new Map());
    const item = m.get(nama).get(x.u) || {t: x.t, u: x.u, tarikh: p.includes(',') ? p.split(',').slice(1).join(',').trim() : '', nota: []};
    if (!item.nota.some(y => y.id === n.id)) item.nota.push(n);
    m.get(nama).set(x.u, item);
  }
  const hos = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return ''; } };
  tambah(skrin,
    h('div', {class: 'kad'}, h('p', null, 'Poket Yaasin menghimpunkan bacaan dan doa daripada sumber yang disenaraikan di bawah. Ia himpunan peribadi, bukan terbitan rasmi, dan tidak diperakui oleh mana-mana pihak berkuasa.'),
      h('div', {class: 'tindakan'}, h('button', {class: 'btn', type: 'button', html: ikon('info') + ' Baca penafian', onclick: () => bukaPenafian(false)}), h('a', {class: 'btn', href: '#/nota/akta-326'}, 'Akta 326 dan KDN'))),
    h('h2', {class: 'sek'}, 'Sumber doa dan bacaan'),
    h('ul', {class: 'senarai-rujuk'},
      h('li', null, h('b', null, `Al-Quran: ${jenis.quran || 0} doa`), h('span', null, `Teks Mushaf Madinah (KFGQPC), riwayat Hafs 'an 'Asim, disemak silang dengan sumber kedua. Kandungan ayat dalam app ≈ ${D.saiz ? D.saiz.juzuk : '-'} juzuk.`)),
      h('li', null, h('b', null, `Hadis: ${jenis.hadis || 0} doa`), h('span', null, 'Setiap satu dengan nombor hadis dan pautan sunnah.com, disemak dengan teks hadis bernombor.'),
        h('span', {class: 'kitab'}, [...kitab].sort((x, y) => y[1] - x[1]).map(([n, c]) => h('span', {class: 'cip cip-kecil'}, `${n} ${c}`)))),
      h('li', null, h('b', null, `Buku Surah Yaasiin, Tahlil & Doa: ${jenis.buku || 0} bacaan`), h('span', null, 'Susunan tahlil dan doa arwah mengikut buku, dengan nombor halaman.')),
      h('li', null, h('b', null, `Susunan ulama dan athar: ${(jenis.ulama || 0) + (jenis.athar || 0)} doa`), h('span', null, 'Ditanda dengan label masing-masing, bukan sebagai hadis.'))),
    h('h2', {class: 'sek'}, 'Laman yang dirujuk dalam nota'),
    KUMP_PENERBIT.filter(([k]) => kump.has(k)).map(([k, label]) => frag(
      h('h3', {class: 'sek-kecil'}, label),
      [...kump.get(k)].sort((x, y) => y[1].size - x[1].size).map(([nama, items]) => h('details', {class: 'det rujuk-k'},
        h('summary', null, h('span', {class: 'nm'}, nama), h('span', {class: 'kecil'}, `${items.size} rujukan`)),
        h('ul', {class: 'rujuk'}, [...items.values()].map(x => h('li', null,
          h('a', {href: x.u, target: '_blank', rel: 'noopener'}, x.t), x.tarikh ? ` (${x.tarikh})` : '', h('span', {class: 'hos'}, hos(x.u)),
          h('span', {class: 'dlm'}, 'Dalam nota: ', x.nota.map((n, i) => frag(i ? ', ' : '', h('a', {href: '#/nota/' + n.id}, n.tajuk))))))))))),
    h('p', {class: 'kecil'}, 'Pautan dibuka di laman asal. Kandungan laman sumber mungkin berubah selepas tarikh semakan dalam setiap nota.'));
}

/* ================================================================ penafian (dipaparkan sekali semasa mula guna, dan dari Tetapan/Rujukan) */
function bukaPenafian(pertama) {
  if (pertama) SIMPAN.tulis('penafian', APP_VERSION);
  bukaHelai(pertama ? 'Sebelum mula' : 'Penafian', frag(
    h('p', null, 'Poket Yaasin ialah himpunan peribadi untuk memudahkan bacaan dan rujukan. Ia bukan terbitan rasmi, dan tidak diperakui oleh mana-mana pihak berkuasa agama.'),
    h('ul', {class: 'senarai-penafian'},
      h('li', null, h('b', null, 'Teks ayat: '), "Mushaf Madinah, riwayat Hafs 'an 'Asim, disemak silang secara automatik. Belum diperakui KDN."),
      h('li', null, h('b', null, 'Doa: '), 'setiap doa ada label darjat dan sumbernya. Hadis disemak dengan nombor hadis.'),
      h('li', null, h('b', null, 'Nota hukum: '), 'ringkasan laman rasmi mufti dan JAKIM, dengan pautan ke sumber asal.'),
      h('li', null, h('b', null, 'Waktu solat: '), 'data e-Solat JAKIM melalui waktusolat.app. Tanpa internet, waktu ialah anggaran kiraan.')),
    h('p', {class: 'kecil'}, 'Untuk rujukan muktamad, gunakan mushaf bercetak yang diperakui KDN, dan rujuk Jabatan Mufti negeri anda untuk soal hukum.'),
    h('div', {class: 'tindakan'},
      h('button', {class: 'btn utama', type: 'button', onclick: () => tutupHelai()}, 'Saya faham'),
      h('a', {class: 'btn', href: '#/rujukan'}, 'Lihat senarai rujukan'))));
}

/* ================================================================ Yaasin */
function tandaBaca(a, beritahu) {
  const t = SIMPAN.baca('terakhir', {}); t.yaasin = a; SIMPAN.tulis('terakhir', t);
  if (beritahu) roti(`Bacaan ditanda pada ayat ${a}`);
}
let pemerhatiAyat = null;
function lapisanBacaan(onUbah, extra = []) {
  const cip = (label, kunci) => h('button', {class: 'cip', type: 'button', 'aria-pressed': String(!!T[kunci]), onclick: e => { T[kunci] = !T[kunci]; simpanT(); e.currentTarget.setAttribute('aria-pressed', String(T[kunci])); onUbah(); }}, label);
  return h('div', {class: 'lapisan'}, h('div', {class: 'gulung'}, cip('Makna', 'makna'), cip('Makna perkataan', 'perkata'), extra));
}
function skrinYaasin(skrin, ke) {
  const S = D.surah[36] || ['Yaasin', 'يس', 83];
  bar({tajuk: 'Surah Yaasin', sub: `Surah ke-36, ${S[2]} ayat`});
  const senarai = Array.from({length: S[2]}, (_, i) => ({s: 36, a: i + 1}));
  const isi = h('div');
  function lukis() {
    isi.replaceChildren(); tambah(isi, [
      h('div', {class: 'sarlawh'}, h('div', {class: 'nama-ar', lang: 'ar'}, 'سُورَةُ يسٓ'), h('div', {class: 'nama-ms'}, 'Surah Yaasin'), h('div', {class: 'meta'}, 'Makkiyyah, 83 ayat')),
      h('p', {class: 'basmalah', lang: 'ar'}, (D.ayat['1:1'] || {w: []}).w.join(' ')),
      senarai.map(x => blokAyat(36, x.a, {ikut: true, lagi: true, senarai}))]);
    pantauBacaan(isi);
  }
  tambah(skrin, lapisanBacaan(lukis, [
    h('button', {class: 'cip', type: 'button', html: ikon('main') + ' Dengar semua', onclick: () => { const t = +SIMPAN.baca('terakhir', {}).yaasin || 1; AUD.main(senarai.slice(Math.max(0, t - 1)), {ikut: true}); }}),
    h('button', {class: 'cip', type: 'button', html: ikon('pentas') + ' Mod Majlis', onclick: () => bukaPentas([halamanSurah(36, 'Surah Yaasin')], {tajuk: 'Surah Yaasin'})}),
  ]), isi);
  lukis();
  if (ke > 1) requestAnimationFrame(() => { const el = document.getElementById('a36-' + ke); if (el) el.scrollIntoView({block: 'start'}); });
}
function pantauBacaan(akar) {
  if (pemerhatiAyat) pemerhatiAyat.disconnect();
  if (!('IntersectionObserver' in window)) return;
  let t = 0;
  pemerhatiAyat = new IntersectionObserver(ents => {
    clearTimeout(t);
    t = setTimeout(() => {
      const nampak = $$('.ayat[data-s="36"]', akar).find(el => { const r = el.getBoundingClientRect(); return r.bottom > 90 && r.top < innerHeight * .5; });
      if (nampak && location.hash.startsWith('#/yaasin')) tandaBaca(+nampak.dataset.a);
    }, 700);
  }, {rootMargin: '-80px 0px -50% 0px'});
  $$('.ayat', akar).forEach(el => pemerhatiAyat.observe(el));
}

/* ================================================================ Tahlil & susunan */
function skrinTahlil(skrin) {
  bar({tajuk: 'Tahlil & Yaasin'});
  tambah(skrin, h('p', {class: 'kecil pengenalan'}, 'Susunan bacaan mengikut buku Surah Yaasiin, Tahlil & Doa. Isi nama arwah sekali, dan nama itu disebut dalam doa dengan kata ganti yang betul.'));
  for (const s of D.susunan) {
    tambah(skrin, h('a', {class: 'mj', href: '#/susunan/' + s.id},
      h('span', {class: 'ik', 'aria-hidden': 'true'}, {'yaasin': '۞', 'tahlil-arwah': '❋', 'tahlil-ringkas': '◌', 'nisfu-syaaban': '◑'}[s.id] || '❋'),
      h('span', {class: 'tx'}, h('b', null, s.tajuk), h('span', null, s.ringkas || `${s.langkah.length} langkah`)),
      h('span', {class: 'anak-panah', html: ikon('kanan')})));
  }
  tambah(skrin, h('div', {class: 'tip'}, h('b', null, 'Status hukum'), 'Majlis tahlil ialah perkara khilafiah yang harus menurut Pejabat Mufti WP; pahala bacaan disampaikan melalui doa. ', h('a', {href: '#/nota/tahlil'}, 'Baca nota penuh')));
  tambah(skrin, h('h2', {class: 'sek'}, 'Nama arwah'), kadNama(ARWAH, n => { ARWAH = n; simpanArwah(); lukisSemula(); }));
}
function kadNama(nama, simpan) {
  return h('div', {class: 'kad kad-nama'},
    h('p', {class: 'nama-senarai'}, nama.length ? senaraiNamaRingkas(nama) : 'Belum ada nama. Doa akan dibaca untuk semua arwah muslimin dan muslimat.'),
    h('button', {class: 'btn kecil', type: 'button', html: ikon(nama.length ? 'sunting' : 'tambah') + (nama.length ? ' Ubah nama' : ' Tambah nama arwah'), onclick: () => suntingNama(nama, simpan)}));
}
/* Ratakan langkah (susunan dalam majlis dikembangkan) → [{jenis, langkah, kumpulan}] */
function ratakan(langkah, kumpulan = null, out = []) {
  for (const st of langkah) {
    if (st.susunan) { const s = SUS.get(st.susunan); if (s) ratakan(s.langkah, s.tajuk, out); continue; }
    out.push({st, kumpulan});
  }
  return out;
}
function tajukLangkah(st) {
  if (st.doa) { const d = cariDoa(st.doa); return d ? d.tj : `(doa ${st.doa} tiada)`; }
  if (st.surah) return st.tajuk || `Surah ${namaSurah(st.surah)}`;
  if (st.quran) return st.tajuk || labelSpec(st.quran);
  if (st.susunan) { const s = SUS.get(st.susunan); return s ? s.tajuk : st.susunan; }
  return '';
}
const ulangLangkah = st => +(st.ulang || (st.doa && (cariDoa(st.doa) || {}).ul) || 0);
/* Isi satu langkah sebagai DOM (paparan senarai dan cetak). */
function isiLangkah(st, ctx) {
  if (st.doa) {
    const d = cariDoa(st.doa); if (!d) return h('p', {class: 'kecil'}, 'Doa ini tiada lagi.');
    return frag(paparBahagian(d, {nama: ctx.nama, bahagian: st.bahagian, suntingNama: ctx.suntingNama}),
      ctx.cetak || ctx.pentas || modCetak ? null : h('a', {class: 'pautan-kecil', href: '#/doa/' + d.id}, 'Makna, sumber dan nota doa ini'));
  }
  if (st.quran) {
    const box = frag();
    for (const x of parseSpec(st.quran)) tambah(box, blokAyat(x.s, x.a, {f: x.f, t: x.t, ikut: false, tanpaPerkata: ctx.cetak}));
    return box;
  }
  if (st.surah) {
    const S = D.surah[st.surah] || ['', '', 0];
    if (ctx.cetak || modCetak) return frag(Array.from({length: S[2]}, (_, i) => blokAyat(st.surah, i + 1, {tanpaPerkata: true})));
    const det = h('details', {class: 'det'}, h('summary', null, `Papar ${S[2]} ayat di sini`));
    det.addEventListener('toggle', () => { if (det.open && det.children.length < 2) tambah(det, ...Array.from({length: S[2]}, (_, i) => blokAyat(st.surah, i + 1, {ikut: false}))); }, {once: false});
    return frag(st.surah === 36 ? h('a', {class: 'btn kecil', href: '#/yaasin'}, 'Buka halaman Yaasin') : null, det);
  }
  return null;
}
function senaraiLangkah(langkah, ctx) {
  const box = h('div', {class: 'senarai-langkah'}); let n = 0, kump = null;
  for (const {st, kumpulan} of ratakan(langkah)) {
    if (kumpulan !== kump) { kump = kumpulan; if (kumpulan) tambah(box, h('div', {class: 'kumpulan'}, kumpulan)); }
    n++;
    const ul = ulangLangkah(st);
    tambah(box, h('section', {class: 'langkah'},
      h('span', {class: 'n', 'aria-hidden': 'true'}, n),
      h('div', {class: 'isi'},
        h('h3', null, tajukLangkah(st), ul > 1 ? h('span', {class: 'ul'}, `×${ul}`) : null),
        st.nota ? h('p', {class: 'lnota'}, inline(st.nota)) : null,
        isiLangkah(st, ctx))));
  }
  return box;
}
function skrinSusunan(skrin, id) {
  const s = SUS.get(id); if (!s) return tiada(skrin);
  bar({tajuk: s.tajuk, kembali: '#/tahlil'});
  const ctx = {nama: ARWAH, suntingNama: () => suntingNama(ARWAH, n => { ARWAH = n; simpanArwah(); lukisSemula(); })};
  tambah(skrin, 
    s.nota ? h('div', {class: 'amaran'}, inline(s.nota)) : null,
    h('div', {class: 'tindakan'},
      h('button', {class: 'btn utama', type: 'button', html: ikon('pentas') + ' Mula (Mod Majlis)', onclick: () => bukaPentas(halamanLangkah(s.langkah, ctx), {tajuk: s.tajuk})}),
      h('button', {class: 'btn', type: 'button', html: ikon('cetak') + ' Cetak', onclick: () => cetak()}),
      h('button', {class: 'btn', type: 'button', html: ikon('majlis') + ' Jadikan majlis', onclick: () => { const m = majlisBaru({tajuk: s.tajuk, nama: ARWAH, langkah: [{susunan: s.id}]}); location.hash = '#/majlis/s/' + m.id; }})),
    lapisanBacaan(lukisSemula),
    perluNama(s.langkah) ? kadNama(ARWAH, n => { ARWAH = n; simpanArwah(); lukisSemula(); }) : null,
    kulitCetak(s.tajuk, ARWAH),
    senaraiLangkah(s.langkah, ctx));
}
function perluNama(langkah) {
  return ratakan(langkah).some(({st}) => { const d = st.doa && cariDoa(st.doa); return d && d.b.some(b => b.arwah || b.varian); });
}

/* ================================================================ Mod Majlis (pentas penuh skrin, sentiasa gelap) */
function halamanSurah(s, tajuk) {
  const S = D.surah[s] || ['', '', 0];
  return {tajuk: tajuk || `Surah ${S[0]}`, isi: () => frag(
    s !== 1 && s !== 9 ? h('p', {class: 'basmalah', lang: 'ar'}, (D.ayat['1:1'] || {w: []}).w.join(' ')) : null,
    Array.from({length: S[2]}, (_, i) => blokAyat(s, i + 1, {tanpaPerkata: true, ikut: true})))};
}
function halamanLangkah(langkah, ctx) {
  return ratakan(langkah).map(({st, kumpulan}) => ({
    tajuk: tajukLangkah(st), kumpulan, ulang: ulangLangkah(st), nota: st.nota,
    isi: () => st.surah ? halamanSurah(st.surah).isi() : isiLangkah(st, {nama: ctx.nama || [], pentas: true}),
  }));
}
let pentasAktif = null;
function bukaPentas(halaman, {tajuk = 'Mod Majlis', mula = 0} = {}) {
  if (!halaman.length) return roti('Tiada bacaan untuk dipaparkan.');
  tutupPentas(true);
  let i = Math.min(mula, halaman.length - 1), skala = +SIMPAN.baca('skala-pentas', 1) || 1, kunci = null;
  const tTajuk = h('b'), tSub = h('span'), jalur = h('i'), isi = h('div', {class: 'isi', tabindex: '-1'});
  const sebelum = h('button', {class: 'btn', type: 'button', onclick: () => pergi(i - 1)}, 'Sebelum');
  const seterus = h('button', {class: 'btn utama', type: 'button', onclick: () => pergi(i + 1)}, 'Seterusnya');
  const togolMakna = h('button', {class: 'ib' + (T.makna ? ' on' : ''), type: 'button', 'aria-label': 'Papar atau sembunyi makna', title: 'Makna', 'aria-pressed': String(T.makna), html: ikon('nota'), onclick: () => { T.makna = !T.makna; simpanT(); togolMakna.classList.toggle('on', T.makna); togolMakna.setAttribute('aria-pressed', String(T.makna)); lukis(); }});
  const el = h('div', {class: 'pentas', role: 'dialog', 'aria-modal': 'true', 'aria-label': tajuk},
    h('div', {class: 'atas'},
      ib('tutup', 'Tutup Mod Majlis', () => tutupPentas()),
      h('div', {class: 't'}, tTajuk, tSub),
      ib('hurufK', 'Kecilkan tulisan', () => ubahSkala(-0.1)),
      ib('hurufB', 'Besarkan tulisan', () => ubahSkala(0.1)),
      togolMakna),
    h('div', {class: 'jalur', 'aria-hidden': 'true'}, jalur),
    isi,
    h('div', {class: 'bawah'}, sebelum, h('span', {class: 'kecil kiraan'}), seterus));
  function ubahSkala(d) { skala = Math.min(2, Math.max(0.7, Math.round((skala + d) * 10) / 10)); el.style.setProperty('--skala-p', skala); SIMPAN.tulis('skala-pentas', skala); }
  function lukis() {
    const p = halaman[i];
    tTajuk.textContent = p.tajuk; tSub.textContent = halaman.length > 1 ? `Langkah ${i + 1} daripada ${halaman.length}${p.kumpulan ? ', ' + p.kumpulan : ''}` : tajuk;
    jalur.style.width = `${((i + 1) / halaman.length) * 100}%`;
    isi.replaceChildren(); tambah(isi, [
      p.nota ? h('p', {class: 'lnota'}, inline(p.nota)) : null,
      p.ulang > 1 ? cincin(p.ulang, () => { if (i + 1 < halaman.length) seterus.focus(); }) : null,
      p.isi()]);
    isi.scrollTop = 0;
    sebelum.disabled = i === 0; seterus.textContent = i + 1 < halaman.length ? 'Seterusnya' : 'Selesai';
  }
  function pergi(j) { if (j >= halaman.length) return tutupPentas(); if (j < 0) return; i = j; AUD.henti(); lukis(); isi.focus({preventScroll: true}); }
  // sapu kiri/kanan
  let x0 = null, y0 = 0;
  isi.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive: true});
  isi.addEventListener('touchend', e => {
    if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) pergi(i + (dx < 0 ? 1 : -1));
  }, {passive: true});
  const kekunci = e => {
    if (e.key === 'Escape') tutupPentas();
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') pergi(i + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') pergi(i - 1);
  };
  document.addEventListener('keydown', kekunci);
  // skrin kekal menyala
  const mohonKunci = async () => { try { if ('wakeLock' in navigator && document.visibilityState === 'visible') kunci = await navigator.wakeLock.request('screen'); } catch (e) {} };
  const lihat = () => { if (document.visibilityState === 'visible' && pentasAktif) mohonKunci(); };
  document.addEventListener('visibilitychange', lihat);
  mohonKunci();
  el.style.setProperty('--skala-p', skala);
  document.body.append(el); document.body.classList.add('ada-pentas');
  history.pushState({pentas: 1}, '');
  pentasAktif = {el, tutup: () => { document.removeEventListener('keydown', kekunci); document.removeEventListener('visibilitychange', lihat); try { kunci && kunci.release(); } catch (e) {} }};
  lukis(); isi.focus({preventScroll: true});
}
function tutupPentas(senyap) {
  if (!pentasAktif) return;
  const p = pentasAktif; pentasAktif = null; p.tutup(); p.el.remove(); document.body.classList.remove('ada-pentas'); AUD.henti();
  if (!senyap && history.state && history.state.pentas) history.back();
}
window.addEventListener('popstate', () => { if (pentasAktif) tutupPentas(true); });
function cincin(sasaran, siap) {
  let n = 0; const R = 46, C = 2 * Math.PI * R;
  const bil = h('b', null, '0'), btn = h('button', {class: 'cincin', type: 'button', 'aria-label': `Pengira: sentuh setiap kali selesai satu bacaan, sasaran ${sasaran}`},
    h('span', {html: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${R}" fill="none" stroke="#1C3330" stroke-width="7"/><circle class="maju" cx="50" cy="50" r="${R}" fill="none" stroke="#D9B45E" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>`}),
    h('span', {class: 'bil'}, bil, h('span', null, `daripada ${sasaran}`)));
  btn.addEventListener('click', () => {
    if (n >= sasaran) { n = 0; btn.classList.remove('siap'); }
    else { n++; if (navigator.vibrate) try { navigator.vibrate(n === sasaran ? [40, 60, 40] : 12); } catch (e) {} }
    bil.textContent = n; $('.maju', btn).setAttribute('stroke-dashoffset', String(C * (1 - n / sasaran)));
    btn.setAttribute('aria-label', `${n} daripada ${sasaran}`);
    if (n === sasaran) { btn.classList.add('siap'); siap && siap(); }
  });
  return h('div', {class: 'pengira'}, btn, h('p', {class: 'kecil tengah'}, 'Sentuh bulatan setiap kali selesai satu bacaan. Sentuh semula selepas siap untuk mula semula.'));
}

/* ================================================================ cetak */
function kulitCetak(tajuk, nama = []) {
  const kini = new Date();
  return h('div', {class: 'cetak-kulit', 'aria-hidden': 'true'},
    h('div', {class: 'kal', lang: 'ar'}, 'يسٓ'),
    h('h1', null, tajuk),
    nama.length ? h('p', null, 'Untuk ' + senaraiNamaRingkas(nama)) : null,
    h('p', null, `${kini.getDate()} ${BULAN[kini.getMonth()]} ${kini.getFullYear()}, ${fmtHijri(hijri(kini))}`),
    h('p', {class: 'kecil'}, 'Teks ayat: Mushaf Madinah (KFGQPC), riwayat Hafs. Cetakan ini belum diperakui KDN; semak dengan mushaf yang diperakui.'),
    h('p', {class: 'kecil'}, 'Mengandungi ayat al-Quran: simpan dan lupuskan dengan hormat.'));
}
let modCetak = false;   // semasa mencetak: surah dipaparkan penuh, tiada grid perkataan, tiada butang
function cetak() {
  const asal = T.perkata; T.perkata = false; modCetak = true; lukisSemula();
  let siap = false;
  const pulih = () => { if (siap) return; siap = true; window.removeEventListener('afterprint', pulih); modCetak = false; T.perkata = asal; lukisSemula(); };
  window.addEventListener('afterprint', pulih);
  setTimeout(() => { window.print(); setTimeout(pulih, 60000); }, 400);
}

/* ================================================================ Majlis */
function majlisSaya() { return senarai_(SIMPAN.baca('majlis-saya', [])).filter(x => x && typeof x === 'object' && x.id); }
function majlisBaru(m) {
  const x = Object.assign({tajuk: 'Majlis saya', templat: null, nama: [], langkah: []}, JSON.parse(JSON.stringify(m)), {id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), dicipta: Date.now(), dikemas: Date.now()});
  const arr = majlisSaya(); arr.unshift(x); SIMPAN.tulis('majlis-saya', arr); return x;
}
function kemasMajlis(m) {
  m.dikemas = Date.now(); const arr = majlisSaya(); const i = arr.findIndex(x => x.id === m.id);
  if (i >= 0) arr[i] = m; else arr.unshift(m); SIMPAN.tulis('majlis-saya', arr);
}
const drafTemplat = new Map();
function majlisDaripadaTemplat(id) {
  if (drafTemplat.has(id)) return drafTemplat.get(id);
  const t = MJ.get(id); if (!t) return null;
  const m = {id: null, tajuk: t.tajuk, templat: id, nama: t.nama === 'arwah' ? ARWAH.map(x => Object.assign({}, x)) : [], langkah: JSON.parse(JSON.stringify(t.langkah || []))};
  drafTemplat.set(id, m); return m;
}
function skrinSenaraiMajlis(skrin) {
  bar({tajuk: 'Majlis'});
  const saya = majlisSaya();
  tambah(skrin, h('p', {class: 'kecil pengenalan'}, 'Pilih templat, isi nama, susun semula bacaan, kemudian bacakan dalam Mod Majlis, cetak buku kecil atau kongsi pautan kepada keluarga.'));
  if (saya.length) {
    tambah(skrin, h('h2', {class: 'sek'}, 'Majlis saya'));
    for (const m of saya) tambah(skrin, h('a', {class: 'mj', href: '#/majlis/s/' + m.id},
      h('span', {class: 'ik', 'aria-hidden': 'true'}, (MJ.get(m.templat) || {}).ikon || '❖'),
      h('span', {class: 'tx'}, h('b', null, m.tajuk), h('span', null, [m.nama && m.nama.length ? senaraiNamaRingkas(m.nama) : null, `${ratakan(m.langkah).length} langkah`].filter(Boolean).join('. '))),
      h('span', {class: 'anak-panah', html: ikon('kanan')})));
  }
  tambah(skrin, h('h2', {class: 'sek'}, 'Templat majlis'));
  for (const t of D.majlis) tambah(skrin, h('a', {class: 'mj', href: '#/majlis/t/' + t.id},
    h('span', {class: 'ik', 'aria-hidden': 'true'}, t.ikon || '❖'),
    h('span', {class: 'tx'}, h('b', null, t.tajuk), h('span', null, t.ringkas || '')),
    h('span', {class: 'anak-panah', html: ikon('kanan')})));
  tambah(skrin, h('button', {class: 'btn penuh', type: 'button', html: ikon('tambah') + ' Bina majlis kosong', onclick: () => { const m = majlisBaru({tajuk: 'Majlis baharu'}); location.hash = '#/majlis/s/' + m.id; }}));
  tambah(skrin, h('div', {class: 'tip'}, h('b', null, 'Doa dalam majlis rasmi'), 'Garis panduan JAKIM: pembaca doa seorang Muslim, kira-kira 2–3 minit, dimulakan dengan pujian dan selawat. ', h('a', {href: '#/nota/doa-beramai'}, 'Baca nota')));
}
function hashMajlis(m, teks) { return (m.id ? '#/majlis/s/' + m.id : '#/majlis/t/' + m.templat) + (teks ? '/teks' : ''); }
function skrinMajlis(skrin, m, modTeks) {
  if (!m) return tiada(skrin);
  const tp = MJ.get(m.templat);
  const ubah = () => {
    if (!m.id) {
      const x = majlisBaru(m); drafTemplat.delete(m.templat); Object.assign(m, x);
      const baru = hashMajlis(m, modTeks); history.replaceState(history.state, '', baru); sejarah[sejarah.length - 1] = baru; hashKini = baru;
    } else kemasMajlis(m);
  };
  const suntingNamaM = () => suntingNama(m.nama || [], n => { m.nama = n; if (!m.id) ARWAH = n.map(x => Object.assign({}, x)), simpanArwah(); ubah(); lukisSemula(); });
  const mula = () => bukaPentas(halamanLangkah(m.langkah, {nama: m.nama || []}), {tajuk: m.tajuk});
  if (modTeks) {
    bar({tajuk: m.tajuk, sub: 'Teks penuh', kembali: hashMajlis(m, false)});
    tambah(skrin, 
      h('div', {class: 'tindakan'},
        h('button', {class: 'btn utama', type: 'button', html: ikon('pentas') + ' Mula (Mod Majlis)', onclick: mula}),
        h('button', {class: 'btn', type: 'button', html: ikon('cetak') + ' Cetak', onclick: () => cetak()})),
      lapisanBacaan(lukisSemula),
      kulitCetak(m.tajuk, m.nama || []),
      senaraiLangkah(m.langkah, {nama: m.nama || [], suntingNama: suntingNamaM}));
    return;
  }
  bar({tajuk: m.tajuk, sub: m.id ? 'Majlis saya' : 'Templat', kembali: '#/majlis'});
  const tajukIn = h('input', {class: 'medan', id: 'tajuk-majlis', value: m.tajuk, maxlength: 80, onchange: e => { m.tajuk = e.target.value.trim() || 'Majlis saya'; ubah(); lukisSemula(); }});
  const senarai = h('div', {class: 'kad senarai-edit'});
  const lukisLangkah = () => {
    senarai.replaceChildren();
    if (!m.langkah.length) tambah(senarai, h('p', {class: 'kosong'}, 'Belum ada bacaan. Tekan "Tambah bacaan".'));
    m.langkah.forEach((st, i) => {
      const jenis = st.susunan ? `Susunan, ${ratakan([st]).length} langkah` : st.doa ? ((cariDoa(st.doa) || {}).saya ? 'Doa saya' : 'Doa') : st.surah ? `Surah, ${(D.surah[st.surah] || [, , 0])[2]} ayat` : 'Ayat';
      const ul = ulangLangkah(st);
      tambah(senarai, h('div', {class: 'edit-l'},
        h('span', {class: 'n'}, i + 1),
        h('div', {class: 'tx'}, tajukLangkah(st), ul > 1 ? h('span', {class: 'ul'}, `×${ul}`) : null, h('small', null, jenis)),
        ib('atas', 'Naikkan', () => { if (i > 0) { [m.langkah[i - 1], m.langkah[i]] = [m.langkah[i], m.langkah[i - 1]]; ubah(); lukisLangkah(); } }, {disabled: i === 0 ? true : null}),
        ib('bawah', 'Turunkan', () => { if (i < m.langkah.length - 1) { [m.langkah[i + 1], m.langkah[i]] = [m.langkah[i], m.langkah[i + 1]]; ubah(); lukisLangkah(); } }, {disabled: i === m.langkah.length - 1 ? true : null}),
        ib('buang', 'Buang langkah ini', () => { m.langkah.splice(i, 1); ubah(); lukisLangkah(); })));
    });
  };
  lukisLangkah();
  tambah(skrin, 
    tp && tp.nota ? h('div', {class: 'amaran'}, inline(tp.nota)) : null,
    h('button', {class: 'btn utama penuh', type: 'button', html: ikon('pentas') + ' Mula (Mod Majlis)', onclick: mula}),
    h('div', {class: 'tindakan tiga'},
      h('a', {class: 'btn', href: hashMajlis(m, true), html: ikon('yaasin') + ' Teks'}),
      h('button', {class: 'btn', type: 'button', html: ikon('kongsi') + ' Kongsi', onclick: () => kongsiMajlis(m)}),
      h('button', {class: 'btn', type: 'button', html: ikon('cetak') + ' Cetak', onclick: () => { location.hash = hashMajlis(m, true); setTimeout(() => cetak(), 250); }})),
    h('label', {class: 'lbl', for: 'tajuk-majlis'}, 'Nama majlis'), tajukIn,
    (tp && tp.nama === 'arwah') || perluNama(m.langkah) ? frag(h('h2', {class: 'sek'}, 'Nama arwah'), kadNama(m.nama || [], n => { m.nama = n; ubah(); lukisSemula(); })) : null,
    h('h2', {class: 'sek'}, 'Susunan bacaan', h('span', {class: 'sp'}), h('span', {class: 'kecil'}, `${ratakan(m.langkah).length} langkah`)),
    senarai,
    h('button', {class: 'btn penuh tambah-langkah', type: 'button', html: ikon('tambah') + ' Tambah bacaan', onclick: () => pilihLangkah(st => { m.langkah.push(st); ubah(); lukisLangkah(); roti('Ditambah: ' + tajukLangkah(st)); })}),
    m.id ? h('button', {class: 'btn penuh bahaya', type: 'button', html: ikon('buang') + ' Padam majlis ini', onclick: () => sahkan('Padam majlis ini?', () => { SIMPAN.tulis('majlis-saya', majlisSaya().filter(x => x.id !== m.id)); roti('Majlis dipadam'); location.hash = '#/majlis'; }, 'Padam')}) : null);
}
const PRASET_AYAT = [
  ['Surah al-Fatihah', {quran: '1:1-7', tajuk: 'Surah al-Fatihah'}],
  ['Surah Yaasin', {surah: 36}],
  ['Ayat Kursi', {quran: '2:255', tajuk: 'Ayat Kursi'}],
  ['Al-Baqarah 1–5', {quran: '2:1-5', tajuk: 'Al-Baqarah 1–5'}],
  ['Al-Baqarah 284–286', {quran: '2:284-286', tajuk: 'Al-Baqarah 284–286'}],
  ['Surah al-Ikhlas (3 kali)', {quran: '112:1-4', tajuk: 'Surah al-Ikhlas', ulang: 3}],
  ['Surah al-Falaq', {quran: '113:1-5', tajuk: 'Surah al-Falaq'}],
  ['Surah an-Nas', {quran: '114:1-6', tajuk: 'Surah an-Nas'}],
  ['Surah al-Insyirah', {quran: '94:1-8', tajuk: 'Surah al-Insyirah'}],
  ['Surah al-Qadr', {quran: '97:1-5', tajuk: 'Surah al-Qadr'}],
  ['Surah al-Fil', {quran: '105:1-5', tajuk: 'Surah al-Fil'}],
];
function pilihLangkah(tambahkan) {
  const tab = h('div', {class: 'gulung', role: 'tablist'}), isi = h('div', {class: 'pilih-isi'});
  const tabs = [['doa', 'Doa'], ['ayat', 'Ayat & surah'], ['susunan', 'Susunan tahlil'], ['saya', 'Doa saya']];
  let aktif = 'doa';
  const butang = (label, sub, st) => h('button', {class: 'pilih-b', type: 'button', onclick: () => { tambahkan(st); }}, h('b', null, label), sub ? h('span', null, sub) : null);
  function lukis() {
    tab.replaceChildren(...tabs.map(([k, l]) => h('button', {class: 'cip', type: 'button', role: 'tab', 'aria-selected': String(k === aktif), 'aria-pressed': String(k === aktif), onclick: () => { aktif = k; lukis(); }}, l)));
    isi.replaceChildren();
    if (aktif === 'doa') {
      const hasil = h('div');
      const cari = h('input', {class: 'medan', type: 'search', placeholder: 'Cari doa: hujan, peperiksaan, sakit…', 'aria-label': 'Cari doa', oninput: () => tapis()});
      const tapis = () => { const r = padanDoa(cari.value).slice(0, 40); hasil.replaceChildren(...r.map(d => butang(d.tj, (d.s || {}).r, {doa: d.id}))); if (!r.length) tambah(hasil, h('p', {class: 'kosong'}, 'Tiada doa sepadan.')); };
      tambah(isi, h('div', {class: 'cari'}, h('span', {html: ikon('cari')}), cari), hasil); tapis();
    } else if (aktif === 'ayat') {
      for (const [l, st] of PRASET_AYAT) if (st.surah || parseSpec(st.quran).every(x => D.ayat[`${x.s}:${x.a}`])) tambah(isi, butang(l, st.quran ? labelSpec(st.quran) : '83 ayat', st));
    } else if (aktif === 'susunan') {
      for (const s of D.susunan) tambah(isi, butang(s.tajuk, s.ringkas, {susunan: s.id}));
    } else {
      const ds = doaSaya(); for (const x of ds) tambah(isi, butang(x.tj, 'Doa saya', {doa: x.id}));
      if (!ds.length) tambah(isi, h('p', {class: 'kosong'}, 'Belum ada doa sendiri. ', h('a', {href: '#/doa/baru', onclick: () => tutupHelai(true)}, 'Tulis doa sendiri')));
    }
  }
  lukis();
  bukaHelai('Tambah bacaan', frag(tab, isi), {kelas: 'helai-tinggi'});
}
/* Pautan kongsi: #/k/<base64url JSON>. Mengandungi nama majlis, nama arwah dan langkah (bukan data lain). */
function kodMajlis(m) {
  const ds = doaSaya(), dipakai = ratakan(m.langkah).map(x => x.st.doa).filter(id => id && !DOA.has(id));
  const o = {v: 1, t: m.tajuk, p: m.templat || undefined, n: (m.nama || []).map(x => [x.n, x.b || '', x.j || 'l']), l: m.langkah,
    ds: dipakai.length ? ds.filter(x => dipakai.includes(x.id)).map(x => ({id: x.id, tj: x.tj, ar: x.ar, ru: x.ru, mk: x.mk})) : undefined};
  const b = new TextEncoder().encode(JSON.stringify(o)); let s = ''; for (const c of b) s += String.fromCharCode(c);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function bacaKod(k) {
  const s = atob(k.replace(/-/g, '+').replace(/_/g, '/')); const b = Uint8Array.from(s, c => c.charCodeAt(0));
  const o = JSON.parse(new TextDecoder().decode(b));
  if (!o || o.v !== 1 || !Array.isArray(o.l)) throw new Error('Format pautan tidak dikenali');
  return {tajuk: String(o.t || 'Majlis dikongsi').slice(0, 80), templat: o.p || null, nama: (o.n || []).map(([n, b2, j]) => ({n: String(n || ''), b: String(b2 || ''), j: j === 'p' ? 'p' : 'l'})),
    langkah: o.l.filter(st => st && (st.doa || st.quran || st.surah || st.susunan)), ds: o.ds || []};
}
function kongsiMajlis(m) {
  const url = URL_ASAS() + '#/k/' + kodMajlis(m);
  const isi = h('div');
  tambah(isi, h('p', {class: 'kecil'}, 'Pautan ini membuka susunan majlis yang sama di telefon lain, termasuk nama arwah. Tiada data dihantar ke pelayan.'));
  if (window.qrcode) {
    try { const q = qrcode(0, 'L'); q.addData(url); q.make(); tambah(isi, h('div', {class: 'qr-kotak', html: q.createSvgTag({cellSize: 4, margin: 2, scalable: true}), role: 'img', 'aria-label': 'Kod QR pautan majlis'})); }
    catch (e) { tambah(isi, h('p', {class: 'kecil'}, 'Pautan terlalu panjang untuk kod QR. Gunakan butang kongsi.')); }
  }
  tambah(isi, h('div', {class: 'tindakan'},
    h('button', {class: 'btn utama', type: 'button', html: ikon('kongsi') + ' Kongsi pautan', onclick: () => kongsi(m.tajuk, `${m.tajuk} (Poket Yaasin)`, url)}),
    h('button', {class: 'btn', type: 'button', html: ikon('salin') + ' Salin', onclick: () => salin(url, 'Pautan disalin')})));
  bukaHelai('Kongsi majlis', isi);
}
function skrinImport(skrin, kod) {
  let m;
  try { m = bacaKod(kod); } catch (e) {
    bar({tajuk: 'Pautan majlis', kembali: '#/majlis'});
    tambah(skrin, h('div', {class: 'kosong'}, h('p', null, 'Pautan majlis ini rosak atau tidak lengkap.'), h('a', {class: 'btn', href: '#/majlis'}, 'Ke Majlis'))); return;
  }
  bar({tajuk: m.tajuk, sub: 'Dikongsi kepada anda', kembali: '#/majlis'});
  const simpanM = () => {
    if (m.ds.length) { const ds = doaSaya(); for (const x of m.ds) if (!ds.some(y => y.id === x.id)) ds.push(x); SIMPAN.tulis('doa-saya', ds); }
    const x = majlisBaru({tajuk: m.tajuk, templat: m.templat, nama: m.nama, langkah: m.langkah}); roti('Disimpan dalam Majlis saya'); location.hash = '#/majlis/s/' + x.id;
  };
  for (const x of m.ds) DOA_SESI.set(x.id, x);
  tambah(skrin, 
    h('div', {class: 'tindakan'},
      h('button', {class: 'btn utama', type: 'button', html: ikon('pentas') + ' Mula (Mod Majlis)', onclick: () => bukaPentas(halamanLangkah(m.langkah, {nama: m.nama}), {tajuk: m.tajuk})}),
      h('button', {class: 'btn', type: 'button', html: ikon('tambah') + ' Simpan ke Majlis saya', onclick: simpanM})),
    m.nama.length ? h('div', {class: 'kad kad-nama'}, h('p', {class: 'nama-senarai'}, 'Untuk ' + senaraiNamaRingkas(m.nama))) : null,
    lapisanBacaan(lukisSemula),
    senaraiLangkah(m.langkah, {nama: m.nama}));
}
/* ================================================================ Doa: senarai, carian, butiran */
/* ================================================================ Carian pintar
   Berjalan dalam telefon tanpa internet dan tanpa model bahasa: normalisasi ejaan, akar kata Bahasa Melayu, rangka ejaan
   Rumi bagi istilah Arab, kamus sinonim (kandungan/sinonim.yaml), pembetulan salah ejaan (jarak suntingan), markah ikut
   medan, dan jawapan pantas daripada data app (waktu solat, puasa sunat, tarikh Hijri). Hasil sentiasa kandungan app
   yang telah disemak, ditambah pautan carian ke laman rasmi mufti (kandungan/laman.yaml). */
const HENTI = new Set(('nak mahu hendak ingin untuk utk yang yg dan atau di ke dari daripada pada apa apakah macam mcm mana bagaimana camne ' +
  'cara saya aku kita kami ada tak tidak x ni ini tu itu tolong boleh sikit je jer lah kah pun dengan dgn dalam dlm atas bagi oleh sebab kerana ' +
  'bila bilakah pukul jam berapa hari esok lusa minggu lagi masa waktu sekarang nanti sahaja saja dia mereka semalam tadi kelmarin ' +
  'minta mohon memohon nk sy sye ape apa2 camana mcmmana').split(' '));
const PETUNJUK_JENIS = {doa: 'doa', nota: 'nota'};   // perkataan yang menunjuk jenis hasil, bukan isi
const pecahKata = s => normal(s).split(/[^\p{L}\p{N}]+/u).map(w => w.replace(/^([a-z]{3,})2$/, '$1')).filter(Boolean);
const LATIN = /^[a-z]+$/;
const KHAS_AKAR = {bekerja: 'kerja', belajar: 'ajar', pelajar: 'ajar', pelajaran: 'ajar', mengajar: 'ajar', pengajaran: 'ajar'};
/* Rangka ejaan Rumi: kh/dh/th/sh/gh → huruf pertama, q → k, vokal dan konsonan berganda dirapatkan, iya/uwa → ia/ua.
   "istikharah" dan "istikarah", "tafrijiyah" dan "tafrijiah", "qiyamullail" dan "qiamullail" menjadi sama. */
const rangka = w => w.replace(/([bcdfgjklmnpqrstvwxz])h/g, '$1').replace(/q/g, 'k').replace(/iy(?=[aiu])/g, 'i').replace(/uw(?=[aiu])/g, 'u')
  .replace(/([aiu])\1+/g, '$1').replace(/([bcdfgjklmnprstvwxyz])\1+/g, '$1');
function akarBM(w) {   // calon akar kata (awalan meN-, peN-, ber-, ter-, di-, ke-; akhiran -kan, -an, -i, -nya, -lah, -kah)
  const out = [], x = w.replace(/(lah|kah|nya)$/, '');
  if (x !== w && x.length >= 4) out.push(x);
  if (KHAS_AKAR[x]) out.push(KHAS_AKAR[x]);
  const awal = []; let m;
  if ((m = x.match(/^meny([aeiou].+)/)) || (m = x.match(/^peny([aeiou].+)/))) awal.push('s' + m[1], 'ny' + m[1]);
  else if ((m = x.match(/^(?:mem|pem)([aeiou].+)/))) awal.push('p' + m[1], 'm' + m[1]);
  else if ((m = x.match(/^(?:mem|pem)([bfv].+)/))) awal.push(m[1]);
  else if ((m = x.match(/^(?:meng|peng)([aeiou].+)/))) awal.push(m[1], 'k' + m[1]);
  else if ((m = x.match(/^(?:meng|peng)([gkh].+)/))) awal.push(m[1]);
  else if ((m = x.match(/^(?:men|pen)([aeiou].+)/))) awal.push('t' + m[1], 'n' + m[1]);
  else if ((m = x.match(/^(?:men|pen)([cdjz].+)/))) awal.push(m[1]);
  else if ((m = x.match(/^me([lmnrwy].+)/))) awal.push(m[1]);
  else if ((m = x.match(/^(?:ber|per|ter)(.{3,})/))) awal.push(m[1]);
  else if ((m = x.match(/^(?:be|pe|te)(r.{3,})/))) awal.push(m[1]);
  else if ((m = x.match(/^(?:di|ke)(.{3,})/))) awal.push(m[1]);
  for (const a of awal) {
    out.push(a);
    const s1 = a.replace(/(kan|an)$/, ''); if (s1 !== a && s1.length >= 3) out.push(s1);
    const s2 = a.replace(/i$/, ''); if (s2 !== a && s2.length >= 4) out.push(s2);
  }
  if (!awal.length && x.length >= 7) { const s1 = x.replace(/(kan|an)$/, ''); if (s1 !== x && s1.length >= 4) out.push(s1); }
  return out.filter(a => a.length >= 3);
}
function calonKata(w) {   // perkataan + akar + rangka, untuk dipadankan sesama sendiri
  const c = new Set([w]);
  if (!LATIN.test(w) || w.length < 4) return c;
  for (const a of akarBM(w)) c.add(a);
  for (const a of [...c]) { const r = rangka(a); if (r.length >= 3) c.add(r); }
  return c;
}
function jarakEdit(a, b, had) {   // jarak Damerau-Levenshtein (OSA); berhenti awal jika melebihi had
  if (Math.abs(a.length - b.length) > had) return had + 1;
  let p2 = null, p1 = Array.from({length: b.length + 1}, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const c = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(p1[j] + 1, c[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c.push(v); if (v < min) min = v;
    }
    if (min > had) return had + 1;
    p2 = p1; p1 = c;
  }
  return p1[b.length];
}
const polos = s => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*\s][^*]*)\*/g, '$1')
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, (_, id) => (NOTA.get(id) || {}).tajuk || id).replace(/\{\{([^}]+)\}\}/g, 'ayat $1');
function unitNota(teks) {   // perenggan dan butir senarai, susunan sama seperti blokTeks (untuk lompat ke ?b=n)
  const out = [];
  for (const blok of String(teks || '').trim().split(/\n\s*\n/)) {
    let para = [];
    const tutup = () => { if (para.length) out.push(para.join(' ')); para = []; };
    for (const x of blok.split('\n').map(y => y.trim()).filter(Boolean)) { if (x.startsWith('- ')) { tutup(); out.push(x.slice(2)); } else para.push(x); }
    tutup();
  }
  return out;
}
const APL_CARI = [
  ['Waktu Solat', '#/solat', 'Jadual hari ini, zon JAKIM dan peringatan', 'waktu solat jadual azan peringatan zon imsak syuruk subuh zohor asar maghrib isyak kalendar telefon bunyi loceng selawat takbir rakam nada'],
  ['Tasbih', '#/tasbih', 'Pengira zikir dengan sasaran', 'tasbih pengira kira zikir counter selawat'],
  ['Diari', '#/diari', 'Kalendar puasa, rekod mengaji dan khatam', 'diari puasa ganti qada mengaji khatam bacaan catatan kalendar puasa sunat'],
  ['Hafalan', '#/hafalan', 'Hafal dan murajaah surah', 'hafalan hafal murajaah surah lazim juz amma ulang'],
  ['Keluarga', '#/keluarga', 'Profil ahli dan kemajuan bersama', 'keluarga profil anak ahli avatar pek watak'],
  ['Zikir pagi dan petang', '#/doa?k=pagi-petang', 'Himpunan zikir pagi dan petang', 'pagi petang zikir mathurat wirid'],
  ['Doa Saya', '#/doa?k=saya', 'Tulis dan simpan doa sendiri', 'doa saya doa sendiri tulis'],
  ['Pembina Majlis', '#/majlis', 'Susun bacaan majlis, kongsi dan cetak', 'majlis kenduri tahlil doa selamat cetak kongsi buku kecil'],
  ['Nota hukum', '#/nota', 'Nota hukum, kaedah dan sumber', 'nota hukum fatwa kaedah'],
  ['Rujukan', '#/rujukan', 'Semua laman mufti, JAKIM dan kitab yang dipetik', 'rujukan sumber mufti jakim kdn'],
  ['Tetapan', '#/tetapan', 'Saiz huruf, tema, Rumi, zon dan sandaran', 'tetapan saiz huruf tema mod malam dark rumi makna sandaran zon pasang install skrin utama homescreen ikon app'],
];
let INDEKS = null;
const FRASA_KUNCI = [['anak bulan', 'anakbulan']];   // frasa yang perkataannya tidak dipadankan secara berasingan
function medan(w, teks) {   // satu medan dokumen: teks bernormal (untuk frasa) + set perkataan dan calon akarnya
  const t = pecahKata(teks), kata = new Set();
  let j = ' ' + t.join(' ') + ' ';
  for (const [f, g] of FRASA_KUNCI) j = j.split(' ' + f + ' ').join(' ' + g + ' ');
  for (const x of j.split(' ')) if (x) for (const c of calonKata(x)) kata.add(c);
  return {w, teks: ' ' + t.join(' ') + ' ', kata, asal: t};
}
function binaIndeks() {
  const kunci = JSON.stringify(SIMPAN.baca('doa-saya', [])).length;
  if (INDEKS && INDEKS.kunci === kunci) return INDEKS;
  const dok = [];
  for (const d of [...D.doa, ...doaSaya().map(doaSayaObj)]) {
    const b = d.b || [];
    dok.push({jenis: 'doa', id: d.id, d, href: '#/doa/' + d.id, medan: [
      medan(6, d.tj), medan(5, [...(d.tag || []), ...(d.kat || []).map(k => KAT[k] ? KAT[k][0] : k)].join(' ')),
      medan(3, [d.st, d.bila].filter(Boolean).join(' ')),
      medan(1.2, [...b.map(x => [x.tj, x.mk, x.ru].join(' ')), polos(d.nota), d.s && d.s.r].join(' ')),
      medan(2.5, b.map(x => (x.ar || []).join(' ')).join(' '))]});
  }
  for (const n of D.nota) {
    const unit = unitNota(n.isi);
    dok.push({jenis: 'nota', id: n.id, n, href: '#/nota/' + n.id, tajuk: n.tajuk, ringkas: n.ringkas, unit,
      medan: [medan(6, n.tajuk), medan(5, (n.kata || []).join(' ')), medan(3, n.ringkas || '')], blok: unit.map(u => medan(1.2, polos(u)))});
  }
  const NAMA_K = {pilihan: 'Surah pilihan', asas: 'Bacaan asas', lazim: 'Surah lazim'};
  for (const x of D.hafalan || []) {
    const s = x.s && (D.meta.surah[x.s - 1] || []);
    dok.push({jenis: 'surah', id: 'h-' + x.id, href: '#/hafalan/' + x.id, tajuk: x.tajuk, ringkas: `Hafalan: ${NAMA_K[x.kumpulan] || 'surah'}${x.s ? `, ${x.hingga - x.dari + 1} ayat` : ''}${audioHafal(x) ? '' : ', audio dalam Smart Quran'}`,
      medan: [medan(6, [x.tajuk, s && s[1], x.s ? 'surah ' + x.tajuk : ''].filter(Boolean).join(' ')), medan(2, 'hafalan hafal murajaah ' + (NAMA_K[x.kumpulan] || ''))]});
  }
  dok.push({jenis: 'surah', id: 'yaasin', href: '#/yaasin', tajuk: 'Surah Yaasin', ringkas: 'Bacaan penuh dengan terjemahan dan audio', medan: [medan(6, 'yaasin yasin surah yaasin يس'), medan(2, 'bacaan terjemahan audio')]});
  for (const su of D.susunan || []) dok.push({jenis: 'surah', id: 's-' + su.id, href: '#/susunan/' + su.id, tajuk: su.tajuk, ringkas: 'Susunan bacaan', medan: [medan(6, su.tajuk), medan(2, 'susunan bacaan')]});
  for (const m of D.majlis || []) dok.push({jenis: 'majlis', id: 'm-' + m.id, href: '#/majlis/t/' + m.id, tajuk: m.tajuk, ringkas: m.ringkas, medan: [medan(6, m.tajuk), medan(3, [m.ringkas, 'majlis templat'].join(' '))]});
  for (const [tj, href, rk, kata] of APL_CARI) dok.push({jenis: 'apl', id: 'a-' + href, href, tajuk: tj, ringkas: rk, medan: [medan(6, tj), medan(4, kata)]});
  const kekerapan = new Map();
  for (const x of dok) for (const m of [...x.medan, ...(x.blok || [])]) for (const w of m.asal) if (w.length >= 4 && LATIN.test(w)) kekerapan.set(w, (kekerapan.get(w) || 0) + 1);
  const sin = (D.sinonim || []).map(g => g.slice()), petaSin = new Map();
  sin.forEach((g, i) => { for (const t of g) { for (const c of t.includes(' ') ? [t] : calonKata(t)) { if (!petaSin.has(c)) petaSin.set(c, new Set()); petaSin.get(c).add(i); } if (!t.includes(' ') && t.length >= 4) kekerapan.set(t, (kekerapan.get(t) || 0) + 1); } });
  INDEKS = {kunci, dok, kekerapan, sin, petaSin, frasa: [...new Set(sin.flat().filter(t => t.includes(' ')))].sort((a, b) => b.split(' ').length - a.split(' ').length)};
  return INDEKS;
}
/* Fahami pertanyaan: frasa sinonim dahulu, kemudian perkataan (buang kata henti), pembetulan ejaan, dan pengembangan sinonim.
   Setiap konsep = {label, istilah: Map(istilah → kekuatan)}; kekuatan 1 tepat, 0.85 akar/rangka, 0.7 sinonim, 0.75 dibetulkan. */
function fahamCarian(q, opt = {}) {
  const I = binaIndeks(), mentah = pecahKata(q), kosong = {mentah, konsep: [], jenis: null, betul: [], luas: []};
  if (!mentah.length) return kosong;
  let teks = ' ' + mentah.join(' ') + ' ';
  const konsep = [], betul = [];
  const tambahSin = (k, kunci, kuat) => {
    for (const gi of I.petaSin.get(kunci) || []) for (const t of I.sin[gi]) {
      if (!k.istilah.has(t) || k.istilah.get(t) < kuat) k.istilah.set(t, kuat);
      if (!t.includes(' ')) for (const c of calonKata(t)) if (!k.istilah.has(c)) k.istilah.set(c, kuat - 0.1);
      k.kump.add(gi);
    }
  };
  for (const f of I.frasa) if (teks.includes(' ' + f + ' ')) {
    const k = {label: f, istilah: new Map([[f, 1]]), kump: new Set(), frasa: true}; tambahSin(k, f, 0.75); konsep.push(k);
    teks = teks.replace(' ' + f + ' ', ' | ');
  }
  const baki = teks.split(' ').filter(w => w && w !== '|');
  let jenis = null;
  baki.forEach((w, i) => {
    if (PETUNJUK_JENIS[w]) { jenis = jenis || PETUNJUK_JENIS[w]; return; }
    if (HENTI.has(w)) return;
    let kata = w;
    const terakhir = opt.menaip && i === baki.length - 1;
    const kenal = c => I.kekerapan.has(c) || I.petaSin.has(c);
    if (LATIN.test(w) && w.length >= 6 && ![...calonKata(w)].some(kenal) && !(terakhir && [...I.kekerapan.keys()].some(v => v.startsWith(w)))) {
      const had = w.length >= 9 ? 2 : 1; let terbaik = null, jarak = had + 1, kerap = 0;
      for (const [v, n] of I.kekerapan) { if (v[0] !== w[0] && had < 2) continue; const j = jarakEdit(w, v, had); if (j < jarak || (j === jarak && n > kerap)) { terbaik = v; jarak = j; kerap = n; } }
      if (terbaik && jarak <= had) { betul.push([w, terbaik]); kata = terbaik; }
    }
    const k = {label: kata, istilah: new Map(), kump: new Set(), betul: kata !== w, sub: LATIN.test(kata) ? null : kata};   // Arab: padanan sebahagian perkataan
    for (const c of calonKata(kata)) k.istilah.set(c, c === kata ? (kata !== w ? 0.8 : 1) : 0.85);
    for (const c of [...k.istilah.keys()]) tambahSin(k, c, 0.7);
    if (terakhir && LATIN.test(kata) && kata.length >= 3) {   // sedang menaip: perkataan terakhir boleh jadi awalan
      let n = 0; for (const v of I.kekerapan.keys()) if (v.length > kata.length && v.startsWith(kata) && !k.istilah.has(v)) { k.istilah.set(v, 0.55); tambahSin(k, v, 0.5); if (++n >= 25) break; }
    }
    konsep.push(k);
  });
  const luas = [...new Set(konsep.flatMap(k => [k.label, ...[...k.kump].map(g => I.sin[g][0])]))].slice(0, 8);
  return {mentah, konsep, jenis, betul, luas};
}
function markahMedan(m, k) {
  let terbaik = k.sub && m.teks.includes(k.sub) ? 0.9 : 0;
  for (const [t, kuat] of k.istilah) {
    if (kuat <= terbaik) continue;
    if (t.includes(' ') ? m.teks.includes(' ' + t + ' ') : m.kata.has(t)) terbaik = kuat;
  }
  return terbaik * m.w;
}
/* Cari dalam semua kandungan. opt.jenis: hadkan kepada satu jenis ('doa'). Pulangan: {f, hasil: [{x, skor, blok, padan}], separa}.
   Markah = jumlah (markah medan × IDF konsep); konsep yang jarang (cth. "demam") lebih berat daripada yang umum (cth. "anak"),
   dan dokumen yang memadankan lebih banyak konsep diutamakan. */
function cariPintar(q, opt = {}) {
  const I = binaIndeks(), f = fahamCarian(q, opt);
  if (!f.konsep.length) return {f, hasil: [], separa: false};
  const n = f.konsep.length, frasaPenuh = ' ' + f.mentah.join(' ') + ' ';
  const surahD = f.mentah.includes('surah'), hukumD = f.mentah.some(w => HUKUM.has(w));
  const calon = [], df = f.konsep.map(() => 0);
  for (const x of I.dok) {
    if (opt.jenis && x.jenis !== opt.jenis) continue;
    const b = f.konsep.map(() => 0), blokM = x.blok ? x.blok.map(() => f.konsep.map(() => 0)) : null;
    f.konsep.forEach((k, ki) => {
      for (const m of x.medan) b[ki] = Math.max(b[ki], markahMedan(m, k));
      if (blokM) x.blok.forEach((m, i) => { const s = markahMedan(m, k); blokM[i][ki] = s; b[ki] = Math.max(b[ki], s); });
    });
    if (b.some(v => v > 0)) { b.forEach((v, ki) => { if (v > 0) df[ki]++; }); calon.push({x, b, blokM}); }
  }
  const N = I.dok.length, idf = df.map(d => Math.log(1 + N / (1 + d))), jumIdf = idf.reduce((a, v) => a + v, 0) || 1;
  const hasil = calon.map(({x, b, blokM}) => {
    let skor = 0, liputan = 0, padan = 0;
    b.forEach((v, ki) => { if (v > 0) { skor += v * idf[ki]; liputan += idf[ki]; padan++; } });
    liputan /= jumIdf; skor *= 0.35 + 0.65 * liputan;
    if (f.mentah.length > 1 && x.medan[0].teks.includes(frasaPenuh)) skor += 5;
    if ((f.jenis && x.jenis === f.jenis) || (surahD && x.jenis === 'surah') || (hukumD && x.jenis === 'nota')) skor *= 1.25;
    if (x.d && x.d.s && x.d.s.j === 'hadis' && /^sahih/i.test(x.d.s.d || '')) skor *= 1.04;   // seri: lafaz hadis sahih dahulu
    let blok = -1;
    if (blokM) { let t = 0; blokM.forEach((s, i) => { const v = s.reduce((a, y, ki) => a + y * idf[ki], 0); if (v > t) { t = v; blok = i; } }); }
    return {x, skor, blok, padan, liputan};
  });
  const maks = Math.max(0, ...hasil.map(r => r.liputan)), penuh = hasil.filter(r => r.padan === n).length;
  const tapis = hasil.filter(r => r.liputan >= (penuh >= 3 ? 0.75 : 0.45) * maks).sort((a, b) => b.skor - a.skor);
  return {f, hasil: tapis, separa: n > 1 && tapis.length > 0 && !tapis.some(r => r.padan === n)};
}

/* Jawapan pantas: dikira terus daripada data app, bukan dijana. */
const KUNCI_SOLAT = {subuh: 'fajr', suboh: 'fajr', fajar: 'fajr', fajr: 'fajr', zohor: 'dhuhr', zuhur: 'dhuhr', zuhr: 'dhuhr', lohor: 'dhuhr', dhuhur: 'dhuhr',
  asar: 'asr', asr: 'asr', ashar: 'asr', maghrib: 'maghrib', magrib: 'maghrib', isyak: 'isha', isya: 'isha', isha: 'isha', imsak: 'imsak', syuruk: 'syuruk', syuruq: 'syuruk'};
const KATA_MASA = new Set(['waktu', 'pukul', 'jam', 'bila', 'bilakah', 'azan', 'masuk', 'sekarang', 'pukul berapa', 'jadual']);
function jawapanPantas(f, kini = new Date()) {
  const m = f.mentah, ada = w => m.includes(w), out = [];
  const solatK = m.map(w => KUNCI_SOLAT[w]).find(Boolean) || (ada('dhuha') && ada('waktu') ? 'dhuha' : null);
  const isi = f.konsep.length;
  if ((solatK && (m.some(w => KATA_MASA.has(w)) || isi <= 1)) || (ada('waktu') && (ada('solat') || ada('sembahyang'))) || (ada('jadual') && ada('solat'))) {
    if (!T.zon) out.push(h('a', {class: 'kad jp', href: '#/solat'}, h('b', null, 'Waktu solat'), h('p', null, 'Pilih zon waktu solat dahulu untuk melihat waktu hari ini.')));
    else {
      const w = waktuHari(kini), s = solatSeterusnya(kini), k = solatK || (s && s.k), t = w && k && w.t[k];
      const jalur = h('div', {class: 'jam-waktu jw-kad'}); lukisJalurWaktu(jalur, null, kini, k);
      out.push(h('a', {class: 'kad jp', href: '#/solat'},
        h('span', {class: 'jp-l'}, `Waktu solat hari ini, zon ${T.zon}${w && w.sumber === 'anggaran' ? ' (anggaran)' : ''}`),
        t ? h('b', {class: 'jp-besar'}, `${NAMA_SOLAT[k]} ${fmtWaktu(t)}`) : null,
        t && t > kini ? h('span', {class: 'jp-sub'}, `lagi ${bakiMasa(t - kini)}`) : t ? h('span', {class: 'jp-sub'}, 'sudah masuk') : null,
        jalur));
    }
  }
  if ((ada('puasa') || ada('berpuasa') || ada('saum')) && m.some(w => ['sunat', 'sunnah', 'nabi', 'isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad', 'bidh', 'putih', 'arafah', 'asyura', 'tasua', 'syawal', 'syaaban', 'zulhijjah', 'daud', 'bila', 'esok', 'minggu', 'hari', 'ini', 'boleh'].includes(w))) {
    const st = statusPuasa(kini), seterus = [];
    for (let i = 1; i <= 60 && seterus.length < 3; i++) { const t = new Date(kini.getFullYear(), kini.getMonth(), kini.getDate() + i); const x = statusPuasa(t); if (x.sunat.length) seterus.push([t, x]); }
    const hariIni = (st.larang ? `Hari ini dilarang berpuasa (${st.larang}).` : st.ramadan ? 'Hari ini dalam bulan Ramadan.' : st.sunat.length ? `Hari ini: puasa sunat ${st.sunat.join(' dan ')}.` : 'Hari ini tiada puasa sunat khusus.')
      + (kini.getDay() === 5 && !st.larang && !st.ramadan ? ' Hari Jumaat: jika berpuasa sunat, sertakan Khamis atau Sabtu.' : '');
    out.push(h('div', {class: 'kad jp'},
      h('span', {class: 'jp-l'}, 'Puasa sunat'), h('b', null, hariIni),
      seterus.length ? h('ul', {class: 'jp-senarai'}, seterus.map(([t, x]) => { const lain = x.sunat.filter(j => j !== 'Isnin' && j !== 'Khamis');
        return h('li', null, h('b', null, `${HARI[t.getDay()]}, ${t.getDate()} ${BULAN[t.getMonth()]}`), lain.length ? `: ${lain.join(', ')}` : ''); })) : null,
      h('div', {class: 'baris'}, h('a', {class: 'btn kecil', href: '#/diari'}, 'Kalendar Diari'), h('a', {class: 'btn kecil', href: '#/nota/puasa-sunat'}, 'Hari puasa sunat'), h('a', {class: 'btn kecil', href: '#/nota/puasa-nabi'}, 'Cara Nabi ﷺ berpuasa'))));
  }
  if ((ada('hijri') || ada('hijriah') || (ada('tarikh') && ada('islam'))) && !out.length) {
    out.push(h('a', {class: 'kad jp', href: '#/nota/kalendar'}, h('span', {class: 'jp-l'}, 'Tarikh Hijri hari ini'), h('b', {class: 'jp-besar'}, fmtHijri(hijri(kini))),
      h('span', {class: 'jp-sub'}, 'Ikut takwim JAKIM jika data waktu solat ada; jika tidak, anggaran.')));
  }
  return out;
}
const HUKUM = new Set(['hukum', 'fatwa', 'harus', 'haram', 'makruh', 'wajib', 'sah', 'batal', 'bidaah', 'khilaf', 'dalil', 'mufti', 'najis', 'aurat']);
function lamanRasmi(q) {
  const neg = (T.zon || '').slice(0, 3), L = D.laman || [];
  const pilih = [...L.filter(x => x.negeri && x.negeri === neg && neg !== 'WLY'), ...L.filter(x => x.negeri === 'WLY'), ...L.filter(x => !x.negeri)];
  return h('section', {class: 'kad laman-rasmi', 'aria-labelledby': 'lr-t'},
    h('h2', {id: 'lr-t', class: 'sek-dalam'}, 'Cari dalam laman rasmi'),
    h('p', {class: 'kecil'}, 'Untuk soalan hukum atau topik yang tiada dalam app. Dibuka dalam pelayar sebagai carian Google terhad kepada laman itu.'),
    h('div', {class: 'baris'}, pilih.map(x => h('a', {class: 'btn kecil', href: 'https://www.google.com/search?q=' + encodeURIComponent(`${q} site:${x.domain}`), target: '_blank', rel: 'noopener', title: x.nama}, x.ringkas || x.nama))));
}
function sorot(teks, f) {   // serlah perkataan yang sepadan (Latin sahaja)
  const kata = [...new Set(f.konsep.flatMap(k => [...k.istilah.keys()]).filter(t => /^[a-z ]{3,}$/.test(t)))].sort((a, b) => b.length - a.length).slice(0, 40);
  if (!kata.length) return teks;
  const re = new RegExp(`(^|[^a-z])(${kata.map(t => t.replace(/ /g, '\\s+')).join('|')})`, 'gi');
  const out = []; let akhir = 0, m;
  while ((m = re.exec(teks))) { const mula = m.index + m[1].length; out.push(teks.slice(akhir, mula), h('mark', null, m[2])); akhir = mula + m[2].length; }
  out.push(teks.slice(akhir)); return out;
}
function petikan(unit, f) {   // ~170 aksara di sekitar padanan pertama
  const t = polos(unit), kata = f.konsep.flatMap(k => [...k.istilah.keys()]).filter(x => /^[a-z ]{3,}$/.test(x));
  const lc = t.toLowerCase(); let i = -1;
  for (const k of kata) { const j = lc.indexOf(k); if (j >= 0 && (i < 0 || j < i)) i = j; }
  const mula = Math.max(0, i - 60), akhir = Math.min(t.length, mula + 170);
  return (mula > 0 ? '…' : '') + t.slice(mula, akhir).trim() + (akhir < t.length ? '…' : '');
}
const NAMA_JENIS = {doa: 'Doa, zikir dan selawat', nota: 'Nota dan amalan', surah: 'Surah dan bacaan', majlis: 'Majlis', apl: 'Dalam app'};
function kadHasil(r, f) {
  const x = r.x;
  if (x.jenis === 'doa') return kadDoa(x.d);
  if (x.jenis === 'nota') {
    const href = x.href + (r.blok >= 0 ? `?b=${r.blok}` : '');
    return h('a', {class: 'kad hasil-k', href}, h('b', null, sorot(x.tajuk, f)), h('p', null, sorot(r.blok >= 0 ? petikan(x.unit[r.blok], f) : x.ringkas || '', f)), h('span', {class: 'kecil'}, 'Nota'));
  }
  return h('a', {class: 'kad hasil-k', href: x.href}, h('b', null, x.tajuk), x.ringkas ? h('p', null, x.ringkas) : null);
}
const CADANG_CARI = ['anak demam', 'solat dhuha', 'puasa sunat', 'selawat tafrijiyah', 'waktu asar', 'hujan lebat', 'tak boleh tidur', 'amalan jumaat', 'istikharah', 'balik kampung'];
function simpanCarian(q) {
  q = String(q || '').trim(); if (q.length < 2) return;
  SIMPAN.tulis('cari', [q, ...SIMPAN.baca('cari', []).filter(x => x !== q)].slice(0, 8));
}
function skrinCari(skrin, q) {
  bar({tajuk: 'Cari', kembali: '#/'});
  let kata = q.get('q') || '', pemasa = 0;
  const input = h('input', {class: 'medan', type: 'search', value: kata, placeholder: 'Contoh: anak demam, solat dhuha, waktu asar', 'aria-label': 'Cari dalam app', autocomplete: 'off', enterkeyhint: 'search',
    oninput: () => { kata = input.value; clearTimeout(pemasa); pemasa = setTimeout(() => { lukis(true); urlKini(); }, 110); },
    onkeydown: e => { if (e.key === 'Enter') { simpanCarian(kata); input.blur(); } }});
  const faham = h('div', {class: 'faham', 'aria-live': 'polite'}), hasil = h('div', {class: 'hasil-cari'});
  bersihSkrin.push(() => clearTimeout(pemasa));
  function urlKini() {
    const baru = '#/cari' + (kata ? '?q=' + encodeURIComponent(kata) : '');
    history.replaceState(history.state, '', baru); sejarah[sejarah.length - 1] = baru; hashKini = baru;
  }
  function lukis(menaip) {
    faham.replaceChildren(); hasil.replaceChildren();
    const qq = kata.trim();
    if (!qq) {
      const lalu = SIMPAN.baca('cari', []), il = gambarKonteks('cari', 'pelekat-cari') || pose(ahliAktif(), 'fikir', 'pelekat-cari');
      tambah(hasil, il ? h('div', {class: 'cari-ilustrasi'}, il) : null, lalu.length ? frag(h('h2', {class: 'sek'}, 'Carian terdahulu'), h('div', {class: 'baris'}, lalu.map(x => h('button', {class: 'cip', type: 'button', onclick: () => { input.value = kata = x; lukis(); urlKini(); }}, x)))) : null,
        h('h2', {class: 'sek'}, 'Cuba cari'), h('div', {class: 'baris'}, CADANG_CARI.map(x => h('button', {class: 'cip', type: 'button', onclick: () => { input.value = kata = x; lukis(); urlKini(); }}, x))),
        h('p', {class: 'kecil'}, 'Carian faham perkataan harian dan ejaan yang berbeza, contohnya "demam" untuk doa orang sakit atau "tahajud" untuk qiyamullail. Semuanya berjalan dalam telefon tanpa internet.'));
      return;
    }
    const {f, hasil: r, separa} = cariPintar(qq, {menaip});
    if (f.betul.length) tambah(faham, h('p', {class: 'kecil'}, 'Maksud anda: ', f.betul.map(([, b], i) => frag(i ? ', ' : '', h('b', null, b))), '?'));
    if (f.luas.length > 1) tambah(faham, h('p', {class: 'kecil kabur'}, 'Carian merangkumi: ' + f.luas.join(', ')));
    const jp = jawapanPantas(f), hukum = f.mentah.some(w => HUKUM.has(w));
    if (jp.length) tambah(hasil, jp);
    if (separa) tambah(hasil, h('p', {class: 'kecil'}, 'Tiada padanan untuk semua perkataan. Hasil berikut sepadan sebahagian.'));
    if ((hukum || r.length < 3) && qq.length > 2) tambah(hasil, lamanRasmi(qq));
    const kump = new Map();
    for (const x of r) { if (!kump.has(x.x.jenis)) kump.set(x.x.jenis, []); kump.get(x.x.jenis).push(x); }
    for (const [j, xs] of kump) {
      const HAD = 6, sek = h('section', {class: 'kump-hasil', 'aria-label': NAMA_JENIS[j]}, h('h2', {class: 'sek'}, `${NAMA_JENIS[j]} (${xs.length})`));
      xs.slice(0, HAD).forEach(x => tambah(sek, kadHasil(x, f)));
      if (xs.length > HAD) tambah(sek, h('button', {class: 'btn penuh', type: 'button', onclick: e => { e.currentTarget.replaceWith(...xs.slice(HAD).map(x => kadHasil(x, f))); }}, `Tunjuk ${xs.length - HAD} lagi`));
      tambah(hasil, sek);
    }
    if (!r.length && !jp.length) tambah(hasil, h('div', {class: 'kosong'}, 'Tiada padanan dalam app. Cuba perkataan lain, atau cari dalam laman rasmi.'));
    if (!(hukum || r.length < 3) && qq.length > 2) tambah(hasil, lamanRasmi(qq));
  }
  hasil.addEventListener('click', e => { if (e.target.closest('a')) simpanCarian(kata); });
  tambah(skrin, h('div', {class: 'lapisan'}, h('div', {class: 'cari'}, h('span', {html: ikon('cari')}), input)), faham, hasil);
  lukis();
  if (!kata || q.get('fokus')) setTimeout(() => input.focus(), 60);
}

function padanDoa(q, kat) {
  let r = [...D.doa, ...doaSaya().map(doaSayaObj)];
  if (kat === 'bintang') r = r.filter(d => BINTANG.has(d.id));
  else if (kat === 'saya') r = r.filter(d => d.saya);
  else if (kat) r = r.filter(d => (d.kat || []).includes(kat));
  if (!pecahKata(q).length) return r;
  const boleh = new Set(r.map(d => d.id));
  return cariPintar(q, {jenis: 'doa', menaip: true}).hasil.map(x => x.x.d).filter(d => boleh.has(d.id));
}
function arPertama(d) {
  const b0 = d.b.find(b => (b.ar && b.ar.length) || b.q); if (!b0) return '';
  if (b0.q) { const x = parseSpec(b0.q)[0]; const A = x && D.ayat[`${x.s}:${x.a}`]; return A ? A.w.slice(x.f - 1, x.t || A.w.length).join(' ') : ''; }
  return b0.ar[0];
}
const labelKat = d => (d.kat || []).map(k => KAT[k] && KAT[k][0]).filter(Boolean)[0] || '';
function kadDoa(d) {
  const ar1 = arPertama(d);
  return h('a', {class: 'doa-k', href: '#/doa/' + d.id},
    h('div', {class: 'top'}, h('b', null, d.tj), BINTANG.has(d.id) ? h('span', {class: 'bintang', title: 'Disimpan', html: ikon('bintang', 'ik-isi')}) : null),
    ar1 ? h('div', {class: 'ar1', lang: 'ar'}, ar1) : null,
    h('div', {class: 'bawah'}, lencana(d), d.ul ? h('span', {class: 'ul'}, `×${d.ul}`) : null, h('span', {class: 'kecil'}, labelKat(d))));
}
function skrinSenaraiDoa(skrin, q) {
  bar({tajuk: 'Doa'});
  let kat = q.get('k') || '', kata = q.get('q') || '';
  const input = h('input', {class: 'medan', type: 'search', value: kata, placeholder: 'Cari: hujan, hutang, sakit, رَبَّنَا', 'aria-label': 'Cari doa', autocomplete: 'off', enterkeyhint: 'search',
    oninput: () => { kata = input.value; lukis(); urlKini(); }});
  const cips = h('div', {class: 'gulung', role: 'group', 'aria-label': 'Tapis ikut kategori'});
  const hasil = h('div');
  const pilihan = [['', 'Semua'], ['bintang', 'Disimpan'], ['saya', 'Doa saya'], ...Object.entries(KAT).filter(([k]) => D.doa.some(d => d.kat.includes(k))).map(([k, v]) => [k, v[0]])];
  function lukisCip() {
    cips.replaceChildren(...pilihan.map(([k, l]) => h('button', {class: 'cip', type: 'button', 'aria-pressed': String(k === kat), onclick: () => { kat = k; lukisCip(); lukis(); urlKini(); }},
      k === 'bintang' ? h('span', {class: 'ik', html: ikon('bintang')}) : KAT[k] ? h('span', {class: 'ik', 'aria-hidden': 'true'}, KAT[k][2]) : null, l)));
  }
  function lukis() {
    const r = padanDoa(kata, kat);
    hasil.replaceChildren(...[kat === 'musafir' && !kata ? gambarKonteks('musafir', 'kumpulan-doa') : null,
      h('p', {class: 'kecil kiraan', role: 'status'}, kata ? `${r.length} doa sepadan. ` : `${r.length} doa`, kata.trim() ? h('a', {href: '#/cari?q=' + encodeURIComponent(kata.trim())}, 'Cari juga dalam nota, surah dan amalan') : null),
      ...r.map(kadDoa)].filter(Boolean));
    if (!r.length) tambah(hasil, h('div', {class: 'kosong'},
      kat === 'bintang' ? 'Belum ada doa disimpan. Buka sesuatu doa dan tekan "Simpan".' :
      kat === 'saya' ? frag('Belum ada doa sendiri. ', h('a', {href: '#/doa/baru'}, 'Tulis doa sendiri')) :
      'Tiada doa sepadan. Cuba perkataan lain, contohnya "hujan", "anak", "rezeki".'));
  }
  function urlKini() {
    const p = new URLSearchParams(); if (kat) p.set('k', kat); if (kata) p.set('q', kata);
    const baru = '#/doa' + (String(p) ? '?' + p : ''); history.replaceState(history.state, '', baru); sejarah[sejarah.length - 1] = baru; hashKini = baru;
  }
  tambah(skrin, h('div', {class: 'lapisan'}, h('div', {class: 'cari'}, h('span', {html: ikon('cari')}), input), cips), hasil,
    h('a', {class: 'btn penuh', href: '#/doa/baru', html: ikon('tambah') + ' Tulis doa sendiri'}));
  lukisCip(); lukis();
  if (kat) requestAnimationFrame(() => { const a = $('.cip[aria-pressed="true"]', cips); if (a) a.scrollIntoView({inline: 'center', block: 'nearest'}); });
  if (q.get('cari')) { urlKini(); setTimeout(() => input.focus(), 60); }
}
const JENIS_SUMBER = {quran: 'Al-Quran', hadis: 'Hadis', buku: 'Buku Surah Yaasiin, Tahlil & Doa', athar: 'Athar sahabat', ulama: 'Susunan ulama', saya: 'Doa saya'};
function skrinDoa(skrin, id) {
  const d = cariDoa(id); if (!d) return tiada(skrin);
  bar({tajuk: d.saya ? 'Doa saya' : 'Doa', kembali: '#/doa'});
  const s = d.s || {};
  const adaArwah = d.b.some(b => b.arwah);
  const ctx = {nama: ARWAH, suntingNama: adaArwah ? () => suntingNama(ARWAH, n => { ARWAH = n; simpanArwah(); lukisSemula(); }) : null};
  const togol = (label, k) => h('button', {class: 'cip', type: 'button', 'aria-pressed': String(!!T[k]), onclick: () => { T[k] = !T[k]; simpanT(); lukisSemula(); }}, label);
  const adaQ = d.b.some(b => b.q), adaTeks = d.b.some(b => b.ar && b.ar.length || b.arwah || b.varian);
  const lapisan = h('div', {class: 'lapisan'}, h('div', {class: 'gulung'},
    adaTeks ? togol('Makna per frasa', 'frasa') : null, adaTeks ? togol('Rumi', 'rumi') : null, togol('Makna', 'makna'), adaQ ? togol('Makna perkataan', 'perkata') : null,
    h('button', {class: 'cip', type: 'button', html: ikon('pentas') + ' Mod Majlis', onclick: () => bukaPentas([{tajuk: d.tj, ulang: d.ul || 0, isi: () => paparBahagian(d, {nama: ARWAH})}], {tajuk: d.tj})})));
  const disimpan = BINTANG.has(d.id);
  const bintangB = h('button', {class: 'btn' + (disimpan ? ' utama' : ''), type: 'button', 'aria-pressed': String(disimpan), html: ikon('bintang', disimpan ? 'ik-isi' : '') + (disimpan ? ' Disimpan' : ' Simpan'),
    onclick: () => { if (BINTANG.has(d.id)) BINTANG.delete(d.id); else BINTANG.add(d.id); simpanBintang(); roti(BINTANG.has(d.id) ? 'Disimpan dalam "Doa disimpan"' : 'Dibuang daripada simpanan'); lukisSemula(); }});
  const pautSumber = s.u ? h('a', {href: s.u, target: '_blank', rel: 'noopener'}, /sunnah\.com/.test(s.u) ? 'Lihat teks hadis di sunnah.com' : 'Buka sumber') : null;
  tambah(skrin, 
    h('div', {class: 'doa-h'},
      h('h2', null, d.tj, d.ul ? h('span', {class: 'ul'}, `×${d.ul}`) : null),
      d.st ? h('p', {class: 'st'}, d.st) : null,
      h('div', {class: 'baris'}, lencana(d), (d.kat || []).map(k => KAT[k] ? h('a', {class: 'cip cip-kecil', href: '#/doa?k=' + k}, KAT[k][0]) : null))),
    d.bila ? h('div', {class: 'bila'}, h('b', null, 'Bila: '), inline(d.bila)) : null,
    lapisan,
    adaArwah ? kadNama(ARWAH, n => { ARWAH = n; simpanArwah(); lukisSemula(); }) : null,
    h('div', {class: 'isi-doa'}, paparBahagian(d, ctx)),
    h('div', {class: 'sumber'},
      h('div', {class: 'baris'}, lencana(d), h('b', null, JENIS_SUMBER[s.j] || 'Sumber')),
      s.r ? h('div', null, inline(s.r)) : null,
      s.d && !/^al-quran$/i.test(s.d) && jenisLencana(d) !== 'saya' ? h('div', {class: 'kecil'}, 'Darjat menurut sumber: ', s.d) : null,
      s.n ? h('div', {class: 'kecil nota-sumber'}, inline(s.n)) : null,
      pautSumber,
      h('div', {class: 'kecil'}, h('a', {href: '#/nota/darjat'}, 'Maksud label sumber'))),
    d.nota ? h('div', {class: 'nota'}, blokTeks(d.nota)) : null,
    d.lihat ? h('div', {class: 'lihat'}, d.lihat.map(n => NOTA.get(n) && h('a', {class: 'nota-k', href: '#/nota/' + n}, h('b', null, NOTA.get(n).tajuk), h('span', null, NOTA.get(n).ringkas || '')))) : null,
    h('div', {class: 'tindakan'},
      bintangB,
      h('button', {class: 'btn', type: 'button', html: ikon('salin') + ' Salin', onclick: () => salin(teksDoa(d, ARWAH), 'Teks doa disalin')}),
      h('button', {class: 'btn', type: 'button', html: ikon('kongsi') + ' Kongsi', onclick: () => kongsi(d.tj, teksDoa(d, ARWAH), URL_ASAS() + '#/doa/' + d.id)}),
      h('button', {class: 'btn', type: 'button', html: ikon('majlis') + ' Tambah ke majlis', onclick: () => keMajlis({doa: d.id})}),
      d.saya ? h('a', {class: 'btn', href: '#/doa/baru/' + d.id, html: ikon('sunting') + ' Sunting'}) : null,
      d.saya ? h('button', {class: 'btn bahaya', type: 'button', html: ikon('buang') + ' Padam', onclick: () => sahkan('Padam doa ini?', () => { SIMPAN.tulis('doa-saya', doaSaya().filter(x => x.id !== d.id)); BINTANG.delete(d.id); simpanBintang(); location.hash = '#/doa?k=saya'; }, 'Padam')}) : null,
      d.saya ? null : h('button', {class: 'btn', type: 'button', html: ikon('lapor') + ' Lapor', onclick: () => lapor(d.tj, 'doa:' + d.id)})));
}
function keMajlis(st) {
  const saya = majlisSaya();
  const isi = h('div', {class: 'senarai-tindakan'},
    h('button', {class: 'btn penuh utama', type: 'button', html: ikon('tambah') + ' Majlis baharu dengan bacaan ini', onclick: () => { const m = majlisBaru({tajuk: 'Majlis baharu', langkah: [st]}); tutupHelai(true); location.hash = '#/majlis/s/' + m.id; }}),
    saya.map(m => h('button', {class: 'pilih-b', type: 'button', onclick: () => { m.langkah.push(st); kemasMajlis(m); tutupHelai(true); roti(`Ditambah ke "${m.tajuk}"`); }}, h('b', null, m.tajuk), h('span', null, `${ratakan(m.langkah).length} langkah`))));
  bukaHelai('Tambah ke majlis', isi);
}
function bukaFrasa(el) {
  bukaHelai(null, frag(h('div', {class: 'kata-besar frasa-besar', lang: 'ar'}, el.textContent), h('div', {class: 'kata-g'}, el.dataset.fr)));
}
function skrinDoaSayaBorang(skrin, id) {
  const ada = id ? doaSaya().find(x => x.id === id) : null;
  bar({tajuk: ada ? 'Sunting doa saya' : 'Tulis doa sendiri', kembali: ada ? '#/doa/' + id : '#/doa?k=saya'});
  const x = Object.assign({tj: '', ar: '', ru: '', mk: '', nota: ''}, ada || {});
  const medan = (k, label, opt = {}) => {
    const el = h(opt.baris ? 'textarea' : 'input', Object.assign({class: 'medan', id: 'ds-' + k, rows: opt.baris || null, value: x[k] || '', oninput: e => { x[k] = e.target.value; }}, opt.attr || {}));
    if (opt.baris) el.value = x[k] || '';
    return frag(h('label', {class: 'lbl', for: 'ds-' + k}, label), el, opt.bantu ? h('p', {class: 'kecil bantu'}, opt.bantu) : null);
  };
  tambah(skrin, h('form', {class: 'borang', onsubmit: e => {
    e.preventDefault();
    x.tj = x.tj.trim(); if (!x.tj) { roti('Isi tajuk doa'); $('#ds-tj').focus(); return; }
    if (!x.ar.trim() && !x.mk.trim()) { roti('Isi teks Arab atau doa dalam Bahasa Melayu'); $('#ds-mk').focus(); return; }
    const ds = doaSaya();
    if (ada) Object.assign(ds.find(y => y.id === id), x); else { x.id = 'saya-' + Date.now().toString(36); ds.unshift(x); }
    SIMPAN.tulis('doa-saya', ds); roti('Doa disimpan dalam telefon ini'); location.hash = '#/doa/' + (ada ? id : x.id);
  }},
    h('p', {class: 'kecil'}, 'Berdoa dengan kata-kata sendiri yang baik maknanya dibenarkan, dalam bahasa apa pun. Jika doa ini bukan lafaz hadis, jangan sandarkan kepada Nabi ﷺ. ', h('a', {href: '#/nota/darjat'}, 'Baca nota')),
    medan('tj', 'Tajuk', {attr: {maxlength: 80, placeholder: 'cth. Doa untuk ibu yang sakit', required: true}}),
    medan('mk', 'Doa dalam Bahasa Melayu (atau maksud)', {baris: 4, attr: {placeholder: 'Ya Allah, sembuhkanlah ibuku…'}}),
    medan('ar', 'Teks Arab (pilihan)', {baris: 3, attr: {dir: 'rtl', lang: 'ar', class: 'medan medan-ar'}}),
    medan('ru', 'Rumi (pilihan)', {baris: 2, bantu: 'Jangan tulis ayat al-Quran dalam Rumi.'}),
    medan('nota', 'Nota (pilihan)', {baris: 2, attr: {placeholder: 'cth. dibaca selepas solat Subuh'}}),
    h('div', {class: 'tindakan'}, h('a', {class: 'btn', href: ada ? '#/doa/' + id : '#/doa?k=saya'}, 'Batal'), h('button', {class: 'btn utama', type: 'submit'}, 'Simpan doa'))));
}

/* ================================================================ Nota */
const KUMPULAN_NOTA = [['hukum', 'Hukum amalan'], ['amalan', 'Solat sunat dan amalan sunnah'], ['adab', 'Adab berdoa'], ['kaedah', 'Tentang app dan kaedah']];
function skrinSenaraiNota(skrin) {
  bar({tajuk: 'Nota hukum & sumber', kembali: '#/'});
  const pl = pose(ahliAktif(), 'baca', 'pelekat-nota');
  tambah(skrin, h('div', {class: 'nota-atas' + (pl ? ' ada-pelekat' : '')}, h('p', {class: 'kecil pengenalan'}, 'Ringkasan pandangan Pejabat Mufti Wilayah Persekutuan, JAKIM, jabatan mufti negeri dan KDN, dengan pautan ke sumber asal. Pandangan berbeza dinyatakan.'), pl));
  for (const [k, label] of KUMPULAN_NOTA) {
    const n = D.nota.filter(x => (x.kumpulan || 'kaedah') === k); if (!n.length) continue;
    tambah(skrin, h('h2', {class: 'sek'}, label), n.map(x => h('a', {class: 'nota-k', href: '#/nota/' + x.id}, h('b', null, x.tajuk), h('span', null, x.ringkas || ''))));
  }
}
function fmtIso(s) { const [y, m, d] = String(s).split('-').map(Number); return y ? `${d} ${BULAN[m - 1]} ${y}` : String(s); }
function skrinNota(skrin, id, q) {
  const n = NOTA.get(id); if (!n) return tiada(skrin);
  bar({tajuk: 'Nota', kembali: '#/nota'});
  const b = q && q.get('b') !== null ? +q.get('b') : -1;
  if (b >= 0) setTimeout(() => { const el = $$('.isi-nota p, .isi-nota li', skrin)[b]; if (el) { el.classList.add('sorot-blok'); el.scrollIntoView({block: 'center'}); } }, 60);
  tambah(skrin, h('article', {class: 'prosa'},
    h('h2', null, n.tajuk), h('div', {class: 'isi-nota'}, blokTeks(n.isi)),
    n.sumber && n.sumber.length ? frag(h('h3', null, 'Sumber'), h('ul', {class: 'rujuk'}, n.sumber.map(x => h('li', null, h('a', {href: x.u, target: '_blank', rel: 'noopener'}, x.t), x.p ? `. ${x.p}.` : '')))) : null,
    n.disemak ? h('p', {class: 'kecil'}, `Kali terakhir disemak: ${fmtIso(n.disemak)}. Kandungan sumber mungkin dikemas kini selepas tarikh ini.`) : null));
}

/* ================================================================ metadata mushaf: 114 surah, sempadan juz & halaman (Mushaf Madinah 604)
   Ayat "global" = nombor ayat 1 hingga 6236 mengikut susunan mushaf. Metadata sahaja; tiada teks ayat. */
const META = D.meta || {surah: [], juz: [], hal: []};
const MULA_S = (() => { const m = [0]; let k = 0; for (const x of META.surah) { m.push(k + 1); k += x[2]; } return m; })();
const JUM_AYAT = META.surah.length === 114 ? MULA_S[114] + META.surah[113][2] - 1 : 6236;
const keGlobal = (s, a) => MULA_S[s] + a - 1;
function dariGlobal(g) { let lo = 1, hi = 114; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (MULA_S[m] <= g) lo = m; else hi = m - 1; } return {s: lo, a: g - MULA_S[lo] + 1}; }
function noDalam(senarai, g) { let lo = 0, hi = senarai.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (senarai[m] <= g) lo = m; else hi = m - 1; } return lo + 1; }
const juzBagi = g => noDalam(META.juz, g), halBagi = g => noDalam(META.hal, g);
const akhirHal = p => p < META.hal.length ? META.hal[p] - 1 : JUM_AYAT;          // ayat global terakhir pada halaman p
const namaS = s => (META.surah[s - 1] || [`Surah ${s}`])[0];
const labelAyat = g => { const x = dariGlobal(g); return `${namaS(x.s)} ${x.s}:${x.a}`; };
function labelJulat(g1, g2) {
  const a = dariGlobal(g1), b = dariGlobal(g2);
  return a.s === b.s ? `${namaS(a.s)} ${a.s}:${a.a}${b.a !== a.a ? '–' + b.a : ''}` : `${labelAyat(g1)} hingga ${labelAyat(g2)}`;
}
const pilihSurah = (id, nilai) => h('select', {class: 'medan', id}, META.surah.map((x, i) => h('option', {value: i + 1, selected: i + 1 === nilai}, `${i + 1}. ${x[0]}`)));

/* ================================================================ Diari peribadi (disimpan dalam telefon sahaja)
   diari = {hari: {'YYYY-MM-DD': {p: jenis puasa, ng: [[g1, g2]...] bacaan, hf: [...] hafalan & murajaah, n: catatan}},
            ngaji: {pos: ayat global seterusnya, khatam: bilangan}, hafal: {id: {a: [ayat], st, t, n, j}}, tambahan: [...], sasaran, sandaran} */
let DIARI = null;
const objek_ = v => v && typeof v === 'object' && !Array.isArray(v);
function normalDiari(x) {   // pastikan bentuk data betul (data lama, sandaran rosak, suntingan manual)
  x = objek_(x) ? x : {};
  const hari = {};
  if (objek_(x.hari)) for (const [k, v] of Object.entries(x.hari)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && objek_(v)) {
    const r = {};
    if (typeof v.p === 'string') r.p = v.p;
    if (Array.isArray(v.ng)) { const ng = v.ng.filter(z => Array.isArray(z) && z[0] >= 1 && z[1] >= z[0] && z[1] <= JUM_AYAT); if (ng.length) r.ng = ng; }
    if (Array.isArray(v.hf)) { const hf = v.hf.filter(z => objek_(z) && typeof z.id === 'string'); if (hf.length) r.hf = hf; }
    if (typeof v.n === 'string' && v.n.trim()) r.n = v.n;
    if (Object.keys(r).length) hari[k] = r;
  }
  const ng = objek_(x.ngaji) ? x.ngaji : {}, pos = Math.trunc(+ng.pos);
  const hafal = {}; if (objek_(x.hafal)) for (const [k, v] of Object.entries(x.hafal)) if (objek_(v)) {
    const r = hafal[k] = Object.assign({}, v, {a: senarai_(v.a).filter(n => Number.isInteger(n))});
    if (!(Number.isInteger(r.p) && r.p >= 1 && r.p <= 286)) delete r.p;   // p: ayat terakhir sesi audio (untuk "Sambung")
    if (objek_(r.u)) {   // u: {ayat: [kali dirujuk, tarikh terakhir]}
      const u = {}; for (const [a, z] of Object.entries(r.u)) if (/^\d{1,3}$/.test(a) && Array.isArray(z) && Number.isFinite(z[0]) && z[0] >= 1 && typeof z[1] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(z[1])) u[a] = [Math.min(9999, Math.trunc(z[0])), z[1]];
      if (Object.keys(u).length) r.u = u; else delete r.u;
    } else delete r.u;
  }
  const tambahan = senarai_(x.tambahan).filter(z => objek_(z) && typeof z.id === 'string' && z.s >= 1 && z.s <= 114 && z.dari >= 1 && z.hingga >= z.dari && META.surah[z.s - 1] && z.hingga <= META.surah[z.s - 1][2]);
  return {v: 1, hari, ngaji: {pos: pos >= 1 && pos <= JUM_AYAT ? pos : 1, khatam: Math.max(0, Math.trunc(+ng.khatam) || 0)}, hafal, tambahan,
    sasaran: [30, 60, 90].includes(+x.sasaran) ? +x.sasaran : 0, sandaran: typeof x.sandaran === 'string' ? x.sandaran : null};
}
function diari() { if (!DIARI) DIARI = normalDiari(SIMPAN.baca(kunciDiari(keluarga().aktif), {})); return DIARI; }   // diari ahli keluarga yang aktif
function simpanDiari() {   // false jika storan gagal: pemanggil tidak memaparkan mesej "berjaya"
  if (SIMPAN.tulis(kunciDiari(keluarga().aktif), DIARI)) return true;
  roti('Storan telefon penuh: diari belum disimpan. Buat sandaran sekarang, kemudian kosongkan ruang.'); return false;
}
function rekodHari(iso) { const d = diari(); return d.hari[iso] || (d.hari[iso] = {}); }
function kemasHari(iso) {
  const d = diari(), x = d.hari[iso];
  if (x && !x.p && !(x.ng || []).length && !(x.hf || []).length && !x.n) delete d.hari[iso];
  return simpanDiari();
}
const hariIniIso = () => isoTarikh(new Date());
const tarikhIso = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
const tambahHari = (iso, n) => { const t = tarikhIso(iso); t.setDate(t.getDate() + n); return isoTarikh(t); };
let kemasDiari = null;     // dipasang oleh skrin Diari: lukis semula kalendar & kad tanpa menutup helaian

/* Puasa: hari sunat dan hari dilarang (lihat nota puasa-sunat). Tarikh Hijri ikut hijri() (takwim JAKIM jika ada). */
const JENIS_PUASA = [['sunat', 'Sunat'], ['ganti', 'Ganti (qada)'], ['ramadan', 'Ramadan'], ['nazar', 'Nazar'], ['lain', 'Lain']];
function statusPuasa(tarikh) {
  const hj = hijri(tarikh), dow = tarikh.getDay(), out = {sunat: [], larang: null, ramadan: hj.m === 9, hj};
  if (hj.m === 10 && hj.d === 1) out.larang = 'Hari Raya Aidilfitri';
  else if (hj.m === 12 && hj.d === 10) out.larang = 'Hari Raya Aidiladha';
  else if (hj.m === 12 && hj.d >= 11 && hj.d <= 13) out.larang = 'Hari Tasyrik';
  if (out.larang || out.ramadan) return out;
  if (dow === 1) out.sunat.push('Isnin');
  if (dow === 4) out.sunat.push('Khamis');
  if (hj.d >= 13 && hj.d <= 15) out.sunat.push('Ayyamul Bidh');
  if (hj.m === 12 && hj.d === 9) out.sunat.push('Arafah');
  if (hj.m === 1 && hj.d === 9) out.sunat.push("Tasu'a");
  if (hj.m === 1 && hj.d === 10) out.sunat.push('Asyura');
  if (hj.m === 10) out.sunat.push('Syawal');
  return out;
}

/* Mengaji: julat ayat global yang dibaca; kedudukan khatam bergerak jika bacaan meneruskan urutan. */
/* Entri bacaan: [g1, g2] atau [g1, g2, 1, posSebelum, khatamSebelum] jika bacaan itu menggerakkan kedudukan khatam. */
function simpanNgaji(iso, g1, g2, gerak) {
  const d = diari(), r = rekodHari(iso), e = [g1, g2];
  let msg = `Direkod: ${labelJulat(g1, g2)}`, khatam = false;
  if (gerak && g2 >= d.ngaji.pos) {
    e.push(1, d.ngaji.pos, d.ngaji.khatam || 0);
    d.ngaji.pos = g2 + 1;
    if (d.ngaji.pos > JUM_AYAT) { d.ngaji.pos = 1; d.ngaji.khatam = (d.ngaji.khatam || 0) + 1; msg = `Alhamdulillah, khatam kali ke-${d.ngaji.khatam}.`; khatam = true; }
  }
  (r.ng = r.ng || []).push(e);
  if (simpanDiari()) { roti(msg, khatam ? 'syabas' : null); if (khatam) getar([60, 80, 60]); }
}
function padamNgaji(iso, i) {   // padam satu rekod; jika rekod itu yang terakhir menggerakkan kedudukan khatam, kembalikan kedudukan
  const d = diari(), r = d.hari[iso]; if (!r || !r.ng || !r.ng[i]) return;
  const [g1, g2, gerak, posLama, khatamLama] = r.ng[i];
  if (gerak === 1) {
    const habis = g2 + 1 > JUM_AYAT, posSelepas = habis ? 1 : g2 + 1, khatamSelepas = (khatamLama || 0) + (habis ? 1 : 0);
    if (d.ngaji.pos === posSelepas && (d.ngaji.khatam || 0) === khatamSelepas) { d.ngaji.pos = posLama; d.ngaji.khatam = khatamLama || 0; roti(`Kedudukan khatam dikembalikan ke ${labelAyat(posLama)}.`); }
  }
  r.ng.splice(i, 1); kemasHari(iso);
}
function halPecahan(a, b) {   // bilangan muka surat (pecahan) yang diliputi julat ayat a hingga b
  let jum = 0;
  for (let p = halBagi(a); p <= META.hal.length; p++) {
    const m = META.hal[p - 1], e = akhirHal(p), lo = Math.max(a, m), hi = Math.min(b, e);
    if (lo > hi) break; jum += (hi - lo + 1) / (e - m + 1); if (e >= b) break;
  }
  return jum;
}
function statNgaji(hari = 30) {   // kadar & anggaran khatam dikira daripada bacaan dalam urutan khatam sahaja
  const d = diari(), kini = new Date(), tarikh = i => isoTarikh(new Date(kini.getFullYear(), kini.getMonth(), kini.getDate() - i));
  let hariBaca = 0, hal = 0;
  for (let i = 0; i < hari; i++) {
    const ng = (d.hari[tarikh(i)] || {}).ng || []; if (ng.length) hariBaca++;
    for (const [a, b, gerak] of ng) if (gerak === 1) hal += halPecahan(a, b);
  }
  let streak = 0;
  for (let i = 0; i < 3660; i++) {
    if (((d.hari[tarikh(i)] || {}).ng || []).length) streak++;
    else if (i > 0) break;           // hari ini belum direkod: kira dari semalam
  }
  const pos = d.ngaji.pos || 1, halSehari = hal / hari, baki = Math.round((halPecahan(pos, JUM_AYAT)) * 10) / 10;
  const eta = halSehari > 0.05 ? new Date(kini.getFullYear(), kini.getMonth(), kini.getDate() + Math.ceil(baki / halSehari)) : null;
  return {hariBaca, halSehari, streak, baki, eta};
}

/* Hafalan: item daripada kandungan/hafalan.yaml + surah lain yang ditambah pengguna. Murajaah berjarak. */
const SELANG = [1, 3, 7, 14, 30, 60, 120];
const senaraiHafalan = () => [...(D.hafalan || []), ...diari().tambahan];
const cariHafalan = id => senaraiHafalan().find(x => x.id === id);
function keadaanHafal(x) {
  const r = diari().hafal[x.id] || {}, jum = x.hingga - x.dari + 1, dah = (r.a || []).filter(a => a >= x.dari && a <= x.hingga).length;
  const hafal = r.st === 'hafal';
  return {r, jum, dah, hafal, perlu: hafal && !!r.j && r.j <= hariIniIso(), st: hafal ? 'hafal' : dah ? 'sedang' : 'belum'};
}
function catatHafalan(iso, id, a) {
  const r = rekodHari(iso); r.hf = r.hf || [];
  let e = r.hf.find(z => z.id === id && z.j === 'baru'); if (!e) r.hf.push(e = {id, j: 'baru', a: []});
  if (!e.a.includes(a)) { e.a.push(a); e.a.sort((p, q) => p - q); }
}
function tandaAyatHafal(x, a, on) {
  const d = diari(), r = d.hafal[x.id] || (d.hafal[x.id] = {a: []}), set = new Set(r.a || []), iso = hariIniIso();
  if (on) { set.add(a); catatHafalan(iso, x.id, a); }
  else {
    set.delete(a);
    const hr = d.hari[iso], e = hr && (hr.hf || []).find(z => z.id === x.id && z.j === 'baru');
    if (e) { e.a = e.a.filter(v => v !== a); if (!e.a.length) hr.hf = hr.hf.filter(z => z !== e); kemasHari(iso); }
  }
  r.a = [...set].sort((p, q) => p - q);
  const jum = x.hingga - x.dari + 1, dah = r.a.filter(v => v >= x.dari && v <= x.hingga).length;
  let pesan = null;
  if (dah >= jum && r.st !== 'hafal') {
    r.st = 'hafal'; r.t = r.t || iso; r.n = r.n || 0; if (!r.j) r.j = tambahHari(iso, SELANG[r.n]);
    pesan = `Alhamdulillah, ${x.tajuk} dihafal. Murajaah seterusnya ${fmtIso(r.j)}.`;
  } else if (dah < jum && r.st === 'hafal') r.st = 'sedang';
  bersihRekodHafal(d, x.id);
  if (simpanDiari()) { if (pesan) { roti(pesan, 'syabas'); getar([40, 60, 40]); } else if (on) getar(12); }
}
function bersihRekodHafal(d, id) {   // buang rekod yang tidak lagi menyimpan apa-apa (cth. surah yang hanya didengar)
  const r = d.hafal[id];
  if (r && !(r.a || []).length && r.st !== 'hafal' && !r.t && !r.p && !(r.u && Object.keys(r.u).length)) delete d.hafal[id];
}
function murajaah(x, lancar) {   // jadual hanya maju sekali sehari, dan hanya apabila murajaah sudah tiba masanya
  const d = diari(), r = d.hafal[x.id] || (d.hafal[x.id] = {a: []}), iso = hariIniIso();
  if (r.st !== 'hafal') { r.st = 'hafal'; r.t = r.t || iso; r.a = Array.from({length: x.hingga - x.dari + 1}, (_, i) => x.dari + i); }
  const tiba = !r.j || r.j <= iso, sudah = r.m === iso;
  let pesan;
  if (!lancar) { r.n = 0; r.j = tambahHari(iso, SELANG[0]); pesan = 'Ulang semula esok, insya-Allah.'; }
  else if (tiba && !sudah) { r.n = Math.min((r.n || 0) + 1, SELANG.length - 1); r.j = tambahHari(iso, SELANG[r.n]); pesan = `Murajaah seterusnya: ${fmtIso(r.j)}`; }
  else pesan = `Murajaah direkod. Jadual kekal: ${fmtIso(r.j)}`;
  r.m = iso;
  const h_ = rekodHari(iso); h_.hf = (h_.hf || []).filter(z => !(z.id === x.id && z.j === 'ulang')); h_.hf.push({id: x.id, j: 'ulang', h: lancar ? 'lancar' : 'kurang'});
  if (simpanDiari()) roti(pesan);
}
function labelStatus(k) {
  if (k.hafal) return k.perlu ? ['perlu', 'Murajaah hari ini'] : ['hafal', k.r.j ? `Hafal. Murajaah ${fmtIso(k.r.j)}` : 'Hafal'];
  return k.dah ? ['sedang', `Sedang: ${k.dah} daripada ${k.jum} ayat`] : ['belum', 'Belum mula'];
}

/* ================================================================ skrin Hafalan: AUDIO SAHAJA (grid butang ayat)
   Teks surah tidak dimuatkan (Akta 326; lihat nota akta-326). Setiap ayat ialah butang: sentuh untuk mendengar ayat itu
   (contohnya apabila tersangkut), atau untuk melompat ke ayat itu semasa sesi. Mod: Dengar, Ikut (talaqqi), Uji (sambung ayat). */
const MOD_HAFAL = [
  ['dengar', 'Dengar', 'Qari membaca berturut-turut. Pilih ulangan dan jeda jika mahu.'],
  ['ikut', 'Ikut', 'Qari membaca satu ayat. Selepas bunyi isyarat, ulang ayat itu sementara app senyap.'],
  ['uji', 'Uji', 'Selepas bunyi isyarat, baca ayat seterusnya dari ingatan. Qari kemudian membacanya untuk anda semak. Tersangkut? Tunggu sahaja, atau tekan Seterusnya.'],
];
const modHafal = () => MOD_HAFAL.some(m => m[0] === T.hafalMod) ? T.hafalMod : 'dengar';
/* Mod Selamat (kandungan/dasar.yaml): teks + audio dalam app kurang daripada satu juzuk. Surah "audio: false" dan surah
   tambahan pengguna dijejak sahaja; audionya dibuka dalam Smart Quran yang diperakui KDN. */
const modSelamat = () => !!(D.dasar && D.dasar.modSelamat);
const audioHafal = x => !modSelamat() || (x.audio !== false && x.kumpulan !== 'lain');
const ulangHafal = () => [1, 3, 5, 10].includes(+T.hafalUlang) ? +T.hafalUlang : 1;   // hanya nilai yang ditawarkan UI (tetapan daripada sandaran boleh rosak)
const jedaHafal = () => [0, 3, 6].includes(+T.hafalJeda) ? +T.hafalJeda : 0;
const masaHafal = () => [1, 1.5, 2].includes(+T.hafalMasa) ? +T.hafalMasa : 1.5;
let sentuhHafal = 'main';   // sentuh butang ayat: 'main' (dengar ayat itu) atau 'tanda' (tanda dihafal)
function rujukBaru(r, hari = 30) {   // {ayat: kali} bagi ayat yang dirujuk (didengar semula kerana tersangkut) dalam `hari` hari lepas
  const had = tambahHari(hariIniIso(), -hari), out = {};
  for (const [a, z] of Object.entries((r && r.u) || {})) if (z[1] >= had) out[a] = z[0];
  return out;
}
function catatRujuk(x, a) {
  const d = diari(), r = d.hafal[x.id] || (d.hafal[x.id] = {a: []}), u = r.u || (r.u = {}), z = u[a];
  u[a] = [(z && z[1] >= tambahHari(hariIniIso(), -30) ? z[0] : 0) + 1, hariIniIso()];
  simpanDiari();
}
/* Senarai langkah audio bagi satu sesi. pembuka: Bismillah sebelum ayat 1 (kecuali Al-Fatihah & At-Taubah), atau dalam mod Uji,
   ayat sebelumnya sebagai petunjuk apabila bermula di tengah surah. */
function barisanHafal(x, ayat, mod, pembuka = true) {
  const ulang = mod === 'uji' ? 1 : ulangHafal(), kali = masaHafal(), jeda = mod === 'dengar' ? jedaHafal() * 1000 : 0, out = [];
  if (pembuka && ayat.length) {
    const a0 = ayat[0];
    if (a0 === 1 && x.s !== 1 && x.s !== 9) out.push({s: 1, a: 1, k: -1, pembuka: true, basmalah: true});
    else if (mod === 'uji' && a0 - 1 >= x.dari) out.push({s: x.s, a: a0 - 1, k: -1, pembuka: true});
  }
  ayat.forEach((a, k) => {
    if (mod === 'uji') { out.push({s: x.s, a, k, diam: 'giliran', kali}, {s: x.s, a, k}); return; }
    for (let i = 0; i < ulang; i++) {
      out.push({s: x.s, a, k});
      if (mod === 'ikut') out.push({s: x.s, a, k, diam: 'giliran', kali});
      else if (jeda && !(i === ulang - 1 && k === ayat.length - 1)) out.push({s: x.s, a, k, diam: jeda});
    }
  });
  return out;
}
function mulaSesiHafal(x, ayat, opt = {}) {
  if (!audioHafal(x)) return roti('Audio surah ini dibuka dalam Smart Quran (Mod Selamat).');
  if (!ayat.length) return roti('Semua ayat sudah ditanda dihafal.');
  const mod = modHafal(), ahli = keluarga().aktif, simpanPos = opt.simpanPos !== false;
  AUD.main(barisanHafal(x, ayat, mod, opt.pembuka !== false), {sesi: x.id, mod, tajuk: x.tajuk, hafal: true, jum: ayat.length, ikut: true, ayat: ayat.slice(), simpanPos,
    pos: simpanPos ? a => { if (keluarga().aktif !== ahli) return; const d = diari(), r = d.hafal[x.id] || (d.hafal[x.id] = {a: []}); if (r.p !== a) { r.p = a; simpanDiari(); } } : null,
    tamat: habis => {
      if (!habis || keluarga().aktif !== ahli) return;
      const d = diari(), r = d.hafal[x.id]; if (simpanPos && r && r.p) { delete r.p; bersihRekodHafal(d, x.id); simpanDiari(); }
      roti(`Selesai: ${x.tajuk}.`, 'syabas');
      if (document.body.dataset.skrin === 'hafalan' && !helaiAktif) lukisSemula();
    }});
}
const sesiHafal = x => AUD.opt.sesi === x.id && AUD.senarai.length > 0;
function sesiSemula(x) {   // tetapan/mod berubah semasa sesi: bina semula senarai ayat yang sama dari ayat semasa, kekalkan tetapannya
  if (!sesiHafal(x)) return;
  const kini = AUD.senarai[AUD.i], pertama = AUD.senarai.find(z => !z.pembuka);
  const a = kini && !kini.pembuka ? kini.a : pertama ? pertama.a : x.dari;
  const asal = AUD.opt.ayat && AUD.opt.ayat.length ? AUD.opt.ayat : [], simpanPos = AUD.opt.simpanPos !== false, jalan = !AUD.el.paused;
  const sisa = asal.filter(b => b >= a);
  mulaSesiHafal(x, sisa.length ? sisa : asal, {pembuka: false, simpanPos});
  if (!jalan) AUD.togol(false);
}
const lukisFokus = id => { lukisSemula(); requestAnimationFrame(() => { const el = id && document.getElementById(id); if (el) el.focus({preventScroll: true}); }); };

function kadHafalan(x) {
  const k = keadaanHafal(x), [kls, label] = labelStatus(k), m = META.surah[x.s - 1] || [], penuh = x.dari === 1 && x.hingga === m[2];
  return h('a', {class: 'hf-kad st-' + kls, href: '#/hafalan/' + encodeURIComponent(x.id)},
    h('span', {class: 'hf-ar', lang: 'ar', 'aria-hidden': 'true'}, penuh ? m[1] : ''),
    h('span', {class: 'hf-tx'}, h('b', null, x.tajuk), h('span', null, `${penuh ? `Surah ${x.s}` : `${namaS(x.s)} ${x.s}:${x.dari}${x.hingga > x.dari ? '–' + x.hingga : ''}`}, ${k.jum} ayat${audioHafal(x) ? '' : ', audio dalam Smart Quran'}`),
      h('span', {class: 'hf-st'}, label)),
    h('span', {class: 'hf-cincin', 'aria-hidden': 'true', style: `--p:${Math.round((k.hafal ? 1 : k.dah / k.jum) * 100)}`}));
}
function skrinHafalan(skrin) {
  bar({tajuk: 'Hafalan', sub: subProfil('dengar, ulang dan murajaah'), kembali: '#/'});
  const semua = senaraiHafalan(), k = semua.map(keadaanHafal);
  const hafal = k.filter(x => x.hafal).length, ayatHafal = k.reduce((s, x) => s + (x.hafal ? x.jum : x.dah), 0), ayatJum = k.reduce((s, x) => s + x.jum, 0);
  const perlu = semua.filter((x, i) => k[i].perlu);
  const plK = gambarKonteks('hafalan', 'pelekat-kad kumpulan-kad'), pl = plK || pose(ahliAktif(), perlu.length ? 'fikir' : hafal ? 'syabas' : 'sapa', 'pelekat-kad');
  const kump = [['pilihan', 'Surah pilihan'], ['asas', 'Bacaan asas'], ['lazim', "Surah lazim (Juz 'Amma)"], ['lain', 'Hafalan lain']];
  tambah(skrin,
    h('div', {class: 'kad hf-ringkas' + (pl ? ' ada-pelekat' : '') + (plK ? ' ada-kumpulan' : '')}, pl,
      h('div', {class: 'hf-angka'}, h('b', null, `${hafal}`), h('span', null, `daripada ${semua.length} bacaan dihafal`)),
      h('div', {class: 'prog-ng', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': ayatJum, 'aria-valuenow': ayatHafal, 'aria-label': 'Ayat dihafal'}, h('i', {style: `width:${ayatJum ? (ayatHafal / ayatJum * 100).toFixed(1) : 0}%`})),
      h('p', {class: 'kecil'}, `${ayatHafal} daripada ${ayatJum} ayat.`),
      perlu.length ? frag(h('h3', {class: 'sek-kecil'}, 'Murajaah hari ini'), h('div', {class: 'baris'}, perlu.map(x => h('a', {class: 'cip', href: '#/hafalan/' + encodeURIComponent(x.id)}, x.tajuk))))
        : h('p', {class: 'kecil'}, hafal ? 'Tiada murajaah dijadualkan hari ini.' : 'Pilih surah, dengar ayat demi ayat, dan tanda ayat yang sudah dihafal. App menjadualkan murajaah selepas itu.')),
    kump.map(([id, label]) => {
      const xs = semua.filter(x => (x.kumpulan || 'lain') === id); if (!xs.length) return null;
      const senarai = h('div', {class: 'hf-senarai'}, xs.map(kadHafalan));
      if (id !== 'lazim') return frag(h('h2', {class: 'sek'}, label), senarai);
      const ada = xs.some(x => { const z = keadaanHafal(x); return z.dah || z.hafal || z.r.p || Object.keys(rujukBaru(z.r)).length; });
      return h('details', {class: 'hf-kump', open: ada}, h('summary', null, h('span', null, label), h('span', {class: 'kecil'}, `${xs.length} surah`)), senarai);
    }),
    h('button', {class: 'btn penuh', type: 'button', html: ikon('tambah') + ' Tambah surah lain', onclick: tambahHafalanLain}),
    h('p', {class: 'kecil'}, modSelamat()
      ? 'Mod Selamat: teks dan audio al-Quran dalam app ini berjumlah kurang daripada satu juzuk. Surah panjang dan surah tambahan dijejak di sini (tanda hafal, murajaah, rekod bacaan), manakala audionya didengar dalam aplikasi Smart Quran yang diperakui KDN. '
      : 'Modul ini audio sahaja: setiap surah dipaparkan sebagai butang ayat untuk didengar, diulang dan ditanda. Semak teks dengan mushaf bercetak berlogo KDN atau aplikasi Smart Quran. ',
      h('a', {href: '#/nota/akta-326'}, 'Sebabnya'), '.'));
}
function tambahHafalanLain() {
  const sel = pilihSurah('hf-surah', 67);
  bukaHelai('Tambah surah untuk dihafal', frag(
    h('label', {class: 'lbl', for: 'hf-surah'}, 'Surah'), sel,
    h('p', {class: 'kecil'}, modSelamat() ? 'Surah tambahan dijejak sahaja (tanda hafal, murajaah, rekod bacaan). Dalam Mod Selamat, audionya didengar dalam aplikasi Smart Quran.' : 'Surah dipaparkan sebagai butang ayat dengan audio qari. Teks disemak dengan mushaf atau aplikasi Smart Quran.'),
    h('div', {class: 'tindakan'}, h('button', {class: 'btn utama', type: 'button', onclick: () => {
      const s = +sel.value, d = diari(), id = 's' + s;
      if (senaraiHafalan().some(x => x.s === s && x.dari === 1 && x.hingga === META.surah[s - 1][2])) { tutupHelai(true); location.hash = '#/hafalan/' + (senaraiHafalan().find(x => x.s === s && x.dari === 1).id); return; }
      d.tambahan.push({id, s, dari: 1, hingga: META.surah[s - 1][2], tajuk: META.surah[s - 1][0], kumpulan: 'lain'}); simpanDiari();
      tutupHelai(true); location.hash = '#/hafalan/' + id;
    }}, 'Tambah'))));
}
const SMART_QURAN = /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'https://apps.apple.com/my/app/smart-quran/id1351866913' : 'https://play.google.com/store/apps/details?id=com.madcatworld.qurantestbed';
function skrinHafalanSatu(skrin, id) {
  const x = cariHafalan(id); if (!x) return tiada(skrin);
  const ms = META.surah[x.s - 1] || [], jum = x.hingga - x.dari + 1, g1 = keGlobal(x.s, x.dari), g2 = keGlobal(x.s, x.hingga), h1 = halBagi(g1), h2 = halBagi(g2);
  bar({tajuk: x.tajuk, sub: `${ms[0] === x.tajuk ? '' : ms[0] + ', '}${jum} ayat, juz ${juzBagi(g1)}, muka surat ${h1}${h2 !== h1 ? '–' + h2 : ''}`, kembali: '#/hafalan'});
  const mod = modHafal(), k = keadaanHafal(x), lukis = () => lukisSemula(), bolehAudio = audioHafal(x), modTanda = !bolehAudio || sentuhHafal === 'tanda';
  const ayat = Array.from({length: jum}, (_, i) => x.dari + i), dah = new Set(k.r.a || []);
  const pos = k.r.p >= x.dari && k.r.p <= x.hingga ? k.r.p : x.dari;
  const rj = rujukBaru(k.r);
  const [kls, label] = labelStatus(k);

  const status = h('div', {class: 'kad hf-status st-' + kls},
    h('div', {class: 'hf-angka'}, h('b', null, `${k.hafal ? jum : k.dah}/${jum}`), h('span', null, label)),
    h('div', {class: 'prog-ng', 'aria-hidden': 'true'}, h('i', {style: `width:${((k.hafal ? jum : k.dah) / jum * 100).toFixed(1)}%`})),
    k.hafal ? frag(h('p', {class: 'kecil'}, k.r.t ? `Dihafal ${fmtIso(k.r.t)}.${k.r.m ? ` Murajaah terakhir ${fmtIso(k.r.m)}.` : ''}` : ''),
      h('div', {class: 'tindakan dua'},
        h('button', {class: 'btn utama', type: 'button', html: ikon('semak') + ' Murajaah lancar', onclick: () => { murajaah(x, true); lukis(); }}),
        h('button', {class: 'btn', type: 'button', onclick: () => { murajaah(x, false); lukis(); }}, 'Kurang lancar'))) : null);

  const pilih = (kunci, nilai, pilihan, lbl) => h('div', {class: 'hf-pilih'}, h('span', {class: 'kecil'}, lbl), h('div', {class: 'baris'}, pilihan.map(([v, l]) =>
    h('button', {class: 'cip cip-kecil', id: `${kunci}-${v}`, type: 'button', 'aria-pressed': String(nilai === v), onclick: () => { T[kunci] = v; simpanT(); sesiSemula(x); lukisFokus(`${kunci}-${v}`); }}, l))));
  const modEl = h('section', {class: 'kad hf-mod', 'aria-label': 'Mod dan tetapan audio'},
    h('div', {class: 'seg', role: 'group', 'aria-label': 'Mod'}, MOD_HAFAL.map(([m, l]) =>
      h('button', {type: 'button', id: 'hf-mod-' + m, 'aria-pressed': String(mod === m), onclick: () => { if (mod === m) return; T.hafalMod = m; simpanT(); sesiSemula(x); lukisFokus('hf-mod-' + m); }}, l))),
    h('p', {class: 'kecil hf-nota'}, MOD_HAFAL.find(m => m[0] === mod)[2]),
    mod !== 'uji' ? pilih('hafalUlang', ulangHafal(), [[1, '1×'], [3, '3×'], [5, '5×'], [10, '10×']], 'Ulang setiap ayat') : null,
    mod === 'dengar' ? pilih('hafalJeda', jedaHafal(), [[0, 'Tiada'], [3, '3 saat'], [6, '6 saat']], 'Jeda antara ayat')
      : pilih('hafalMasa', masaHafal(), [[1, 'Sama panjang'], [1.5, '1.5×'], [2, '2×']], 'Masa giliran anda, berbanding bacaan qari'),
    h('button', {class: 'btn utama penuh hf-mula', type: 'button', html: ikon('main') + (pos > x.dari ? ` Sambung dari ayat ${pos}` : ` Mula dari ayat ${x.dari}`), onclick: () => mulaSesiHafal(x, ayat.filter(a => a >= pos))}),
    h('div', {class: 'tindakan dua'},
      pos > x.dari ? h('button', {class: 'btn', type: 'button', onclick: () => mulaSesiHafal(x, ayat)}, `Dari ayat ${x.dari}`) : null,
      h('button', {class: 'btn', type: 'button', disabled: k.hafal || dah.size >= jum, onclick: () => mulaSesiHafal(x, ayat.filter(a => !(dah.has(a) || k.hafal)))}, 'Belum dihafal')));

  // grid butang ayat, dikumpul ikut muka surat Mushaf Madinah (seperti Smart Quran)
  const kelasAyat = a => { const n = rj[a] || 0; return 'ag' + (dah.has(a) || k.hafal ? ' on' : '') + (n ? ' rj' + (n >= 6 ? 3 : n >= 3 ? 2 : 1) : ''); };
  const labelAyat_ = a => `Ayat ${a}${dah.has(a) || k.hafal ? ', sudah dihafal' : ''}${rj[a] ? `, dirujuk ${rj[a]} kali` : ''}`;
  const lemahEl = h('div', {class: 'hf-lemah'});
  const lukisLemah = () => {
    const ls = Object.entries(rj).map(([a, n]) => [+a, n]).filter(([a]) => a >= x.dari && a <= x.hingga).sort((p, q) => q[1] - p[1] || p[0] - q[0]).slice(0, 8);
    lemahEl.replaceChildren();
    if (!ls.length) return;
    tambah(lemahEl, h('h3', {class: 'sek-kecil'}, 'Ayat yang kerap dirujuk (30 hari)'),
      h('div', {class: 'baris'}, ls.map(([a, n]) => h('button', {class: 'cip cip-kecil', type: 'button', onclick: () => AUD.main([{s: x.s, a, k: 0}], {tajuk: x.tajuk, hafal: true})}, `Ayat ${a}, ${n}×`))),
      h('div', {class: 'tindakan dua'},
        h('button', {class: 'btn', type: 'button', html: ikon('main') + ' Ulang ayat-ayat ini', onclick: () => mulaSesiHafal(x, ls.map(z => z[0]).sort((p, q) => p - q), {pembuka: false, simpanPos: false})}),
        h('button', {class: 'btn', type: 'button', onclick: () => { const d = diari(), r = d.hafal[x.id]; if (r) { delete r.u; bersihRekodHafal(d, x.id); simpanDiari(); } lukis(); }}, 'Kosongkan')));
  };
  const sentuhAyat = (a, el) => {
    if (modTanda) { tandaAyatHafal(x, a, !(dah.has(a) || keadaanHafal(x).hafal)); return lukisFokus(`a${x.s}-${a}`); }
    if (sesiHafal(x)) {
      const uji = AUD.opt.mod === 'uji';
      if (!AUD.lompatKe(x.s, a)) { mulaSesiHafal(x, ayat.filter(b => b >= a), {pembuka: false}); if (uji) AUD.lompatKe(x.s, a); }
      if (!uji) return;
    } else AUD.main([{s: x.s, a, k: 0}], {tajuk: x.tajuk, hafal: true, ikut: false});
    catatRujuk(x, a); rj[a] = (rj[a] || 0) + 1;
    el.className = kelasAyat(a) + (el.classList.contains('main') ? ' main' : ''); el.setAttribute('aria-label', labelAyat_(a)); lukisLemah();
  };
  const halAyat = new Map();
  for (const a of ayat) { const p = halBagi(keGlobal(x.s, a)); if (!halAyat.has(p)) halAyat.set(p, []); halAyat.get(p).push(a); }
  const grid = h('div', {class: 'ag-grid' + (modTanda ? ' mod-tanda' : ''), role: 'group', 'aria-label': `Butang ayat ${x.dari} hingga ${x.hingga}`},
    [...halAyat].map(([p, aa]) => h('div', {class: 'ag-hal', role: 'group', 'aria-label': `Muka surat ${p}`},
      h('span', {class: 'ag-m', 'aria-hidden': 'true'}, `m/s ${p}`),
      h('div', {class: 'ag-b'}, aa.map(a => { const el = h('button', {class: kelasAyat(a), id: `a${x.s}-${a}`, type: 'button', 'aria-label': labelAyat_(a),
        'aria-pressed': modTanda ? String(dah.has(a) || k.hafal) : null, onclick: () => sentuhAyat(a, el)}, String(a)); return el; })))));
  if (bolehAudio) lukisLemah();
  const sentuhEl = h('div', {class: 'hf-sentuh'}, h('span', {class: 'kecil'}, 'Sentuh ayat untuk'),
    h('div', {class: 'seg seg-kecil', role: 'group', 'aria-label': 'Tindakan apabila butang ayat disentuh'},
      [['main', 'Dengar'], ['tanda', 'Tanda hafal']].map(([v, l]) => h('button', {type: 'button', id: 'hf-sentuh-' + v, 'aria-pressed': String(sentuhHafal === v), onclick: () => { sentuhHafal = v; lukisFokus('hf-sentuh-' + v); }}, l))));
  const rekodBaca = h('button', {class: 'btn penuh', type: 'button', html: ikon('diari') + ` Rekod bacaan ${x.tajuk} hari ini`, onclick: () => {
    const d = diari(), r = d.hari[hariIniIso()];
    if (r && (r.ng || []).some(([a, b]) => a === g1 && b === g2)) return roti('Bacaan ini sudah direkod hari ini.');
    simpanNgaji(hariIniIso(), g1, g2, false);
  }});
  const semakTeks = h('div', {class: 'kad hf-teks'},
    h('p', null, `Semak teks dengan mushaf bercetak berlogo KDN, muka surat ${h1}${h2 !== h1 ? ' hingga ' + h2 : ''}, atau `, h('a', {href: SMART_QURAN, target: '_blank', rel: 'noopener'}, 'aplikasi Smart Quran'), ' yang diperakui KDN.',
      x.s === 36 ? frag(' Teks Yaasin juga ada dalam app: ', h('a', {href: '#/yaasin'}, 'buka Yaasin'), '.') : null));
  const kereta = h('p', {class: 'kecil hf-kereta', html: ikon('kereta') + '<span>Dalam kereta: butang sebelum/seterusnya pada stereng, skrin kereta atau fon telinga Bluetooth biasanya menukar ayat. Mod Uji berjalan sendiri tanpa perlu menyentuh telefon.</span>'});
  const smartEl = bolehAudio ? null : h('section', {class: 'kad hf-smart'},
    h('h2', {class: 'sek-dalam'}, 'Dengar dalam Smart Quran'),
    h('p', null, `Mod Selamat: Poket hanya memainkan audio yang, bersama teks dalam app, berjumlah kurang daripada satu juzuk. Dengar ${x.tajuk} dalam aplikasi Smart Quran yang diperakui KDN (muka surat ${h1}${h2 !== h1 ? ' hingga ' + h2 : ''}), kemudian tanda ayat yang sudah dihafal di bawah.`),
    h('div', {class: 'tindakan dua'},
      h('a', {class: 'btn utama', href: SMART_QURAN, target: '_blank', rel: 'noopener', html: ikon('dengar') + ' Smart Quran'}),
      h('a', {class: 'btn', href: '#/nota/akta-326'}, 'Kenapa?')));
  tambah(skrin, status, bolehAudio ? [modEl, kereta, sentuhEl] : [smartEl, h('p', {class: 'kecil hf-sentuh-nota'}, 'Sentuh nombor ayat untuk menanda ayat yang sudah dihafal.')], grid, bolehAudio ? lemahEl : null, rekodBaca,
    h('div', {class: 'tindakan dua'},
      h('button', {class: 'btn', type: 'button', html: ikon('semak') + ' Tanda semua', onclick: () => { for (const a of ayat) if (!dah.has(a)) tandaAyatHafal(x, a, true); lukis(); }}),
      h('button', {class: 'btn', type: 'button', html: ikon('muat') + ' Set semula', onclick: () => sahkan(`Padam rekod hafalan ${x.tajuk}?`, () => { if (sesiHafal(x)) AUD.henti(); delete diari().hafal[x.id]; simpanDiari(); lukis(); }, 'Padam rekod')})),
    bolehAudio ? semakTeks : null,
    x.kumpulan === 'lain' ? h('button', {class: 'btn penuh bahaya', type: 'button', html: ikon('buang') + ' Buang daripada senarai', onclick: () => sahkan(`Buang ${x.tajuk} daripada senarai hafalan?`, () => { if (sesiHafal(x)) AUD.henti(); const d = diari(); d.tambahan = d.tambahan.filter(z => z.id !== x.id); delete d.hafal[x.id]; simpanDiari(); location.hash = '#/hafalan'; }, 'Buang')}) : null);
  if (AUD.senarai.length) requestAnimationFrame(() => AUD.serlah(false));
}

/* ================================================================ skrin Diari: kalendar, puasa, mengaji, catatan */
const HARI_PENDEK = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
function skrinDiari(skrin, bulanTeks) {
  const kini = new Date();
  let [y, m] = /^\d{4}-(0[1-9]|1[0-2])$/.test(bulanTeks || '') ? bulanTeks.split('-').map(Number) : [kini.getFullYear(), kini.getMonth() + 1];
  bar({tajuk: 'Diari', sub: subProfil('puasa, mengaji, hafalan dan catatan'), kembali: '#/'});
  const kal = h('section', {class: 'kad kalendar', 'aria-label': 'Kalendar diari'}), ngajiEl = h('section', {class: 'kad kad-ngaji', 'aria-labelledby': 'ng-tajuk'});
  const hafalEl = h('section', {class: 'kad'}), sandaranEl = h('section', {class: 'kad'});
  const ubahBulan = n => {
    m += n; if (m < 1) { m = 12; y--; } else if (m > 12) { m = 1; y++; }
    const baru = `#/diari/${y}-${pad(m)}`; history.replaceState(history.state, '', baru); sejarah[sejarah.length - 1] = baru; hashKini = baru; lukisKal();
  };
  function lukisKal() {
    const d = diari(), pertama = new Date(y, m - 1, 1), bil = new Date(y, m, 0).getDate(), hariIni = hariIniIso();
    const hjA = hijri(pertama), hjB = hijri(new Date(y, m - 1, bil));
    const tajukHj = hjA.m === hjB.m ? `${BULAN_H[hjA.m - 1]} ${hjA.y}H` : `${BULAN_H[hjA.m - 1]}${hjA.y !== hjB.y ? ` ${hjA.y}H` : ''} hingga ${BULAN_H[hjB.m - 1]} ${hjB.y}H`;
    const grid = h('div', {class: 'kal-grid'});
    HARI_PENDEK.forEach((n, i) => tambah(grid, h('div', {class: 'kal-hari' + (i === 1 || i === 4 ? ' sunat' : ''), 'aria-hidden': 'true'}, n)));
    for (let i = 0; i < pertama.getDay(); i++) tambah(grid, h('div', {class: 'kal-sel kosong', 'aria-hidden': 'true'}));
    let bPuasa = 0, bNgaji = 0, bHafal = 0, jakim = true;
    for (let t = 1; t <= bil; t++) {
      const tarikh = new Date(y, m - 1, t), iso = isoTarikh(tarikh), x = d.hari[iso] || {}, sp = statusPuasa(tarikh);
      if (!sp.hj.jakim) jakim = false;
      const ng = (x.ng || []).length, hf = (x.hf || []).length;
      if (x.p) bPuasa++; if (ng) bNgaji++; if (hf) bHafal++;
      const khas = sp.sunat.some(z => z !== 'Isnin' && z !== 'Khamis' && z !== 'Syawal');
      const label = [fmtTarikh(tarikh), fmtHijri(sp.hj), sp.larang ? `Dilarang berpuasa: ${sp.larang}` : '', sp.ramadan ? 'Ramadan' : '', sp.sunat.length ? `Sunat berpuasa: ${sp.sunat.join(', ')}` : '',
        x.p ? 'Berpuasa' : '', ng ? 'Mengaji' : '', hf ? 'Hafalan' : '', x.n ? 'Ada catatan' : ''].filter(Boolean).join('. ');
      tambah(grid, h('button', {class: ['kal-sel', iso === hariIni ? 'hari-ini' : '', sp.larang ? 'larang' : '', khas ? 'khas' : '', sp.ramadan ? 'ramadan' : ''].filter(Boolean).join(' '), type: 'button', 'aria-label': label, 'data-iso': iso, onclick: () => bukaHari(iso)},
        h('span', {class: 'tm'}, t), h('span', {class: 'th' + (sp.hj.d === 1 ? ' awal' : '')}, sp.hj.d),
        h('span', {class: 'titik', 'aria-hidden': 'true'}, x.p ? h('i', {class: 't-puasa'}) : null, ng ? h('i', {class: 't-ngaji'}) : null, hf ? h('i', {class: 't-hafal'}) : null, x.n ? h('i', {class: 't-nota'}) : null)));
    }
    kal.replaceChildren(); tambah(kal,
      h('div', {class: 'kal-kepala'}, ib('kembali', 'Bulan sebelum', () => ubahBulan(-1)),
        h('div', {class: 'kal-tajuk', 'aria-live': 'polite'}, h('b', null, `${BULAN[m - 1]} ${y}`), h('span', null, tajukHj)),
        ib('kanan', 'Bulan berikut', () => ubahBulan(1))),
      grid,
      h('div', {class: 'kal-petunjuk'},
        h('span', null, h('i', {class: 't-puasa'}), 'Puasa'), h('span', null, h('i', {class: 't-ngaji'}), 'Mengaji'), h('span', null, h('i', {class: 't-hafal'}), 'Hafalan'), h('span', null, h('i', {class: 't-nota'}), 'Catatan'),
        h('span', null, h('b', {class: 'p-khas'}), 'Hari sunat khas'), h('span', null, h('b', {class: 'p-larang'}), 'Dilarang berpuasa')),
      h('p', {class: 'kecil'}, `Bulan ini: puasa ${bPuasa} hari, mengaji ${bNgaji} hari, hafalan ${bHafal} hari. Isnin dan Khamis bertanda hijau. Tarikh Hijri ${jakim ? 'ikut takwim JAKIM' : 'ialah anggaran; laraskan dalam Tetapan jika perlu'}. `,
        h('a', {href: '#/nota/puasa-sunat'}, 'Hari puasa sunat'), '.'),
      (y !== kini.getFullYear() || m !== kini.getMonth() + 1) ? h('button', {class: 'btn kecil', type: 'button', onclick: () => { y = kini.getFullYear(); m = kini.getMonth() + 1; ubahBulan(0); }}, 'Kembali ke bulan ini') : null);
  }
  function lukisNgaji() {
    const d = diari(), pos = Math.min(Math.max(d.ngaji.pos || 1, 1), JUM_AYAT), st = statNgaji(30), peratus = (pos - 1) / JUM_AYAT * 100;
    const hariIni = (d.hari[hariIniIso()] || {}).ng || [];
    ngajiEl.replaceChildren(); tambah(ngajiEl,
      h('div', {class: 'ng-atas'}, h('h2', {id: 'ng-tajuk'}, 'Mengaji'), h('button', {class: 'btn kecil', type: 'button', onclick: bukaKedudukan}, 'Ubah kedudukan')),
      h('p', {class: 'ng-pos'}, pose(ahliAktif(), 'tulis', 'pelekat-ngaji') || gambarKonteks('diari', 'pelekat-ngaji kumpulan-ngaji'), h('span', {class: 'kecil'}, d.ngaji.khatam ? `Khatam kali ke-${d.ngaji.khatam + 1}, sambung dari` : 'Sambung dari'), h('b', null, labelAyat(pos)),
        h('span', {class: 'kecil'}, `Juz ${juzBagi(pos)}, muka surat ${halBagi(pos)} (Mushaf Madinah)`)),
      h('div', {class: 'prog-ng', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(peratus), 'aria-label': 'Kemajuan khatam'}, h('i', {style: `width:${peratus.toFixed(1)}%`})),
      h('p', {class: 'kecil'}, `${peratus.toFixed(1)}% ke arah khatam, baki ${st.baki} muka surat. `,
        st.hariBaca ? `30 hari lepas: mengaji ${st.hariBaca} hari, purata ${st.halSehari.toFixed(1)} muka sehari.` : 'Belum ada rekod dalam 30 hari lepas.',
        st.streak > 1 ? ` ${st.streak} hari berturut-turut.` : '', st.eta ? ` Pada kadar ini, khatam sekitar ${fmtTarikh(st.eta)}.` : ''),
      h('div', {class: 'hf-pilih'}, h('span', {class: 'kecil'}, 'Sasaran khatam'), h('div', {class: 'baris'}, [[0, 'Tiada'], [30, '30 hari'], [60, '60 hari'], [90, '90 hari']].map(([n, l]) =>
        h('button', {class: 'cip cip-kecil', type: 'button', 'aria-pressed': String((d.sasaran || 0) === n), onclick: () => { d.sasaran = n; simpanDiari(); lukisNgaji(); }}, l)))),
      d.sasaran ? h('p', {class: 'kecil'}, `Untuk khatam dalam ${d.sasaran} hari dari hari ini: kira-kira ${Math.ceil(st.baki / d.sasaran)} muka surat sehari.`) : null,
      hariIni.length ? h('p', {class: 'kecil'}, `Hari ini: ${hariIni.map(([a, b]) => labelJulat(a, b)).join('; ')}.`) : null,
      h('button', {class: 'btn utama penuh', type: 'button', html: ikon('tambah') + ' Rekod bacaan hari ini', onclick: () => bukaRekodNgaji(hariIniIso())}));
  }
  function lukisHafal() {
    const semua = senaraiHafalan(), k = semua.map(keadaanHafal), perlu = semua.filter((x, i) => k[i].perlu);
    hafalEl.replaceChildren(); tambah(hafalEl, h('h2', {class: 'sek-dalam'}, 'Hafalan'),
      h('p', {class: 'kecil'}, `${k.filter(z => z.hafal).length} daripada ${semua.length} bacaan dihafal. ${perlu.length ? `Murajaah hari ini: ${perlu.map(x => x.tajuk).join(', ')}.` : 'Tiada murajaah hari ini.'}`),
      h('a', {class: 'btn penuh', href: '#/hafalan', html: ikon('hafalan') + ' Buka Hafalan'}));
  }
  function lukisSandaran() {
    const d = diari(), ada = Object.keys(d.hari).length;
    sandaranEl.replaceChildren(); tambah(sandaranEl, h('h2', {class: 'sek-dalam'}, 'Sandaran'),
      h('p', {class: 'kecil'}, `Diari disimpan dalam telefon ini sahaja (${ada} hari direkod${ramai() ? ` untuk ${ahliAktif().nama}` : ''}). Sandaran terakhir: ${SIMPAN.baca('sandaran-terakhir', null) ? fmtIso(SIMPAN.baca('sandaran-terakhir', null)) : 'belum pernah'}. Fail sandaran merangkumi semua ahli keluarga; simpan di Google Drive atau e-mel, terutama sebelum menukar telefon.`),
      h('div', {class: 'tindakan dua'}, h('button', {class: 'btn', type: 'button', html: ikon('kongsi') + ' Simpan', onclick: eksportSandaran}),
        h('button', {class: 'btn', type: 'button', html: ikon('muat') + ' Pulihkan', onclick: importSandaran})));
  }
  kemasDiari = () => { lukisKal(); lukisNgaji(); lukisHafal(); lukisSandaran(); };
  bersihSkrin.push(() => { kemasDiari = null; });
  kemasDiari();
  tambah(skrin, kal, ngajiEl, hafalEl, sandaranEl);
}
function bukaHari(iso) {
  const tarikh = tarikhIso(iso), sp = statusPuasa(tarikh), rekod = () => diari().hari[iso] || {};
  const lepas = () => { kemasHari(iso); if (kemasDiari) kemasDiari(); };
  const info = sp.larang ? h('p', {class: 'hari-info larang'}, `Dilarang berpuasa: ${sp.larang}.`) : sp.ramadan ? h('p', {class: 'hari-info'}, 'Bulan Ramadan.')
    : sp.sunat.length ? h('p', {class: 'hari-info sunat'}, `Sunat berpuasa: ${sp.sunat.join(', ')}.`) : null;
  const puasa = h('div', {class: 'baris', role: 'group', 'aria-label': 'Puasa'});
  // Puasa sunat pada hari Jumaat, Sabtu atau Ahad sahaja: ingatkan supaya disambung dengan hari sebelum atau selepasnya.
  // Tidak dipaparkan jika hari itu sendiri hari sunat (Arafah, Asyura, Ayyamul Bidh, Syawal...), selaras Al-Kafi #563.
  const nasihat = h('p', {class: 'hari-info nasihat', role: 'note', hidden: true});
  const NASIHAT_HARI = {
    5: ['Hari Jumaat: sertakan puasa Khamis atau Sabtu, kerana Nabi ﷺ melarang berpuasa pada hari Jumaat sahaja, kecuali puasa yang biasa dilakukan (Sahih al-Bukhari 1985; Sahih Muslim 1144b). ', 11],
    6: ["Hari Sabtu: dalam mazhab Syafi'i, makruh berpuasa sunat pada hari Sabtu sahaja; sertakan hari Jumaat atau Ahad, kecuali puasa yang biasa dilakukan (Pejabat Mufti WP, Al-Kafi #563). ", 16],
    0: ["Hari Ahad: dalam mazhab Syafi'i, makruh berpuasa sunat pada hari Ahad sahaja; sertakan hari Sabtu atau Isnin, kecuali puasa yang biasa dilakukan (Pejabat Mufti WP, Al-Kafi #563). ", 16],
  };
  const lukisNasihat = () => {
    const dh = diari().hari, sebelah = [-1, 1].some(n => (dh[isoTarikh(new Date(tarikh.getFullYear(), tarikh.getMonth(), tarikh.getDate() + n))] || {}).p);
    const n = NASIHAT_HARI[tarikh.getDay()], tunjuk = !!n && rekod().p === 'sunat' && !sebelah && !sp.ramadan && !sp.larang && !sp.sunat.length;
    nasihat.hidden = !tunjuk; nasihat.replaceChildren();
    if (tunjuk) tambah(nasihat, n[0], h('a', {href: `#/nota/puasa-nabi?b=${n[1]}`}, 'Baca nota'), '.');
  };
  const lukisPuasa = () => { puasa.replaceChildren(); tambah(puasa, [['', 'Tidak berpuasa'], ...JENIS_PUASA].map(([k, l]) =>
    h('button', {class: 'cip', type: 'button', disabled: !!sp.larang && !!k, 'aria-pressed': String((rekod().p || '') === k), onclick: () => { const r = rekodHari(iso); if (k) r.p = k; else delete r.p; lepas(); lukisPuasa(); }}, l))); lukisNasihat(); };
  const ngaji = h('div');
  const lukisNgajiHari = () => { const ng = rekod().ng || []; ngaji.replaceChildren(); tambah(ngaji, ng.length ? h('ul', {class: 'senarai-hari'}, ng.map(([a, b], i) => h('li', null,
    h('span', null, `${labelJulat(a, b)} (muka ${halBagi(a)}${halBagi(b) !== halBagi(a) ? '–' + halBagi(b) : ''})`),
    ib('buang', 'Padam rekod bacaan ini', () => { padamNgaji(iso, i); if (kemasDiari) kemasDiari(); lukisNgajiHari(); })))) : h('p', {class: 'kecil'}, 'Tiada rekod bacaan.'),
    h('button', {class: 'btn kecil', type: 'button', html: ikon('tambah') + ' Tambah bacaan', onclick: () => { simpanCatatan(); bukaRekodNgaji(iso, () => bukaHari(iso)); }})); };
  const hf = rekod().hf || [];
  const hafalan = hf.length ? h('ul', {class: 'senarai-hari'}, hf.map(z => { const x = cariHafalan(z.id); const t = x ? x.tajuk : z.id;
    return h('li', null, z.j === 'baru' ? `Hafalan baharu: ${t}, ayat ${(z.a || []).join(', ')}` : `Murajaah ${t}: ${z.h === 'lancar' ? 'lancar' : 'kurang lancar'}`); })) : h('p', {class: 'kecil'}, 'Tiada rekod hafalan. Hafalan direkod daripada skrin Hafalan.');
  let pemasa = 0;
  const simpanCatatan = () => { clearTimeout(pemasa); const r = rekodHari(iso), v = catatan.value.trim(); if (v) r.n = catatan.value; else delete r.n; lepas(); };
  const catatan = h('textarea', {class: 'medan', rows: 3, id: 'catatan-hari', placeholder: 'Contohnya: tadarus bersama keluarga, niat esok puasa ganti',
    oninput: () => { clearTimeout(pemasa); pemasa = setTimeout(simpanCatatan, 300); }, onchange: simpanCatatan}, rekod().n || '');
  lukisPuasa(); lukisNgajiHari();
  bukaHelai(`${fmtTarikh(tarikh)}`, frag(
    h('p', {class: 'kecil hari-hj'}, fmtHijri(sp.hj) + (sp.hj.jakim ? '' : ' (anggaran)')), info,
    h('h3', {class: 'sek-kecil'}, 'Puasa'), puasa, nasihat,
    h('h3', {class: 'sek-kecil'}, 'Mengaji'), ngaji,
    h('h3', {class: 'sek-kecil'}, 'Hafalan'), hafalan,
    h('label', {class: 'lbl', for: 'catatan-hari'}, 'Catatan'), catatan), {kelas: 'helai-tinggi', onTutup: simpanCatatan});
}
function bukaRekodNgaji(iso, selepas) {
  const d = diari(), pos = Math.min(Math.max(d.ngaji.pos || 1, 1), JUM_AYAT);
  let mod = T.ngajiMod === 'ayat' ? 'ayat' : 'hal';
  const isi = h('div', {class: 'rekod-ngaji'});
  let disentuh = false;
  const gerak = h('input', {type: 'checkbox', class: 'suis', checked: true, 'aria-label': 'Kemas kini kedudukan khatam', onchange: () => { disentuh = true; }});
  function lukis() {
    isi.replaceChildren();
    const pratonton = h('p', {class: 'kecil ng-pratonton', 'aria-live': 'polite'});
    const simpanB = h('button', {class: 'btn utama penuh', type: 'button'}, 'Simpan bacaan');
    let julat = () => null, medan;
    if (mod === 'hal') {
      const p0 = halBagi(pos);
      const dari = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, max: 604, value: p0, id: 'ng-dari'});
      const hingga = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, max: 604, value: p0, id: 'ng-hingga'});
      julat = () => { const a = Math.trunc(+dari.value), b = Math.trunc(+hingga.value); if (!(a >= 1 && b >= a && b <= 604)) return null; return [a === halBagi(pos) ? Math.max(pos, META.hal[a - 1]) : META.hal[a - 1], akhirHal(b)]; };
      medan = frag(h('div', {class: 'dua-medan'}, h('label', {class: 'lbl'}, 'Dari muka surat', dari), h('label', {class: 'lbl'}, 'Hingga muka surat', hingga)),
        h('div', {class: 'baris'}, [1, 2, 5, 10, 20].map(n => h('button', {class: 'cip cip-kecil', type: 'button', onclick: () => { hingga.value = Math.min(604, (Math.trunc(+dari.value) || p0) + n - 1); kira(); }}, `${n} muka`))),
        h('p', {class: 'kecil'}, 'Nombor muka surat ikut Mushaf Madinah (604 muka surat). Jika mushaf anda berbeza, rekod ikut surah dan ayat.'));
      dari.addEventListener('input', kira); hingga.addEventListener('input', kira);
    } else {
      const p = dariGlobal(pos);
      const sDari = pilihSurah('ng-sdari', p.s), aDari = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, value: p.a, 'aria-label': 'Ayat mula'});
      const sHingga = pilihSurah('ng-shingga', p.s), aHingga = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, value: p.a, 'aria-label': 'Ayat akhir'});
      julat = () => {
        const s1 = +sDari.value, a1 = Math.trunc(+aDari.value), s2 = +sHingga.value, a2 = Math.trunc(+aHingga.value);
        if (!(a1 >= 1 && a1 <= META.surah[s1 - 1][2] && a2 >= 1 && a2 <= META.surah[s2 - 1][2])) return null;
        const g1 = keGlobal(s1, a1), g2 = keGlobal(s2, a2); return g2 >= g1 ? [g1, g2] : null;
      };
      medan = frag(h('label', {class: 'lbl', for: 'ng-sdari'}, 'Dari'), h('div', {class: 'surah-ayat'}, sDari, aDari),
        h('label', {class: 'lbl', for: 'ng-shingga'}, 'Hingga'), h('div', {class: 'surah-ayat'}, sHingga, aHingga));
      for (const el of [sDari, aDari, sHingga, aHingga]) el.addEventListener('input', kira);
      sDari.addEventListener('change', () => { aDari.value = 1; kira(); });
      sHingga.addEventListener('change', () => { aHingga.value = META.surah[+sHingga.value - 1][2]; kira(); });
    }
    function kira() {
      const j = julat();
      pratonton.textContent = j ? `${labelJulat(j[0], j[1])}: ${j[1] - j[0] + 1} ayat, muka surat ${halBagi(j[0])}${halBagi(j[1]) !== halBagi(j[0]) ? ' hingga ' + halBagi(j[1]) : ''}.` : 'Julat tidak sah. Semak nombor muka surat atau ayat.';
      simpanB.disabled = !j; if (j && !disentuh) gerak.checked = j[0] <= pos && j[1] >= pos;
    }
    simpanB.addEventListener('click', () => { const j = julat(); if (!j) return; simpanNgaji(iso, j[0], j[1], gerak.checked); tutupHelai(true); if (kemasDiari) kemasDiari(); if (selepas) selepas(); });
    tambah(isi,
      h('p', {class: 'kecil'}, `${fmtTarikh(tarikhIso(iso))}. Kedudukan khatam: ${labelAyat(pos)}, muka surat ${halBagi(pos)}.`),
      h('div', {class: 'baris', role: 'group', 'aria-label': 'Cara merekod'}, [['hal', 'Muka surat'], ['ayat', 'Surah dan ayat']].map(([k, l]) =>
        h('button', {class: 'cip', type: 'button', 'aria-pressed': String(mod === k), onclick: () => { mod = k; T.ngajiMod = k; simpanT(); lukis(); }}, l))),
      medan, pratonton,
      h('label', {class: 'set'}, h('span', {class: 'tx'}, h('b', null, 'Kemas kini kedudukan khatam'), h('span', null, 'Matikan untuk bacaan di luar urutan khatam, contohnya Al-Kahfi pada hari Jumaat.')), gerak),
      simpanB);
    kira();
  }
  lukis();
  bukaHelai('Rekod bacaan al-Quran', isi, {kelas: 'helai-tinggi'});
}
function bukaKedudukan() {
  const d = diari(), p = dariGlobal(Math.min(Math.max(d.ngaji.pos || 1, 1), JUM_AYAT));
  const sS = pilihSurah('kd-surah', p.s), aS = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, value: p.a, id: 'kd-ayat'});
  const kh = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 0, value: d.ngaji.khatam || 0, id: 'kd-khatam'});
  const hal = h('input', {class: 'medan', type: 'number', inputmode: 'numeric', min: 1, max: 604, id: 'kd-hal', placeholder: 'Kosongkan untuk guna surah dan ayat'});
  bukaHelai('Kedudukan bacaan', frag(
    h('p', {class: 'kecil'}, 'Tetapkan ayat seterusnya yang akan dibaca dalam urutan khatam, contohnya apabila mula menggunakan diari ini.'),
    h('label', {class: 'lbl', for: 'kd-surah'}, 'Surah'), sS, h('label', {class: 'lbl', for: 'kd-ayat'}, 'Ayat'), aS,
    h('label', {class: 'lbl', for: 'kd-hal'}, 'Atau mula muka surat (Mushaf Madinah)'), hal,
    h('label', {class: 'lbl', for: 'kd-khatam'}, 'Sudah khatam berapa kali'), kh,
    h('div', {class: 'tindakan'}, h('button', {class: 'btn utama', type: 'button', onclick: () => {
      const s = +sS.value, a = Math.trunc(+aS.value), p = Math.trunc(+hal.value);
      if (hal.value.trim()) { if (!(p >= 1 && p <= 604)) return roti('Muka surat mesti antara 1 dan 604.'); d.ngaji.pos = META.hal[p - 1]; }
      else { if (!(a >= 1 && a <= META.surah[s - 1][2])) return roti(`Surah ${namaS(s)} ada ${META.surah[s - 1][2]} ayat.`); d.ngaji.pos = keGlobal(s, a); }
      d.ngaji.khatam = Math.max(0, Math.trunc(+kh.value) || 0); simpanDiari(); tutupHelai(); if (kemasDiari) kemasDiari();
    }}, 'Simpan'))));
}

/* ================================================================ sandaran data peribadi (fail JSON) */
const KUNCI_ASAS = ['bintang', 'doa-saya', 'majlis-saya', 'arwah', 'terakhir', 'tasbih', 'tetapan', 'keluarga', 'pek', 'bunyi'];
const KUNCI_DIARI = /^diari(-[a-z0-9-]{1,24})?$/;
const SEMAK_SANDARAN = {bintang: Array.isArray, 'doa-saya': Array.isArray, 'majlis-saya': Array.isArray, arwah: Array.isArray, terakhir: objek_, tasbih: objek_, tetapan: objek_, keluarga: objek_, bunyi: objek_};
function kunciPeribadi() {   // kunci data peribadi dalam telefon ini: asas + diari setiap ahli
  const out = new Set([...KUNCI_ASAS, 'diari']);
  try { for (const k of Object.keys(localStorage)) if (k.startsWith('poket-') && KUNCI_DIARI.test(k.slice(6))) out.add(k.slice(6)); } catch (e) {}
  return [...out];
}
async function eksportSandaran() {
  const iso = hariIniIso(), nama = `poket-yaasin-sandaran-${iso}.json`, k = keluarga();
  const data = {bintang: [...BINTANG], arwah: ARWAH, tetapan: T, 'doa-saya': doaSaya(), 'majlis-saya': majlisSaya(), keluarga: k};
  for (const a of k.ahli) data[kunciDiari(a.id)] = diariAhli(a.id);      // diari aktif diambil daripada memori (terkini)
  for (const x of ['terakhir', 'tasbih']) { const v = SIMPAN.baca(x, null); if (v != null) data[x] = v; }
  if (Object.keys(bunyiTelefon()).length) data.bunyi = bunyiTelefon();   // klip bunyi peringatan (rakaman sendiri)
  const pk = pekPeribadi(); if (pk) data.pek = pk;   // pek watak peribadi (imej keluarga) ikut serta: fail sandaran mesti disimpan secara peribadi
  const teks = JSON.stringify({app: 'poket-yaasin', jenis: 'sandaran', v: 2, dibuat: new Date().toISOString(), versi: APP_VERSION, data});
  const tanda = () => { SIMPAN.tulis('sandaran-terakhir', iso); if (kemasDiari) kemasDiari(); };
  try {
    const fail = new File([teks], nama, {type: 'application/json'});
    if (navigator.canShare && navigator.canShare({files: [fail]})) { await navigator.share({files: [fail], title: 'Sandaran Poket Yaasin'}); tanda(); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = h('a', {href: URL.createObjectURL(new Blob([teks], {type: 'application/json'})), download: nama});
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  tanda(); roti('Fail sandaran dimuat turun. Simpan di Google Drive atau e-mel kepada diri sendiri.');
}
function importSandaran() {
  const inp = h('input', {type: 'file', accept: 'application/json,.json', style: 'display:none'});
  inp.addEventListener('change', async () => {
    const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
    try {
      const o = JSON.parse(await f.text());
      if (!o || o.app !== 'poket-yaasin' || o.jenis !== 'sandaran' || !objek_(o.data)) throw new Error('ini bukan fail sandaran Poket Yaasin');
      for (const [k, ok] of Object.entries(SEMAK_SANDARAN)) if (k in o.data && !ok(o.data[k])) throw new Error(`bahagian "${k}" dalam fail rosak`);
      const kunciFail = Object.keys(o.data).filter(k => KUNCI_ASAS.includes(k) || KUNCI_DIARI.test(k));
      for (const k of kunciFail) if (KUNCI_DIARI.test(k)) { if (!objek_(o.data[k])) throw new Error(`bahagian "${k}" dalam fail rosak`); o.data[k] = normalDiari(o.data[k]); }
      if (o.data.keluarga) o.data.keluarga = normalKeluarga(o.data.keluarga);
      if ('pek' in o.data) { const pk = normalPek(o.data.pek); if (pk) o.data.pek = pk; else delete o.data.pek; }
      if ('bunyi' in o.data) { const bn = normalBunyi(o.data.bunyi); if (Object.keys(bn).length) o.data.bunyi = bn; else delete o.data.bunyi; }
      const dt = new Date(o.dibuat), bil = kunciFail.filter(k => KUNCI_DIARI.test(k)).reduce((s, k) => s + Object.keys(o.data[k].hari).length, 0);
      const ahli = o.data.keluarga ? o.data.keluarga.ahli.length : 1;
      sahkan(`Gantikan data dalam telefon ini dengan sandaran ${isNaN(dt) ? 'tanpa tarikh' : fmtTarikh(dt)} (${ahli} ahli, ${bil} hari dalam diari)?`, () => {
        const semua = [...new Set([...kunciPeribadi(), ...kunciFail])], asal = Object.fromEntries(semua.map(k => [k, SIMPAN.baca(k, null)]));
        const gagal = semua.some(k => k in o.data && kunciFail.includes(k) ? !SIMPAN.tulis(k, o.data[k]) : (SIMPAN.buang(k), false));
        if (gagal) {   // storan penuh: kembalikan data asal supaya tidak separuh dipulihkan
          for (const [k, v] of Object.entries(asal)) { if (v == null) SIMPAN.buang(k); else SIMPAN.tulis(k, v); }
          return roti('Storan telefon penuh: sandaran tidak dapat dipulihkan. Data asal dikekalkan.');
        }
        location.reload();
      }, 'Pulihkan');
    } catch (e) { roti('Fail tidak dapat dibaca: ' + e.message); }
  });
  document.body.append(inp); inp.click();
}

/* Baris peribadi untuk widget skrin Utama */
function barisPeribadi() {
  const d = diari(), out = [], perlu = senaraiHafalan().filter(x => keadaanHafal(x).perlu);
  if (perlu.length) out.push(h('a', {class: 'w-sambung w-peribadi', href: '#/hafalan'}, h('span', {class: 'tx'}, h('b', null, ramai() ? `Murajaah hari ini (${ahliAktif().nama})` : 'Murajaah hari ini'),
    h('span', null, perlu.slice(0, 3).map(x => x.tajuk).join(', ') + (perlu.length > 3 ? ` dan ${perlu.length - 3} lagi` : '')))));
  if (d.ngaji.pos > 1 || d.ngaji.khatam || Object.values(d.hari).some(x => (x.ng || []).length)) {
    const dah = ((d.hari[hariIniIso()] || {}).ng || []).length, pos = Math.min(Math.max(d.ngaji.pos || 1, 1), JUM_AYAT);
    out.push(h('a', {class: 'w-sambung w-peribadi', href: '#/diari'}, h('span', {class: 'tx'}, h('b', null, (dah ? 'Mengaji: sudah direkod hari ini' : 'Mengaji') + (ramai() ? ` (${ahliAktif().nama})` : '')),
      h('span', null, `sambung ${labelAyat(pos)}, muka surat ${halBagi(pos)}`))));
  }
  return out;
}

/* ================================================================ Keluarga: profil ahli (nama, gambar) dan kemajuan bersama
   Setiap ahli ada diari & hafalan sendiri. Gambar dikecilkan (240 px) dan disimpan dalam telefon ini sahaja; ia tidak
   dimuat naik ke mana-mana dan tidak termasuk dalam repo awam. */
const WARNA_AHLI = ['#0E5E57', '#2E5F86', '#5A5786', '#8A5F0E', '#2F6B3C', '#8E3B3B'];
const PERANAN = [['abah', 'Bapa'], ['ummi', 'Ibu'], ['anak', 'Anak'], ['atuk', 'Atuk'], ['nenek', 'Nenek'], ['lain', 'Lain-lain']];
let KELUARGA = null;
function normalKeluarga(x) {
  const ahli = (objek_(x) ? senarai_(x.ahli) : []).filter(a => objek_(a) && typeof a.id === 'string' && /^[a-z0-9-]{1,24}$/.test(a.id))
    .map(a => ({id: a.id, nama: String(a.nama || 'Ahli').trim().slice(0, 30) || 'Ahli', peranan: PERANAN.some(p => p[0] === a.peranan) ? a.peranan : 'lain',
      warna: Math.abs(Math.trunc(+a.warna) || 0) % WARNA_AHLI.length, gambar: typeof a.gambar === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(a.gambar) ? a.gambar : null,
      watak: typeof a.watak === 'string' && /^[a-z0-9-]{1,20}$/.test(a.watak) ? a.watak : null}));
  const unik = []; for (const a of ahli) if (!unik.some(b => b.id === a.id)) unik.push(a);
  if (!unik.some(a => a.id === 'utama')) unik.unshift({id: 'utama', nama: 'Saya', peranan: 'lain', warna: 0, gambar: null, watak: null});
  return {nama: objek_(x) && typeof x.nama === 'string' ? x.nama.trim().slice(0, 40) : '', ahli: unik, aktif: objek_(x) && unik.some(a => a.id === x.aktif) ? x.aktif : 'utama'};
}
const keluarga = () => KELUARGA || (KELUARGA = normalKeluarga(SIMPAN.baca('keluarga', null)));
function simpanKeluarga() { if (SIMPAN.tulis('keluarga', KELUARGA)) return true; roti('Storan telefon penuh: profil belum disimpan. Cuba buang gambar atau buat sandaran.'); return false; }
const ahliAktif = () => { const k = keluarga(); return k.ahli.find(a => a.id === k.aktif) || k.ahli[0]; };
const kunciDiari = id => id === 'utama' ? 'diari' : 'diari-' + id;
const ramai = () => keluarga().ahli.length > 1;
const subProfil = teks => ramai() ? `${ahliAktif().nama}: ${teks}` : teks;
function tukarAhli(id) {
  const k = keluarga(); if (!k.ahli.some(a => a.id === id)) return;
  tutupHelai(true);
  if (k.aktif !== id) { k.aktif = id; simpanKeluarga(); DIARI = null; roti(`Profil aktif: ${ahliAktif().nama}`); }
  lukisSemula();
}
/* Pek watak: profil boleh dipautkan kepada watak. Pose dipaparkan ikut konteks: sapa (Utama), fikir (Hafalan: murajaah/ayat
   kerap dirujuk), syabas (berjaya), tulis (Diari), asal (Keluarga). Pek terbina (kandungan/avatar.yaml) sengaja kosong. */
/* Pek watak keluarga PERIBADI: fail JSON (tools/pek.py) yang diimport dalam telefon (Keluarga > Pek watak keluarga).
   Imej sebagai data URL dalam localStorage "poket-pek" dan dalam fail sandaran; TIDAK dalam repo atau GitHub Pages (awam).
   Watak pek peribadi mengatasi watak terbina (D.avatar, kini kosong) yang sama id. */
const POSE_APP = ['asal', 'sapa', 'fikir', 'syabas', 'tulis', 'baca', 'doa', 'ingat'];
const KONTEKS_PEK = ['utama', 'keluarga', 'hafalan', 'diari', 'musafir', 'cari', 'syabas'];
/* Pose yang tiada dalam pek diganti mengikut urutan ini (cth. 'baca' → 'sapa' → 'asal'); pek kecil tetap lengkap. */
const GANTI_POSE = {asal: ['sapa', 'syabas'], sapa: ['asal'], fikir: ['asal'], syabas: ['sapa', 'asal'], tulis: ['fikir', 'asal'], baca: ['sapa', 'asal'], doa: ['sapa', 'asal'], ingat: ['sapa', 'asal']};
let PEK_P = null;
function normalPek(x) {
  const img = v => typeof v === 'string' && v.length < 500000 && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v) ? v : null;
  if (!objek_(x) || x.jenis !== 'pek-watak') return null;
  const watak = senarai_(x.watak).filter(w => objek_(w) && typeof w.id === 'string' && /^[a-z0-9-]{1,20}$/.test(w.id)).map(w => {
    const pose = {}; if (objek_(w.pose)) for (const k of POSE_APP) { const v = img(w.pose[k]); if (v) pose[k] = v; }
    return {id: w.id, nama: String(w.nama || w.id).trim().slice(0, 30) || w.id, peranan: PERANAN.some(p_ => p_[0] === w.peranan) ? w.peranan : 'lain', muka: img(w.muka), pose};
  }).filter((w, i, xs) => (w.muka || w.pose.asal) && xs.findIndex(z => z.id === w.id) === i);
  const ids = new Set(watak.map(w => w.id));
  const kumpulan = senarai_(x.kumpulan).filter(g => objek_(g) && typeof g.id === 'string' && /^[a-z0-9-]{1,20}$/.test(g.id) && img(g.fail))
    .map(g => ({id: g.id, fail: img(g.fail), konteks: senarai_(g.konteks).filter(k => KONTEKS_PEK.includes(k)), ahli: senarai_(g.ahli).filter(a => ids.has(a)), tajuk: String(g.tajuk || '').slice(0, 60)}));
  const bunyi = {}; if (objek_(x.bunyi)) for (const [k] of SLOT_BUNYI) if (klipSah(x.bunyi[k])) bunyi[k] = x.bunyi[k];   // klip peringatan keluarga (pilihan)
  if (!watak.length && !kumpulan.length && !Object.keys(bunyi).length) return null;
  return {jenis: 'pek-watak', v: 1, nama: typeof x.nama === 'string' ? x.nama.trim().slice(0, 40) : '', dibuat: typeof x.dibuat === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.dibuat) ? x.dibuat : '', watak, kumpulan, bunyi};
}
const pekPeribadi = () => { if (PEK_P === null) PEK_P = normalPek(SIMPAN.baca('pek', null)) || false; return PEK_P; };
const PEK = () => {
  const b = D.avatar && Array.isArray(D.avatar.watak) ? D.avatar.watak : [], p = pekPeribadi();
  return p ? [...p.watak, ...b.filter(w => !p.watak.some(z => z.id === w.id))] : b;
};
const srcImej = f => /^data:image\//.test(f) ? f : 'avatar/' + f;
const watakBagi = a => a && a.watak ? PEK().find(w => w.id === a.watak) || null : null;
function pose(a, nama, kelas = '') {
  const w = !a || a.gambar ? null : watakBagi(a), p = w && w.pose;
  const f = p && [nama, ...(GANTI_POSE[nama] || []), 'asal'].map(k => p[k]).find(Boolean);
  return f ? h('img', {class: 'pelekat' + (kelas ? ' ' + kelas : ''), src: srcImej(f), alt: '', 'aria-hidden': 'true', decoding: 'async', draggable: 'false'}) : null;
}
/* Gambar berkumpulan bagi satu konteks; pek peribadi didahulukan. Jika beberapa gambar berkongsi konteks, gambar bertukar
   setiap hari (indeks = bilangan hari sejak 1970, ikut tarikh tempatan), jadi skrin yang sama berbeza dari hari ke hari. */
function gambarKonteks(konteks, kelas = '', kini = new Date()) {
  const ikut = xs => (xs || []).filter(g_ => (g_.konteks || []).includes(konteks));
  let g = ikut((pekPeribadi() || {}).kumpulan); if (!g.length) g = ikut(D.avatar && D.avatar.kumpulan);
  if (!g.length) return null;
  const x = g[Math.floor(Date.UTC(kini.getFullYear(), kini.getMonth(), kini.getDate()) / 864e5) % g.length];
  return h('img', {class: 'pelekat pelekat-kumpulan' + (kelas ? ' ' + kelas : ''), src: srcImej(x.fail), alt: '', 'aria-hidden': 'true', decoding: 'async', draggable: 'false'});
}
function avatar(a, saiz = 40, kelas = '') {
  const awal = String(a.nama || '?').trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  const w = !a.gambar && watakBagi(a), muka = w && (w.muka || (w.pose && w.pose.asal));
  return h('span', {class: 'avatar' + (kelas ? ' ' + kelas : '') + (muka ? ' watak' : ''), style: `--sz:${saiz}px;--wa:${WARNA_AHLI[a.warna || 0]}`, role: 'img', 'aria-label': a.nama},
    a.gambar ? h('img', {src: a.gambar, alt: '', decoding: 'async'}) : muka ? h('img', {src: srcImej(muka), alt: '', decoding: 'async'}) : h('span', {class: 'awal', 'aria-hidden': 'true'}, awal));
}
function pautWatak(w) {   // pautkan watak kepada profil sedia ada atau profil baharu
  const k = keluarga(), pilih = a => {
    const asal = k.ahli.map(b => Object.assign({}, b));   // salinan SEBELUM sebarang perubahan, untuk dikembalikan jika storan penuh
    for (const b of k.ahli) if (b.watak === w.id) b.watak = null;
    a.watak = w.id; a.gambar = null; if (!a.nama || a.nama === 'Saya') a.nama = w.nama;
    if (a.peranan === 'lain' && PERANAN.some(p => p[0] === w.peranan)) a.peranan = w.peranan;
    if (simpanKeluarga()) { tutupHelai(true); roti(a.nama === w.nama ? `Watak ${w.nama} dipautkan.` : `Watak ${w.nama} dipautkan kepada profil ${a.nama}.`, 'sapa'); lukisSemula(); }
    else k.ahli = asal.filter(b => b.id !== baru);   // storan penuh: kembalikan senarai asal
  };
  let baru = null;
  bukaHelai(`Pautkan watak ${w.nama} kepada`, frag(
    h('div', {class: 'pilih-ahli'}, k.ahli.map(a => h('button', {class: 'ahli-b', type: 'button', onclick: () => a.gambar
      ? sahkan(`Gambar profil ${a.nama} akan digantikan dengan watak ${w.nama}. Teruskan?`, () => pilih(a), 'Gantikan gambar') : pilih(a)}, avatar(a, 56), h('span', null, a.nama)))),
    h('div', {class: 'tindakan tengah-baris'}, h('button', {class: 'btn', type: 'button', html: ikon('tambah') + ' Profil baharu', onclick: () => {
      const a = {id: 'a' + Date.now().toString(36), nama: w.nama, peranan: 'lain', warna: k.ahli.length % WARNA_AHLI.length, gambar: null, watak: null};
      baru = a.id; k.ahli.push(a); pilih(a);
    }}))));
}
function bacaGambar(fail) {   // potong segi empat di tengah, 240 × 240, JPEG; dalam telefon sahaja
  return new Promise((ok, tolak) => {
    if (!fail || !/^image\//.test(fail.type)) return tolak(new Error('Fail itu bukan gambar.'));
    const url = URL.createObjectURL(fail), img = new Image();
    img.onload = () => {
      try {
        const s = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas'); c.width = c.height = 240;
        c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 240, 240);
        let q = 0.85, data = c.toDataURL('image/jpeg', q);
        while (data.length > 60000 && q > 0.45) { q -= 0.1; data = c.toDataURL('image/jpeg', q); }
        ok(data);
      } catch (e) { tolak(new Error('Gambar tidak dapat diproses.')); } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); tolak(new Error('Gambar tidak dapat dibaca. Cuba gambar JPEG atau PNG.')); };
    img.src = url;
  });
}
function suntingAhli(id) {
  const k = keluarga(), baru = !id, asal = k.ahli.find(x => x.id === id);
  if (!baru && !asal) return;
  const a = baru ? {id: 'a' + Date.now().toString(36), nama: '', peranan: 'anak', warna: k.ahli.length % WARNA_AHLI.length, gambar: null, watak: null} : Object.assign({}, asal);
  let gambarSimpan = a.gambar;   // gambar yang diganti oleh watak dikembalikan jika watak dinyahpilih
  const pratonton = h('div', {class: 'ahli-pratonton'});
  const lukisP = () => { pratonton.replaceChildren(avatar(a.nama ? a : Object.assign({}, a, {nama: '?'}), 92)); };
  const nama = h('input', {class: 'medan', id: 'ahli-nama', value: a.nama, maxlength: 30, placeholder: 'Contohnya: Baba, Ibu, Along', autocomplete: 'off', oninput: () => { a.nama = nama.value; lukisP(); }});
  const peranan = h('select', {class: 'medan', id: 'ahli-peranan', onchange: () => { a.peranan = peranan.value; }}, PERANAN.map(([v, l]) => h('option', {value: v, selected: a.peranan === v}, l)));
  const fail = h('input', {type: 'file', accept: 'image/*', class: 'sr', id: 'ahli-gambar', tabindex: '-1', onchange: async () => {
    try { a.gambar = gambarSimpan = await bacaGambar(fail.files && fail.files[0]); a.watak = null; lukisP(); lukisWK(); buang.hidden = false; } catch (e) { roti(e.message); } fail.value = '';
  }});
  const buang = h('button', {class: 'btn kecil', type: 'button', hidden: !a.gambar, onclick: () => { a.gambar = gambarSimpan = null; lukisP(); buang.hidden = true; }}, 'Buang gambar');
  const watakEl = PEK().length ? h('div', {class: 'pilih-watak', role: 'group', 'aria-label': 'Watak keluarga'}) : null;
  const lukisWK = () => {
    if (!watakEl) return; watakEl.replaceChildren();
    tambah(watakEl, PEK().map(w => h('button', {class: 'ahli-b' + (a.watak === w.id ? ' aktif' : ''), type: 'button', 'aria-pressed': String(a.watak === w.id), onclick: () => {
      a.watak = a.watak === w.id ? null : w.id;
      if (!a.watak && gambarSimpan) { a.gambar = gambarSimpan; buang.hidden = false; }
      if (a.watak) {
        a.gambar = null; buang.hidden = true;
        if (!a.nama.trim() || a.nama === 'Saya') { a.nama = w.nama; nama.value = w.nama; }
        if (a.peranan === 'lain' && PERANAN.some(p => p[0] === w.peranan)) { a.peranan = w.peranan; peranan.value = w.peranan; }
      }
      lukisWK(); lukisP();
    }}, avatar({nama: w.nama, watak: w.id, warna: a.warna}, 52), h('span', null, w.nama))));
  };
  const warna = h('div', {class: 'baris pilih-warna', role: 'group', 'aria-label': 'Warna latar'});
  const lukisW = () => { warna.replaceChildren(); tambah(warna, WARNA_AHLI.map((w, i) => h('button', {class: 'warna-b', type: 'button', style: `--wa:${w}`, 'aria-label': `Warna ${i + 1}`, 'aria-pressed': String(a.warna === i), onclick: () => { a.warna = i; lukisW(); lukisP(); }}))); };
  lukisP(); lukisW(); lukisWK();
  bukaHelai(baru ? 'Tambah ahli keluarga' : 'Sunting profil', frag(
    pratonton,
    h('div', {class: 'tindakan tengah-baris'}, h('button', {class: 'btn kecil', type: 'button', html: ikon('kamera') + ' Pilih gambar', onclick: () => fail.click()}), buang, fail),
    h('p', {class: 'kecil tengah'}, 'Gambar kekal dalam telefon ini sahaja dan tidak dimuat naik.'),
    watakEl ? frag(h('span', {class: 'lbl'}, 'Atau watak keluarga'), watakEl) : null,
    h('label', {class: 'lbl', for: 'ahli-nama'}, 'Nama panggilan'), nama,
    h('label', {class: 'lbl', for: 'ahli-peranan'}, 'Dalam keluarga'), peranan,
    h('span', {class: 'lbl'}, 'Warna (jika tiada gambar)'), warna,
    h('div', {class: 'tindakan'},
      h('button', {class: 'btn utama', type: 'button', onclick: () => {
        a.nama = a.nama.trim().slice(0, 30); if (!a.nama) { roti('Tulis nama dahulu.'); return nama.focus(); }
        const idx = baru ? k.ahli.length : k.ahli.indexOf(asal);
        const sebelum = k.ahli.map(b => Object.assign({}, b));
        if (baru) k.ahli.push(a); else k.ahli[idx] = a;
        const lain = a.watak ? k.ahli.filter(b => b !== a && b.watak === a.watak) : [];
        for (const b of lain) b.watak = null;   // satu watak untuk satu profil
        if (simpanKeluarga()) { roti(lain.length ? `Profil disimpan. Watak dipindahkan daripada ${lain.map(b => b.nama).join(', ')}.` : baru ? `${a.nama} ditambah` : 'Profil disimpan'); lukisSemula(); }
        else k.ahli = sebelum;   // storan penuh: batalkan perubahan dalam memori
      }}, baru ? 'Tambah' : 'Simpan'),
      !baru && a.id !== 'utama' ? h('button', {class: 'btn bahaya', type: 'button', onclick: () => sahkan(`Padam profil ${a.nama} serta diari dan rekod hafalannya dalam telefon ini?`, () => {
        k.ahli = k.ahli.filter(x => x.id !== a.id); SIMPAN.buang(kunciDiari(a.id));
        if (k.aktif === a.id) { k.aktif = 'utama'; DIARI = null; }
        simpanKeluarga(); lukisSemula();
      }, 'Padam profil')}, 'Padam') : null)), {kelas: 'helai-tinggi'});
}
function bukaPilihAhli() {
  const k = keluarga();
  bukaHelai('Siapa yang menggunakan app?', frag(
    h('div', {class: 'pilih-ahli'}, k.ahli.map(a => h('button', {class: 'ahli-b' + (a.id === k.aktif ? ' aktif' : ''), type: 'button', 'aria-pressed': String(a.id === k.aktif), onclick: () => tukarAhli(a.id)},
      avatar(a, 64), h('span', null, a.nama)))),
    h('p', {class: 'kecil tengah'}, 'Diari, rekod mengaji dan hafalan disimpan berasingan bagi setiap ahli.'),
    h('div', {class: 'tindakan tengah-baris'}, h('a', {class: 'btn', href: '#/keluarga', html: ikon('keluarga') + ' Urus keluarga'}),
      h('button', {class: 'btn', type: 'button', html: ikon('tambah') + ' Tambah ahli', onclick: () => suntingAhli(null)}))));
}
function diariAhli(id) { return id === keluarga().aktif ? diari() : normalDiari(SIMPAN.baca(kunciDiari(id), {})); }
function statAhli(id, hari = 7) {
  const d = diariAhli(id), kini = new Date(), iniIso = hariIniIso();
  let puasa = 0, muka = 0, hariNgaji = 0; const baru = new Set();
  for (let i = 0; i < hari; i++) {
    const r = d.hari[isoTarikh(new Date(kini.getFullYear(), kini.getMonth(), kini.getDate() - i))]; if (!r) continue;
    if (r.p) puasa++; if ((r.ng || []).length) hariNgaji++;
    for (const [a, b] of r.ng || []) muka += halPecahan(a, b);
    for (const z of r.hf || []) if (z.j === 'baru') baru.add(z.id);
  }
  const semua = [...(D.hafalan || []), ...d.tambahan];
  const hafal = semua.filter(x => (d.hafal[x.id] || {}).st === 'hafal').length;
  const perlu = semua.filter(x => { const r = d.hafal[x.id]; return r && r.st === 'hafal' && r.j && r.j <= iniIso; }).length;
  return {puasa, muka, hariNgaji, baru: baru.size, hafal, perlu, khatam: d.ngaji.khatam, pos: d.ngaji.pos};
}
/* Import pek watak peribadi: simpan, kemudian pautkan setiap watak kepada profil (id watak sama, nama sama, profil
   "Saya" untuk watak pertama) atau cipta profil baharu. Profil yang ada gambar sendiri tidak diubah. */
function pautPek(p, milik) {   // milik: id watak bagi profil telefon ini (profil 'utama'), dipilih dalam tanyaMilik
  const k = keluarga(); let dipaut = 0, baru = 0;
  const u = k.ahli.find(z => z.id === 'utama'), wm = milik && p.watak.find(w => w.id === milik);
  if (wm && u && !u.watak && !k.ahli.some(a => a.watak === wm.id)) {
    u.watak = wm.id; u.gambar = null; if (!u.nama.trim() || u.nama === 'Saya') u.nama = wm.nama;
    if (u.peranan === 'lain') u.peranan = wm.peranan; dipaut++;
  }
  p.watak.forEach((w, i) => {
    if (k.ahli.some(a => a.watak === w.id)) return;
    const a = k.ahli.find(z => !z.watak && !z.gambar && z.nama.trim().toLowerCase() === w.nama.toLowerCase());
    if (a) { a.watak = w.id; if (a.peranan === 'lain') a.peranan = w.peranan; dipaut++; }
    else { k.ahli.push({id: 'a' + Date.now().toString(36) + i, nama: w.nama, peranan: w.peranan, warna: k.ahli.length % WARNA_AHLI.length, gambar: null, watak: w.id}); baru++; }
  });
  if (!k.nama && p.nama) k.nama = p.nama;
  return {dipaut, baru};
}
function importPek() {
  const inp = h('input', {type: 'file', accept: '.json,application/json', class: 'sr', tabindex: '-1'});
  inp.addEventListener('change', async () => {
    const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
    try {
      if (f.size > 3 * 1024 * 1024) throw new Error('fail terlalu besar (had 3 MB)');
      const p = normalPek(JSON.parse(await f.text()));
      if (!p) throw new Error('bukan pek watak Poket Yaasin');
      const kSebelum = JSON.parse(JSON.stringify(keluarga()));
      if (!SIMPAN.tulis('pek', p)) return roti('Storan telefon penuh: pek tidak dapat disimpan. Buat sandaran, kemudian kosongkan ruang.');
      PEK_P = p;
      const siap = milik => {
        const r = pautPek(p, milik);
        if (!simpanKeluarga()) { KELUARGA = normalKeluarga(kSebelum); lukisSemula(); return; }
        const nb = Object.keys(p.bunyi || {}).length;
        roti(`Pek dipasang: ${p.watak.length} watak, ${p.kumpulan.length} gambar keluarga${nb ? `, ${nb} klip bunyi` : ''}${r.baru ? `, ${r.baru} profil baharu` : ''}.`, 'sapa');
        lukisSemula();
      };
      // Pek yang sama diimport di setiap telefon keluarga: tanya profil telefon ini milik siapa, kecuali namanya sudah sepadan dengan watak.
      const k = keluarga(), u = k.ahli.find(z => z.id === 'utama'), bebas = p.watak.filter(w => !k.ahli.some(a => a.watak === w.id));
      if (u && !u.watak && bebas.length && !bebas.some(w => w.nama.toLowerCase() === u.nama.trim().toLowerCase())) tanyaMilik(bebas, u, siap);
      else siap(null);
    } catch (e) { roti('Pek tidak dapat dibaca: ' + e.message); }
  });
  document.body.append(inp); inp.click();
}
function tanyaMilik(senarai, u, siap) {
  let selesai = false;
  const pilih = id => { if (selesai) return; selesai = true; tutupHelai(true); siap(id); };
  bukaHelai('Telefon ini milik siapa?', frag(
    h('p', {class: 'kecil'}, `Profil ${u.nama} di telefon ini akan memakai watak yang dipilih${u.gambar ? ', dan gambar profilnya diganti' : ''}. Watak lain menjadi profil ahli keluarga.`),
    h('div', {class: 'pilih-watak pilih-milik', role: 'group', 'aria-label': 'Watak keluarga'}, senarai.map(w => h('button', {class: 'ahli-b', type: 'button', onclick: () => pilih(w.id)},
      avatar({nama: w.nama, watak: w.id, warna: u.warna}, 58), h('span', null, w.nama)))),
    h('div', {class: 'tindakan'}, h('button', {class: 'btn', type: 'button', onclick: () => pilih(null)}, 'Bukan dalam senarai'))),
    {onTutup: () => { if (!selesai) { selesai = true; siap(null); } }});
}
function buangPek() {
  sahkan('Buang pek watak keluarga daripada telefon ini? Profil dan rekod kekal; muka watak diganti huruf awal.', () => {
    SIMPAN.buang('pek'); PEK_P = false; roti('Pek watak dibuang daripada telefon ini.'); lukisSemula();
  }, 'Buang pek');
}
function skrinKeluarga(skrin) {
  const k = keluarga();
  bar({tajuk: 'Keluarga', sub: k.nama || 'Profil dan kemajuan bersama', kembali: '#/'});
  const st = k.ahli.map(a => [a, statAhli(a.id)]);
  const jum = st.reduce((s, [, x]) => ({muka: s.muka + x.muka, puasa: s.puasa + x.puasa, baru: s.baru + x.baru}), {muka: 0, puasa: 0, baru: 0});
  const namaK = h('input', {class: 'medan', id: 'nama-keluarga', value: k.nama, maxlength: 40, placeholder: 'Contohnya: Keluarga Ahmad', autocomplete: 'off',
    onchange: () => { k.nama = namaK.value.trim().slice(0, 40); simpanKeluarga(); bar({tajuk: 'Keluarga', sub: k.nama || 'Profil dan kemajuan bersama', kembali: '#/'}); }});
  const chip = (n, label) => n ? h('span', {class: 'cip cip-kecil'}, label) : null;
  const belum = PEK().filter(w => !k.ahli.some(a => a.watak === w.id)), pek = pekPeribadi();
  tambah(skrin,
    h('div', {class: 'kad keluarga-atas'},
      gambarKonteks('keluarga', 'kumpulan-keluarga'),
      h('div', {class: 'barisan-ahli'}, k.ahli.map(a => { const pl = pose(a, 'asal', 'pelekat-ahli');
        return h('button', {class: 'ahli-b' + (a.id === k.aktif ? ' aktif' : '') + (pl ? ' ada-pelekat' : ''), type: 'button', 'aria-pressed': String(a.id === k.aktif), 'aria-label': `Guna profil ${a.nama}`, onclick: () => tukarAhli(a.id)},
          pl || avatar(a, 58), h('span', null, a.nama)); })),
      h('label', {class: 'lbl', for: 'nama-keluarga'}, 'Nama keluarga (dipaparkan di skrin Utama)'), namaK),
    h('h2', {class: 'sek'}, '7 hari lepas'),
    (() => { const ada = jum.muka || jum.puasa || jum.baru, g = ada ? gambarKonteks('syabas', 'kumpulan-syabas') : null;
      return h('div', {class: 'papan-bersama' + (g ? ' ada-gambar' : '')}, h('p', {class: 'kecil'}, ada ? `Bersama: mengaji ${jum.muka.toFixed(1)} muka surat, berpuasa ${jum.puasa} hari, ${jum.baru} bacaan baharu dihafal.` : 'Belum ada rekod minggu ini. Mula dengan menanda bacaan atau puasa dalam Diari.'), g); })(),
    h('div', {class: 'senarai-ahli'}, st.map(([a, x]) => h('section', {class: 'kad ahli-kad' + (a.id === k.aktif ? ' aktif' : '')},
      h('div', {class: 'ahli-atas'}, avatar(a, 52),
        h('div', {class: 'ahli-tx'}, h('b', null, a.nama), h('span', null, (PERANAN.find(p => p[0] === a.peranan) || [, ''])[1] + (a.id === k.aktif ? ', sedang digunakan' : ''))),
        ib('sunting', `Sunting profil ${a.nama}`, () => suntingAhli(a.id))),
      h('div', {class: 'baris'},
        chip(x.hariNgaji, `Mengaji ${x.hariNgaji} hari, ${x.muka.toFixed(1)} muka`), chip(x.puasa, `Puasa ${x.puasa} hari`),
        chip(x.hafal, `${x.hafal} bacaan dihafal`), chip(x.baru, `${x.baru} baharu minggu ini`), chip(x.khatam, `Khatam ${x.khatam} kali`),
        x.perlu ? h('span', {class: 'cip cip-kecil perlu'}, `Murajaah ${x.perlu} hari ini`) : null,
        !x.hariNgaji && !x.puasa && !x.hafal ? h('span', {class: 'kecil'}, 'Belum ada rekod.') : null),
      a.id !== k.aktif ? h('button', {class: 'btn kecil', type: 'button', onclick: () => tukarAhli(a.id)}, `Guna profil ${a.nama}`) : null))),
    h('button', {class: 'btn penuh', type: 'button', html: ikon('tambah') + ' Tambah ahli keluarga', onclick: () => suntingAhli(null)}),
    belum.length ? h('section', {class: 'kad watak-baru'}, h('h2', {class: 'sek-dalam'}, 'Watak keluarga'),
      h('p', {class: 'kecil'}, 'Watak ini belum dipautkan kepada mana-mana profil. Selepas dipautkan, avatar dan posenya muncul di skrin Utama, Hafalan dan Diari.'),
      h('div', {class: 'baris'}, belum.map(w => h('button', {class: 'btn', type: 'button', onclick: () => pautWatak(w)}, avatar({nama: w.nama, watak: w.id, warna: 0}, 30), `Pautkan ${w.nama}`)))) : null,
    h('section', {class: 'kad pek-kad'}, h('h2', {class: 'sek-dalam'}, 'Pek watak keluarga'),
      pek ? h('p', {class: 'kecil'}, `${pek.nama || 'Pek peribadi'}: ${pek.watak.length} watak, ${pek.kumpulan.length} gambar keluarga${Object.keys(pek.bunyi || {}).length ? `, ${Object.keys(pek.bunyi).length} klip bunyi peringatan` : ''}${pek.dibuat ? `, dibina ${fmtIso(pek.dibuat)}` : ''}. Disimpan dalam telefon ini sahaja dan dalam fail sandaran.`)
        : h('p', {class: 'kecil'}, 'Import fail pek (.json) yang mengandungi muka dan gambar keluarga. Imej disimpan dalam telefon ini sahaja; ia tidak dimuat naik dan tidak berada dalam repo app.'),
      h('div', {class: 'tindakan dua'},
        h('button', {class: 'btn', type: 'button', html: ikon('muat') + (pek ? ' Tukar pek' : ' Import pek'), onclick: importPek}),
        pek ? h('button', {class: 'btn bahaya', type: 'button', onclick: buangPek}, 'Buang pek') : null)),
    h('p', {class: 'kecil'}, 'Profil, gambar dan rekod setiap ahli disimpan dalam telefon ini sahaja, dan termasuk dalam fail sandaran. Telefon lain mempunyai senarai keluarga sendiri; rekod tidak diselaraskan antara telefon.'));
}

/* ================================================================ pasang app (PWA) di skrin utama telefon
   Chrome/Edge/Samsung Internet (Android) memberi acara beforeinstallprompt beberapa saat selepas laman dibuka; komponen
   yang dipaparkan sebelum itu dikemas kini apabila acara tiba (pendengarPasang). iPhone/iPad: tiada acara, jadi tunjuk
   langkah Kongsi > Tambah ke Skrin Utama. Dalam pelayar WhatsApp, pengguna perlu membuka dalam Chrome/Safari dahulu. */
let pasangAcara = null;
const pendengarPasang = new Set();
const kemasPasang = () => pendengarPasang.forEach(f => { try { f(); } catch (e) {} });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); pasangAcara = e; kemasPasang(); });
window.addEventListener('appinstalled', () => { pasangAcara = null; roti('Poket Yaasin dipasang. Buka dari ikonnya di skrin utama.'); kemasPasang(); });
const appDipasang = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; } };
const perantiIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
async function mulaPasang() {
  const p = pasangAcara; if (!p) return;
  pasangAcara = null;   // acara hanya boleh dipakai sekali
  try { p.prompt(); await p.userChoice; } catch (e) {}
  kemasPasang();
}
const langkahPasang = () => perantiIOS()
  ? h('ol', {class: 'langkah-pasang'}, h('li', null, 'Buka app ini dalam Safari. Jika dibuka dari WhatsApp, tekan "Buka dalam Safari" dahulu.'),
      h('li', null, 'Tekan butang Kongsi ', h('span', {class: 'ik-kongsi', html: ikon('kongsiIos')}), ' di bawah skrin (di atas pada iPad).'),
      h('li', null, 'Pilih "Tambah ke Skrin Utama" (Add to Home Screen), kemudian "Tambah".'))
  : h('ol', {class: 'langkah-pasang'}, h('li', null, 'Buka app ini dalam Chrome. Jika dibuka dari WhatsApp, pilih "Buka dalam Chrome" dahulu.'),
      h('li', null, 'Tekan menu ⋮ di penjuru kanan atas.'), h('li', null, 'Pilih "Pasang aplikasi" atau "Tambah ke skrin utama".'));
function kadPasang() {
  const el = h('section', {class: 'kad kad-pasang'});
  const lukis = () => {
    const sudah = appDipasang(); el.replaceChildren();
    tambah(el, h('div', {class: 'pasang-atas'}, h('img', {class: 'pasang-ikon', src: 'img/icon-192.png', alt: '', width: 48, height: 48}),
      h('span', {class: 'tx'}, h('b', null, sudah ? 'App dipasang di skrin utama' : 'Pasang di skrin utama'),
        h('span', null, sudah ? 'Anda sedang menggunakan app daripada ikonnya.' : 'Buka seperti app biasa terus dari ikon, dan guna tanpa internet.'))));
    if (!sudah) tambah(el, pasangAcara ? h('button', {class: 'btn utama penuh', type: 'button', html: ikon('tambah') + ' Pasang app', onclick: mulaPasang}) : langkahPasang());
  };
  pendengarPasang.add(lukis); bersihSkrin.push(() => pendengarPasang.delete(lukis));
  lukis(); return el;
}
function bannerPasang() {   // skrin Utama: cadangan pasang yang boleh ditutup (14 hari)
  if (appDipasang() || Date.now() - (+SIMPAN.baca('pasang-nanti', 0) || 0) < 14 * 864e5) return null;
  const el = h('div', {class: 'pasang-rumah'});
  const lukis = () => {
    el.hidden = appDipasang() || !(pasangAcara || perantiIOS()); el.replaceChildren(); if (el.hidden) return;
    tambah(el, h('img', {class: 'pasang-ikon', src: 'img/icon-192.png', alt: '', width: 40, height: 40}),
      h('span', {class: 'tx'}, h('b', null, 'Pasang app ini'), h('span', null, 'Ikon di skrin utama')),
      pasangAcara ? h('button', {class: 'btn kecil utama', type: 'button', onclick: mulaPasang}, 'Pasang') : h('a', {class: 'btn kecil', href: '#/tetapan'}, 'Caranya'),
      h('button', {class: 'ib', type: 'button', 'aria-label': 'Tutup cadangan pasang', html: ikon('tutup'), onclick: () => { SIMPAN.tulis('pasang-nanti', Date.now()); el.remove(); }}));
  };
  pendengarPasang.add(lukis); bersihSkrin.push(() => pendengarPasang.delete(lukis));
  lukis(); return el;
}

/* ================================================================ Tetapan */
function pasangTema() {
  const r = document.documentElement;
  if (T.tema === 'malam' || T.tema === 'cerah') r.dataset.tema = T.tema; else delete r.dataset.tema;
  const gelap = T.tema === 'malam' || (T.tema !== 'cerah' && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]'); if (m) m.content = gelap ? '#0F1F1D' : '#0A3F3B';
}
function skrinTetapan(skrin) {
  bar({tajuk: 'Tetapan', kembali: '#/'});
  const suis = (k, label, desc) => h('label', {class: 'set'}, h('span', {class: 'tx'}, h('b', null, label), desc ? h('span', null, desc) : null),
    h('input', {type: 'checkbox', class: 'suis', checked: !!T[k], onchange: e => { T[k] = e.target.checked; simpanT(); }}));
  const tema = h('div', {class: 'baris', role: 'group', 'aria-label': 'Tema'}, [['auto', 'Ikut telefon'], ['cerah', 'Cerah'], ['malam', 'Malam']].map(([k, l]) =>
    h('button', {class: 'cip', type: 'button', 'aria-pressed': String(T.tema === k), onclick: () => { T.tema = k; simpanT(); pasangTema(); lukisSemula(); }}, l)));
  const contoh = h('p', {class: 'ar contoh', lang: 'ar'}, 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ');
  const nilai = h('span', {class: 'kecil'}, `${Math.round(T.skala * 100)}%`);
  const saiz = h('input', {type: 'range', min: '0.8', max: '1.7', step: '0.05', value: String(T.skala), 'aria-label': 'Saiz tulisan Arab',
    oninput: e => { T.skala = +e.target.value; document.documentElement.style.setProperty('--skala', T.skala); nilai.textContent = `${Math.round(T.skala * 100)}%`; simpanT(); }});
  const qari = h('select', {class: 'medan', id: 'qari', onchange: e => { T.qari = e.target.value; simpanT(); }}, QARI.map(([k, l]) => h('option', {value: k, selected: T.qari === k}, l)));
  const hjT = h('b'), hjS = h('span'); const lukisHj = () => {
    const jk = hijriJakim(new Date());
    hjT.textContent = `${fmtHijri(hijri())}${!jk && +T.hijri ? ` (pelarasan ${T.hijri > 0 ? '+' : ''}${T.hijri} hari)` : ''}`;
    hjS.textContent = jk ? `Mengikut takwim JAKIM dalam data waktu solat zon ${T.zon}. Pelarasan di bawah hanya dipakai apabila data itu tiada.` : 'Laraskan jika tarikh berbeza dengan pengumuman rasmi di negeri anda.';
  };
  const hjB = d => h('button', {class: 'btn kecil', type: 'button', onclick: () => { T.hijri = Math.max(-2, Math.min(2, (+T.hijri || 0) + d)); simpanT(); lukisHj(); }}, d > 0 ? '+1 hari' : '−1 hari');
  lukisHj();
  tambah(skrin, kadPasang(),
    h('h2', {class: 'sek'}, 'Paparan'),
    h('div', {class: 'set set-blok'}, h('span', {class: 'tx'}, h('b', null, 'Tema')), tema),
    h('div', {class: 'set set-blok'}, h('span', {class: 'tx'}, h('b', null, 'Saiz tulisan Arab'), nilai), saiz, contoh),
    suis('makna', 'Terjemahan dan makna', 'Terjemahan ayat (Basmeih) dan maksud doa'),
    suis('frasa', 'Makna per frasa', 'Setiap frasa doa diikuti maknanya'),
    suis('rumi', 'Rumi untuk doa', 'Bantuan sebutan. Ayat al-Quran tidak diberi Rumi.'),
    suis('perkata', 'Makna perkataan', 'Grid perkataan di bawah setiap ayat'),
    h('h2', {class: 'sek'}, 'Audio'),
    h('label', {class: 'lbl', for: 'qari'}, 'Qari'), qari,
    suis('ikut', 'Ikut ayat yang dibaca', 'Skrin bergerak mengikut audio'),
    h('h2', {class: 'sek'}, 'Tarikh Hijri'),
    h('div', {class: 'set set-blok'}, h('span', {class: 'tx'}, hjT, hjS), h('div', {class: 'baris'}, hjB(-1), hjB(1))),
    h('h2', {class: 'sek'}, 'Waktu solat'),
    h('a', {class: 'nota-k', href: '#/solat'}, h('b', null, T.zon && ZON.has(T.zon) ? `Zon ${T.zon}, ${ZON.get(T.zon).negeri}` : 'Pilih zon waktu solat'),
      h('span', null, T.zon && ZON.has(T.zon) ? `${ZON.get(T.zon).daerah}. Peringatan ${T.peringatan ? `${+T.minitAwal || 10} minit sebelum waktu` : 'dimatikan'}.` : 'Untuk waktu solat JAKIM dan peringatan sebelum masuk waktu.')),
    h('h2', {class: 'sek'}, 'App'),
    h('div', {class: 'senarai-tindakan'},
      h('a', {class: 'nota-k', href: '#/nota/tentang'}, h('b', null, 'Tentang app ini'), h('span', null, 'Apa yang disemak dan apa yang masih draf')),
      h('a', {class: 'nota-k', href: '#/nota/sumber-lesen'}, h('b', null, 'Sumber data dan lesen'), h('span', null, 'Teks, terjemahan, audio, hadis, fon')),
      h('a', {class: 'nota-k', href: '#/rujukan'}, h('b', null, 'Senarai rujukan'), h('span', null, 'Laman mufti, JAKIM, KDN dan kitab hadis yang dipetik')),
      h('button', {class: 'btn penuh', type: 'button', html: ikon('info') + ' Penafian', onclick: () => bukaPenafian(false)}),
      h('button', {class: 'btn penuh', type: 'button', html: ikon('kongsi') + ' Simpan sandaran data peribadi', onclick: eksportSandaran}),
      h('button', {class: 'btn penuh', type: 'button', html: ikon('muat') + ' Pulihkan daripada fail sandaran', onclick: importSandaran}),
      h('button', {class: 'btn penuh', type: 'button', html: ikon('lapor') + ' Lapor masalah atau cadangan', onclick: () => lapor('Masalah umum', 'umum')}),
      h('button', {class: 'btn penuh bahaya', type: 'button', html: ikon('buang') + ' Padam semua data dalam telefon ini', onclick: () => sahkan('Padam tetapan, doa disimpan, Doa Saya, Majlis saya, nama arwah, diari, rekod hafalan, profil keluarga dan pek watak? Buat sandaran dahulu jika perlu.', () => {
        try { Object.keys(localStorage).filter(k => k.startsWith('poket-')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
        location.reload();
      }, 'Padam semua')})),
    h('p', {class: 'kecil versi'}, `Versi ${APP_VERSION}. Data dibina ${D.dibina || '-'} (${D.kod || '-'}).`));
}

/* ================================================================ lapor kesilapan */
function lapor(apa, kunci) {
  const teks = `Perkara: ${apa}\nRujukan: ${kunci}\nVersi: ${APP_VERSION}, data ${D.dibina || ''} (${D.kod || ''})\n\nApa yang salah:\n\n\nCadangan pembetulan (jika ada):\n`;
  const url = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent('Semakan: ' + apa)}&body=${encodeURIComponent(teks)}`;
  bukaHelai('Lapor kesilapan', frag(
    h('p', null, 'Terima kasih. Laporan anda membantu semakan kandungan oleh guru.'),
    h('div', {class: 'tindakan'},
      h('a', {class: 'btn utama', href: url, target: '_blank', rel: 'noopener'}, 'Buka borang GitHub'),
      h('button', {class: 'btn', type: 'button', onclick: () => salin(teks, 'Teks laporan disalin. Hantar melalui WhatsApp atau e-mel.')}, 'Salin teks laporan'))));
}

/* ================================================================ versi baharu & service worker */
async function semakVersi() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), {cache: 'no-store'}); if (!r.ok) return;
    const j = await r.json();
    if (j && j.v && j.v !== APP_VERSION && !$('#kemaskini')) {
      document.body.append(h('div', {id: 'kemaskini', class: 'kemaskini', role: 'status'}, h('span', null, 'Versi baharu Poket Yaasin tersedia.'),
        h('button', {type: 'button', onclick: async () => { try { const g = await navigator.serviceWorker?.getRegistration(); if (g) await g.update(); } catch (e) {} location.reload(); }}, 'Muat semula')));
    }
  } catch (e) {}
}

/* ================================================================ mula */
function mula() {
  for (const d of D.doa) {   // indeks carian: tambah teks ayat bagi doa al-Quran
    let c = d._c || d.tj;
    for (const b of d.b) if (b.q) for (const x of parseSpec(b.q)) { const A = D.ayat[`${x.s}:${x.a}`]; if (A) c += ' ' + A.w.slice(x.f - 1, x.t || A.w.length).join(' '); }
    d._c = normal(c);
  }
  pasangTema(); document.documentElement.style.setProperty('--skala', T.skala);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', pasangTema);
  document.addEventListener('click', e => {
    const w = e.target.closest('.w[data-k], .pk[data-k]'); if (w) { bukaKata(w.dataset.k, w.dataset.i); return; }
    const ta = e.target.closest('.tanda-ayat, .ref-q'); if (ta) { e.preventDefault(); bukaAyat(ta.dataset.ayat, ta.dataset.sebab); return; }
    const fr = e.target.closest('.ar .fr'); if (fr && fr.dataset.fr) bukaFrasa(fr);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && helaiAktif) { tutupHelai(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.ar .fr')) { e.preventDefault(); bukaFrasa(e.target); }
  });
  window.addEventListener('hashchange', hala);
  hala();
  setTimeout(semakVersi, 4000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { semakVersi(); segarWaktu(); semakPeringatan(); } });
  window.addEventListener('online', () => segarWaktu());
  setTimeout(() => { segarWaktu(); semakPeringatan(); }, 1500);
  setInterval(semakPeringatan, 30000);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && typeof e.data.ke === 'string' && e.data.ke.startsWith('#/')) location.hash = e.data.ke; });
  }
  if (!SIMPAN.baca('penafian', null)) setTimeout(() => { if (!helaiAktif && !pentasAktif) bukaPenafian(true); }, 700);
}
mula();
