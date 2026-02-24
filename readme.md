# Onkologi Radiasi Admin Panel (React + Vercel)

Aplikasi ini sekarang dikonversi menjadi **React Admin Panel** yang siap deploy di **Vercel**.

## Apa yang ditingkatkan

- Migrasi dari script Python menjadi dashboard web interaktif.
- Seluruh **50 fitur kalkulator** dipetakan ke UI form perhitungan real-time.
- Struktur admin panel: sidebar, filter kategori, pencarian fitur, ringkasan statistik.
- Konfigurasi deployment Vercel (`vercel.json`) sudah disiapkan.

## Stack

- React 18
- Vite 5
- Vercel (static deploy)

## Jalankan Lokal

```bash
npm install
npm run dev
```

Akses: `http://localhost:5173`

## Build Produksi

```bash
npm run build
npm run preview
```

## Deploy ke Vercel

### Opsi 1 — via dashboard Vercel
1. Import repository ini di Vercel.
2. Framework: auto detect (Vite).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

### Opsi 2 — via Vercel CLI
```bash
npm i -g vercel
vercel
```

## Catatan

- `radiation_oncology_calc.py` tetap disertakan sebagai referensi rumus asli.
- Ini alat edukasi/perencanaan bantu, bukan pengganti keputusan klinis dokter fisika medis.
