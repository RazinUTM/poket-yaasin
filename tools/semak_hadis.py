#!/usr/bin/env python3
"""Semak setiap frasa Arab doa bersumberkan hadis terhadap teks hadis asal (pangkalan sunnah.com, pakej npm `hadith`).

    python3 tools/semak_hadis.py          # laporan ringkas
    python3 tools/semak_hadis.py -v       # tunjuk setiap frasa

Rujukan diambil daripada medan sumber.ruj, cth. "Sahih al-Bukhari, no. 6369", "Sahih Muslim, no. 918a",
"Sunan Abi Dawud, no. 5095", "Jami' at-Tirmizi, no. 3433", "Sunan Ibn Majah, no. 925", "Hisn al-Muslim no. 120".
Frasa dianggap sepadan jika kerangka hurufnya (tanpa baris) terkandung dalam teks hadis.
"""
import re, sys, io, sqlite3, tarfile, unicodedata, urllib.request
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent.parent
DBP = ROOT / 'tools' / 'sumber' / 'hadith.db'
URL = 'https://registry.npmjs.org/hadith/-/hadith-1.3.0.tgz'

KOL = [(r'Sahih al-Bukhari', 1), (r'Sahih Muslim', 2), (r"Sunan an-Nasa'i", 3), (r'Sunan Abi Dawud', 10),
       (r"Jami' at-Tirmizi", 30), (r'Sunan Ibn Majah', 38), (r"Muwatta' Malik", 40), (r'Musnad Ahmad', 50),
       (r'Riyad as-Salihin', 110), (r'Mishkat al-Masabih', 113), (r'Al-Adab al-Mufrad', 115), (r'Hisn al-Muslim', 300)]
RE_RUJ = re.compile(r'(' + '|'.join(re.escape(k) for k, _ in KOL) + r'),? no\.? ?(\d+)([a-z]?)')
RE_RUJ_NOTA = re.compile(r'(' + '|'.join(re.escape(k) for k, _ in KOL) + r'),? (?:no\.? ?)?(\d+)([a-z]?)\b')

def pastikan_db():
    if DBP.exists(): return
    print('Memuat turun pangkalan hadis (~38 MB)…', flush=True)
    data = urllib.request.urlopen(URL, timeout=300).read()
    with tarfile.open(fileobj=io.BytesIO(data)) as tf:
        DBP.parent.mkdir(parents=True, exist_ok=True)
        DBP.write_bytes(tf.extractfile('package/data/hadith.db').read())

def norm(s):
    s = unicodedata.normalize('NFKC', s or '')
    s = ''.join(ch for ch in s if unicodedata.category(ch) not in ('Mn', 'Cf') and ch not in 'ـ‏‎')
    s = s.translate(str.maketrans({'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ی':'ي','ة':'ه','ؤ':'و','ئ':'ي','ء':''}))
    s = re.sub(r'[^ء-ي ]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def main():
    verbose = '-v' in sys.argv
    pastikan_db()
    db = sqlite3.connect(DBP)
    def teks(cid, no, huruf):
        nos = [f'{no} {huruf}', f'{no}{huruf}', no] if huruf else [no]
        for n in nos:
            rows = db.execute("select c6,c7,c8 from hadith_content where c1=? and (c4=? or c4 like ?)", (cid, n, n + ',%')).fetchall()
            if rows: return ' '.join(norm(' '.join(x or '' for x in r)) for r in rows), n
        return None, None
    jumlah = lulus = 0; masalah = []; dilangkau = []
    for fp in sorted((ROOT / 'kandungan' / 'doa').glob('*.yaml')):
        for d in yaml.safe_load(fp.read_text(encoding='utf-8')) or []:
            s = d.get('sumber') or {}
            if s.get('jenis') not in ('hadis', 'athar'): continue
            if s.get('semak') is False:
                dilangkau.append(d['id']); continue
            kecuali = {norm(x) for x in s.get('semak_kecuali') or []}
            refs = [(dict(KOL)[m.group(1)], m.group(2), m.group(3)) for m in RE_RUJ.finditer(s.get('ruj', ''))]
            if not refs:
                masalah.append(f"{d['id']}: tiada rujukan berformat (ruj={s.get('ruj')!r})"); continue
            korpus = []
            for cid, no, h in refs:
                t, n = teks(cid, no, h)
                if t is None: masalah.append(f"{d['id']}: rujukan tidak ditemui dalam pangkalan: kol {cid} no {no}{h}")
                else: korpus.append(t)
            if not korpus: continue
            semua = ' '.join(korpus)
            bah = d.get('bahagian') or [d]
            for b in bah:
                if not b.get('teks'): continue
                for fr in str(b['teks']).split('|'):
                    jumlah += 1
                    n = norm(fr)
                    if n in kecuali:
                        lulus += 1; continue
                    if n and n in semua:
                        lulus += 1
                        if verbose: print('  ✓', d['id'], fr.strip())
                    else:
                        masalah.append(f"{d['id']}: frasa tidak ditemui dalam hadis → {fr.strip()}")
    print(f'Frasa disemak: {jumlah}, sepadan: {lulus} (termasuk pengecualian bernota)')
    if dilangkau: print('Dilangkau (sumber bukan kitab hadis dalam pangkalan):', ', '.join(dilangkau))
    # Rujukan bernombor dalam nota dan pesan kalendar (cth. "Sahih Muslim 1144b", "Sahih al-Bukhari no. 935") mesti wujud.
    rn = rl = 0
    for nama in ('nota.yaml', 'kalendar.yaml'):
        teks_fail = (ROOT / 'kandungan' / nama).read_text(encoding='utf-8')
        for m in RE_RUJ_NOTA.finditer(teks_fail):
            rn += 1
            t, _ = teks(dict(KOL)[m.group(1)], m.group(2), m.group(3))
            if t is None: masalah.append(f'{nama}: rujukan tidak ditemui dalam pangkalan: {m.group(0)}')
            else: rl += 1
    print(f'Rujukan hadis dalam nota dan kalendar: {rn}, ditemui: {rl}')
    if masalah:
        print('\nUntuk semakan manusia (mungkin variasi lafaz yang disengajakan — lihat nota doa):')
        for m in masalah: print(' -', m)
    return 0

if __name__ == '__main__':
    sys.exit(main())
