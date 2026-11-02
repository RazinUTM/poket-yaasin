#!/usr/bin/env python3
"""Bina docs/data/kandungan.js daripada kandungan/*.yaml dan sumber Quran.

    python3 tools/bina.py            # bina + semak (gagal jika ada ralat)
    python3 tools/bina.py --semak    # semak sahaja, tidak menulis fail

Sumber (dimuat turun sekali ke tools/sumber/, tidak di-commit):
  - Teks Uthmani KFGQPC (Mushaf Madinah), pengekodan Khaled Hosny (dipadankan dengan font Amiri Quran)
  - Terjemahan Abdullah Muhammad Basmeih (Tanzil.net)
  - Gloss perkataan English quran.com (pakej npm @kmaslesa/holy-quran-word-by-word-full-data) — rujukan & audio perkataan
  - Teks kedua (KFGQPC Uthmani Hafs v13) untuk semakan silang kerangka huruf
"""
import json, re, sys, io, tarfile, unicodedata, urllib.request, hashlib, datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("Perlukan PyYAML:  pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent
SUMBER = ROOT / 'tools' / 'sumber'
KAND = ROOT / 'kandungan'
OUT = ROOT / 'docs' / 'data' / 'kandungan.js'

FAWAZ = 'https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/'
FAIL = {
    'quran-khaledhosny.json': FAWAZ + 'ara-qurankhaledhosn.json',
    'quran-kfgqpc-hafs.json': FAWAZ + 'ara-quranuthmanihaf.json',
    'ms-basmeih.json': FAWAZ + 'msa-abdullahmuhamma.json',
    'wbw-en.tgz': 'https://registry.npmjs.org/@kmaslesa/holy-quran-word-by-word-full-data/-/holy-quran-word-by-word-full-data-1.0.6.tgz',
}

SURAH = {1:("Al-Fatihah","الفاتحة",7),2:("Al-Baqarah","البقرة",286),3:("Ali 'Imran","آل عمران",200),4:("An-Nisa'","النساء",176),
 5:("Al-Ma'idah","المائدة",120),6:("Al-An'am","الأنعام",165),7:("Al-A'raf","الأعراف",206),8:("Al-Anfal","الأنفال",75),9:("At-Taubah","التوبة",129),
 10:("Yunus","يونس",109),11:("Hud","هود",123),12:("Yusuf","يوسف",111),13:("Ar-Ra'd","الرعد",43),14:("Ibrahim","إبراهيم",52),15:("Al-Hijr","الحجر",99),
 16:("An-Nahl","النحل",128),17:("Al-Isra'","الإسراء",111),18:("Al-Kahfi","الكهف",110),19:("Maryam","مريم",98),20:("Taha","طه",135),
 21:("Al-Anbiya'","الأنبياء",112),22:("Al-Hajj","الحج",78),23:("Al-Mu'minun","المؤمنون",118),24:("An-Nur","النور",64),25:("Al-Furqan","الفرقان",77),
 26:("Asy-Syu'ara'","الشعراء",227),27:("An-Naml","النمل",93),28:("Al-Qasas","القصص",88),29:("Al-'Ankabut","العنكبوت",69),30:("Ar-Rum","الروم",60),
 31:("Luqman","لقمان",34),32:("As-Sajdah","السجدة",30),33:("Al-Ahzab","الأحزاب",73),34:("Saba'","سبأ",54),35:("Fatir","فاطر",45),36:("Yaasin","يس",83),
 37:("As-Saffat","الصافات",182),38:("Sad","ص",88),39:("Az-Zumar","الزمر",75),40:("Ghafir","غافر",85),41:("Fussilat","فصلت",54),42:("Asy-Syura","الشورى",53),
 43:("Az-Zukhruf","الزخرف",89),44:("Ad-Dukhan","الدخان",59),45:("Al-Jathiyah","الجاثية",37),46:("Al-Ahqaf","الأحقاف",35),47:("Muhammad","محمد",38),
 48:("Al-Fath","الفتح",29),49:("Al-Hujurat","الحجرات",18),50:("Qaf","ق",45),51:("Adz-Dzariyat","الذاريات",60),52:("At-Tur","الطور",49),53:("An-Najm","النجم",62),
 54:("Al-Qamar","القمر",55),55:("Ar-Rahman","الرحمن",78),56:("Al-Waqi'ah","الواقعة",96),57:("Al-Hadid","الحديد",29),58:("Al-Mujadalah","المجادلة",22),
 59:("Al-Hasyr","الحشر",24),60:("Al-Mumtahanah","الممتحنة",13),61:("As-Saff","الصف",14),62:("Al-Jumu'ah","الجمعة",11),63:("Al-Munafiqun","المنافقون",11),
 64:("At-Taghabun","التغابن",18),65:("At-Talaq","الطلاق",12),66:("At-Tahrim","التحريم",12),67:("Al-Mulk","الملك",30),68:("Al-Qalam","القلم",52),
 69:("Al-Haqqah","الحاقة",52),70:("Al-Ma'arij","المعارج",44),71:("Nuh","نوح",28),72:("Al-Jinn","الجن",28),73:("Al-Muzzammil","المزمل",20),
 74:("Al-Muddaththir","المدثر",56),75:("Al-Qiyamah","القيامة",40),76:("Al-Insan","الإنسان",31),77:("Al-Mursalat","المرسلات",50),78:("An-Naba'","النبأ",40),
 79:("An-Nazi'at","النازعات",46),80:("'Abasa","عبس",42),81:("At-Takwir","التكوير",29),82:("Al-Infitar","الانفطار",19),83:("Al-Mutaffifin","المطففين",36),
 84:("Al-Insyiqaq","الانشقاق",25),85:("Al-Buruj","البروج",22),86:("At-Tariq","الطارق",17),87:("Al-A'la","الأعلى",19),88:("Al-Ghasyiyah","الغاشية",26),
 89:("Al-Fajr","الفجر",30),90:("Al-Balad","البلد",20),91:("Asy-Syams","الشمس",15),92:("Al-Lail","الليل",21),93:("Ad-Dhuha","الضحى",11),
 94:("Al-Insyirah","الشرح",8),95:("At-Tin","التين",8),96:("Al-'Alaq","العلق",19),97:("Al-Qadr","القدر",5),98:("Al-Bayyinah","البينة",8),
 99:("Az-Zalzalah","الزلزلة",8),100:("Al-'Adiyat","العاديات",11),101:("Al-Qari'ah","القارعة",11),102:("At-Takathur","التكاثر",8),103:("Al-'Asr","العصر",3),
 104:("Al-Humazah","الهمزة",9),105:("Al-Fil","الفيل",5),106:("Quraisy","قريش",4),107:("Al-Ma'un","الماعون",7),108:("Al-Kauthar","الكوثر",3),
 109:("Al-Kafirun","الكافرون",6),110:("An-Nasr","النصر",3),111:("Al-Masad","المسد",5),112:("Al-Ikhlas","الإخلاص",4),113:("Al-Falaq","الفلق",5),114:("An-Nas","الناس",6)}

ralat, amaran = [], []
def RALAT(m): ralat.append(m)
def AMARAN(m): amaran.append(m)

# ---------------------------------------------------------------- sumber
def ambil(nama):
    p = SUMBER / nama
    if not p.exists():
        SUMBER.mkdir(parents=True, exist_ok=True)
        print(f'  muat turun {nama} …', flush=True)
        with urllib.request.urlopen(FAIL[nama], timeout=120) as r:
            p.write_bytes(r.read())
    return p

def muat_json(nama):
    return json.loads(ambil(nama).read_text(encoding='utf-8'))

def tokens(text):
    """Pisah teks Uthmani kepada perkataan. Token yang bermula dengan tanda (cth. alif khanjariah selepas ruang) dicantum."""
    out = []
    for t in text.split(' '):
        if not t: continue
        if out and (unicodedata.category(t[0]) in ('Mn', 'Cf') or t[0] in 'ٰ⁠'):
            out[-1] += ' ' + t
        else:
            out.append(t)
    return out

TR = str.maketrans({'ی':'ي','ى':'ي','أ':'ا','إ':'ا','آ':'ا',
                    'ؤ':'و','ئ':'ي','ہ':'ه','ٱ':'ا'})
def kerangka(s):
    """Kerangka huruf sahaja (tanpa baris/tanda) untuk semakan silang dua sumber teks."""
    s = ''.join(ch for ch in s if unicodedata.category(ch) not in ('Mn','Me','Cf','Zs') and ch not in ' ـ۞۩۝ۥۦ')
    return s.translate(TR)

def cari_normal(s):
    """Normalisasi untuk carian dalam app: buang baris, satukan bentuk alif/ya/ha."""
    s = unicodedata.normalize('NFKC', s)
    s = ''.join(ch for ch in s if unicodedata.category(ch) not in ('Mn','Cf') and ch != 'ـ')
    return s.translate(str.maketrans({'أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ی':'ي','ة':'ه','ؤ':'و','ئ':'ي'}))

def muat_quran():
    K = muat_json('quran-khaledhosny.json')['quran']
    bism = None; Q = {}
    for v in K:
        t = v['text']; toks = tokens(t)
        if v['chapter'] == 1 and v['verse'] == 1: bism = t
        if v['chapter'] not in (1, 9) and v['verse'] == 1:
            toks = toks[4:]  # buang basmalah yang dicantum pada ayat 1
        Q[(v['chapter'], v['verse'])] = [x for x in toks if x not in ('۞', '۩')]
    return Q, bism

def semak_silang(Q):
    """Bandingkan kerangka huruf setiap ayat dengan teks KFGQPC kedua. Mesti 0 beza."""
    H = {(v['chapter'], v['verse']): v['text'] for v in muat_json('quran-kfgqpc-hafs.json')['quran']}
    beza = [k for k, toks in Q.items() if kerangka(' '.join(toks)) != kerangka(H[k])]
    return len(Q), beza

def muat_wbw():
    p = ambil('wbw-en.tgz')
    with tarfile.open(p) as tf:
        f = tf.extractfile('package/data.json'); data = json.load(f)
    W = {}
    for page in data:
        for ay in page['ayahs']:
            for w in ay.get('words') or []:
                if w and w['char_type_name'] == 'word':
                    s, a = map(int, w['parentAyahVerseKey'].split(':'))
                    W.setdefault((s, a), []).append(w)
    for k in W: W[k].sort(key=lambda w: w['position'])
    return W

# ---------------------------------------------------------------- spesifikasi rujukan Quran
RE_SPEC = re.compile(r'^(\d+):(\d+)(?:-(\d+))?(?:#(\d+)-(\d*))?$')
def parse_spec(spec):
    """'3:191#13-, 3:192-194' -> [(s, a, dari, hingga)] (dari/hingga 1-based perkataan; None = hujung)"""
    out = []
    for part in str(spec).split(','):
        part = part.strip()
        m = RE_SPEC.match(part)
        if not m: RALAT(f'Spesifikasi Quran tidak sah: {spec!r}'); continue
        s, a0, a1, f, t = m.groups(); s = int(s); a0 = int(a0); a1 = int(a1 or a0)
        for a in range(a0, a1 + 1):
            out.append((s, a, int(f) if f else 1, int(t) if t else None))
    return out

RE_REF = re.compile(r'\{\{(\d+:\d+(?:-\d+)?)\}\}')
RE_TANDA = re.compile(r'⟨(\d+:\d+(?:-\d+)?(?:, ?\d+:\d+(?:-\d+)?)*)⟩')   # tanda petikan ayat dalam rumi: ⟨36:5⟩, ⟨4:69,1:7⟩
RE_NOTA = re.compile(r'\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]')  # pautan ke nota lain

# ---------------------------------------------------------------- petikan ayat dalam teks doa (dasar Rumi)
def rasm(s):
    """Kunci rasm untuk memadankan teks Uthmani dengan ejaan imla'i doa:
    tanpa baris, tanpa alif dan hamzah atas garis, tanpa ruang (beza pemisahan perkataan, cth. يٰٓأَيُّهَا / يَا أَيُّهَا)."""
    s = unicodedata.normalize('NFC', s).replace('وٰ', '')   # Uthmani: waw + alif kecil = bunyi alif (ٱلصَّلَوٰة)
    out = []
    for ch in s:
        if ch in 'ىی': ch = 'ي'
        elif ch == 'ة': ch = 'ت'
        # alif & semua kerusi hamzah dibuang: Uthmani sering menulis hamzah tanpa kerusi (شَيْـًٔا) berbanding imla'i (شَيْئًا)
        if ch in 'اأإآٱءئؤـ' or unicodedata.category(ch)[0] != 'L' or unicodedata.category(ch) == 'Lm':
            continue
        out.append(ch)
    return ''.join(out)

class IndeksQuran:
    """Seluruh al-Quran sebagai satu rentetan rasm (ayat bersambung dalam surah) + set L-gram untuk carian pantas."""
    def __init__(self, Q, L):
        import bisect
        self.L, self._bisect = L, bisect.bisect_right
        parts, self.mula, self.kunci, pos = [], [], [], 0
        for s in range(1, 115):
            a = 1
            while (s, a) in Q:
                r = rasm(' '.join(Q[(s, a)]))
                self.mula.append(pos); self.kunci.append((s, a))
                parts.append(r); pos += len(r); a += 1
            parts.append('#'); pos += 1
        self.semua = ''.join(parts)
        self.gram = {self.semua[i:i + L] for i in range(len(self.semua) - L + 1)}

    def ayat_bagi(self, sub, had=40):
        """Senarai julat ayat [(s, a0, a1)] di mana rentetan rasm `sub` muncul."""
        out, k = [], self.semua.find(sub)
        while k >= 0 and len(out) < had:
            i0 = self._bisect(self.mula, k) - 1; i1 = self._bisect(self.mula, k + len(sub) - 1) - 1
            (s0, a0), (s1, a1) = self.kunci[i0], self.kunci[i1]
            if s0 == s1: out.append((s0, a0, a1))
            k = self.semua.find(sub, k + 1)
        return out

    def cari(self, frasa, putih=()):
        """Cari petikan ayat (≥ L huruf rasm berturut-turut) dalam senarai frasa Arab.
        `putih`: rentetan rasm lafaz zikir yang dikecualikan; ia dikosongkan dahulu supaya tidak dikira.
        Pulangkan (petikan, zikir): petikan = [(sub, [idx frasa], [(s,a0,a1)])], zikir = [(rasm, [idx frasa])]."""
        chars, src = [], []
        for i, f in enumerate(frasa):
            r = rasm(f); chars.append(r); src += [i] * len(r)
        D = ''.join(chars); D2 = list(D); zikir = []
        for w in sorted(putih, key=len, reverse=True):
            k = D.find(w)
            while k >= 0:
                if '|' not in D2[k:k + len(w)]:
                    zikir.append((w, sorted(set(src[k:k + len(w)]))))
                    D2[k:k + len(w)] = '|' * len(w)
                k = D.find(w, k + 1)
        D = ''.join(D2)
        hasil, i, n, L = [], 0, len(D), self.L
        while i <= n - L:
            if D[i:i + L] in self.gram:
                lo, hi = i + L, n          # carian binari: petikan terpanjang bermula di i
                while lo < hi:
                    mid = (lo + hi + 1) // 2
                    if D[i:mid] in self.semua: lo = mid
                    else: hi = mid - 1
                sub = D[i:lo]
                hasil.append((sub, sorted(set(src[i:lo])), self.ayat_bagi(sub)))
                i = lo
            else:
                i += 1
        return hasil, zikir

# ---------------------------------------------------------------- utama
def bina(tulis=True):
    print('• Memuat sumber Quran')
    Q, bism = muat_quran()
    n, beza = semak_silang(Q)
    print(f'  semakan silang kerangka huruf: {n} ayat, {len(beza)} berbeza')
    if beza: RALAT(f'Teks Quran tidak sepadan dengan sumber kedua pada {beza[:10]}')
    W = muat_wbw()
    MS = {(v['chapter'], v['verse']): v['text'] for v in muat_json('ms-basmeih.json')['quran']}

    # makna perkata BM
    G = {}  # (s,a) -> list gloss (None jika tiada)
    for ln, line in enumerate((KAND / 'perkata.tsv').read_text(encoding='utf-8').splitlines(), 1):
        if not line.strip() or line.startswith('#'): continue
        try: k, g = line.split('\t')
        except ValueError: RALAT(f'perkata.tsv baris {ln}: perlu TAB'); continue
        for s, a, f, t in parse_spec(k):
            toks = Q.get((s, a))
            if toks is None: RALAT(f'perkata.tsv baris {ln}: ayat {s}:{a} tiada'); continue
            t = t or len(toks); gs = g.split('|')
            if len(gs) != t - f + 1:
                RALAT(f'perkata.tsv baris {ln} ({k}): {t-f+1} perkataan tetapi {len(gs)} makna'); continue
            arr = G.setdefault((s, a), [None] * len(toks))
            for i, x in enumerate(gs): arr[f - 1 + i] = x.strip()

    perlu = set()   # ayat yang perlu dimasukkan
    rujuk = set()   # ayat rujukan dalam nota ({{s:a}})
    def ambil_rujukan(teks):
        for m in RE_REF.finditer(teks or ''):
            for s, a, f, t in parse_spec(m.group(1)): rujuk.add((s, a))

    # ---------------- dasar Rumi: indeks petikan ayat
    R = yaml.safe_load((KAND / 'rumi.yaml').read_text(encoding='utf-8')) or {}
    putih = [rasm(l) for k in R.get('kekal', []) for l in k['lafaz']]
    IQ = IndeksQuran(Q, int(R.get('ambang', 12)))
    laporan = []   # (tag, bahagian, frasa Arab, ayat, keputusan)
    def fmt_ay(ay):
        return ', '.join(f'{s}:{a0}' + (f'-{a1}' if a1 != a0 else '') for s, a0, a1 in ay[:5]) + (' …' if len(ay) > 5 else '')
    def semak_rumi(tag, nb, ar, ru):
        """Pastikan Rumi tidak mengandungi petikan ayat yang belum diputuskan (rujuk kandungan/rumi.yaml)."""
        tanda = set()
        for m in RE_TANDA.finditer(ru or ''):
            for part in m.group(1).split(','):
                for s_, a_, *_ in parse_spec(part.strip()):
                    if (s_, a_) not in Q: RALAT(f'{tag} bahagian {nb}: tanda ⟨{part}⟩ merujuk ayat yang tiada')
                    tanda.add((s_, a_)); rujuk.add((s_, a_))
        petik, zk = IQ.cari(ar, putih)
        for sub, fi, ay in petik:
            keys = {(s, a) for s, a0, a1 in ay for a in range(a0, a1 + 1)}
            frasa = ' | '.join(ar[j] for j in fi)
            if not ru: kep = 'tiada Rumi'
            elif keys & tanda: kep = 'Rumi disembunyikan'
            else:
                kep = 'BELUM DIPUTUSKAN'
                RALAT(f'{tag} bahagian {nb}: Rumi mengandungi petikan ayat [{fmt_ay(ay)}] dalam «{frasa}». '
                      f'Tanda dengan ⟨s:a⟩ dalam rumi, atau tambah lafaznya ke kandungan/rumi.yaml jika ia zikir/diksi.')
            laporan.append((tag, nb, frasa, fmt_ay(ay), kep))
        for w, fi in zk:
            laporan.append((tag, nb, ' | '.join(ar[j] for j in fi), fmt_ay(IQ.ayat_bagi(w)) or '—', 'Rumi dikekalkan (rumi.yaml)'))
        for k in sorted(tanda):
            if not any(k in {(s, a) for s, a0, a1 in ay for a in range(a0, a1 + 1)} for _, _, ay in petik):
                laporan.append((tag, nb, '', f'{k[0]}:{k[1]}', 'Rumi disembunyikan (tanda editorial)'))

    # ---------------- doa
    templat = yaml.safe_load((KAND / 'templat.yaml').read_text(encoding='utf-8'))
    for tk, tv in templat.items():
        for g, o in tv.items():
            if isinstance(o, dict) and o.get('teks'):
                semak_rumi(f'templat:{tk}.{g}', 1, [x.strip() for x in o['teks'].split('|')], o.get('rumi'))
    doa, ids = [], set()
    for fp in sorted((KAND / 'doa').glob('*.yaml')):
        for d in yaml.safe_load(fp.read_text(encoding='utf-8')) or []:
            tag = f'{fp.name}:{d.get("id")}'
            if not d.get('id') or not d.get('tajuk'): RALAT(f'{tag}: perlu id dan tajuk'); continue
            if d['id'] in ids: RALAT(f'{tag}: id berulang'); continue
            ids.add(d['id'])
            for kunci in ('nota', 'bila'): ambil_rujukan(d.get(kunci))
            s = d.get('sumber') or {}
            ambil_rujukan(s.get('ruj')); ambil_rujukan(s.get('nota'))
            bah = d.get('bahagian')
            if bah is None:
                bah = [{k: d[k] for k in ('teks', 'frasa', 'rumi', 'makna', 'quran') if k in d}]
            out_b = []
            for i, b in enumerate(bah):
                ob = {}
                if b.get('tajuk'): ob['tj'] = b['tajuk']
                if b.get('ulang'): ob['ul'] = int(b['ulang'])
                if b.get('pilihan'): ob['pl'] = b['pilihan']
                if 'arwah' in b:
                    if b['arwah'] not in templat: RALAT(f'{tag}: templat arwah {b["arwah"]} tiada')
                    ob['arwah'] = b['arwah']; out_b.append(ob); continue
                if 'varian' in b:
                    if b['varian'] not in templat: RALAT(f'{tag}: templat varian {b["varian"]} tiada')
                    ob['varian'] = b['varian']; out_b.append(ob); continue
                if 'quran' in b:
                    sp = parse_spec(b['quran'])
                    for s_, a_, f_, t_ in sp:
                        if (s_, a_) not in Q: RALAT(f'{tag}: ayat {s_}:{a_} tiada')
                        perlu.add((s_, a_))
                    ob['q'] = str(b['quran'])
                    if b.get('makna'): ob['mk'] = b['makna']
                    out_b.append(ob); continue
                teks = str(b.get('teks') or '').strip()
                if not teks: RALAT(f'{tag} bahagian {i+1}: tiada teks'); continue
                ar = [x.strip() for x in teks.split('|')]
                ob['ar'] = ar
                if b.get('frasa'):
                    fr = [x.strip() for x in str(b['frasa']).split('|')]
                    if len(fr) != len(ar):
                        RALAT(f'{tag} bahagian {i+1}: {len(ar)} frasa Arab tetapi {len(fr)} frasa BM')
                    ob['fr'] = fr
                else:
                    AMARAN(f'{tag} bahagian {i+1}: tiada makna frasa')
                if b.get('rumi'): ob['ru'] = str(b['rumi']).strip()
                if b.get('makna'): ob['mk'] = str(b['makna']).strip()
                ambil_rujukan(b.get('makna'))
                semak_rumi(d['id'], i + 1, ar, ob.get('ru'))
                out_b.append(ob)
            jenis = s.get('jenis') or ('quran' if any('q' in b for b in out_b) and all('q' in b for b in out_b) else '')
            if jenis == 'quran' or (not s and d.get('quran')):
                sp = parse_spec(d['quran'])
                s = {'jenis': 'quran', 'darjat': 'Al-Quran',
                     'ruj': ', '.join(sorted({f'{SURAH[a][0]} {a}:{b}' for a, b, *_ in sp}, key=lambda x: x))}
                # ringkaskan julat: Surah s:a–b
                kump = {}
                for a, b, *_ in sp: kump.setdefault(a, []).append(b)
                s['ruj'] = '; '.join(f'Surah {SURAH[a][0]} ({a}:{min(v)}' + (f'–{max(v)})' if max(v) != min(v) else ')') for a, v in kump.items())
            if not s.get('jenis'): RALAT(f'{tag}: tiada sumber.jenis')
            item = {'id': d['id'], 'tj': d['tajuk'], 'kat': d.get('kat') or [], 'tag': d.get('tag') or [],
                    's': {k2: v for k2, v in {'j': s.get('jenis'), 'r': s.get('ruj'), 'd': s.get('darjat'), 'u': s.get('url'), 'n': s.get('nota')}.items() if v},
                    'b': out_b}
            for k1, k2 in (('subtajuk', 'st'), ('bila', 'bila'), ('nota', 'nota'), ('ulang', 'ul'), ('lihat', 'lihat')):
                if d.get(k1): item[k2] = d[k1]
            # teks carian (Arab tanpa baris + BM + rumi + tag)
            cari = ' '.join([d['tajuk'], d.get('subtajuk', ''), ' '.join(item['tag']),
                             ' '.join(' '.join(b.get('fr', [])) + ' ' + b.get('mk', '') + ' ' + RE_TANDA.sub(' ', b.get('ru', '')) for b in out_b)])
            arc = ' '.join(cari_normal(' '.join(b.get('ar', []))) for b in out_b)
            item['_c'] = (cari.lower() + ' ' + arc).strip()
            doa.append(item)

    # ---------------- susunan
    susunan = yaml.safe_load((KAND / 'susunan.yaml').read_text(encoding='utf-8')) or []
    for su in susunan:
        for st in su['langkah']:
            if 'doa' in st and st['doa'] not in ids: RALAT(f'susunan {su["id"]}: doa {st["doa"]} tiada')
            if 'quran' in st:
                for s_, a_, *_ in parse_spec(st['quran']): perlu.add((s_, a_))
            if 'surah' in st:
                for a_ in range(1, SURAH[st['surah']][2] + 1): perlu.add((st['surah'], a_))
        ambil_rujukan(su.get('nota'))

    # ---------------- fail tambahan (pilihan)
    def muat_pilihan(nama):
        p = KAND / nama
        return (yaml.safe_load(p.read_text(encoding='utf-8')) or []) if p.exists() else []
    majlis = muat_pilihan('majlis.yaml')
    for m in majlis:
        for st in m.get('langkah', []):
            if 'doa' in st and st['doa'] not in ids: RALAT(f'majlis {m["id"]}: doa {st["doa"]} tiada')
            if 'susunan' in st and st['susunan'] not in {x['id'] for x in susunan}: RALAT(f'majlis {m["id"]}: susunan {st["susunan"]} tiada')
            if 'quran' in st:
                for s_, a_, *_ in parse_spec(st['quran']): perlu.add((s_, a_))
    # ---------------- dasar (kandungan/dasar.yaml): Mod Selamat = audio dikira bersama teks dalam had satu juzuk
    dasar_y = (yaml.safe_load((KAND / 'dasar.yaml').read_text(encoding='utf-8')) if (KAND / 'dasar.yaml').exists() else None) or {}
    if not isinstance(dasar_y.get('mod_selamat', True), bool): RALAT('dasar.yaml: mod_selamat mesti true atau false')
    mod_selamat = dasar_y.get('mod_selamat', True) is not False
    # ---------------- hafalan: AUDIO SAHAJA. Tiada ayat dimuatkan daripada senarai ini (Akta 326; lihat hafalan.yaml)
    hafalan = muat_pilihan('hafalan.yaml')
    for x in hafalan:
        s_ = x.get('s')
        if not x.get('id') or s_ not in SURAH: RALAT(f'hafalan {x.get("id")}: perlu id dan nombor surah yang sah'); continue
        if 'teks' in x: RALAT(f'hafalan {x["id"]}: medan "teks" tidak lagi digunakan; modul Hafalan ialah audio sahaja')
        x.setdefault('dari', 1); x.setdefault('hingga', SURAH[s_][2]); x.setdefault('tajuk', SURAH[s_][0]); x.setdefault('kumpulan', 'lazim')
        if x['kumpulan'] not in ('pilihan', 'asas', 'lazim'): RALAT(f'hafalan {x["id"]}: kumpulan {x["kumpulan"]} tidak dikenali')
        if not isinstance(x.get('audio', True), bool): RALAT(f'hafalan {x["id"]}: audio mesti true atau false')
        x['audio'] = (x.get('audio', True) is not False) or not mod_selamat   # tanpa Mod Selamat: semua surah beraudio
        if not (1 <= x['dari'] <= x['hingga'] <= SURAH[s_][2]): RALAT(f'hafalan {x["id"]}: julat ayat {x["dari"]}-{x["hingga"]} tidak sah')
    if len({x.get('id') for x in hafalan}) != len(hafalan): RALAT('hafalan.yaml: id berulang')
    # ---------------- pek watak TERBINA (awam; sengaja kosong). Imej keluarga: pek peribadi (tools/pek.py), bukan di sini
    avatar = muat_pilihan('avatar.yaml') or {}
    POSE = {'asal', 'sapa', 'fikir', 'syabas', 'tulis', 'baca', 'doa'}
    dir_av = ROOT / 'docs' / 'avatar'
    def semak_imej(f, tag):
        p = dir_av / str(f)
        if not re.fullmatch(r'[a-z0-9-]+\.(webp|png)', str(f)) or not p.exists(): RALAT(f'avatar {tag}: fail {f} tiada dalam docs/avatar/')
        elif p.stat().st_size > 80 * 1024: AMARAN(f'avatar {tag}: {f} {p.stat().st_size // 1024} KB (cadangan ≤ 80 KB; jalankan tools/avatar.py)')
    watak = avatar.get('watak') or []
    for w in watak:
        if not re.fullmatch(r'[a-z0-9-]{1,20}', str(w.get('id', ''))): RALAT(f'avatar: id watak {w.get("id")} tidak sah'); continue
        if not w.get('nama'): RALAT(f'avatar {w["id"]}: perlu nama')
        if w.get('peranan') and w['peranan'] not in ('abah', 'ummi', 'anak', 'atuk', 'nenek', 'lain'): RALAT(f'avatar {w["id"]}: peranan {w["peranan"]} tidak dikenali')
        if w.get('muka'): semak_imej(w['muka'], w['id'])
        for k_, f in (w.get('pose') or {}).items():
            if k_ not in POSE: RALAT(f'avatar {w["id"]}: pose {k_} tidak dikenali ({", ".join(sorted(POSE))})')
            semak_imej(f, f'{w["id"]}.{k_}')
        if not w.get('muka') and not (w.get('pose') or {}).get('asal'): RALAT(f'avatar {w["id"]}: perlu muka atau pose asal')
    if len({w.get('id') for w in watak}) != len(watak): RALAT('avatar.yaml: id watak berulang')
    for g in avatar.get('kumpulan') or []:
        if not g.get('id') or not g.get('fail'): RALAT('avatar.yaml: kumpulan perlu id dan fail'); continue
        if any(k_ not in ('utama', 'keluarga', 'hafalan', 'diari', 'musafir') for k_ in g.get('konteks') or []): RALAT(f'avatar kumpulan {g["id"]}: konteks tidak dikenali')
        semak_imej(g['fail'], 'kumpulan ' + g['id'])
        for a_ in g.get('ahli') or []:
            if a_ not in {w.get('id') for w in watak}: RALAT(f'avatar kumpulan {g["id"]}: watak {a_} tiada')
    sw_teks = (ROOT / 'docs' / 'sw.js').read_text(encoding='utf-8')
    for w in watak:
        for f in [w.get('muka')] + list((w.get('pose') or {}).values()):
            if f and f"'avatar/{f}'" not in sw_teks: RALAT(f'avatar {w.get("id")}: avatar/{f} tiada dalam senarai ASAS docs/sw.js (perlu untuk luar talian)')
    for g in avatar.get('kumpulan') or []:
        if g.get('fail') and f"'avatar/{g['fail']}'" not in sw_teks: RALAT(f'avatar kumpulan {g.get("id")}: avatar/{g["fail"]} tiada dalam senarai ASAS docs/sw.js')
    avatar = {'watak': watak, 'kumpulan': avatar.get('kumpulan') or []}
    # ---------------- metadata mushaf (tiada teks): nama & bilangan ayat 114 surah, permulaan juz dan halaman Madinah
    mushaf = yaml.safe_load((KAND / 'mushaf.yaml').read_text(encoding='utf-8'))
    juz = [v for baris_ in mushaf['juz'] for v in baris_]; hal = [v for baris_ in mushaf['halaman'] for v in baris_]
    mula_s, kum = {}, 0
    for s_ in range(1, 115): mula_s[s_] = kum + 1; kum += SURAH[s_][2]
    if kum != 6236 or kum != len(Q): RALAT(f'jumlah ayat SURAH {kum} ≠ 6236 / teks {len(Q)}')
    if len(juz) != 30 or len(hal) != 604 or juz != sorted(juz) or hal != sorted(hal) or juz[0] != 1 or hal[0] != 1 or hal[-1] > 6236:
        RALAT('mushaf.yaml: senarai juz/halaman tidak sah')
    elif juz[1] != mula_s[2] + 141 or juz[29] != mula_s[78] or hal[1] != mula_s[2]:
        RALAT('mushaf.yaml: sempadan juz/halaman tidak sepadan dengan 2:142, 78:1 dan 2:1')
    meta = {'surah': [[SURAH[s_][0], SURAH[s_][1], SURAH[s_][2]] for s_ in range(1, 115)], 'juz': juz, 'hal': hal}

    kalendar = muat_pilihan('kalendar.yaml')
    for k in kalendar:
        for c in k.get('cadang', []):
            j, _, v = c.partition(':')
            if j == 'doa' and v not in ids: RALAT(f'kalendar {k["id"]}: doa {v} tiada')
            if j == 'susunan' and v not in {x['id'] for x in susunan}: RALAT(f'kalendar {k["id"]}: susunan {v} tiada')
            if j == 'majlis' and v not in {x['id'] for x in majlis}: RALAT(f'kalendar {k["id"]}: majlis {v} tiada')
            if j == 'hafalan' and v not in {x['id'] for x in hafalan}: RALAT(f'kalendar {k["id"]}: hafalan {v} tiada')
        ambil_rujukan(k.get('pesan'))
    hijri = yaml.safe_load((KAND / 'hijri.yaml').read_text(encoding='utf-8')) if (KAND / 'hijri.yaml').exists() else {}
    nota = muat_pilihan('nota.yaml')
    nota_ids = {n_['id'] for n_ in nota}
    for n_ in nota:
        if not n_.get('id') or not n_.get('tajuk') or not n_.get('isi'): RALAT(f'nota {n_.get("id")}: perlu id, tajuk, isi')
        ambil_rujukan(n_.get('isi'))
    # pautan [[nota]] dalam semua teks
    def semak_pautan(teks, tag):
        for m in RE_NOTA.finditer(teks or ''):
            if m.group(1) not in nota_ids: RALAT(f'{tag}: pautan nota [[{m.group(1)}]] tiada dalam nota.yaml')
    for d in doa:
        semak_pautan(d.get('nota'), f'doa {d["id"]}'); semak_pautan(d['s'].get('n'), f'doa {d["id"]} sumber')
        for x in d.get('lihat', []):
            if x not in nota_ids: RALAT(f'doa {d["id"]}: lihat nota {x} tiada')
    for n_ in nota: semak_pautan(n_.get('isi'), f'nota {n_["id"]}')
    for su in susunan: semak_pautan(su.get('nota'), f'susunan {su["id"]}')
    for k in kalendar: semak_pautan(k.get('pesan'), f'kalendar {k["id"]}')
    for m in majlis: semak_pautan(m.get('nota'), f'majlis {m["id"]}')
    kat = yaml.safe_load((KAND / 'kategori.yaml').read_text(encoding='utf-8')) if (KAND / 'kategori.yaml').exists() else {}
    for d in doa:
        for k in d['kat']:
            if kat and k not in kat: RALAT(f'doa {d["id"]}: kategori {k} tiada dalam kategori.yaml')

    perlu |= set(G.keys()); perlu.add((1, 1))
    # ---------------- ayat
    ayat = {}
    tiada_gloss = []
    for k in sorted(perlu | rujuk):
        toks = Q[k]; s, a = k
        o = {'w': toks, 't': MS.get(k, '')}
        if k in perlu:
            g = G.get(k)
            if g: o['g'] = g
            elif k in perlu: tiada_gloss.append(f'{s}:{a}')
            ws = W.get(k, [])
            if len(ws) == len(toks):
                o['e'] = [w['translation']['text'] for w in ws]
            else:
                AMARAN(f'{s}:{a}: bilangan perkataan quran.com ({len(ws)}) ≠ Uthmani ({len(toks)}); gloss English/audio perkataan dimatikan')
                o['na'] = 1
        ayat[f'{s}:{a}'] = o
    if tiada_gloss: AMARAN(f'{len(tiada_gloss)} ayat tanpa makna perkata BM: {", ".join(tiada_gloss[:12])}{" …" if len(tiada_gloss) > 12 else ""}')

    surah = {s: list(SURAH[s]) for s in sorted({k[0] for k in perlu | rujuk})}

    # ---------------- saiz kandungan al-Quran (Akta 326: >= 1 juzuk = "teks Al-Qur'an", perlu lesen & perakuan)
    jumlah_q = sum(len(Q[k]) for k in perlu | rujuk)
    sejuzuk = round(sum(len(v) for v in Q.values()) / 604 * 20)   # purata perkataan bagi 20 halaman Mushaf Madinah
    nisbah = jumlah_q / sejuzuk
    if nisbah >= 1: RALAT(f'Kandungan ayat {jumlah_q} perkataan = {nisbah:.2f} juzuk. Melebihi satu juzuk menjadikan app "teks Al-Qur\'an" (lesen & perakuan KDN).')
    elif nisbah >= 0.9 and not mod_selamat: AMARAN(f'Kandungan ayat {jumlah_q} perkataan = {nisbah:.2f} juzuk, hampir had satu juzuk (baki {sejuzuk - jumlah_q} perkataan).')
    # Mod Selamat: ayat yang boleh DIDENGAR dalam Hafalan (tanpa teks) turut dikira; "dokumen" dalam Akta termasuk rakaman bunyi
    audio_sahaja = set()
    if mod_selamat:
        for x in hafalan:
            if x.get('audio') and x.get('s') in SURAH:
                for a_ in range(x['dari'], x['hingga'] + 1):
                    if (x['s'], a_) not in perlu | rujuk: audio_sahaja.add((x['s'], a_))
    jumlah_a = jumlah_q + sum(len(Q[k]) for k in audio_sahaja)
    nisbah_a = jumlah_a / sejuzuk
    if mod_selamat and nisbah_a >= 1: RALAT(f'Mod Selamat: teks + audio {jumlah_a} perkataan = {nisbah_a:.2f} juzuk. Tandakan lebih banyak surah "audio: false" dalam hafalan.yaml.')
    elif mod_selamat and nisbah_a >= 0.9: AMARAN(f'Mod Selamat: teks + audio {jumlah_a} perkataan = {nisbah_a:.3f} juzuk (baki {sejuzuk - jumlah_a} perkataan).')
    kump = {}
    for s_, a_ in sorted(perlu | rujuk): kump.setdefault(s_, []).append(a_)
    def julat(aa):
        out, mula = [], aa[0]
        for x, y in zip(aa, aa[1:] + [None]):
            if y != x + 1: out.append(f'{mula}' if mula == x else f'{mula}–{x}'); mula = y
        return ', '.join(out)
    baris = ['# Senarai ayat al-Quran dalam app', '', 'Dijana oleh `tools/bina.py` untuk lampiran surat kepada LPPPQ/KDN. Jangan edit terus.', '',
             f'Jumlah: {len(perlu | rujuk)} ayat, {jumlah_q} perkataan (token Uthmani). Satu juzuk ≈ {sejuzuk} perkataan (purata 20 halaman Mushaf Madinah), jadi kandungan ≈ {nisbah:.3f} juzuk; baki {sejuzuk - jumlah_q} perkataan sebelum had satu juzuk.', '',
             'Sumber teks: Mushaf Madinah, Mujamma\' Malik Fahd (KFGQPC), riwayat Hafs \'an \'Asim. Dipaparkan dalam tulisan Arab sahaja.', '',
             '| Surah | Ayat | Bilangan ayat | Perkataan |', '|---|---|---|---|']
    for s_, aa in kump.items():
        baris.append(f'| {s_}. {SURAH[s_][0]} | {julat(aa)} | {len(aa)} | {sum(len(Q[(s_, x)]) for x in aa)} |')
    baris += ['', '## Audio tanpa teks (modul Hafalan)', '',
              (f'Mod Selamat AKTIF (kandungan/dasar.yaml): audio yang boleh dimainkan turut dikira. Teks + audio = {jumlah_a} perkataan ≈ {nisbah_a:.3f} juzuk; baki {sejuzuk - jumlah_a} perkataan. '
               f'Dijejak sahaja tanpa audio dalam app (audio dibuka dalam Smart Quran): {", ".join(SURAH[x["s"]][0] for x in sorted(hafalan, key=lambda y: y["s"]) if not x["audio"] and x.get("s"))}, dan surah yang ditambah sendiri oleh pengguna.')
              if mod_selamat else 'Mod Selamat TIDAK aktif: audio semua surah hafalan boleh dimainkan (tidak dikira dalam had teks).', '']
    if audio_sahaja:
        ka = {}
        for s_, a_ in sorted(audio_sahaja): ka.setdefault(s_, []).append(a_)
        baris += ['| Surah | Ayat (audio sahaja) | Bilangan ayat | Perkataan |', '|---|---|---|---|']
        for s_, aa in ka.items():
            baris.append(f'| {s_}. {SURAH[s_][0]} | {julat(aa)} | {len(aa)} | {sum(len(Q[(s_, x)]) for x in aa)} |')
    (ROOT / 'tools' / 'senarai-ayat-dalam-app.md').write_text('\n'.join(baris) + '\n', encoding='utf-8')

    zon = yaml.safe_load((KAND / 'zon-solat.yaml').read_text(encoding='utf-8')) if (KAND / 'zon-solat.yaml').exists() else []
    for z in zon:
        if not z.get('lat') or not z.get('lon'): RALAT(f'zon {z.get("kod")}: tiada koordinat')
    # ---------------- kad khat harian di skrin Utama (kandungan/khat.yaml): bukan untuk ayat al-Quran
    khat_raw = (yaml.safe_load((KAND / 'khat.yaml').read_text(encoding='utf-8')) if (KAND / 'khat.yaml').exists() else {}) or {}
    doa_peta = {d_['id']: d_ for d_ in doa}
    khat = {}
    for jenis_k in ('selawat', 'zikir'):
        ids = khat_raw.get(jenis_k) or []
        for i_ in ids:
            d_ = doa_peta.get(i_)
            if not d_: RALAT(f'khat.yaml {jenis_k}: doa {i_} tiada'); continue
            if any(b_.get('q') for b_ in d_['b']): RALAT(f'khat.yaml {i_}: ada rujukan ayat al-Quran; fon khat bukan Rasm Uthmani')
            ar_ = [f_ for b_ in d_['b'] for f_ in b_.get('ar', [])]
            if not ar_: RALAT(f'khat.yaml {i_}: tiada teks Arab'); continue
            petik_, _ = IQ.cari(ar_, putih)
            if petik_: RALAT(f'khat.yaml {i_}: dikesan petikan ayat ({fmt_ay(petik_[0][2])}); fon khat bukan Rasm Uthmani')
            if sum(len(f_.split()) for f_ in ar_) > 70: amaran.append(f'khat.yaml {i_}: teks panjang untuk kad Utama')
        if len(set(ids)) != len(ids): RALAT(f'khat.yaml {jenis_k}: id berulang')
        khat[jenis_k] = list(ids)
    # ---------------- carian pintar: kamus sinonim dan laman rasmi untuk carian lanjut
    def istilah_cari(t):
        t = cari_normal(str(t)).lower().replace("'", '').replace('\u2019', '').replace('`', '')
        return ' '.join(x for x in re.split(r'[^\w]+', t) if x)
    sinonim = []
    for i, g in enumerate(muat_pilihan('sinonim.yaml')):
        if not isinstance(g, list) or len(g) < 2: RALAT(f'sinonim.yaml kumpulan {i + 1}: perlu sekurang-kurangnya dua istilah'); continue
        k = [istilah_cari(t) for t in g]
        if not all(k): RALAT(f'sinonim.yaml kumpulan {i + 1}: istilah kosong')
        sinonim.append(list(dict.fromkeys(k)))
    laman = muat_pilihan('laman.yaml')
    for x in laman:
        if not x.get('nama') or not re.fullmatch(r'[a-z0-9.-]+\.[a-z]{2,}', str(x.get('domain', ''))): RALAT(f'laman.yaml: entri tidak sah {x}')
        if x.get('negeri') and not re.fullmatch(r'[A-Z]{3}', str(x['negeri'])): RALAT(f'laman.yaml {x.get("domain")}: negeri mesti awalan zon (cth. JHR)')
    for n_ in nota:
        if n_.get('kata') is not None and not (isinstance(n_['kata'], list) and all(isinstance(t, str) and t for t in n_['kata'])): RALAT(f'nota {n_["id"]}: kata mesti senarai teks')
    data = {
        'dibina': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime('%Y-%m-%d %H:%M'),
        'surah': surah, 'ayat': ayat, 'doa': doa, 'templat': templat, 'susunan': susunan,
        'majlis': majlis, 'kalendar': kalendar, 'nota': nota, 'kat': kat, 'hijri': hijri, 'zon': zon, 'hafalan': hafalan, 'meta': meta, 'avatar': avatar,
        'saiz': {'ayat': len(perlu | rujuk), 'perkataan': jumlah_q, 'juzuk': round(nisbah, 3), 'sejuzuk': sejuzuk,
                 'audio': {'ayat': len(perlu | rujuk | audio_sahaja), 'perkataan': jumlah_a, 'juzuk': round(nisbah_a, 3)}},
        'dasar': {'modSelamat': mod_selamat}, 'sinonim': sinonim, 'laman': laman, 'khat': khat,
    }
    js = json.dumps(data, ensure_ascii=False, separators=(',', ':'), default=str)  # default=str: tarikh YAML → 'YYYY-MM-DD'
    kod = hashlib.sha256(js.encode()).hexdigest()[:12]
    print(f'• {len(doa)} doa, {len(susunan)} susunan, {len(majlis)} templat majlis, {len(kalendar)} peristiwa kalendar, {len(nota)} nota')
    print(f'• {len(ayat)} ayat ({sum(1 for v in ayat.values() if "g" in v)} dengan makna perkata), {len(js)/1024:.0f} KB, cap {kod}')
    print(f'• Kandungan ayat: {jumlah_q} perkataan ≈ {nisbah:.3f} juzuk, baki {sejuzuk - jumlah_q} perkataan sebelum 1 juzuk (tools/senarai-ayat-dalam-app.md)')
    print(f'• Mod Selamat {"AKTIF" if mod_selamat else "tidak aktif"}: teks + audio {jumlah_a} perkataan ≈ {nisbah_a:.3f} juzuk; {sum(1 for x in hafalan if not x["audio"])} surah hafalan dijejak sahaja (audio dalam Smart Quran)')
    print(f'• {len(zon)} zon waktu solat; {len(hafalan)} bacaan hafalan (audio sahaja); {len(avatar["watak"])} watak avatar')
    for m in amaran: print('  AMARAN:', m)
    # laporan petikan ayat untuk semakan guru/ustaz
    kira = {}
    for *_, kep in laporan: kira[kep] = kira.get(kep, 0) + 1
    baris = ['# Laporan petikan ayat dalam teks doa', '',
             'Dijana oleh `tools/bina.py` — jangan edit terus. Dasar dan senarai pengecualian: `kandungan/rumi.yaml`.', '',
             f'Ambang pengesanan: {IQ.L} huruf rasm berturut-turut yang sama dengan teks al-Quran (tanpa baris, alif dan hamzah).', '',
             'Ringkasan: ' + '; '.join(f'{k}: {v}' for k, v in sorted(kira.items())), '',
             '| Doa | Bahagian | Frasa Arab yang sepadan | Ayat | Keputusan |', '|---|---|---|---|---|']
    for tag, nb, frasa, ay, kep in sorted(laporan, key=lambda x: (x[4], x[0], x[1])):
        baris.append(f'| {tag} | {nb} | {frasa.replace("|", "／")} | {ay} | {kep} |')
    (ROOT / 'tools' / 'laporan-petikan-ayat.md').write_text('\n'.join(baris) + '\n', encoding='utf-8')
    print('• Petikan ayat dalam doa: ' + ', '.join(f'{v} {k}' for k, v in sorted(kira.items())) + ' (tools/laporan-petikan-ayat.md)')
    if ralat:
        print('\nPERLU DIBETULKAN:'); [print(' -', m) for m in ralat]
        sys.exit(2)
    if tulis:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(f'/* Dijana oleh tools/bina.py — JANGAN edit terus. Edit kandungan/*.yaml kemudian jalankan semula. */\n'
                       f'window.PY_DATA={js};window.PY_DATA.kod="{kod}";\n', encoding='utf-8')
        print(f'• Ditulis: {OUT.relative_to(ROOT)}')
    return data

if __name__ == '__main__':
    bina(tulis='--semak' not in sys.argv)
