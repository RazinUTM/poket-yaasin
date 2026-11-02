/* Ujian asap (smoke test) Poket Yaasin dengan Playwright.
     node tests/asap.cjs            # lebar telefon 390 px, mod cerah + gelap, luar talian
     node tests/asap.cjs --gambar   # simpan tangkapan skrin dalam tests/gambar/
   Perlu: npm i -D playwright && npx playwright install chromium (sekali sahaja).
   Pelayan statik dimulakan sendiri pada port rawak untuk folder docs/. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const DOCS = path.join(__dirname, '..', 'docs');
const GAMBAR = process.argv.includes('--gambar') ? path.join(__dirname, 'gambar') : null;
const JENIS = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain'};

function pelayan() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(DOCS, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
      if (!f.startsWith(DOCS) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
      res.writeHead(200, {'Content-Type': JENIS[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res);
    }).listen(0, '127.0.0.1', () => ok(s));
  });
}

/* Audio qari tiruan: fail WAV senyap 1 saat (pelayan EveryAyah/quran.com tidak dapat dicapai dari persekitaran ujian). */
function wavTiruan(saat) {
  const kadar = 8000, n = kadar * saat, b = Buffer.alloc(44 + n, 128);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(kadar, 24); b.writeUInt32LE(kadar, 28); b.writeUInt16LE(1, 32); b.writeUInt16LE(8, 34); b.write('data', 36); b.writeUInt32LE(n, 40); return b;
}
const audioTiruan = ctx => ctx.route(/everyayah\.com|verses\.quran\.com|audio\.qurancdn\.com/, r => r.fulfill({body: wavTiruan(1), headers: {'Content-Type': 'audio/wav', 'Access-Control-Allow-Origin': '*'}}));

/* API waktu solat tidak dapat dicapai dari persekitaran ujian: jawapan tiruan dengan waktu tetap (bentuk sama seperti api.waktusolat.app/v2). */
const pad = n => String(n).padStart(2, '0');
function bulanTiruan(zon, y, m) {
  const hari = new Date(Date.UTC(y, m, 0)).getUTCDate(), ts = (d, j, mn) => Math.floor(Date.UTC(y, m - 1, d, j - 8, mn) / 1000);
  const f = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC'});
  const hj = d => { const p = {}; for (const x of f.formatToParts(new Date(Date.UTC(y, m - 1, d)))) p[x.type] = x.value; return `${p.year}-${pad(p.month)}-${pad(p.day)}`; };
  return {zone: zon, year: y, month: 'X', month_number: m, last_updated: null, prayers: Array.from({length: hari}, (_, i) => { const d = i + 1;
    return {day: d, hijri: hj(d), imsak: ts(d, 5, 38), fajr: ts(d, 5, 48), syuruk: ts(d, 6, 56), dhuha: ts(d, 7, 21), dhuhr: ts(d, 13, 0), asr: ts(d, 16, 20), maghrib: ts(d, 18, 58), isha: ts(d, 20, 9)}; })};
}
async function apiTiruan(ctx, gagal) {
  let panggilan = 0;
  await ctx.route('https://api.waktusolat.app/**', route => {
    panggilan++; if (gagal) return route.abort();
    const u = new URL(route.request().url()), y = +u.searchParams.get('year'), m = +u.searchParams.get('month');
    const zon = u.pathname.includes('/gps/') ? 'WLY01' : u.pathname.split('/').pop();
    return route.fulfill({json: bulanTiruan(zon, y, m), headers: {'Access-Control-Allow-Origin': '*'}});
  });
  return () => panggilan;
}

const LALUAN = ['#/', '#/yaasin', '#/tahlil', '#/susunan/tahlil-arwah', '#/susunan/yaasin', '#/susunan/nisfu-syaaban', '#/doa', '#/doa?k=alam', '#/doa?q=hujan',
  '#/doa/doa-arwah', '#/doa/doa-selepas-yaasin', '#/doa/musibah', '#/doa/q-rabbana-atina', '#/doa/doa-nisfu-syaaban', '#/doa/petir', '#/doa/qunut-nazilah',
  '#/majlis', '#/majlis/t/tahlil-yaasin', '#/majlis/t/tahlil-yaasin/teks', '#/majlis/t/perkahwinan', '#/nota', '#/nota/rumi', '#/nota/tahlil', '#/nota/penafian', '#/nota/waktu-solat', '#/tetapan', '#/doa/baru',
  '#/solat', '#/tasbih', '#/rujukan', '#/doa?k=saya', '#/doa?cari=1', '#/hafalan', '#/hafalan/kafirun', '#/hafalan/alaq', '#/hafalan/kursi',
  '#/diari', '#/diari/2027-03', '#/diari/2026-13', '#/nota/puasa-sunat', '#/keluarga', '#/hafalan/kahfi', '#/tiada-laluan',
  '#/cari', '#/cari?q=anak%20demam', '#/cari?q=waktu%20asar', '#/cari?q=puasa%20sunat', '#/nota/puasa-sunat?b=3', '#/tasbih?doa=selawat-pendek',
  '#/nota/solat-sunat', '#/nota/amalan-harian', '#/nota/selawat', '#/doa/selawat-tafrijiyah', '#/tasbih?doa=selawat-tafrijiyah',
  '#/nota/puasa-nabi', '#/nota/puasa-adab', '#/nota/waktu-solat?b=9', '#/cari?q=puasa%20hari%20jumaat'];

let gagal = 0;
const semak = (ok, msg) => { if (ok) console.log('  ok  ', msg); else { gagal++; console.log('  GAGAL', msg); } };

(async () => {
  const srv = await pelayan(); const URL = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});   // mikrofon tiruan untuk ujian rakaman
  if (GAMBAR) fs.mkdirSync(GAMBAR, {recursive: true});
  for (const skema of ['light', 'dark']) {
    console.log(`\n== ${skema === 'light' ? 'Mod cerah' : 'Mod gelap'}, 390 px`);
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, colorScheme: skema, locale: 'ms-MY', timezoneId: 'Asia/Kuala_Lumpur', serviceWorkers: 'block'});
    await apiTiruan(ctx); await audioTiruan(ctx);
    await ctx.addInitScript(() => {
      if (!localStorage.getItem('poket-penafian')) localStorage.setItem('poket-penafian', '"ujian"');
      window.__ms = [];   // rekod tindakan Media Session yang didaftarkan (butang stereng/Bluetooth)
      if (navigator.mediaSession) { const asal = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession); navigator.mediaSession.setActionHandler = (k, f) => { window.__ms.push(k); return asal(k, f); }; }
    });
    const pg = await ctx.newPage(); const ralat = [];
    pg.on('pageerror', e => ralat.push(String(e))); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) ralat.push(m.text()); });
    await pg.goto(URL + '#/'); await pg.waitForSelector('#skrin > *');
    for (const r of LALUAN) {
      await pg.evaluate(h => { location.hash = h; }, r); await pg.waitForTimeout(r.includes('yaasin') ? 500 : 180);
      const lebar = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      semak(lebar <= 0, `${r}: tiada limpahan mendatar (${lebar}px)`);
      const sampah = await pg.evaluate(() => (document.querySelector('#skrin').innerText.match(/\[object \w+\]|\bnull\b|\bundefined\b|\bNaN\b/g) || []).join(', '));
      if (sampah) semak(false, `${r}: teks rosak dipaparkan (${sampah})`);
      if (GAMBAR) await pg.screenshot({path: path.join(GAMBAR, `${skema}-${r.replace(/[#/?=]+/g, '_').replace(/^_+|_+$/g, '') || 'utama'}.png`)});
    }
    if (skema === 'light') {
      // interaksi utama
      await pg.evaluate(() => { location.hash = '#/yaasin'; }); await pg.waitForTimeout(400);
      await pg.click('#a36-1 .w'); semak(await pg.isVisible('.helai .kata-besar'), 'Yaasin: sentuh perkataan membuka makna perkataan');
      await pg.keyboard.press('Escape');
      await pg.evaluate(() => { location.hash = '#/doa/doa-selepas-yaasin'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.tanda-ayat').count() >= 2, 'Doa Yaasin: Rumi petikan ayat diganti tanda ayat');
      await pg.click('.tanda-ayat'); semak(await pg.isVisible('.helai .amaran'), 'Tanda ayat membuka ayat + penjelasan Rumi'); await pg.keyboard.press('Escape');
      await pg.evaluate(() => { location.hash = '#/doa?q=ربنا'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.doa-k').count() > 3, 'Carian Arab "ربنا" menemui doa');
      await pg.evaluate(() => { location.hash = '#/doa?q=hujan'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.doa-k').count() >= 3, 'Carian "hujan" menemui doa');
      // nama arwah → kata ganti
      await pg.evaluate(() => { localStorage.setItem('poket-arwah', JSON.stringify([{n: 'Aminah', b: 'Yusof', j: 'p'}])); location.hash = '#/doa/doa-arwah'; location.reload(); });
      await pg.waitForSelector('.isi-doa'); await pg.waitForTimeout(250);
      const t = await pg.textContent('.isi-doa');
      semak(t.includes('Aminah') && t.includes('Yusof'), 'Doa Arwah: nama arwah dimasukkan');
      semak(t.includes('اغْفِرْ لَهَا'), 'Doa Arwah: kata ganti perempuan (لَهَا) dipilih');
      // Mod Majlis
      await pg.evaluate(() => { location.hash = '#/susunan/tahlil-ringkas'; }); await pg.waitForTimeout(300);
      await pg.click('text=Mula (Mod Majlis)'); semak(await pg.isVisible('.pentas'), 'Mod Majlis dibuka');
      await pg.click('.pentas .bawah .btn.utama'); await pg.click('.pentas .bawah .btn.utama'); await pg.click('.pentas .bawah .btn.utama');
      semak((await pg.textContent('.pentas .atas .t span')).includes('Langkah 4'), 'Mod Majlis: butang Seterusnya');
      const ada = await pg.locator('.pentas .cincin').count(); semak(ada === 1, 'Mod Majlis: pengira muncul untuk zikir berulang');
      if (ada) { await pg.click('.pentas .cincin'); semak((await pg.textContent('.cincin .bil b')) === '1', 'Pengira bertambah'); }
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(150); semak(!(await pg.isVisible('.pentas')), 'Mod Majlis ditutup dengan Escape');
      // Pembina majlis: tambah langkah → disimpan → kongsi → import
      await pg.evaluate(() => { location.hash = '#/majlis/t/doa-selamat'; }); await pg.waitForTimeout(250);
      const sebelum = await pg.locator('.edit-l').count();
      await pg.click('text=Tambah bacaan'); await pg.click('.pilih-b >> nth=0'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
      semak(await pg.locator('.edit-l').count() === sebelum + 1, 'Pembina majlis: langkah ditambah');
      semak(/#\/majlis\/s\//.test(await pg.evaluate(() => location.hash)), 'Pembina majlis: templat yang diubah disimpan sebagai Majlis saya');
      const kod = await pg.evaluate(() => kodMajlis(majlisSaya()[0]));
      await pg.evaluate(k => { location.hash = '#/k/' + k; }, kod); await pg.waitForTimeout(250);
      semak(await pg.locator('.langkah').count() > 3, 'Pautan kongsi majlis dibuka di telefon lain');
      // skrin Utama gaya telefon
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.grid-apl .apl').count() === 8 && await pg.locator('#tab.dok .apl').count() === 4, 'Utama: 8 ikon aplikasi dan dok 4 aplikasi teras');
      semak(/^\d{1,2}:\d{2}$/.test(await pg.textContent('.jam .jj')), 'Utama: widget jam memaparkan masa');
      semak(!(await pg.isVisible('#bar')), 'Utama: bar atas disembunyikan seperti skrin utama telefon');
      semak((await pg.textContent('.jam-solat')).includes('Pilih zon'), 'Utama: tanpa zon, widget meminta pilih zon');
      await pg.click('.cari-rumah'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => document.activeElement && document.activeElement.type === 'search'), 'Utama: pil carian membuka skrin Cari dengan kotak carian aktif');
      // waktu solat: pilih zon, data JAKIM (tiruan), Hijri daripada takwim JAKIM
      await pg.evaluate(() => { location.hash = '#/solat'; }); await pg.waitForTimeout(200);
      await pg.selectOption('#pilih-negeri', 'Wilayah Persekutuan'); await pg.selectOption('#pilih-zon', 'WLY01'); await pg.waitForTimeout(500);
      semak(await pg.locator('.senarai-solat li').count() === 8, 'Waktu solat: 8 waktu dipaparkan');
      semak((await pg.textContent('.kad-solat')).includes('5:48 AM') && await pg.locator('.kad-solat .b-sahih').count() === 1, 'Waktu solat: waktu JAKIM disimpan dan ditanda JAKIM');
      const hjTiruan = await pg.evaluate(() => { const r = SIMPAN.baca(`waktu-WLY01-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, null); return r && r.p.find(x => x[0] === new Date().getDate())[1]; });
      const hjApp = await pg.evaluate(() => { const x = hijri(new Date()); return `${x.y}-${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`; });
      semak(hjTiruan && hjApp === hjTiruan, `Tarikh Hijri diambil daripada takwim JAKIM (${hjApp})`);
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(250);
      semak((await pg.textContent('.jam-solat')).includes('WLY01'), 'Utama: widget memaparkan solat seterusnya bagi zon');
      // peringatan: waktu tiruan 5 minit dari sekarang
      await pg.evaluate(() => {
        const n = new Date(), o = bulanSimpan('WLY01', n.getFullYear(), n.getMonth() + 1), t = Math.floor(Date.now() / 1000) + 300;
        o.p = o.p.map(r => r[0] === n.getDate() ? [r[0], r[1], t - 600, t, t, t, t, t, t, t] : r); simpanBulan(o); dahIngat = null; SIMPAN.buang('peringatan-dah'); semakPeringatan();
      });
      semak(await pg.isVisible('.banner-solat') && /dalam [45] minit/.test(await pg.textContent('.banner-solat')), 'Peringatan: kad muncul sebelum masuk waktu');
      const bilBanner = await pg.evaluate(() => { for (let i = 0; i < 5; i++) semakPeringatan(); return document.querySelectorAll('.banner-solat').length; });
      semak(bilBanner === 1, 'Peringatan: tidak berulang untuk waktu yang sama');
      await pg.click('.banner-solat .ib');
      // bunyi peringatan: slot selawat dan takbir (fail, rakaman mikrofon tiruan), tanpa klip = loceng, tiada pertindihan
      if (skema === 'light') {
        await ctx.grantPermissions(['microphone'], {origin: URL}).catch(() => {});
        await pg.evaluate(() => { SIMPAN.buang('bunyi'); BUNYI = null; T.bunyi = false; simpanT(); location.hash = '#/solat'; }); await pg.waitForTimeout(300);
        semak(await pg.locator('.bunyi-panel').isHidden(), 'Bunyi: panel klip tersembunyi selagi bunyi dimatikan');
        await pg.locator('label.set', {hasText: 'Bunyi peringatan'}).locator('.suis').check(); await pg.waitForTimeout(100);
        semak(await pg.locator('.bunyi-slot').count() === 2 && (await pg.textContent('.bunyi-slot[data-slot="awal"] .bs-status')).includes('Loceng'), 'Bunyi: dua slot; tanpa klip, loceng');
        const [pf] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('.bunyi-slot[data-slot="awal"] button:has-text("Pilih fail")')]);
        await pf.setFiles({name: 'selawat.wav', mimeType: 'audio/wav', buffer: wavTiruan(2)}); await pg.waitForTimeout(700);
        semak(/Selawat ringkas: fail anda, 2 saat/.test(await pg.textContent('.bunyi-slot[data-slot="awal"] .bs-status')), 'Bunyi: fail audio dipilih, tempoh disahkan, disimpan');
        const [pf2] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('.bunyi-slot[data-slot="masuk"] button:has-text("Pilih fail")')]);
        await pf2.setFiles({name: 'panjang.wav', mimeType: 'audio/wav', buffer: wavTiruan(25)}); await pg.waitForTimeout(700);
        semak((await pg.textContent('#roti')).includes('melebihi had 20 saat') && (await pg.textContent('.bunyi-slot[data-slot="masuk"] .bs-status')).includes('Loceng'), 'Bunyi: klip melebihi 20 saat ditolak');
        semak(JSON.stringify(await pg.evaluate(async () => [await mainBunyi('awal'), await mainBunyi('awal'), await mainBunyi('masuk')])) === '["klip","sedang","loceng"]', 'Bunyi: klip dimainkan tanpa bertindih; slot tanpa klip berbunyi loceng');
        await pg.waitForTimeout(2300);   // klip 2 saat dimainkan hingga habis
        await pg.click('.bunyi-slot[data-slot="masuk"] button:has-text("Rakam")'); await pg.waitForTimeout(150);
        semak((await pg.textContent('.helai-rakam')).includes('Allaahu akbar, Allaahu akbar'), 'Rakam: helaian memaparkan contoh takbir');
        await pg.click('.rakam-butang button:has-text("Mula rakam")'); await pg.waitForTimeout(1700);
        await pg.click('.rakam-butang button:has-text("Berhenti")'); await pg.waitForTimeout(1000);
        semak(/Rakaman [12] saat/.test(await pg.textContent('.rakam-status')), 'Rakam: mikrofon dirakam dan tempoh disahkan');
        await pg.click('.rakam-butang button:has-text("Simpan")'); await pg.waitForTimeout(200);
        semak(/Takbir dua kali: rakaman anda/.test(await pg.textContent('.bunyi-slot[data-slot="masuk"] .bs-status')), 'Rakam: klip takbir disimpan dalam telefon');
        // slot ikut masa: sebelum waktu = selawat; 3 minit pertama selepas masuk = takbir + pautan doa selepas azan; lewat = kad tanpa bunyi
        const jejak = await pg.evaluate(() => {
          const bunyi = [], asal = mainBunyi; mainBunyi = j => { bunyi.push(j); return Promise.resolve('ujian'); };
          const n = new Date(), uji = beza => {
            const o = bulanSimpan('WLY01', n.getFullYear(), n.getMonth() + 1), t = Math.floor(Date.now() / 1000) + beza, l = t - 7 * 3600;
            o.p = o.p.map(r => r[0] === n.getDate() ? [r[0], r[1], l, l, l, l, l, t, t + 3 * 3600, t + 4 * 3600] : r); simpanBulan(o); MEM_WAKTU.clear();
            dahIngat = null; SIMPAN.buang('peringatan-dah'); semakPeringatan();
            const b = document.querySelector('.banner-solat'), x = [b ? b.textContent : '', !!document.querySelector('.banner-solat .bs-doa')]; if (b) b.remove(); return x;
          };
          const r = [uji(300), uji(-60), uji(-300)]; mainBunyi = asal; return {r, bunyi};
        });
        semak(JSON.stringify(jejak.bunyi) === '["awal","masuk"]' && /Asar dalam/.test(jejak.r[0][0]) && /Sudah masuk waktu Asar/.test(jejak.r[1][0]) && jejak.r[1][1] && /Sudah masuk/.test(jejak.r[2][0]),
          'Peringatan: selawat sebelum waktu, takbir dalam 3 minit pertama, lewat tanpa bunyi, pautan doa selepas azan');
        const pk = await pg.evaluate(() => { const p = normalPek({jenis: 'pek-watak', bunyi: {awal: 'data:audio/mpeg;base64,SUQz', masuk: 'javascript:alert(1)', lain: 'data:audio/mpeg;base64,SUQz'}}); return p && [Object.keys(p.bunyi).join(), p.watak.length]; });
        semak(JSON.stringify(pk) === '["awal",0]', 'Pek: klip bunyi sah diterima, yang lain ditolak; pek bunyi sahaja dibenarkan');
        const [fs1] = await Promise.all([pg.waitForEvent('download'), pg.evaluate(() => eksportSandaran())]);
        const sb = JSON.parse(fs.readFileSync(await fs1.path(), 'utf8'));
        semak(sb.data.bunyi && sb.data.bunyi.awal && sb.data.bunyi.masuk && /^data:audio\//.test(sb.data.bunyi.awal.data), 'Sandaran: klip bunyi peringatan ikut serta');
        await pg.evaluate(() => { SIMPAN.buang('bunyi'); BUNYI = null; T.bunyi = false; simpanT(); SIMPAN.buang(`waktu-WLY01-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`); MEM_WAKTU.clear(); dahIngat = null; });
      }
      // pasang app (PWA): kad di atas Tetapan yang dikemas kini apabila beforeinstallprompt tiba; cadangan boleh tutup di Utama
      if (skema === 'light') {
        const acara = hasil => pg.evaluate(o => { const e = new Event('beforeinstallprompt', {cancelable: true}); e.prompt = () => { window.__pasang = (window.__pasang || 0) + 1; }; e.userChoice = Promise.resolve({outcome: o, platform: 'web'}); window.dispatchEvent(e); }, hasil);
        await pg.evaluate(() => { pasangAcara = null; window.__pasang = 0; SIMPAN.buang('pasang-nanti'); location.hash = '#/tetapan'; }); await pg.waitForTimeout(250);
        const awal = await pg.evaluate(() => { const k = document.querySelector('.kad-pasang'), s = document.querySelector('h2.sek'); return !!k && !!s && !!(k.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING) && !!k.querySelector('.langkah-pasang') && !k.querySelector('button'); });
        await acara('accepted'); await pg.waitForTimeout(100);
        await pg.click('.kad-pasang button:has-text("Pasang app")'); await pg.waitForTimeout(150);
        semak(awal && await pg.evaluate(() => window.__pasang === 1 && pasangAcara === null), 'Pasang app: kad di atas Tetapan; butang Pasang muncul sebaik pelayar bersedia, tanpa buka semula skrin');
        await acara('dismissed'); await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(300);
        const adaCadangan = await pg.isVisible('.pasang-rumah button:has-text("Pasang")');
        await pg.click('.pasang-rumah .ib'); await pg.evaluate(() => { location.hash = '#/tetapan'; }); await pg.waitForTimeout(150); await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(300);
        semak(adaCadangan && await pg.locator('.pasang-rumah').count() === 0, 'Pasang app: cadangan di skrin Utama, tidak muncul lagi selepas ditutup');
        await pg.evaluate(() => { pasangAcara = null; SIMPAN.buang('pasang-nanti'); });
      }
      // fail kalendar .ics
      await pg.evaluate(() => { SIMPAN.buang(`waktu-WLY01-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`); MEM_WAKTU.clear(); location.hash = '#/solat'; }); await pg.waitForTimeout(500);
      const [muat] = await Promise.all([pg.waitForEvent('download'), pg.click('text=Tambah ke kalendar telefon')]);
      const ics = fs.readFileSync(await muat.path(), 'utf8');
      semak(ics.startsWith('BEGIN:VCALENDAR') && (ics.match(/BEGIN:VEVENT/g) || []).length >= 140 && ics.includes('TRIGGER:-PT10M') && ics.split('\r\n').every(l => Buffer.byteLength(l) <= 75), 'Kalendar: fail .ics 30 hari dengan penggera, baris dilipat');
      // tasbih
      await pg.evaluate(() => { SIMPAN.buang('tasbih'); location.hash = '#/tasbih'; }); await pg.waitForTimeout(200);
      for (let i = 0; i < 33; i++) await pg.click('.cincin-t');
      semak((await pg.textContent('.cincin-t .bil b')) === '33' && await pg.locator('.cincin-t.siap').count() === 1, 'Tasbih: 33 kali, cincin selesai');
      await pg.click('.cincin-t');
      semak((await pg.textContent('.tasbih-langkah')).includes('Bacaan 2') && (await pg.textContent('.cincin-t .bil b')) === '1', 'Tasbih: sentuhan seterusnya bermula bacaan kedua');
      await pg.click('text=Tolak satu'); semak((await pg.textContent('.cincin-t .bil b')) === '0', 'Tasbih: tolak satu');
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.evaluate(() => { location.hash = '#/tasbih'; }); await pg.waitForTimeout(200);
      semak((await pg.textContent('.tasbih-langkah')).includes('Bacaan 2'), 'Tasbih: kiraan disimpan selepas keluar skrin');
      // hafalan: audio sahaja, grid butang ayat
      await pg.evaluate(() => { T.hafalMod = 'dengar'; T.hafalUlang = 1; T.hafalJeda = 0; simpanT(); location.hash = '#/hafalan/kahfi'; }); await pg.waitForTimeout(300);
      semak(await pg.locator('.ag-grid .ag').count() === 110 && await pg.locator('#skrin .qr, #skrin .ayat').count() === 0 && await pg.locator('.ag-m').count() === 12,
        'Hafalan: Al-Kahfi 110 butang ayat dalam 12 muka surat, tiada teks ayat');
      semak(await pg.evaluate(() => D.dasar.modSelamat === true && D.saiz.audio.juzuk < 1 && D.saiz.juzuk < 1), 'Mod Selamat: teks + audio dalam app kurang daripada satu juzuk');
      semak(await pg.locator('.hf-smart a[href*="smart-quran"], .hf-smart a[href*="qurantestbed"]').count() === 1 && await pg.locator('.hf-mod, .hf-sentuh').count() === 0, 'Mod Selamat: Al-Kahfi tiada pemain; butang ke Smart Quran');
      await pg.click('#a18-11'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => !AUD.senarai.length && (diari().hafal.kahfi.a || []).includes(11)), 'Mod Selamat: sentuh ayat Al-Kahfi menanda hafal, tidak memainkan audio');
      semak(await pg.evaluate(() => { mulaSesiHafal(cariHafalan('kahfi'), [1, 2]); return !AUD.senarai.length; }), 'Mod Selamat: sesi audio surah panjang disekat walaupun dipanggil terus');
      await pg.evaluate(() => { const d = diari(); d.hafal.kahfi.a = d.hafal.kahfi.a.filter(a => a !== 11); simpanDiari(); location.hash = '#/hafalan/yaasin'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.ag').count() === 83 && await pg.locator('#skrin .qr').count() === 0 && await pg.locator('.hf-teks a[href="#/yaasin"]').count() === 1 && await pg.locator('.hf-mod').count() === 1, 'Hafalan: Yaasin grid dengan audio (teksnya sudah dalam app) dan pautan ke teks Yaasin');
      await pg.evaluate(() => { location.hash = '#/hafalan/kafirun'; }); await pg.waitForTimeout(250);
      await pg.click('.hf-sentuh >> text=Tanda hafal'); await pg.waitForTimeout(150);
      for (let i = 0; i < 6; i++) { await pg.click(`.ag >> nth=${i}`); await pg.waitForTimeout(80); }
      semak(await pg.evaluate(() => { const k = keadaanHafal(cariHafalan('kafirun')); return k.hafal && k.r.j > hariIniIso(); }), 'Hafalan: semua ayat ditanda melalui grid, status Hafal dan murajaah dijadualkan');
      semak(await pg.evaluate(() => ((diari().hari[hariIniIso()] || {}).hf || []).some(z => z.id === 'kafirun' && z.a.length === 6)), 'Hafalan: sesi direkod dalam diari hari ini');
      await pg.click('.hf-sentuh >> text=Dengar'); await pg.waitForTimeout(150);
      await pg.click('.hf-pilih >> text=3×'); await pg.waitForTimeout(150); await pg.click('.hf-mula'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => AUD.senarai[0].basmalah && AUD.senarai.filter(z => !z.pembuka).length === 18 && AUD.senarai.filter(z => !z.pembuka).every(z => !z.diam)), 'Hafalan Dengar: Bismillah, kemudian setiap ayat 3 kali');
      await pg.evaluate(() => { AUD.henti(); T.hafalUlang = 1; T.hafalMod = 'ikut'; simpanT(); lukisSemula(); }); await pg.waitForTimeout(200);
      await pg.click('.hf-mula'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => { const l = AUD.senarai.filter(z => !z.pembuka); return l.length === 12 && l.every((z, i) => i % 2 ? z.diam === 'giliran' : !z.diam); }), 'Hafalan Ikut: setiap ayat diikuti giliran senyap untuk mengulang');
      // mod Uji: giliran (senyap WAV) dahulu, kemudian qari; berjalan sendiri walaupun tanpa sentuhan
      await pg.evaluate(() => { AUD.henti(); T.hafalMod = 'uji'; simpanT(); delete diari().hafal.kafirun.p; lukisSemula(); }); await pg.waitForTimeout(200);
      await pg.click('.hf-mula'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => { const l = AUD.senarai; return l[0].basmalah && l[1].diam === 'giliran' && l[1].a === 1 && !l[2].diam && l[2].a === 1 && l.length === 13; }), 'Hafalan Uji: Bismillah, giliran anda bagi ayat 1, kemudian qari membaca ayat 1');
      await pg.waitForFunction(() => AUD.senarai[AUD.i] && AUD.senarai[AUD.i].diam === 'giliran', null, {timeout: 6000}).catch(() => {});
      const giliran = await pg.evaluate(() => ({src: AUD.el.src, tajuk: navigator.mediaSession && navigator.mediaSession.metadata && navigator.mediaSession.metadata.title, pemain: document.querySelector('#pemain .t b').textContent, kelas: document.querySelector('#a109-1').className}));
      semak(giliran.src.startsWith('blob:') && /Giliran anda: ayat 1/.test(giliran.tajuk || '') && /Giliran anda/.test(giliran.pemain) && /giliran/.test(giliran.kelas), 'Hafalan Uji: giliran dimainkan sebagai audio senyap; skrin kereta/Bluetooth memaparkan "Giliran anda"');
      semak(await pg.evaluate(() => AUD.durasi.has('109:1') && AUD.msDiam({s: 109, a: 1, diam: 'giliran', kali: 2}) === Math.round(Math.max(2500, AUD.durasi.get('109:1') * 2000 + 800))), 'Hafalan Uji: tempoh giliran ikut panjang audio ayat (dimuat lebih awal)');
      await pg.waitForFunction(() => AUD.i >= 3, null, {timeout: 9000}).catch(() => {});
      semak(await pg.evaluate(() => AUD.i >= 3), 'Hafalan Uji: sesi maju sendiri dari giliran ke bacaan qari tanpa disentuh');
      semak(await pg.evaluate(() => ['play', 'pause', 'previoustrack', 'nexttrack'].every(k => window.__ms.includes(k))), 'Butang sebelum/seterusnya Media Session (stereng, Bluetooth, skrin kunci) didaftarkan');
      const lompat = await pg.evaluate(() => {
        const g = AUD.senarai.findIndex(z => z.diam === 'giliran' && z.a === 3); AUD.i = g; AUD.mula();
        AUD.lompat(1); const a1 = AUD.senarai[AUD.i]; AUD.lompat(1); const a2 = AUD.senarai[AUD.i]; AUD.lompat(-1); const a3 = AUD.senarai[AUD.i];
        return [!a1.diam && a1.a === 3, a2.diam === 'giliran' && a2.a === 4, !a3.diam && a3.a === 3];
      });
      semak(lompat.every(Boolean), `Butang seterusnya: tamatkan giliran, kemudian ke ayat berikutnya; sebelum: kembali ke bacaan qari (${lompat})`);
      semak(await pg.evaluate(() => diari().hafal.kafirun.p === 3), 'Hafalan: kedudukan sesi disimpan untuk "Sambung"');
      await pg.evaluate(() => { AUD.i = AUD.senarai.length - 1; AUD.seterusnya(); }); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => !AUD.senarai.length && !diari().hafal.kafirun.p) && (await pg.textContent('#roti')).includes('Selesai'), 'Hafalan: sesi tamat, kedudukan dikosongkan');
      // tersangkut: sentuh nombor ayat (tiada sesi) = dengar ayat itu sahaja dan direkod sebagai "kerap dirujuk"
      await pg.evaluate(() => { location.hash = '#/hafalan/yaasin'; }); await pg.waitForTimeout(250);
      await pg.click('#a36-37'); await pg.waitForTimeout(150); await pg.click('#a36-37'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => AUD.senarai.length === 1 && AUD.senarai[0].a === 37 && diari().hafal.yaasin.u['37'][0] === 2), 'Tersangkut: sentuh ayat 37 memainkan ayat itu sahaja dan mengira rujukan');
      semak(await pg.locator('#a36-37.rj1').count() === 1 && (await pg.textContent('.hf-lemah')).includes('Ayat 37, 2×'), 'Tersangkut: ayat yang kerap dirujuk ditanda pada grid dan disenaraikan');
      await pg.evaluate(() => { AUD.henti(); T.hafalMod = 'dengar'; simpanT(); diari().hafal.yaasin.p = 40; simpanDiari(); lukisSemula(); }); await pg.waitForTimeout(200);
      semak((await pg.textContent('.hf-mula')).includes('Sambung dari ayat 40'), 'Hafalan: butang Sambung dari ayat terakhir');
      await pg.click('.hf-mula'); await pg.waitForTimeout(150);
      await pg.click('#a36-60'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => AUD.senarai[AUD.i].a === 60 && AUD.senarai.length > 40 && !(diari().hafal.yaasin.u || {})['60']), 'Semasa sesi Dengar: sentuh ayat melompat ke ayat itu tanpa dikira tersangkut');
      await pg.evaluate(() => AUD.henti());
      // semakan bebas: giliran pertama menunggu tempoh ayat; sesi berhenti apabila rekod dipadam; Uji di luar senarai; ⏮; pemain senyap
      await pg.evaluate(() => { T.hafalMod = 'uji'; simpanT(); location.hash = '#/hafalan/kursi'; }); await pg.waitForTimeout(250);
      await pg.click('.hf-mula');
      await pg.waitForFunction(() => AUD.senarai[AUD.i] && AUD.senarai[AUD.i].diam === 'giliran' && AUD.msKini > 1500, null, {timeout: 6000}).catch(() => {});
      semak(await pg.evaluate(() => AUD.durasi.has('2:255') && AUD.msKini === AUD.msDiam(AUD.senarai[AUD.i]) && AUD.msKini < 7000), 'Uji Ayat al-Kursi: giliran pertama menunggu tempoh ayat 2:255, bukan anggaran 7 saat');
      semak(await pg.locator('#pemain [aria-label="Ayat seterusnya"]').count() === 1, 'Ayat tunggal: butang Seterusnya ada untuk menamatkan giliran');
      semak(await pg.evaluate(() => !IOS && AUD.hidup && !AUD.hidup.paused), 'Pemain senyap berulang aktif semasa sesi (kawalan skrin kunci dan kereta di Chrome)');
      await pg.evaluate(() => AUD.henti()); semak(await pg.evaluate(() => AUD.hidup.paused), 'Pemain senyap berhenti bersama sesi');
      await pg.evaluate(() => { T.hafalMod = 'dengar'; simpanT(); location.hash = '#/hafalan/nas'; }); await pg.waitForTimeout(250);
      await pg.click('.hf-mula'); await pg.waitForFunction(() => (diari().hafal.nas || {}).p >= 1, null, {timeout: 6000}).catch(() => {});
      await pg.click('text=Set semula'); await pg.click('.helai .btn.utama'); await pg.waitForTimeout(2500);
      semak(await pg.evaluate(() => !diari().hafal.nas && !AUD.senarai.length), 'Set semula semasa sesi: sesi dihentikan dan rekod tidak dicipta semula');
      await pg.evaluate(() => { T.hafalMod = 'uji'; simpanT(); const d = diari(); (d.hafal.yaasin = d.hafal.yaasin || {a: []}).p = 40; simpanDiari(); location.hash = '#/hafalan/yaasin'; }); await pg.waitForTimeout(250);
      await pg.click('.hf-mula'); await pg.waitForTimeout(200); await pg.click('#a36-5'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => { const x = AUD.senarai[AUD.i]; return x.a === 5 && !x.diam; }), 'Uji: sentuh ayat sebelum titik mula terus memainkan ayat itu, bukan giliran senyap');
      await pg.evaluate(() => { AUD.henti(); T.hafalMod = 'dengar'; simpanT(); lukisSemula(); }); await pg.waitForTimeout(200);
      await pg.evaluate(() => mulaSesiHafal(cariHafalan('yaasin'), [10, 50], {pembuka: false, simpanPos: false}));
      await pg.click('#hf-mod-ikut'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => JSON.stringify(AUD.opt.ayat) === '[10,50]' && AUD.opt.simpanPos === false && AUD.opt.mod === 'ikut' && AUD.senarai.filter(z => !z.diam).every(z => z.a === 10 || z.a === 50)), 'Tukar mod semasa sesi "ulang ayat-ayat ini": senarai ayat dan tetapan dikekalkan');
      semak(await pg.evaluate(() => document.activeElement && document.activeElement.id === 'hf-mod-ikut'), 'Fokus kekal pada butang mod selepas skrin dilukis semula');
      const kembali = await pg.evaluate(() => {
        AUD.henti(); T.hafalUlang = 3; mulaSesiHafal(cariHafalan('nas'), [1, 2, 3], {pembuka: false, simpanPos: false});
        const j = AUD.senarai.findIndex((z, i) => z.a === 2 && AUD.senarai.slice(0, i).some(y => y.a === 2)); AUD.i = j; AUD.mula(); AUD.lompat(-1);
        const ok = AUD.senarai[AUD.i].a === 1 && AUD.i === AUD.senarai.findIndex(z => z.a === 1); T.hafalUlang = 1; simpanT(); AUD.henti(); return ok;
      });
      semak(kembali, 'Butang sebelum: ke bacaan pertama ayat sebelumnya, bukan ulangan sebelumnya');
      semak(await pg.evaluate(() => { T.hafalUlang = 1e7; T.hafalJeda = 1e5; const n = barisanHafal(cariHafalan('nas'), [1, 2], 'dengar').length; T.hafalUlang = 1; T.hafalJeda = 0; simpanT(); return n <= 4; }), 'Tetapan hafalan yang rosak (cth. daripada sandaran) diabaikan');
      semak(await pg.evaluate(() => { AUD.main(Array.from({length: 83}, (_, i) => ({s: 36, a: i + 1}))); const t = document.querySelector('#pemain .t b').textContent; AUD.henti(); return /\(1\/83\)/.test(t); }), 'Yaasin "Dengar semua": kiraan (1/83) kekal');
      // diari: puasa, mengaji, khatam, hari dilarang
      await pg.evaluate(() => { location.hash = '#/diari'; }); await pg.waitForTimeout(300);
      const iniIso = await pg.evaluate(() => hariIniIso());
      await pg.click(`.kal-sel[data-iso="${iniIso}"]`); await pg.waitForTimeout(200);
      await pg.click('.helai .cip >> text=Ganti (qada)'); await pg.fill('#catatan-hari', 'Ujian catatan'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
      semak(await pg.locator(`.kal-sel[data-iso="${iniIso}"] .t-puasa`).count() === 1 && await pg.locator(`.kal-sel[data-iso="${iniIso}"] .t-nota`).count() === 1, 'Diari: puasa dan catatan ditanda pada kalendar');
      await pg.evaluate(() => { diari().ngaji = {pos: 1, khatam: 0}; simpanDiari(); kemasDiari(); });
      await pg.click('text=Rekod bacaan hari ini'); await pg.waitForTimeout(200); await pg.click('.helai .cip-kecil >> text=5 muka'); await pg.click('text=Simpan bacaan'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => diari().ngaji.pos === META.hal[5]), 'Diari: 5 muka surat direkod, kedudukan khatam ke muka surat 6');
      await pg.evaluate(() => { diari().ngaji.pos = keGlobal(114, 1); simpanDiari(); kemasDiari(); });
      await pg.click('text=Rekod bacaan hari ini'); await pg.waitForTimeout(200); await pg.click('.helai .cip >> text=Surah dan ayat'); await pg.waitForTimeout(100);
      await pg.selectOption('#ng-shingga', '114'); await pg.click('text=Simpan bacaan'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => diari().ngaji.khatam === 1 && diari().ngaji.pos === 1), 'Diari: khatam dikira apabila sampai An-Nas');
      const larang = await pg.evaluate(() => { for (let i = 0; i < 400; i++) { const t = new Date(2027, 0, 1 + i); if (statusPuasa(t).larang === 'Hari Raya Aidilfitri') return isoTarikh(t); } return null; });
      await pg.evaluate(iso => { location.hash = '#/diari/' + iso.slice(0, 7); }, larang); await pg.waitForTimeout(300);
      await pg.click(`.kal-sel[data-iso="${larang}"]`); await pg.waitForTimeout(200);
      semak(await pg.locator(`.kal-sel[data-iso="${larang}"].larang`).count() === 1 && await pg.locator('.helai .cip[disabled]').count() === 5, `Diari: Hari Raya (${larang}) ditanda dilarang berpuasa`);
      await pg.keyboard.press('Escape');
      // semakan bebas: kedudukan dikembalikan apabila bacaan dipadam; murajaah maju sekali sehari; kadar ikut bacaan khatam sahaja
      const pulih = await pg.evaluate(() => {
        const d = diari(), iso = hariIniIso(); d.ngaji = {pos: 8, khatam: 0}; delete d.hari[iso];
        simpanNgaji(iso, 8, 400, true); const selepas = d.ngaji.pos; padamNgaji(iso, 0);
        return selepas === 401 && d.ngaji.pos === 8;
      });
      semak(pulih, 'Diari: padam bacaan mengembalikan kedudukan khatam');
      const jadual = await pg.evaluate(() => {
        const x = cariHafalan('nas'), d = diari(); d.hafal.nas = {a: [1, 2, 3, 4, 5, 6], st: 'hafal', t: hariIniIso(), n: 0, j: hariIniIso()};
        murajaah(x, true); const j1 = d.hafal.nas.j; murajaah(x, true); murajaah(x, true);
        return j1 === tambahHari(hariIniIso(), 3) && d.hafal.nas.j === j1;
      });
      semak(jadual, 'Hafalan: murajaah lancar berulang pada hari sama tidak memajukan jadual');
      const kadar = await pg.evaluate(() => {
        const d = diari(), iso = hariIniIso(); d.hari = {}; d.ngaji = {pos: 1, khatam: 0};
        simpanNgaji(iso, keGlobal(18, 1), keGlobal(18, 110), false);   // Al-Kahfi di luar urutan khatam
        const a = statNgaji(30).halSehari; simpanNgaji(iso, 1, META.hal[10] - 1, true);   // 10 muka dalam urutan
        return a === 0 && Math.abs(statNgaji(30).halSehari * 30 - 10) < 0.01;
      });
      semak(kadar, 'Diari: kadar khatam dikira daripada bacaan urutan khatam, ikut pecahan muka surat');
      // Diari: puasa sunat pada hari Jumaat sahaja diberi peringatan; tiada jika hari Khamis juga berpuasa
      const jm = await pg.evaluate(() => {
        const t = new Date(); t.setDate(t.getDate() + ((5 - t.getDay() + 7) % 7) + 7);
        const biasa = x => !statusPuasa(x).ramadan && !statusPuasa(x).larang && !statusPuasa(x).sunat.length;
        while (!biasa(t) || !biasa(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1))) t.setDate(t.getDate() + 7);
        const iso = isoTarikh(t), kh = isoTarikh(new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1)), sb = isoTarikh(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)), d = diari();
        delete d.hari[iso]; delete d.hari[kh]; delete d.hari[sb]; simpanDiari(); return [iso, kh, sb];
      });
      await pg.evaluate(iso => bukaHari(iso), jm[0]); await pg.waitForTimeout(150);
      await pg.click('.helai .cip >> text="Sunat"'); await pg.waitForTimeout(100);
      const nasihatJumaat = await pg.isVisible('.helai .hari-info.nasihat') && (await pg.textContent('.helai .hari-info.nasihat')).includes('Khamis atau Sabtu');
      await pg.keyboard.press('Escape');
      await pg.evaluate(kh => { rekodHari(kh).p = 'sunat'; simpanDiari(); }, jm[1]);
      await pg.evaluate(iso => bukaHari(iso), jm[0]); await pg.waitForTimeout(150);
      const tiadaNasihat = !(await pg.isVisible('.helai .hari-info.nasihat'));
      await pg.keyboard.press('Escape');
      await pg.evaluate(([iso, kh]) => { const d = diari(); delete d.hari[iso]; delete d.hari[kh]; simpanDiari(); }, jm);
      await pg.evaluate(sb => bukaHari(sb), jm[2]); await pg.waitForTimeout(150);
      await pg.click('.helai .cip >> text="Sunat"'); await pg.waitForTimeout(100);
      const nasihatSabtu = await pg.isVisible('.helai .hari-info.nasihat') && (await pg.textContent('.helai .hari-info.nasihat')).includes('Al-Kafi #563');
      await pg.keyboard.press('Escape');
      await pg.evaluate(sb => { delete diari().hari[sb]; simpanDiari(); }, jm[2]);
      semak(nasihatJumaat && tiadaNasihat && nasihatSabtu, 'Diari: puasa sunat Jumaat atau Sabtu sahaja diberi peringatan; tiada jika disambung dengan Khamis');
      semak(await pg.evaluate(() => { const u = id => unitNota((D.nota.find(n => n.id === id) || {}).isi); return u('puasa-nabi')[11].includes('hari Jumaat sahaja') && u('puasa-nabi')[16].includes('Al-Kafi #563') && u('waktu-solat')[9].includes('Bunyi selawat dan takbir'); }),
        'Pautan ?b= daripada Diari dan Waktu Solat menunjuk perenggan yang betul');
      const kt = await pg.evaluate(() => [konteksAktif(new Date(2026, 10, 1, 21, 0)).map(k => k.id), konteksAktif(new Date(2026, 10, 5, 10, 0)).map(k => k.id), (D.kalendar.find(k => k.id === 'hari-jumaat') || {}).pesan || '']);
      semak(kt[0].includes('esok-isnin') && kt[1].includes('puasa-khamis') && kt[2].includes('hari raya mingguan'), 'Kalendar: niat dan sahur malam Isnin, puasa Khamis, Jumaat hari raya mingguan');
      for (const [q, id] of [['nabi puasa selasa rabu khamis', 'puasa-nabi'], ['puasa hari jumaat', 'puasa-nabi'], ['puasa sabtu', 'puasa-nabi'], ['lupa niat puasa sunat', 'puasa-adab'], ['bunyi azan', 'waktu-solat']]) {
        await pg.evaluate(q => { location.hash = '#/cari?q=' + encodeURIComponent(q); }, q); await pg.waitForTimeout(300);
        const hrefs = await pg.$$eval('.hasil-cari a[href^="#/nota/"]', as => as.slice(0, 3).map(a => a.getAttribute('href')));
        semak(hrefs.some(h => h.startsWith('#/nota/' + id)), `Cari "${q}": nota ${id} dalam tiga hasil nota teratas (${hrefs.join(', ')})`);
      }
      await pg.evaluate(() => { location.hash = '#/diari'; }); await pg.waitForTimeout(250);
      await pg.evaluate(() => { diari().ngaji.pos = keGlobal(18, 1); simpanDiari(); kemasDiari(); });
      await pg.click('text=Rekod bacaan hari ini'); await pg.waitForTimeout(150); await pg.click('.helai .cip >> text=Surah dan ayat'); await pg.waitForTimeout(100);
      await pg.click('.helai .set .suis'); await pg.selectOption('#ng-shingga', '18'); await pg.waitForTimeout(100);
      semak(!(await pg.isChecked('.helai .set .suis')), 'Diari: pilihan pengguna pada suis kedudukan khatam tidak diubah semula');
      await pg.keyboard.press('Escape');
      const hijriLancar = await pg.evaluate(() => { MEM_WAKTU.clear(); for (const k of Object.keys(localStorage)) if (/^poket-waktu-/.test(k)) localStorage.removeItem(k); let p = null, bad = 0; for (let i = 0; i < 730; i++) { const x = hijri(new Date(2026, 0, 1 + i)); if (p && !((x.y === p.y && x.m === p.m && x.d === p.d + 1) || (x.d === 1 && p.d >= 29))) bad++; p = x; } return bad; });
      semak(hijriLancar === 0, `Tarikh Hijri tanpa data JAKIM berturutan tanpa lompatan (${hijriLancar})`);
      // sandaran: eksport kemudian pulihkan
      await pg.evaluate(() => { diari().ngaji.khatam = 3; simpanDiari(); });
      const [fail] = await Promise.all([pg.waitForEvent('download'), pg.evaluate(() => eksportSandaran())]);
      const pathSandaran = await fail.path(), sandaran = JSON.parse(fs.readFileSync(pathSandaran, 'utf8'));
      semak(sandaran.app === 'poket-yaasin' && sandaran.data.diari && sandaran.data.diari.ngaji.khatam === 3, 'Sandaran: fail JSON mengandungi diari');
      await pg.evaluate(() => { localStorage.removeItem('poket-diari'); });
      const [pemilih] = await Promise.all([pg.waitForEvent('filechooser'), pg.evaluate(() => importSandaran())]);
      await pemilih.setFiles(pathSandaran); await pg.waitForTimeout(300); await pg.click('.helai .btn.utama'); await pg.waitForLoadState('load'); await pg.waitForTimeout(500);
      semak(await pg.evaluate(() => diari().ngaji.khatam === 3 && keadaanHafal(cariHafalan('kafirun')).hafal), 'Sandaran: data dipulihkan selepas dipadam');
      const rosak = path.join(require('os').tmpdir(), 'sandaran-rosak.json');
      fs.writeFileSync(rosak, JSON.stringify({app: 'poket-yaasin', jenis: 'sandaran', data: {bintang: 5}}));
      const [pemilih2] = await Promise.all([pg.waitForEvent('filechooser'), pg.evaluate(() => importSandaran())]);
      await pemilih2.setFiles(rosak); await pg.waitForTimeout(300);
      semak((await pg.textContent('#roti')).includes('rosak') && !(await pg.isVisible('.helai')), 'Sandaran: fail rosak ditolak sebelum mengubah data');
      // keluarga: profil dengan gambar (dalam telefon sahaja), diari berasingan setiap ahli, sandaran semua ahli
      const gambarUjian = path.join(require('os').tmpdir(), 'avatar-ujian.png');
      fs.writeFileSync(gambarUjian, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
      await pg.evaluate(() => { location.hash = '#/keluarga'; }); await pg.waitForTimeout(250);
      await pg.click('.ahli-kad .ib'); await pg.waitForTimeout(150); await pg.fill('#ahli-nama', 'Abah');
      const [pilihGambar] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('text=Pilih gambar')]); await pilihGambar.setFiles(gambarUjian); await pg.waitForTimeout(300);
      await pg.click('.helai .btn.utama'); await pg.waitForTimeout(250);
      semak(await pg.evaluate(() => /^data:image\/jpeg;base64,/.test(keluarga().ahli[0].gambar || '')) && await pg.locator('.ahli-kad .avatar img').count() === 1, 'Keluarga: gambar profil dikecilkan dan disimpan dalam telefon');
      await pg.click('text=Tambah ahli keluarga'); await pg.waitForTimeout(150); await pg.fill('#ahli-nama', 'Aisyah'); await pg.click('.helai .btn.utama'); await pg.waitForTimeout(250);
      await pg.click('text=Guna profil Aisyah'); await pg.waitForTimeout(250);
      const asing = await pg.evaluate(() => {
        const id = keluarga().aktif, abahSebelum = JSON.stringify(SIMPAN.baca('diari', {}));
        simpanNgaji(hariIniIso(), 1, 20, true);
        return id !== 'utama' && SIMPAN.baca('diari-' + id, {}).ngaji.pos === 21 && JSON.stringify(SIMPAN.baca('diari', {})) === abahSebelum;
      });
      semak(asing, 'Keluarga: diari setiap ahli disimpan berasingan');
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.ahli-tumpuk .avatar').count() === 2 && (await pg.textContent('.widget')).includes('(Aisyah)'), 'Utama: avatar keluarga dan rekod ahli aktif dipaparkan');
      await pg.click('.ahli-tumpuk'); await pg.waitForTimeout(150); await pg.click('.pilih-ahli .ahli-b >> nth=0'); await pg.waitForTimeout(200);
      semak(await pg.evaluate(() => keluarga().aktif === 'utama'), 'Utama: tukar profil melalui avatar');
      const [fail3] = await Promise.all([pg.waitForEvent('download'), pg.evaluate(() => eksportSandaran())]);
      const s3 = JSON.parse(fs.readFileSync(await fail3.path(), 'utf8'));
      semak(s3.data.keluarga && s3.data.keluarga.ahli.length === 2 && Object.keys(s3.data).filter(k => /^diari/.test(k)).length === 2, 'Sandaran: semua ahli keluarga dan diari mereka disertakan');
      await pg.evaluate(() => { location.hash = '#/hafalan/kahfi'; }); await pg.waitForTimeout(250);
      await pg.click('text=Rekod bacaan Al-Kahfi hari ini'); await pg.waitForTimeout(150);
      semak(await pg.evaluate(() => { const d = diari(), ng = (d.hari[hariIniIso()] || {}).ng || []; return ng.some(([a, b, gerak]) => a === keGlobal(18, 1) && b === keGlobal(18, 110) && gerak !== 1); }), 'Surah pilihan: bacaan Al-Kahfi direkod tanpa menggerakkan kedudukan khatam');
      // pek watak keluarga PERIBADI (fail sintetik: imej 1 piksel, bukan wajah sebenar)
      const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const PNG2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      const pekUjian = path.join(require('os').tmpdir(), 'pek-ujian.json'), pekRosak = path.join(require('os').tmpdir(), 'pek-rosak.json');
      fs.writeFileSync(pekUjian, JSON.stringify({app: 'poket-yaasin', jenis: 'pek-watak', v: 1, nama: 'Keluarga Ujian', dibuat: '2026-11-02',
        watak: [{id: 'baba', nama: 'Baba', peranan: 'abah', muka: PNG, pose: {syabas: PNG, tulis: PNG, asal: PNG2, ingat: PNG}}, {id: 'ibu', nama: 'Ibu', peranan: 'ummi', muka: PNG}],
        kumpulan: [{id: 'bersama', fail: PNG, konteks: ['utama'], ahli: ['baba', 'ibu']}, {id: 'berdiri', fail: PNG, konteks: ['keluarga']}, {id: 'mengaji', fail: PNG, konteks: ['hafalan']}, {id: 'musafir', fail: PNG, konteks: ['musafir']},
          {id: 'peluk', fail: PNG2, konteks: ['utama']}, {id: 'bincang', fail: PNG, konteks: ['cari']}, {id: 'syabas', fail: PNG, konteks: ['syabas']}]}));
      fs.writeFileSync(pekRosak, JSON.stringify({app: 'poket-yaasin', jenis: 'lain', watak: []}));
      await pg.evaluate(() => { location.hash = '#/keluarga'; }); await pg.waitForTimeout(250);
      const [pilihPek] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('.pek-kad .btn')]); await pilihPek.setFiles(pekUjian); await pg.waitForTimeout(400);
      semak((await pg.textContent('.helai h3').catch(() => '')) === 'Telefon ini milik siapa?' && await pg.locator('.pilih-milik .ahli-b').count() === 2, 'Pek peribadi: ditanya telefon ini milik siapa');
      await pg.click('.helai >> text=Bukan dalam senarai'); await pg.waitForTimeout(300);
      semak(await pg.evaluate(() => SIMPAN.baca('pek', {}).jenis === 'pek-watak' && PEK().length === 2 && /^data:image\//.test(watakBagi({watak: 'baba'}).muka)), 'Pek peribadi: diimport dan disimpan dalam telefon (data URL, bukan fail repo)');
      semak(await pg.evaluate(() => { const k = keluarga(); return k.ahli.filter(a => a.watak).map(a => a.nama).join() === 'Baba,Ibu' && /^data:image\/jpeg/.test(k.ahli[0].gambar || ''); }), 'Pek peribadi: profil Baba dan Ibu dicipta; profil yang ada gambar sendiri tidak diubah');
      semak(await pg.locator('.kumpulan-keluarga').count() === 1 && (await pg.textContent('.pek-kad')).includes('2 watak, 7 gambar keluarga'), 'Pek peribadi: gambar keluarga di skrin Keluarga');
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(300);
      semak(await pg.locator('.widget-foto img').count() === 1, 'Pek peribadi: widget foto keluarga di skrin Utama');
      await pg.evaluate(() => { location.hash = '#/doa?k=musafir'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.kumpulan-doa').count() === 1, 'Pek peribadi: gambar keluarga dalam doa Perjalanan');
      await pg.evaluate(() => { location.hash = '#/hafalan'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.hf-ringkas .kumpulan-kad').count() === 1, 'Pek peribadi: gambar keluarga mengaji dalam ringkasan Hafalan');
      await pg.evaluate(() => { location.hash = '#/keluarga'; }); await pg.waitForTimeout(250);
      await pg.click('.ahli-kad .ib >> nth=0'); await pg.waitForTimeout(150); await pg.click('.pilih-watak .ahli-b >> text=Baba'); await pg.click('.helai .btn.utama'); await pg.waitForTimeout(250);
      semak(await pg.evaluate(() => { const k = keluarga(); return k.ahli[0].watak === 'baba' && !k.ahli[0].gambar && k.ahli.filter(a => a.watak === 'baba').length === 1; }) && (await pg.textContent('#roti')).includes('dipindahkan'), 'Watak: satu watak untuk satu profil (dipindahkan, gambar diganti)');
      await pg.evaluate(() => roti('Ujian', 'syabas')); semak(await pg.locator('#roti .pelekat-roti').count() === 1, 'Watak: pose syabas dalam mesej kejayaan');
      await pg.evaluate(() => { location.hash = '#/diari'; }); await pg.waitForTimeout(300);
      semak(await pg.locator('.kad-ngaji .pelekat-ngaji').count() === 1, 'Watak: pose menulis dalam Diari');
      // tempat tambahan: Cari (gambar konteks 'cari'), Nota (pose baca → asal), Waktu Solat (pose ingat), papan Keluarga (konteks 'syabas')
      await pg.evaluate(() => { location.hash = '#/cari'; }); await pg.waitForTimeout(250);
      const adaCari = await pg.locator('.cari-ilustrasi .pelekat-kumpulan').count() === 1;
      await pg.evaluate(() => { location.hash = '#/nota'; }); await pg.waitForTimeout(250);
      const adaNota = await pg.locator('.nota-atas .pelekat-nota').count() === 1;
      await pg.evaluate(() => { T.zon = T.zon || 'WLY01'; simpanT(); location.hash = '#/solat'; }); await pg.waitForTimeout(300);
      const adaSolat = await pg.locator('.sek-pelekat .pelekat-sek').count() === 1;
      semak(adaCari && adaNota && adaSolat, 'Watak: pelekat di skrin Cari, Nota dan Waktu Solat');
      const ganti = await pg.evaluate(([a, b]) => {
        const src = (n, x) => { const el = pose({watak: 'baba'}, n); return el && el.getAttribute('src') === x; };
        const g1 = gambarKonteks('utama', '', new Date(2026, 10, 2)).getAttribute('src'), g2 = gambarKonteks('utama', '', new Date(2026, 10, 3)).getAttribute('src');
        return src('baca', b) && src('doa', b) && src('ingat', a) && g1 !== g2 && !!gambarKonteks('syabas') && gambarKonteks('lain') === null;
      }, [PNG, PNG2]);
      semak(ganti, 'Watak: pose yang tiada diganti (baca → asal); gambar konteks sama bertukar setiap hari');
      const [fail4] = await Promise.all([pg.waitForEvent('download'), pg.evaluate(() => eksportSandaran())]);
      const s4 = JSON.parse(fs.readFileSync(await fail4.path(), 'utf8'));
      semak(s4.data.pek && s4.data.pek.jenis === 'pek-watak' && s4.data.pek.watak.length === 2 && s4.data.keluarga.ahli[0].watak === 'baba', 'Sandaran: pek peribadi dan pautan watak disertakan');
      await pg.evaluate(() => { location.hash = '#/keluarga'; }); await pg.waitForTimeout(250);
      const [pilihRosak] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('.pek-kad .btn >> nth=0')]); await pilihRosak.setFiles(pekRosak); await pg.waitForTimeout(300);
      semak((await pg.textContent('#roti')).includes('tidak dapat dibaca') && await pg.evaluate(() => PEK().length === 2), 'Pek peribadi: fail yang bukan pek ditolak tanpa mengubah pek sedia ada');
      await pg.click('text=Buang pek'); await pg.click('.helai .btn.utama'); await pg.waitForTimeout(250);
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(250);
      semak(await pg.evaluate(() => SIMPAN.baca('pek', null) === null) && await pg.locator('.widget-foto').count() === 0, 'Pek peribadi: dibuang daripada telefon');
      // telefon ahli lain (profil lalai "Saya"): pek yang sama, pilih watak sendiri (bukan watak pertama)
      await pg.evaluate(() => { localStorage.removeItem('poket-keluarga'); location.hash = '#/keluarga'; location.reload(); }); await pg.waitForTimeout(800);
      const [pilihPek2] = await Promise.all([pg.waitForEvent('filechooser'), pg.click('.pek-kad .btn')]); await pilihPek2.setFiles(pekUjian); await pg.waitForTimeout(400);
      await pg.click('.pilih-milik .ahli-b >> text=Ibu'); await pg.waitForTimeout(300);
      semak(await pg.evaluate(() => { const k = keluarga(), u = k.ahli.find(a => a.id === 'utama'); return u.watak === 'ibu' && u.nama === 'Ibu' && k.ahli.length === 2 && k.ahli.some(a => a.id !== 'utama' && a.watak === 'baba'); }), 'Pek peribadi: telefon Ibu memakai watak Ibu (dipilih), Baba menjadi profil lain');
      await pg.evaluate(() => { localStorage.removeItem('poket-keluarga'); localStorage.removeItem('poket-pek'); location.reload(); }); await pg.waitForTimeout(600);
      // carian pintar (dalam telefon, tanpa model bahasa)
      await pg.evaluate(() => { location.hash = '#/cari?q=' + encodeURIComponent('anak demam'); }); await pg.waitForTimeout(300);
      semak(await pg.locator('.hasil-cari a[href="#/doa/ziarah-sakit"]').count() === 1 && (await pg.textContent('.faham')).includes('sakit'), 'Cari: "anak demam" difahami sebagai sakit dan menemui doa menziarahi pesakit');
      await pg.evaluate(() => { location.hash = '#/cari?q=istikhara'; }); await pg.waitForTimeout(250);
      semak((await pg.textContent('.faham')).includes('istikharah') && await pg.locator('.hasil-cari a[href="#/doa/istikharah"]').count() === 1, 'Cari: salah ejaan dibetulkan ("istikhara" → istikharah)');
      await pg.evaluate(() => { location.hash = '#/cari?q=' + encodeURIComponent('bila asar'); }); await pg.waitForTimeout(250);
      semak((await pg.textContent('.jp')).includes('Asar 4:20 PM') && await pg.locator('.jp .jw').count() === 6, 'Cari: jawapan pantas waktu Asar daripada data JAKIM');
      await pg.evaluate(() => { location.hash = '#/cari?q=' + encodeURIComponent('puasa sunat bila'); }); await pg.waitForTimeout(250);
      semak((await pg.textContent('.hasil-cari')).includes('Puasa sunat') && await pg.locator('.jp-senarai li').count() >= 1, 'Cari: jawapan pantas puasa sunat seterusnya');
      await pg.evaluate(() => { location.hash = '#/cari?q=' + encodeURIComponent('hukum korban'); }); await pg.waitForTimeout(250);
      semak(await pg.locator('.laman-rasmi a[href*="site%3Amuftiwp.gov.my"]').count() === 1 && await pg.locator('.laman-rasmi a[href*="site%3Ae-smaf.islam.gov.my"]').count() === 1, 'Cari: soalan hukum memaparkan carian laman rasmi mufti');
      await pg.evaluate(() => { location.hash = '#/cari?q=' + encodeURIComponent('enam hari syawal'); }); await pg.waitForTimeout(250);
      const pautNota = await pg.getAttribute('.hasil-cari a[href^="#/nota/puasa-sunat"]', 'href').catch(() => '');
      semak(/\?b=\d+$/.test(pautNota || ''), 'Cari: hasil nota menunjuk perenggan yang sepadan');
      if (pautNota) { await pg.click(`.hasil-cari a[href="${pautNota}"]`); await pg.waitForTimeout(250); semak(await pg.locator('.isi-nota .sorot-blok').count() === 1, 'Nota: perenggan hasil carian diserlahkan'); }
      await pg.evaluate(() => { location.hash = '#/doa?q=demam'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('#skrin a.doa-k[href="#/doa/ziarah-sakit"]').count() === 1 && await pg.locator('.kiraan a[href^="#/cari"]').count() === 1, 'Doa: carian guna enjin yang sama dan pautan ke carian penuh');
      // skrin Utama: jalur waktu solat dan khat harian
      await pg.evaluate(() => { location.hash = '#/'; }); await pg.waitForTimeout(300);
      semak(await pg.locator('.jam-waktu .jw').count() === 6 && await pg.locator('.jam-waktu .jw.kini').count() === 1, 'Utama: jalur enam waktu solat, solat seterusnya ditonjolkan');
      const khat = await pg.evaluate(() => { const k = khatHari(), e = document.querySelector('.widget-khat .kh-ar'); return k && e && getComputedStyle(e).fontFamily.includes('Aref Ruqaa') && e.textContent.length > 5 ? k.id : null; });
      semak(!!khat, `Utama: kad khat harian (${khat})`);
      semak(await pg.evaluate(() => { const j = new Date(2026, 10, 6); return khatHari(j).jenis === 'selawat' && khatHari(j).jumaat; }), 'Khat: hari Jumaat sentiasa selawat');
      await pg.evaluate(() => { const s = D.khat.selawat; BINTANG.clear(); BINTANG.add(s[1]); }); 
      semak(await pg.evaluate(() => { const s = D.khat.selawat, ids = []; for (let i = 0; i < 12; i++) { const k = khatHari(new Date(2026, 10, 2 + 2 * i)); if (k.jenis === 'selawat') ids.push(k.id); } const n = ids.filter(x => x === s[1]).length; return n >= ids.length / 2 && n < ids.length; }), 'Khat: bacaan bertanda bintang lebih kerap, yang lain masih muncul');
      await pg.evaluate(() => { BINTANG.clear(); simpanBintang(); });
      await pg.click('.widget-khat .kh-kira'); await pg.waitForTimeout(300);
      semak(await pg.evaluate(() => location.hash === '#/tasbih' && SIMPAN.baca('tasbih', {}).p === 'doa:' + khatHari().id && [...document.querySelectorAll('.gulung .cip[aria-pressed="true"]')].map(e => e.textContent).join() === cariDoa(khatHari().id).tj), 'Khat: butang Kira membuka Tasbih dengan bacaan itu');
      semak(await pg.evaluate(() => { const d = cariDoa(khatHari().id); return d.ul ? !document.querySelector('[aria-label="Sasaran"]') : !!document.querySelector('[aria-label="Sasaran"]'); }), 'Tasbih: sasaran ikut hadis jika ada bilangan; jika tiada, pengguna memilih');
      await pg.click('.cincin-t'); await pg.click('.cincin-t');
      semak((await pg.textContent('.cincin-t .bil b')) === '2', 'Tasbih: bacaan khat dikira');
      // kandungan baharu: nota solat sunat dan amalan harian, selawat susunan ulama
      await pg.evaluate(() => { location.hash = '#/cari?q=tahajud'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.hasil-cari a[href^="#/nota/solat-sunat?b="]').count() === 1, 'Cari: "tahajud" menemui perenggan qiyamullail dalam nota solat sunat');
      await pg.evaluate(() => { location.hash = '#/cari?q=tafrijiah'; }); await pg.waitForTimeout(250);
      semak(await pg.locator('.hasil-cari a[href="#/doa/selawat-tafrijiyah"]').count() === 1, 'Cari: "tafrijiah" menemui Selawat Tafrijiyah');
      semak(await pg.evaluate(() => ['selawat-tafrijiyah', 'selawat-syifa', 'selawat-ibrahimiyah'].every(id => D.khat.selawat.includes(id)) && D.khat.zikir.every(id => cariDoa(id))), 'Khat: Tafrijiyah, Syifa\' dan Ibrahimiyah dalam giliran selawat');
      await pg.evaluate(() => { location.hash = '#/doa/selawat-syifa'; }); await pg.waitForTimeout(250);
      semak((await pg.textContent('.sumber')).includes('Perlis') && await pg.locator('.lihat a[href="#/nota/selawat"]').count() === 1, 'Selawat Syifa\': pandangan berbeza dan pautan nota dipaparkan');
      // rujukan
      await pg.evaluate(() => { location.hash = '#/rujukan'; }); await pg.waitForTimeout(200);
      semak(await pg.locator('.rujuk-k').count() >= 8 && (await pg.textContent('#skrin')).includes('Pejabat Mufti Wilayah Persekutuan'), 'Rujukan: sumber dikumpul ikut penerbit');
      semak(ralat.length === 0, 'Tiada ralat JavaScript' + (ralat.length ? ': ' + ralat.slice(0, 3).join(' | ') : ''));
    } else semak(ralat.length === 0, 'Tiada ralat JavaScript (mod gelap)' + (ralat.length ? ': ' + ralat.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  // penafian kali pertama, dan waktu anggaran apabila API tidak dapat dicapai
  console.log('\n== Kali pertama dibuka, API waktu solat gagal');
  {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, timezoneId: 'Asia/Kuala_Lumpur', serviceWorkers: 'block'});
    const bil = await apiTiruan(ctx, true);
    const pg = await ctx.newPage(); const ralat = []; pg.on('pageerror', e => ralat.push(String(e)));
    await pg.goto(URL + '#/'); await pg.waitForTimeout(1000);
    semak((await pg.textContent('.helai h3').catch(() => '')) === 'Sebelum mula', 'Penafian dipaparkan semasa kali pertama dibuka');
    await pg.click('text=Saya faham'); await pg.reload(); await pg.waitForTimeout(1000);
    semak(await pg.locator('.helai').count() === 0, 'Penafian tidak diulang selepas dibaca');
    await pg.evaluate(() => { T.zon = 'SBH07'; simpanT(); location.hash = '#/solat'; }); await pg.waitForTimeout(600);
    semak(await pg.locator('.kad-solat .b-beza').count() === 1 && await pg.locator('.senarai-solat li').count() >= 6, 'Tanpa data JAKIM: waktu anggaran dipaparkan dan ditanda');
    semak(bil() > 0, 'App cuba mengambil waktu JAKIM apabila dalam talian');
    semak(ralat.length === 0, 'Tiada ralat JavaScript' + (ralat.length ? ': ' + ralat.join(' | ') : ''));
    await ctx.close();
  }
  console.log('\n== Storan telefon penuh, dan lukis semula selepas data tiba');
  {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, timezoneId: 'Asia/Kuala_Lumpur', serviceWorkers: 'block'});
    const bil = await apiTiruan(ctx);
    await ctx.addInitScript(() => {
      localStorage.setItem('poket-penafian', '"ujian"');
      const asal = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (/^poket-(waktu|peringatan)/.test(k)) throw new DOMException('penuh', 'QuotaExceededError'); return asal.call(this, k, v); };
    });
    const pg = await ctx.newPage(); const ralat = []; pg.on('pageerror', e => ralat.push(String(e)));
    await pg.goto(URL + '#/solat'); await pg.waitForTimeout(300);
    await pg.selectOption('#pilih-negeri', 'Selangor'); await pg.selectOption('#pilih-zon', 'SGR01'); await pg.waitForTimeout(3000);
    semak(bil() <= 2 && await pg.locator('.kad-solat .b-sahih').count() === 1, `Storan penuh: waktu JAKIM dipaparkan tanpa gelung pengambilan (${bil()} panggilan API)`);
    await pg.evaluate(() => { MEM_WAKTU.clear(); location.hash = '#/yaasin'; }); await pg.waitForTimeout(500);
    await pg.click('#a36-1 .w'); await pg.evaluate(() => segarWaktu()); await pg.waitForTimeout(500);
    semak(await pg.isVisible('.helai .kata-besar'), 'Data waktu yang tiba tidak menutup helaian di skrin lain');
    await pg.keyboard.press('Escape');
    await pg.evaluate(() => { const asal = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'poket-diari') throw new DOMException('penuh', 'QuotaExceededError'); return asal.call(this, k, v); }; });
    await pg.evaluate(() => simpanNgaji(hariIniIso(), 1, 7, true)); await pg.waitForTimeout(100);
    semak((await pg.textContent('#roti')).includes('Storan telefon penuh'), 'Storan penuh: amaran tidak ditimpa mesej "Direkod"');
    const [fail2] = await Promise.all([pg.waitForEvent('download'), pg.evaluate(() => eksportSandaran())]);
    const s2 = JSON.parse(fs.readFileSync(await fail2.path(), 'utf8'));
    semak(s2.data.diari.ngaji.pos === 8, 'Storan penuh: sandaran diambil daripada memori (rekod terkini ada)');
    semak(ralat.length === 0, 'Tiada ralat JavaScript' + (ralat.length ? ': ' + ralat.join(' | ') : ''));
    await ctx.close();
  }
  // luar talian (service worker)
  console.log('\n== Luar talian');
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage(); await pg.goto(URL); await pg.waitForSelector('#skrin > *');
  await pg.evaluate(() => navigator.serviceWorker.ready); await pg.waitForTimeout(800);
  await ctx.setOffline(true); await pg.reload(); await pg.waitForSelector('#skrin > *', {timeout: 5000}).catch(() => {});
  semak(await pg.locator('.grid-apl').count() === 1, 'App dibuka tanpa internet selepas lawatan pertama');
  await pg.evaluate(() => { location.hash = '#/yaasin'; }); await pg.waitForTimeout(400);
  semak(await pg.locator('.ayat').count() === 83, 'Yaasin (83 ayat) tersedia tanpa internet');
  await b.close(); srv.close();
  console.log(gagal ? `\n${gagal} semakan GAGAL` : '\nSemua semakan lulus'); process.exit(gagal ? 1 : 0);
})();
