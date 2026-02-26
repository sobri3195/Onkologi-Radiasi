# Analisa Detail: 10 Fitur Tambahan Frontend untuk Onkologi Radiasi

Dokumen ini menyajikan usulan fitur frontend yang berfokus pada peningkatan **usability**, **safety check**, **produktifitas klinis**, dan **traceability** untuk admin panel kalkulator onkologi radiasi.

## 1) Favorite & Pin Calculator
### Analisa
Saat jumlah kalkulator banyak, user sering mengakses subset kecil (mis. BED, EQD2, NTCP). Tanpa shortcut personal, waktu navigasi meningkat dan risiko salah pilih kalkulator juga naik.

### Rekomendasi Fitur
- Tambahkan tombol ⭐ di setiap kartu kalkulator.
- Buat area khusus “Pinned Calculators” di bagian atas konten.
- Simpan preferensi pin ke `localStorage`.

### Prompt Implementasi
> Tambahkan fitur **Favorite & Pin Calculator** pada React app ini. Buat ikon bintang di setiap kartu kalkulator untuk toggle pin/unpin, tampilkan section “Pinned Calculators” di atas daftar kategori, dan persist data dengan localStorage (key: `pinned_calculators`). Pastikan sorting pinned tetap stabil dan UI responsif untuk mobile.

---

## 2) Preset Klinis per Kalkulator
### Analisa
Input parameter klinis sering berulang (mis. skema 60Gy/30fx, 70Gy/35fx). Mengisi manual berulang rentan typo.

### Rekomendasi Fitur
- Dropdown preset per kalkulator.
- Tombol “Apply Preset” dan “Reset”.
- Dukung custom preset buatan user.

### Prompt Implementasi
> Implementasikan **Preset Klinis per Kalkulator**: setiap kalkulator memiliki daftar preset default + kemampuan menyimpan preset custom pengguna ke localStorage. Tambahkan UI untuk memilih preset, menerapkan nilai field otomatis, rename/delete preset custom, serta tombol reset ke default value.

---

## 3) Validasi Input Klinis Berbasis Range
### Analisa
Saat ini user bisa memasukkan nilai tidak realistis (negatif, sangat ekstrem), yang menghasilkan output misleading.

### Rekomendasi Fitur
- Definisikan rentang valid per field (`min`, `max`, `soft warning`).
- Highlight error (blocking) vs warning (non-blocking).
- Tampilkan helper text klinis.

### Prompt Implementasi
> Refactor struktur `calculators.js` agar tiap field mendukung metadata validasi (`min`, `max`, `recommendedMin`, `recommendedMax`, `unit`). Di frontend, tampilkan error state jika melewati hard limit dan warning state jika di luar recommended range. Hasil kalkulasi tidak muncul jika ada hard error.

---

## 4) Perbandingan Multi-Skenario (Scenario Compare)
### Analisa
Tim klinis sering membandingkan beberapa skenario (mis. beda fraksinasi) sebelum memutuskan rencana.

### Rekomendasi Fitur
- Mode “Compare” pada kalkulator terpilih.
- Multi kolom skenario A/B/C.
- Highlight perubahan output (% diff).

### Prompt Implementasi
> Buat fitur **Scenario Compare** untuk kalkulator terpilih: pengguna dapat membuat minimal 3 skenario input, melihat output berdampingan, serta indikator selisih absolut dan persentase terhadap baseline. Tambahkan tombol duplikasi skenario agar workflow cepat.

---

## 5) Riwayat Perhitungan (Calculation History)
### Analisa
Tanpa histori, user sulit mengaudit langkah atau mengulang hitungan sebelumnya saat diskusi multidisiplin.

### Rekomendasi Fitur
- Auto-save riwayat lokal per kalkulator.
- Tampilkan timestamp, input ringkas, output.
- Aksi “Load kembali”, “Hapus item”, “Clear all”.

### Prompt Implementasi
> Tambahkan modul **Calculation History** berbasis localStorage yang menyimpan 20 perhitungan terakhir per kalkulator (beserta timestamp, input, output). Sediakan panel histori yang bisa expand/collapse dan action: reload nilai ke form, delete satu item, clear semua histori.

---

## 6) Export PDF/CSV Hasil
### Analisa
User membutuhkan artefak dokumentasi untuk rapat, review fisika medis, atau lampiran internal.

### Rekomendasi Fitur
- Export single-result ke PDF ringkas.
- Export batch history ke CSV.
- Sertakan metadata (tanggal, kalkulator, unit).

### Prompt Implementasi
> Implementasikan fitur **Export Hasil**: (1) export hasil kalkulator aktif ke PDF satu halaman berisi parameter dan output, (2) export histori kalkulator ke CSV. Gunakan library yang lightweight dan pastikan format angka konsisten (maksimal 4 desimal).

---

## 7) Dashboard Ringkas KPI Penggunaan
### Analisa
Admin panel akan lebih bernilai jika bisa menunjukkan insight penggunaan fitur (kalkulator terpopuler, frekuensi kategori).

### Rekomendasi Fitur
- Track event lokal (open calculator, run calculation).
- Widget KPI mingguan/bulanan.
- Mini chart tanpa backend (sementara lokal).

### Prompt Implementasi
> Tambahkan **Usage Analytics Dashboard (local-only)** yang merekam event interaksi (view kalkulator, perubahan input, kalkulasi). Buat ringkasan KPI: top 5 kalkulator, total run, distribusi kategori, dan sparkline 7 hari terakhir. Simpan agregasi di localStorage.

---

## 8) Mode Aksesibilitas (A11y)
### Analisa
Lingkungan klinis bisa punya keterbatasan kondisi tampilan/monitor. UI harus inklusif dan terbaca cepat.

### Rekomendasi Fitur
- High-contrast mode.
- Font scaling (100%, 110%, 125%).
- Keyboard navigation + visible focus ring.

### Prompt Implementasi
> Bangun **A11y Mode**: toggle high contrast, pengaturan ukuran font global, serta peningkatan keyboard navigation untuk semua kontrol form. Pastikan memenuhi prinsip WCAG dasar: kontras, focus visible, label terhubung ke input, dan aria-live untuk error/warning.

---

## 9) Guardrail Klinis & Disclaimer Kontekstual
### Analisa
Kalkulator medis perlu pengingat bahwa hasil bersifat asistif, bukan keputusan final. Guardrail kontekstual mengurangi misuse.

### Rekomendasi Fitur
- Disclaimer global sticky.
- Tooltip risiko untuk kalkulator sensitif.
- Confirmation dialog saat nilai ekstrem.

### Prompt Implementasi
> Tambahkan **Clinical Guardrail Layer**: disclaimer sticky di layout, tooltip “interpretasi hati-hati” pada kalkulator berisiko, serta modal konfirmasi ketika input berada pada zona ekstrem (tetap boleh lanjut, tapi harus acknowledge). Simpan status acknowledge per sesi.

---

## 10) Internationalization (ID/EN) + Terminologi Medis Konsisten
### Analisa
Sebagian tim bekerja bilingual. UI bilingual membantu kolaborasi lintas institusi dan dokumentasi.

### Rekomendasi Fitur
- Bahasa Indonesia/Inggris via toggle.
- Dictionary terminologi medis terstandar.
- Persist pilihan bahasa.

### Prompt Implementasi
> Integrasikan **i18n bilingual (Bahasa Indonesia & English)** pada seluruh label UI, judul kategori, nama field, dan helper text. Gunakan struktur translation key yang scalable, fallback ke Bahasa Indonesia jika key hilang, serta simpan preferensi language user di localStorage.

---

## Prioritas Implementasi (Saran)
1. **Quick wins**: Favorite/Pin, Preset, Validasi Input.
2. **Impact menengah**: History, Compare, Export.
3. **Maturity layer**: A11y, Guardrail, Analytics, i18n.

## Catatan Arsitektur Frontend
- Pertimbangkan migrasi state kompleks ke `useReducer` atau state manager ringan (mis. Zustand) untuk fitur compare/history/preset.
- Definisikan tipe metadata field agar mudah dipakai lintas fitur (validasi, i18n, tooltip, unit).
- Buat komponen reusable: `CalculatorCard`, `FieldInput`, `ValidationMessage`, `ResultPanel`, `HistoryDrawer`.
