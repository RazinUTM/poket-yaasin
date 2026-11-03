// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Ahmad Razin Zainal Abidin and Universiti Teknologi Malaysia
//
// Usrati (dahulu Poket Yaasin): Ringkasan AI (Cloudflare Worker, satu fail, tiada pakej luar).
// App menghantar {soalan, kod, negeri}; Worker bertanya Claude dengan web search yang DIHADKAN kepada laman mufti
// dan JAKIM (senarai di bawah = kandungan/laman.yaml; tools/bina.py gagal jika berbeza), kemudian memulangkan
// ringkasan <= 150 perkataan dengan nombor rujukan dan senarai sumber.
//
// Rahsia (Cloudflare: Settings > Variables and Secrets, jenis "Secret"):
//   ANTHROPIC_API_KEY  kunci API daripada Claude Console (JANGAN letak dalam kod atau repo)
//   KOD_KELUARGA       kod laluan yang dimasukkan dalam Tetapan app setiap ahli keluarga
// Pilihan (jenis "Text"): MODEL (lalai claude-haiku-5-5), ASAL (lalai https://razinutm.github.io)
//
// Peraturan kandungan (CLAUDE.md): AI hanya meringkaskan laman yang dicari; tiada teks ayat, hadis atau doa
// (tulisan Arab dibuang secara mekanikal di bawah); tiada sumber -> "tiada jawapan", bukan rekaan.

const DOMAIN = [
  'muftiwp.gov.my', 'e-smaf.islam.gov.my', 'mufti.johor.gov.my', 'mufti.kedah.gov.my', 'mufti.kelantan.gov.my',
  'muftimelaka.gov.my', 'muftins.gov.my', 'mufti.pahang.gov.my', 'mufti.perak.gov.my', 'muftiperlis.gov.my',
  'mufti.penang.gov.my', 'mufti.sabah.gov.my', 'muftiselangor.gov.my',
];

const ARAHAN = `Anda pembantu carian dalam app Usrati untuk keluarga Muslim di Malaysia.
Tugas: jawab soalan agama secara ringkas BERDASARKAN HASIL CARIAN laman mufti dan JAKIM sahaja.
Peraturan:
1. Sentiasa guna alat carian dahulu. Tulis hanya apa yang disokong oleh hasil carian; jangan tambah daripada ingatan sendiri.
2. Bahasa Melayu mudah untuk warga emas, paling banyak 150 perkataan, satu hingga tiga perenggan pendek. Tiada tajuk, tiada senarai panjang.
3. Jangan tulis teks Arab, ayat al-Quran, lafaz hadis atau lafaz doa, sama ada dalam tulisan Arab atau Rumi. Sebut rujukannya sahaja, contohnya "Surah al-Baqarah ayat 183" atau "hadis riwayat Muslim".
4. Jangan petik lebih 15 perkataan berturut-turut daripada sumber; ringkaskan dengan kata-kata sendiri.
5. Jika sumber berbeza pandangan (contohnya antara negeri), nyatakan secara adil dan sebut pejabat mufti masing-masing.
6. Jangan beri fatwa sendiri dan jangan janjikan pahala atau dosa secara pasti. Untuk kes peribadi (nikah cerai, faraid, hutang, kesihatan), cadangkan merujuk pejabat agama atau mufti negeri.
7. Jika hasil carian tidak menjawab soalan, tulis tepat satu perkataan: TIADA_SUMBER`;

const ARAB = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+(?:[\s‌‍]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+)*/g;

function jawab(status, data, asal) {
  return new Response(data == null ? null : JSON.stringify(data), {status, headers: {
    'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': asal,
    'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', 'vary': 'origin', 'cache-control': 'no-store'}});
}
function samaRahsia(a, b) {   // banding masa malar
  a = String(a || ''); b = String(b || '');
  let beza = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) beza |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return beza === 0 && b.length > 0;
}
const dibenar = url => { try { const h = new URL(url).hostname.toLowerCase(); return DOMAIN.some(d => h === d || h.endsWith('.' + d)); } catch (e) { return false; } };

// Tukar respons Messages API kepada {teks, sumber, bacaan}. (Tiada eksport bernama: Cloudflare hanya menerima
// pengendali lalai; tests/worker.mjs mendedahkan fungsi ini sendiri.)
function olah(resp) {
  const sumber = [], indeks = new Map(), bacaan = new Map();
  let teks = '';
  for (const b of resp.content || []) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) if (r && r.url && dibenar(r.url) && !bacaan.has(r.url)) bacaan.set(r.url, String(r.title || r.url).slice(0, 160));
    } else if (b.type === 'text') {
      let t = String(b.text || '');
      const n = [];
      for (const c of b.citations || []) {
        if (!c || !c.url || !dibenar(c.url)) continue;
        if (!indeks.has(c.url)) { indeks.set(c.url, sumber.length + 1); sumber.push({n: sumber.length + 1, url: c.url, tajuk: String(c.title || c.url).slice(0, 160)}); }
        const k = indeks.get(c.url); if (!n.includes(k)) n.push(k);
      }
      if (n.length) t = t.replace(/\s+$/, '') + ' ' + n.map(k => `[${k}]`).join('') + (/\s$/.test(t) ? ' ' : '');
      teks += t;
    }
  }
  teks = teks.replace(ARAB, '').replace(/[ \t]+([.,;:])/g, '$1').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const tiada = !sumber.length || /TIADA_SUMBER/.test(teks);
  return {
    teks: tiada ? '' : teks,
    tiada,
    sumber: tiada ? [] : sumber,
    bacaan: [...bacaan].filter(([u]) => !indeks.has(u)).slice(0, 6).map(([url, tajuk]) => ({url, tajuk})),
  };
}

export default {
  async fetch(req, env) {
    const asal = env.ASAL || 'https://razinutm.github.io';
    if (req.method === 'OPTIONS') return jawab(204, null, asal);
    if (req.method !== 'POST') return jawab(405, {ralat: 'Guna POST.'}, asal);
    const dari = req.headers.get('origin');
    if (dari && dari !== asal) return jawab(403, {ralat: 'Asal tidak dibenarkan.'}, asal);
    let m; try { m = await req.json(); } catch (e) { return jawab(400, {ralat: 'Permintaan tidak sah.'}, asal); }
    if (!samaRahsia(m && m.kod, env.KOD_KELUARGA)) return jawab(401, {ralat: 'Kod keluarga salah.'}, asal);
    const soalan = String(m.soalan || '').replace(/\s+/g, ' ').trim();
    if (soalan.length < 3 || soalan.length > 300) return jawab(400, {ralat: 'Soalan perlu 3 hingga 300 aksara.'}, asal);
    const negeri = String(m.negeri || '').replace(/[^A-Za-z ]/g, '').slice(0, 30);
    if (!env.ANTHROPIC_API_KEY) return jawab(500, {ralat: 'Kunci API belum ditetapkan dalam Worker.'}, asal);

    const badan = {
      model: env.MODEL || 'claude-haiku-5-5',
      max_tokens: 900,
      system: ARAHAN + (negeri ? `\nPengguna tinggal di negeri ${negeri}; utamakan pejabat mufti negeri itu jika ada hasilnya.` : ''),
      tools: [{type: 'web_search_20250305', name: 'web_search', max_uses: 3, allowed_domains: DOMAIN,
        user_location: {type: 'approximate', country: 'MY', timezone: 'Asia/Kuala_Lumpur'}}],
      messages: [{role: 'user', content: soalan}],
    };
    let r;
    try {
      r = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', body: JSON.stringify(badan), headers: {
        'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01'}});
    } catch (e) { return jawab(502, {ralat: 'Tidak dapat menghubungi Claude.'}, asal); }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return jawab(502, {ralat: 'Claude menolak permintaan.', butiran: String((data.error && data.error.message) || r.status).slice(0, 300)}, asal);
    const u = data.usage || {};
    return jawab(200, {...olah(data), model: data.model || badan.model,
      guna: {carian: (u.server_tool_use && u.server_tool_use.web_search_requests) || 0, masuk: u.input_tokens || 0, keluar: u.output_tokens || 0}}, asal);
  },
};
