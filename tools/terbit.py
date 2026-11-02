#!/usr/bin/env python3
"""Sediakan keluaran baharu sebelum git commit/push.

    python3 tools/terbit.py              # versi automatik (tarikh hari ini + huruf), HANYA jika kod/data berubah
    python3 tools/terbit.py 2026-11-02a  # versi ini (dipaksa)
    python3 tools/terbit.py --paksa      # naikkan versi walaupun tiada perubahan

1. Naikkan APP_VERSION (docs/app/poket.js), VERSI (docs/sw.js), ?v= dalam docs/index.html dan docs/version.json.
   Telefon pengguna nampak banner "Versi baharu" dan service worker memuat turun kerangka baharu.
2. Semak setiap fail dalam senarai cache service worker wujud.
"""
import hashlib, json, re, sys, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / 'docs'
JS, SW, IDX, VJ = DOCS / 'app/poket.js', DOCS / 'sw.js', DOCS / 'index.html', DOCS / 'version.json'

RE_JS = re.compile(r"const APP_VERSION='([^']+)'")
RE_SW = re.compile(r"const VERSI = '([^']+)'")
RE_V = re.compile(r'(\?v=)[\w.-]+')

def cap_jari():
    """Cap jari kandungan yang dihantar kepada pengguna (rentetan versi diabaikan)."""
    fail = [JS, DOCS / 'app/poket.css', DOCS / 'data/kandungan.js', SW, IDX, DOCS / 'manifest.webmanifest'] + sorted((DOCS / 'js/vendor').glob('*.js'))
    h = hashlib.sha256()
    for f in fail:
        t = f.read_text(encoding='utf-8')
        t = RE_JS.sub('', t); t = RE_SW.sub('', t); t = RE_V.sub(r'\1', t)
        h.update(t.encode('utf-8')); h.update(b'\0')
    return h.hexdigest()[:16]

def main():
    arg = sys.argv[1:]; paksa = '--paksa' in arg
    v = next((a for a in arg if not a.startswith('--')), None)
    lama = RE_JS.search(JS.read_text(encoding='utf-8')).group(1)
    hari = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=8)).strftime('%Y-%m-%d')
    kod = cap_jari()
    try: vj = json.loads(VJ.read_text(encoding='utf-8'))
    except Exception: vj = {}
    naik = paksa or bool(v) or vj.get('kod') != kod
    if not naik: v = lama
    elif not v:
        hz = lama[10:] if lama.startswith(hari) else ''
        v = hari + (chr(ord(hz[0]) + 1) if hz else 'a')
    if not re.fullmatch(r'[\w.-]{4,24}', v): sys.exit(f'Versi tidak sah: {v}')

    JS.write_text(RE_JS.sub(f"const APP_VERSION='{v}'", JS.read_text(encoding='utf-8')), encoding='utf-8')
    SW.write_text(RE_SW.sub(f"const VERSI = '{v}'", SW.read_text(encoding='utf-8')), encoding='utf-8')
    IDX.write_text(RE_V.sub(r'\g<1>' + v, IDX.read_text(encoding='utf-8')), encoding='utf-8')
    VJ.write_text(json.dumps({'v': v, 'kod': kod}) + '\n', encoding='utf-8')

    masalah = []
    senarai = re.search(r'const ASAS = \[(.*?)\];', SW.read_text(encoding='utf-8'), re.S).group(1)
    for f in re.findall(r"'([^']+)'", senarai):
        f = f.split('?')[0]
        if f in ('./',): continue
        if not (DOCS / f).exists(): masalah.append(f'sw.js menyenaraikan fail yang tiada: {f}')
    for f in re.findall(r'(?:src|href)="([^"#:]+)"', IDX.read_text(encoding='utf-8')):
        if not (DOCS / f.split('?')[0]).exists(): masalah.append(f'index.html merujuk fail yang tiada: {f}')

    print(f'Versi: {lama} → {v}' if naik and v != lama else f'Versi kekal {v} (tiada perubahan kod/data; guna --paksa jika perlu)')
    if masalah:
        print('\nPERLU DIBETULKAN:\n- ' + '\n- '.join(masalah)); sys.exit(2)
    print('Semakan lulus. Seterusnya: git add -A && git commit && git push')

if __name__ == '__main__':
    main()
