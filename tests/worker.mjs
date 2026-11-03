// Ujian Worker Ringkasan AI dengan fetch tiruan (tiada panggilan sebenar ke Claude). node tests/worker.mjs
import {readFileSync} from 'node:fs';
// Muat Worker sebagai modul data: dengan eksport tambahan olah() untuk ujian sahaja
const sumberW = readFileSync(new URL('../pelayan/ringkasan-ai.js', import.meta.url), 'utf8').replace('export default {', 'export {olah};\nexport default {');
const {default: W, olah} = await import('data:text/javascript,' + encodeURIComponent(sumberW));

let gagal = 0;
const semak = (ok, msg) => { console.log((ok ? '  ok   ' : '  GAGAL ') + msg); if (!ok) gagal++; };
const ASAL = 'https://razinutm.github.io';
const env = {ANTHROPIC_API_KEY: 'sk-ujian', KOD_KELUARGA: 'kod-rahsia-123'};
const minta = (badan, o = {}) => new Request('https://contoh.workers.dev/', {method: o.method || 'POST',
  headers: {'content-type': 'application/json', origin: o.origin || ASAL}, body: o.method === 'OPTIONS' ? undefined : JSON.stringify(badan)});

const RESP = {
  model: 'claude-haiku-5-5',
  usage: {input_tokens: 5200, output_tokens: 240, server_tool_use: {web_search_requests: 2}},
  content: [
    {type: 'server_tool_use', id: 's1', name: 'web_search', input: {query: 'puasa sunat hari jumaat'}},
    {type: 'web_search_tool_result', tool_use_id: 's1', content: [
      {type: 'web_search_result', url: 'https://muftiwp.gov.my/artikel/irsyad-hukum/1', title: 'Irsyad Hukum: Puasa Jumaat'},
      {type: 'web_search_result', url: 'https://muftiselangor.gov.my/fatwa/2', title: 'Fatwa Selangor'},
      {type: 'web_search_result', url: 'https://contoh-luar.com/x', title: 'Laman luar'}]},
    {type: 'text', text: 'Berdasarkan hasil carian, '},
    {type: 'text', text: 'makruh berpuasa sunat pada hari Jumaat sahaja tanpa sehari sebelum atau selepasnya', citations: [
      {type: 'web_search_result_location', url: 'https://muftiwp.gov.my/artikel/irsyad-hukum/1', title: 'Irsyad Hukum: Puasa Jumaat', cited_text: '...'},
      {type: 'web_search_result_location', url: 'https://contoh-luar.com/x', title: 'Laman luar', cited_text: '...'}]},
    {type: 'text', text: '. Dalilnya hadis لا يصوم أحدكم يوم الجمعة riwayat Bukhari.'},
  ],
};

let dihantar = null;
globalThis.fetch = async (url, o) => { dihantar = {url, o, badan: JSON.parse(o.body)}; return new Response(JSON.stringify(RESP), {status: 200}); };

let r = await W.fetch(minta(null, {method: 'OPTIONS'}), env);
semak(r.status === 204 && r.headers.get('access-control-allow-origin') === ASAL, 'Preflight CORS hanya untuk laman app');
r = await W.fetch(minta({soalan: 'puasa jumaat', kod: 'salah'}), env);
semak(r.status === 401 && !dihantar, 'Kod keluarga salah ditolak tanpa memanggil Claude');
r = await W.fetch(minta({soalan: 'puasa jumaat', kod: env.KOD_KELUARGA}, {origin: 'https://jahat.example'}), env);
semak(r.status === 403 && !dihantar, 'Asal lain ditolak');
r = await W.fetch(minta({soalan: 'x', kod: env.KOD_KELUARGA}), env);
semak(r.status === 400, 'Soalan terlalu pendek ditolak');
r = await W.fetch(minta({soalan: 'puasa jumaat', kod: env.KOD_KELUARGA}), {KOD_KELUARGA: env.KOD_KELUARGA});
semak(r.status === 500 && !dihantar, 'Tanpa kunci API: ralat jelas');

r = await W.fetch(minta({soalan: 'boleh ke puasa sunat hari jumaat?', kod: env.KOD_KELUARGA, negeri: 'Johor<script>'}), env);
const j = await r.json();
const t = dihantar && dihantar.badan.tools[0];
semak(dihantar && dihantar.url === 'https://api.anthropic.com/v1/messages' && dihantar.o.headers['x-api-key'] === 'sk-ujian', 'Kunci API dihantar dari Worker sahaja');
semak(t && t.type === 'web_search_20250305' && t.max_uses === 3 && t.allowed_domains.includes('muftiwp.gov.my') && !t.allowed_domains.some(d => /google|wikipedia/.test(d)), 'Carian web dihadkan kepada domain mufti, maksimum 3 carian');
semak(dihantar.badan.system.includes('TIADA_SUMBER') && dihantar.badan.system.includes('negeri Johorscript') && !dihantar.badan.system.includes('<'), 'Arahan sistem: peraturan sumber, negeri disanitasi');
semak(r.status === 200 && j.teks.includes('hari Jumaat sahaja') && j.teks.includes('[1]'), 'Ringkasan dengan nombor rujukan');
semak(!/[؀-ۿ]/.test(j.teks) && j.teks.includes('riwayat Bukhari'), 'Tulisan Arab dibuang daripada ringkasan, rujukan kekal');
semak(j.sumber.length === 1 && j.sumber[0].url.includes('muftiwp.gov.my'), 'Sumber luar senarai mufti tidak dipaparkan');
semak(j.bacaan.length === 1 && j.bacaan[0].url.includes('muftiselangor'), 'Bacaan lanjut: hasil carian mufti lain yang belum dipetik');
semak(j.guna.carian === 2 && j.guna.masuk === 5200, 'Penggunaan token dan carian dilaporkan');

const kosong = olah({content: [{type: 'text', text: 'TIADA_SUMBER'}]});
semak(kosong.tiada && kosong.teks === '' && !kosong.sumber.length, 'TIADA_SUMBER: tiada ringkasan direka');
const tanpaPetik = olah({content: [{type: 'text', text: 'Jawapan tanpa rujukan.'}]});
semak(tanpaPetik.tiada, 'Jawapan tanpa petikan sumber dianggap tiada jawapan');

globalThis.fetch = async () => new Response(JSON.stringify({error: {message: 'model not found'}}), {status: 404});
r = await W.fetch(minta({soalan: 'puasa jumaat', kod: env.KOD_KELUARGA}), env);
const e = await r.json();
semak(r.status === 502 && e.butiran.includes('model not found'), 'Ralat API diteruskan dengan butiran');

// pause_turn: Worker menyambung giliran dan menggabungkan kandungan
{
  let n = 0, badanKedua = null;
  globalThis.fetch = async (url, o) => {
    n++;
    if (n === 1) return new Response(JSON.stringify({stop_reason: 'pause_turn', usage: {input_tokens: 100, output_tokens: 10, server_tool_use: {web_search_requests: 1}},
      content: [{type: 'server_tool_use', id: 's1', name: 'web_search', input: {query: 'x'}}, {type: 'web_search_tool_result', tool_use_id: 's1', content: [{type: 'web_search_result', url: 'https://muftiwp.gov.my/a', title: 'A'}]}]}), {status: 200});
    badanKedua = JSON.parse(o.body);
    return new Response(JSON.stringify({stop_reason: 'end_turn', usage: {input_tokens: 200, output_tokens: 50},
      content: [{type: 'text', text: 'Jawapan disambung', citations: [{type: 'web_search_result_location', url: 'https://muftiwp.gov.my/a', title: 'A'}]}]}), {status: 200});
  };
  const r2 = await W.fetch(minta({soalan: 'puasa jumaat', kod: env.KOD_KELUARGA}), env);
  const j2 = await r2.json();
  semak(n === 2 && badanKedua.messages.length === 2 && badanKedua.messages[1].role === 'assistant' && j2.teks.includes('[1]') && j2.guna.carian === 1 && j2.guna.masuk === 300 && j2.diag.sambung, 'pause_turn: giliran disambung, kandungan dan penggunaan digabung');
  globalThis.fetch = async () => new Response(JSON.stringify({stop_reason: 'end_turn', content: [{type: 'text', text: 'Jawapan tanpa petikan langsung.'}]}), {status: 200});
  const j3 = await (await W.fetch(minta({soalan: 'puasa jumaat', kod: env.KOD_KELUARGA}), env)).json();
  semak(j3.tiada && j3.diag.mentah.includes('tanpa petikan') && j3.diag.henti === 'end_turn', 'Diagnosis: teks mentah dan sebab berhenti dilaporkan apabila tiada ringkasan');
}

console.log(gagal ? `\n${gagal} semakan gagal` : '\nSemua semakan Worker lulus');
process.exit(gagal ? 1 : 0);
