#!/usr/bin/env python3
"""Bina pek watak keluarga PERIBADI: satu fail JSON (imej sebagai data URL) untuk diimport dalam app
(Keluarga > Pek watak keluarga > Import). Imej kekal dalam telefon; ia tidak berada dalam repo atau GitHub Pages.

  python3 tools/pek.py peribadi/pek.yaml [--keluar peribadi/pek-keluarga.json]

peribadi/pek.yaml (folder peribadi/ dalam .gitignore; laluan imej relatif kepada fail YAML):
  nama: Keluarga Contoh
  watak:
    - {id: baba, nama: Baba, peranan: abah, muka: avatar/baba-muka.webp, pose: {syabas: avatar/baba-syabas.webp}}
  kumpulan:
    - {id: bersama, fail: avatar/keluarga-bersama.webp, konteks: [utama], ahli: [baba]}
  bunyi:                          # pilihan: klip peringatan solat dirakam sendiri oleh keluarga (maksimum 300 KB setiap satu)
    awal: bunyi/selawat.m4a       # sebelum waktu: selawat ringkas
    masuk: bunyi/takbir.m4a       # masuk waktu: takbir "Allaahu akbar" dua kali

peranan: abah | ummi | anak | atuk | nenek | lain.
pose: asal (Keluarga), sapa (Utama), fikir (Hafalan, Cari), syabas (kejayaan), tulis (Diari), baca (Nota), doa (Tasbih selesai),
ingat (Waktu Solat). Pose yang tiada diganti dalam app (cth. baca → sapa → asal), jadi 4 hingga 5 pose sudah mencukupi.
konteks gambar berkumpulan: utama (widget foto skrin Utama), keluarga (skrin Keluarga), hafalan (ringkasan Hafalan),
diari (Diari), musafir (doa Perjalanan), cari (skrin Cari), syabas (papan kemajuan Keluarga). Beberapa gambar dengan
konteks yang sama bertukar setiap hari.
bunyi: MP3 atau M4A paling serasi (Android dan iPhone); WebM/Ogg mungkin tidak dimainkan di iPhone. Gunakan rakaman
sendiri sahaja (bukan rakaman orang lain yang tidak dibenarkan). Rakaman dalam telefon mengatasi klip pek.
"""
import argparse
import base64
import datetime
import json
import pathlib
import re
import sys

import yaml

PERANAN = {'abah', 'ummi', 'anak', 'atuk', 'nenek', 'lain'}
POSE = {'asal', 'sapa', 'fikir', 'syabas', 'tulis', 'baca', 'doa', 'ingat'}
KONTEKS = {'utama', 'keluarga', 'hafalan', 'diari', 'musafir', 'cari', 'syabas'}
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}
MIME_AUDIO = {'.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.oga': 'audio/ogg',
              '.opus': 'audio/ogg', '.webm': 'audio/webm', '.wav': 'audio/wav'}
SLOT_BUNYI = {'awal', 'masuk'}
RE_ID = re.compile(r'[a-z0-9-]{1,20}')
HAD_IMEJ = 200 * 1024
HAD_AUDIO = 300 * 1024
ralat = []
amaran = []


def data_url(asas, f, tag):
    p = (asas / str(f)).resolve()
    if p.suffix.lower() not in MIME or not p.is_file():
        ralat.append(f'{tag}: fail {f} tiada atau bukan WebP/PNG/JPEG'); return None
    b = p.read_bytes()
    if len(b) > HAD_IMEJ:
        ralat.append(f'{tag}: {f} {len(b) // 1024} KB melebihi {HAD_IMEJ // 1024} KB (kecilkan dengan tools/avatar.py)'); return None
    return f'data:{MIME[p.suffix.lower()]};base64,' + base64.b64encode(b).decode()


def data_url_audio(asas, f, tag):
    p = (asas / str(f)).resolve()
    if p.suffix.lower() not in MIME_AUDIO or not p.is_file():
        ralat.append(f'{tag}: fail {f} tiada atau bukan audio ({", ".join(sorted(MIME_AUDIO))})'); return None
    b = p.read_bytes()
    if len(b) > HAD_AUDIO:
        ralat.append(f'{tag}: {f} {len(b) // 1024} KB melebihi {HAD_AUDIO // 1024} KB (pendekkan klip, maksimum 20 saat)'); return None
    if p.suffix.lower() in ('.webm', '.ogg', '.oga', '.opus'):
        amaran.append(f'{tag}: {p.suffix} mungkin tidak dimainkan di iPhone; MP3 atau M4A lebih serasi')
    return f'data:{MIME_AUDIO[p.suffix.lower()]};base64,' + base64.b64encode(b).decode()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('manifest')
    ap.add_argument('--keluar')
    o = ap.parse_args()
    man = pathlib.Path(o.manifest).resolve()
    asas = man.parent
    m = yaml.safe_load(man.read_text(encoding='utf-8')) or {}
    watak, ids = [], set()
    for w in m.get('watak') or []:
        wid = str(w.get('id', ''))
        if not RE_ID.fullmatch(wid) or wid in ids: ralat.append(f'watak {wid!r}: id tidak sah atau berulang'); continue
        ids.add(wid)
        if w.get('peranan', 'lain') not in PERANAN: ralat.append(f'watak {wid}: peranan {w.get("peranan")} tidak dikenali')
        pose = {}
        for k, f in (w.get('pose') or {}).items():
            if k not in POSE: ralat.append(f'watak {wid}: pose {k} tidak dikenali'); continue
            pose[k] = data_url(asas, f, f'watak {wid}.{k}')
        muka = data_url(asas, w['muka'], f'watak {wid} muka') if w.get('muka') else None
        if not muka and not pose.get('asal'): ralat.append(f'watak {wid}: perlu muka atau pose asal')
        watak.append({'id': wid, 'nama': str(w.get('nama') or wid)[:30], 'peranan': w.get('peranan', 'lain'), 'muka': muka, 'pose': pose})
    kumpulan = []
    for g in m.get('kumpulan') or []:
        gid = str(g.get('id', ''))
        if not RE_ID.fullmatch(gid): ralat.append(f'kumpulan {gid!r}: id tidak sah'); continue
        kt = [k for k in g.get('konteks') or [] if k in KONTEKS]
        if len(kt) != len(g.get('konteks') or []): ralat.append(f'kumpulan {gid}: konteks dibenarkan {", ".join(sorted(KONTEKS))}')
        ahli = [a for a in g.get('ahli') or [] if a in ids]
        if len(ahli) != len(g.get('ahli') or []): ralat.append(f'kumpulan {gid}: ahli mesti id watak dalam pek ini')
        kumpulan.append({'id': gid, 'fail': data_url(asas, g.get('fail', ''), f'kumpulan {gid}'), 'konteks': kt, 'ahli': ahli, 'tajuk': str(g.get('tajuk') or '')[:60]})
    bunyi = {}
    for k, f in (m.get('bunyi') or {}).items():
        if k not in SLOT_BUNYI: ralat.append(f'bunyi {k}: slot dibenarkan awal (sebelum waktu) atau masuk (masuk waktu)'); continue
        v = data_url_audio(asas, f, f'bunyi {k}')
        if v: bunyi[k] = v
    if not watak and not kumpulan and not bunyi: ralat.append('pek kosong')
    if ralat:
        print('Pek TIDAK dibina:\n  ' + '\n  '.join(ralat), file=sys.stderr); sys.exit(1)
    pek = {'app': 'poket-yaasin', 'jenis': 'pek-watak', 'v': 1, 'nama': str(m.get('nama') or '')[:40],
           'dibuat': datetime.date.today().isoformat(), 'watak': watak, 'kumpulan': kumpulan, 'bunyi': bunyi}
    keluar = pathlib.Path(o.keluar) if o.keluar else asas / 'pek-keluarga.json'
    teks = json.dumps(pek, ensure_ascii=False, separators=(',', ':'))
    keluar.write_text(teks, encoding='utf-8')
    print(f'Pek ditulis: {keluar} ({len(teks) / 1024:.0f} KB): {len(watak)} watak, {len(kumpulan)} gambar berkumpulan, {len(bunyi)} klip bunyi.')
    for a in amaran: print('AMARAN: ' + a, file=sys.stderr)
    if len(teks) > 1.5 * 1024 * 1024:
        print('AMARAN: pek melebihi 1.5 MB; storan telefon (localStorage) mungkin tidak cukup.', file=sys.stderr)
    print('Fail ini mengandungi imej dan suara keluarga: kongsi secara peribadi sahaja (cth. WhatsApp kepada ahli keluarga), jangan commit.')


if __name__ == '__main__':
    main()
