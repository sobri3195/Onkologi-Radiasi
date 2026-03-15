# Onkologi Radiasi – Clinical Calculation Workspace

Aplikasi web berbasis **React + Vite** untuk membantu simulasi kalkulasi onkologi radiasi secara cepat, terstruktur, dan dapat dieksplorasi per kategori klinis.

> ⚠️ **Disclaimer klinis:** aplikasi ini adalah alat bantu edukasi/perencanaan. Tidak menggantikan keputusan klinis dokter, fisikawan medis, atau tim multidisiplin.

## Fitur Utama

- Dashboard kalkulator dengan pencarian, filter kategori, sorting, pin kalkulator favorit, dan reset cepat.
- Validasi input (hard limit + rentang rekomendasi klinis).
- Preset (default + custom), histori perhitungan, dan export histori ke CSV.
- Total **86 kalkulator** yang dikelompokkan per domain radioterapi.

## Kategori Kalkulator

### 1) Dosis Dasar
Kalkulator inti seperti BED, EQD2, TCP/NTCP, PDD, TAR, TMR, MU, hingga dose rate brachy.

### 2) Volume & Geometri
Volume tumor (spherical/ellipsoid), PTV, conformity/homogeneity index, DVH point, equivalent sphere diameter, dll.

### 3) Koreksi & Faktor
Inverse square law, koreksi setup/faktor lapangan, bobot biologis, timing, dan parameter koreksi lain.

### 4) Modul Lanjutan
Analitik lanjutan seperti dose escalation gain, BED/EQD2 difference, plan benefit, adaptive replan trigger, hingga composite clinical score.

### 5) **Klaster Serviks** *(baru)*
- Point A EQD2
- Overall Treatment Time Penalty (Serviks)
- HR-CTV Coverage Ratio
- OAR D2cc Safety (Bladder)

### 6) **Klaster Kepala-Leher** *(baru)*
- Parotid Mean Dose Risk
- Larynx Edema Risk Index
- Nodal Burden Index
- Feeding Tube Probability Score

### 7) **Klaster Toksisitas Radioterapi** *(baru)*
- Mucositis Risk Score
- Radiodermatitis Severity Index
- Pneumonitis Risk (%)
- Late Fibrosis Index

### 8) **Klaster Faktor Hematologi-Nutrisi** *(baru)*
- NLR (Neutrophil-Lymphocyte Ratio)
- PLR (Platelet-Lymphocyte Ratio)
- Prognostic Nutrition Index (PNI)
- Hemoglobin Adequacy Ratio

## Teknologi

- React 18
- Vite 5
- CSS custom
- Deploy-ready untuk Vercel

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Akses di browser: `http://localhost:5173`

## Build Produksi

```bash
npm run build
npm run preview
```

## Struktur File Kunci

- `src/App.jsx` — UI dashboard, state management, validasi, histori, preset.
- `src/calculators.js` — seluruh definisi kategori + rumus kalkulator.
- `src/styles.css` — styling antarmuka.

## Deploy ke Vercel

1. Import repository ke Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy.

Atau via CLI:

```bash
npm i -g vercel
vercel
```

---

Jika diinginkan, tahap berikutnya bisa ditambah:
- mode **clinical pathways** per site penyakit,
- template protokol fraksinasi,
- scoring komposit otomatis dari beberapa kalkulator.
