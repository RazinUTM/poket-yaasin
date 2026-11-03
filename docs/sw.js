/* Service worker Poket Yaasin: simpan kerangka app supaya berfungsi tanpa internet.
   VERSI dinaikkan oleh tools/terbit.py; cache lama dibuang apabila versi baharu aktif.
   Audio (everyayah.com, quran.com) tidak disimpan: ia dimainkan terus daripada pelayan sumber. */
const VERSI = '2026-11-03d';
const CACHE = 'poket-' + VERSI;
const ASAS = ['./', 'index.html', 'manifest.webmanifest',
  'app/poket.css?v=' + VERSI, 'app/poket.js?v=' + VERSI, 'data/kandungan.js?v=' + VERSI, 'js/vendor/qrcode.js?v=' + VERSI,
  'fonts/amiri-quran.woff2', 'fonts/amiri-quran-latin.woff2', 'fonts/amiri-400.woff2', 'fonts/amiri-700.woff2',
  'fonts/atkinson-400.woff2', 'fonts/atkinson-400i.woff2', 'fonts/atkinson-600.woff2', 'fonts/atkinson-700.woff2', 'fonts/aref-ruqaa-700.woff2',
  'img/icon-192.png', 'img/icon-512.png', 'img/icon-180.png'];
  // imej watak terbina (kandungan/avatar.yaml, kini kosong) mesti disenaraikan di sini; pek keluarga peribadi disimpan dalam telefon

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASAS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('poket-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;            // audio & pautan luar: terus ke rangkaian
  if (u.pathname.endsWith('/version.json')) return;         // semakan versi sentiasa ke rangkaian
  if (r.mode === 'navigate') {                              // halaman: rangkaian dahulu, cache jika luar talian
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const s = res.clone(); caches.open(CACHE).then(c => c.put('index.html', s)); }
      return res;
    }).catch(() => caches.match('index.html').then(x => x || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => {      // aset: cache dahulu
    if (res.ok) { const s = res.clone(); caches.open(CACHE).then(c => c.put(r, s)); }
    return res;
  })));
});
/* Notifikasi waktu solat: sentuh untuk buka app pada skrin Waktu Solat. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const ke = (e.notification.data && e.notification.data.url) || '#/';
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.postMessage({ke}); return c.focus(); }
    return self.clients.openWindow(new URL(ke, self.registration.scope).href);
  }));
});
