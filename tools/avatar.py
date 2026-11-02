#!/usr/bin/env python3
"""Potong helaian avatar keluarga kepada pelekat WebP untuk pek watak PERIBADI (peribadi/avatar/, tidak di-commit).

Helaian boleh berlatar putih atau lutsinar (PNG beralfa). Setiap figura (komponen bersambung) dipotong ikut susunan
baris demi baris, kiri ke kanan, dan diberi garis putih ala pelekat supaya kemas pada latar cerah dan gelap.

  # pose individu (satu watak, beberapa pose); <watak>-muka.webp dijana daripada pose --muka
  python3 tools/avatar.py BABA.png --watak baba --pose asal,sapa,fikir,syabas,tulis --muka asal

  # gambar berkumpulan (pasangan/keluarga); nama bebas, cth. keluarga-bersama.webp
  python3 tools/avatar.py KELUARGA.png --watak keluarga --kumpulan berdiri,belajar,mengaji,musafir,bersama

  # muka untuk avatar bulat daripada kotak dalam helaian (koordinat piksel helaian asal)
  python3 tools/avatar.py KELUARGA.png --muka-kotak "ibu:37,133,207,303;anak1:138,50,288,200"

  # separuh badan (hingga peha): buang semua di bawah baris 800 helaian; figura yang bersentuhan dipisahkan
  # pada laluan kos minimum berhampiran lajur yang diberi (ikut garis luar kartun, bukan garisan lurus)
  python3 tools/avatar.py BABA.png --watak baba --pose asal,sapa,fikir,syabas,tulis --potong-y 800 --sempadan 327,643,962,1287

Kemudian senaraikan fail dalam peribadi/pek.yaml dan bina pek dengan tools/pek.py.
JANGAN letak imej keluarga (terutama anak-anak) dalam docs/: repo dan GitHub Pages adalah awam.
Keperluan: Pillow (dengan WebP), numpy, scipy.
"""
import argparse
import pathlib
import re
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSE_SAH = {'asal', 'sapa', 'fikir', 'syabas', 'tulis', 'baca', 'doa', 'ingat'}
RE_ID = re.compile(r'[a-z0-9-]{1,24}')


def topeng(rgba, ambang=232, kelabu=18):
    """(latar depan bool, alfa 0..1). PNG beralfa: alfa sendiri. Lain: latar putih neutral yang bersambung dengan tepi imej."""
    a = rgba[..., 3].astype(float) / 255
    if (a < 0.98).mean() > 0.05:
        return a > 0.09, a
    rgb = rgba[..., :3].astype(int)
    mn, mx = rgb.min(axis=2), rgb.max(axis=2)
    calon = (mn >= ambang) & ((mx - mn) <= kelabu)
    lab, _ = ndi.label(calon)
    tepi = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(tepi))
    return fg, fg.astype(float)


def jahitan(fg, rgba, x, lebar=45):
    """Laluan menegak kos minimum (seam) dalam jalur x ± lebar. Latar kosong paling murah, garis luar gelap murah,
    isi berwarna mahal; sedikit kos jarak dari x supaya laluan hampir lurus. Pulangan: lajur bagi setiap baris."""
    H, W = fg.shape
    lo, hi = max(0, x - lebar), min(W, x + lebar + 1)
    lum = rgba[:, lo:hi, :3].astype(float).mean(axis=2) / 255
    kos = np.where(fg[:, lo:hi], 1.0 + 4.0 * lum, 0.0) + 0.002 * np.abs(np.arange(lo, hi) - x)[None, :]
    M = kos.copy(); balik = np.zeros(kos.shape, np.int8); idx = np.arange(kos.shape[1])
    for y in range(1, H):
        calon = np.vstack([np.r_[np.inf, M[y - 1, :-1]], M[y - 1], np.r_[M[y - 1, 1:], np.inf]])
        a = calon.argmin(axis=0); M[y] += calon[a, idx]; balik[y] = a - 1
    j = int(M[-1].argmin()); laluan = np.empty(H, int)
    for y in range(H - 1, -1, -1):
        laluan[y] = lo + j
        if y: j += int(balik[y, j])
    return laluan


def pisah(fg, rgba, lajur):
    """Buang jalur 2 piksel di sepanjang setiap jahitan supaya figura yang bersentuhan menjadi komponen berasingan
    (2 piksel menghalang sambungan pepenjuru 8-arah merentasi jahitan)."""
    fg = fg.copy(); H, W = fg.shape
    for x in lajur:
        lal = jahitan(fg, rgba, x)
        for y, c in enumerate(lal):
            fg[y, c: min(W, c + 2)] = False
    return fg


def figura(fg, min_nisbah=0.15):
    """Komponen bersambung (8-arah) yang cukup besar, disusun baris demi baris (atas ke bawah), kiri ke kanan."""
    lab, n = ndi.label(fg, structure=np.ones((3, 3)))
    if not n:
        return []
    luas = ndi.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
    besar = luas.max()
    objs = ndi.find_objects(lab)
    keep = [i + 1 for i in range(n) if luas[i] >= besar * min_nisbah]
    keep.sort(key=lambda i: objs[i - 1][0].start)
    baris = []
    for i in keep:
        sl = objs[i - 1]
        if baris and sl[0].start < baris[-1][0][0] + 0.5 * (baris[-1][0][1] - baris[-1][0][0]):   # bermula di separuh atas baris semasa
            baris[-1][1].append(i)
        else:
            baris.append([(sl[0].start, sl[0].stop), [i]])
    urutan = [i for _, ids in baris for i in sorted(ids, key=lambda j: objs[j - 1][1].start)]
    out = []
    for i in urutan:
        m = lab == i
        sl = objs[i - 1]
        kecil = (lab > 0) & (lab != i)
        kecil[: sl[0].start] = False; kecil[sl[0].stop:] = False; kecil[:, : sl[1].start] = False; kecil[:, sl[1].stop:] = False
        for j in np.unique(lab[kecil]):
            if j and luas[j - 1] < besar * min_nisbah:
                m |= lab == j
        out.append(m)
    return out


def pelekat(rgba, m, alfa, cincin):
    """RGBA: figura (alfa asalnya) di atas garis putih selebar `cincin` piksel di luar figura (tepi lembut)."""
    a_s = np.where(m, alfa, 0.0)
    jarak = ndi.distance_transform_edt(~m)
    r = np.clip(cincin + 0.5 - jarak, 0, 1)
    A = a_s + r * (1 - a_s)
    rgb = rgba[..., :3].astype(float)
    C = np.where(A[..., None] > 0, (rgb * a_s[..., None] + 255 * (r * (1 - a_s))[..., None]) / np.maximum(A, 1e-6)[..., None], 255)
    return np.dstack([C.round().clip(0, 255).astype(np.uint8), (A * 255).round().astype(np.uint8)])


def potong(out, m, cincin, H, had_y=0):
    ys, xs = np.nonzero(m)
    pad = cincin + 2
    y0 = max(0, ys.min() - pad)
    y1 = ys.max() + 1 if ys.max() >= H - 1 - pad else min(H, ys.max() + 1 + pad)   # figura terpotong di tepi bawah: potong rata
    if had_y and had_y < y1:   # separuh badan: potong rata pada baris had_y (tiada garis putih di tepi bawah)
        y1 = had_y; xs = np.nonzero(m[:had_y].any(axis=0))[0]
    x0, x1 = max(0, xs.min() - pad), min(out.shape[1], xs.max() + 1 + pad)
    return out[y0:y1, x0:x1], m[y0:y1, x0:x1]


def kecilkan(rgba, tinggi):
    im = Image.fromarray(rgba, 'RGBA')
    if im.height > tinggi:
        im = im.resize((round(im.width * tinggi / im.height), tinggi), Image.LANCZOS)
    return im


def muka(rgba, m):
    """Segi empat kepala dan bahu bagi satu figura: dari atas kepala hingga bawah garis bahu, berpusat pada kepala."""
    ys, xs = np.nonzero(m)
    atas = ys.min()
    lebar = m.sum(axis=1)
    rujuk = np.median(lebar[atas: atas + 60][lebar[atas: atas + 60] > 0])
    bahu = next((y for y in range(atas + 40, m.shape[0]) if lebar[y] > rujuk * 1.9), atas + int((ys.max() - atas) * 0.45))
    tengah = int(np.mean(np.nonzero(m[atas:bahu])[1]))
    sisi = int((bahu - atas) * 1.22)
    y0 = max(0, atas - int(sisi * 0.06)); x0 = max(0, tengah - sisi // 2)
    kotak = rgba[y0: y0 + sisi, x0: x0 + sisi]
    out = np.zeros((sisi, sisi, 4), np.uint8); out[..., :3] = 255
    out[: kotak.shape[0], : kotak.shape[1]] = kotak
    return out


def simpan(im, laluan, kualiti=84):
    im.save(laluan, 'WEBP', quality=kualiti, method=6, alpha_quality=90)
    return laluan.stat().st_size


def senarai(teks, nama):
    xs = [x.strip() for x in (teks or '').split(',') if x.strip()]
    salah = [x for x in xs if not RE_ID.fullmatch(x)]
    if salah:
        sys.exit(f'{nama} tidak sah: {", ".join(salah)} (huruf kecil, nombor dan "-" sahaja)')
    return xs


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('helaian')
    p.add_argument('--watak', help='awalan nama fail: id watak (pose) atau nama set (kumpulan)')
    p.add_argument('--pose', help='nama pose ikut susunan figura, dipisah koma')
    p.add_argument('--kumpulan', help='nama gambar berkumpulan ikut susunan figura, dipisah koma')
    p.add_argument('--muka', help='pose untuk <watak>-muka.webp (lalai: pose pertama)')
    p.add_argument('--muka-kotak', help='"id:x0,y0,x1,y1;id2:..." kotak muka dalam helaian asal')
    p.add_argument('--tinggi', type=int, default=0, help='tinggi maksimum (lalai 420 untuk pose, 480 untuk kumpulan)')
    p.add_argument('--keluar', default=str(ROOT / 'peribadi' / 'avatar'))
    p.add_argument('--pratonton', help='laluan PNG helaian semakan (latar cerah dan gelap)')
    p.add_argument('--potong-y', type=int, default=0, help='buang bahagian di bawah baris ini (piksel helaian): separuh badan, cth. hingga peha')
    p.add_argument('--sempadan', help='lajur anggaran "x1,x2,..." untuk memisahkan figura yang bersentuhan')
    o = p.parse_args()

    rgba = np.asarray(Image.open(o.helaian).convert('RGBA'))
    H = rgba.shape[0]
    keluar = pathlib.Path(o.keluar); keluar.mkdir(parents=True, exist_ok=True)
    if keluar.resolve().is_relative_to((ROOT / 'docs').resolve()):
        print('AMARAN: folder keluaran dalam docs/ (AWAM). Imej keluarga sepatutnya dalam peribadi/.', file=sys.stderr)
    dijana = []

    nama = senarai(o.pose, 'Pose') if o.pose else senarai(o.kumpulan, 'Kumpulan') if o.kumpulan else []
    if o.pose and (salah := [x for x in nama if x not in POSE_SAH]):
        sys.exit(f'Pose tidak dikenali: {", ".join(salah)}. Pilihan: {", ".join(sorted(POSE_SAH))}')
    if nama:
        if not o.watak or not RE_ID.fullmatch(o.watak):
            sys.exit('--watak diperlukan (huruf kecil, nombor, "-")')
        fg, alfa = topeng(rgba)
        if o.sempadan:
            fg = pisah(fg, rgba, [int(x) for x in o.sempadan.split(',') if x.strip()])
        figs = figura(fg)
        if len(figs) != len(nama):
            sys.exit(f'Dijumpai {len(figs)} figura tetapi {len(nama)} nama diberi. Pastikan figura dipisahkan oleh ruang kosong.')
        cincin = max(4, round(H * (0.013 if o.pose else 0.008)))
        tinggi = o.tinggi or (420 if o.pose else 480)
        potongan = {}
        for n, m in zip(nama, figs):
            kp, km = potong(pelekat(rgba, m, alfa, cincin), m, cincin, H, o.potong_y)
            potongan[n] = (kp, km)
            im = kecilkan(kp, tinggi)
            f = keluar / f'{o.watak}-{n}.webp'; sz = simpan(im, f, 84 if o.pose else 82)
            dijana.append(f); print(f'  {f.name}  {im.width}x{im.height}  {sz / 1024:.1f} KB')
        if o.pose:
            mk = o.muka or nama[0]
            kp, km = potongan[mk]
            im = Image.fromarray(muka(kp, km), 'RGBA').resize((192, 192), Image.LANCZOS)
            f = keluar / f'{o.watak}-muka.webp'; sz = simpan(im, f)
            dijana.append(f); print(f'  {f.name}  192x192  {sz / 1024:.1f} KB  (daripada pose {mk})')

    for bahagian in [x for x in (o.muka_kotak or '').split(';') if x.strip()]:
        m_ = re.fullmatch(r'\s*([a-z0-9-]{1,24})\s*:\s*(\d+),(\d+),(\d+),(\d+)\s*', bahagian)
        if not m_:
            sys.exit(f'--muka-kotak tidak sah: {bahagian!r} (contoh "ibu:37,133,207,303")')
        wid, x0, y0, x1, y1 = m_.group(1), *map(int, m_.groups()[1:])
        if not (0 <= x0 < x1 <= rgba.shape[1] and 0 <= y0 < y1 <= H):
            sys.exit(f'Kotak {wid} di luar imej {rgba.shape[1]}x{H}')
        sisi = max(x1 - x0, y1 - y0); cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        kotak = Image.fromarray(rgba, 'RGBA').crop((cx - sisi // 2, cy - sisi // 2, cx - sisi // 2 + sisi, cy - sisi // 2 + sisi))
        im = kotak.resize((192, 192), Image.LANCZOS)
        f = keluar / f'{wid}-muka.webp'; sz = simpan(im, f)
        dijana.append(f); print(f'  {f.name}  192x192  {sz / 1024:.1f} KB  (kotak {x0},{y0},{x1},{y1})')

    if not dijana:
        sys.exit('Tiada apa-apa dijana: beri --pose, --kumpulan atau --muka-kotak.')
    if o.pratonton:
        ims = [Image.open(f).convert('RGBA') for f in dijana]
        t = 220; ims = [x.resize((max(1, round(x.width * t / x.height)), t), Image.LANCZOS) for x in ims]
        lebar = min(2400, sum(x.width for x in ims) + 16 * (len(ims) + 1))
        baris, x, y = [], 16, 0
        for im in ims:
            if x + im.width + 16 > lebar and x > 16: x = 16; y += t + 16
            baris.append((im, x, y)); x += im.width + 16
        tinggi_s = y + t + 32
        sheet = Image.new('RGB', (lebar, tinggi_s * 2), 'white')
        for k, warna in enumerate(['#f2efe8', '#1d2321']):
            sheet.paste(Image.new('RGB', (lebar, tinggi_s), warna), (0, k * tinggi_s))
            for im, x, y in baris:
                sheet.paste(im, (x, k * tinggi_s + y + 16), im)
        sheet.save(o.pratonton)
        print('  pratonton:', o.pratonton)


if __name__ == '__main__':
    main()
