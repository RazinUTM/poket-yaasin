// Jana ikon app Usrati (أسرتي, fon Aref Ruqaa; bukan petikan ayat) dengan bingkai bintang lapan. node tools/ikon.cjs
// Keluaran terus ke docs/img/. Perlu Playwright (sama seperti tests/asap.cjs).
const {chromium} = require('playwright'); const path = require('path');
const F = path.join(__dirname, '..', 'docs', 'fonts'), OUT = path.join(__dirname, '..', 'docs', 'img');
const html = (s, skala, fon) => `<!doctype html><html><head><style>
@font-face{font-family:R;src:url(file://${F}/aref-ruqaa-700.woff2)}@font-face{font-family:A;src:url(file://${F}/amiri-700.woff2)}
html,body{margin:0;width:${s}px;height:${s}px;background:#0A3F3B;overflow:hidden}
svg{position:absolute;inset:0}
.t{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:${fon};color:#D9B45E;font-size:${s*(s<64?0.46:fon==='R'?0.29:0.27)*skala}px;line-height:1;padding-top:${s*0.035*skala}px}
</style></head><body>
${s<64?"":`<svg width="${s}" height="${s}" viewBox="0 0 512 512"><g transform="translate(256 256) scale(${skala}) translate(-256 -256)" fill="none" stroke="#B48A2C" stroke-opacity=".75" stroke-width="5">
<circle cx="256" cy="256" r="196" stroke-opacity=".35" stroke-width="3"/><rect x="96" y="96" width="320" height="320" rx="4"/><rect x="96" y="96" width="320" height="320" rx="4" transform="rotate(45 256 256)"/></g></svg>`}
<div class="t" dir="rtl" lang="ar">أسرتي</div></body></html>`;
(async () => {
  const b = await chromium.launch();
  for (const fon of ['R']) for (const [nama, s, skala] of [['icon-512', 512, 1], ['icon-192', 192, 1], ['icon-180', 180, 1], ['favicon-32', 32, 1], ['icon-maskable-512', 512, 0.78]]) {
    const pg = await b.newPage({viewport: {width: s, height: s}});
    const tmp = path.join(require('os').tmpdir(), 'ikon-usrati.html'); require('fs').writeFileSync(tmp, html(s, skala, fon)); await pg.goto('file://' + tmp); await pg.evaluate(async () => { await document.fonts.load('40px R', 'أسرتي'); await document.fonts.load('40px A', 'أسرتي'); await document.fonts.ready; }); await pg.waitForTimeout(150);
    await pg.screenshot({path: path.join(OUT, `${nama}.png`)}); await pg.close();
  }
  await b.close();
})();
