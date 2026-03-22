# Analisa Mendalam Fitur Aplikasi Onkologi Radiasi

Dokumen ini merangkum **seluruh fitur yang saat ini benar-benar terimplementasi** pada aplikasi **Onkologi Radiasi – Clinical Calculation Workspace**, berdasarkan pembacaan kode sumber React/Vite dan definisi kalkulator yang ada di repository.

## 1. Ringkasan Eksekutif

Aplikasi ini adalah dashboard kalkulator klinis berbasis **React 18 + Vite** untuk kebutuhan simulasi dan eksplorasi perhitungan onkologi radiasi. Fokus utamanya bukan sekadar menampilkan kalkulator, tetapi menyediakan **workspace interaktif** dengan kemampuan pencarian, filter kategori, sorting, pin kalkulator, preset, validasi input klinis, histori perhitungan, ekspor CSV, dan copy hasil.

Secara implementasi, aplikasi memuat **86 kalkulator** yang dibagi ke dalam **9 kategori klinis/fisika**. Seluruh kalkulator dibangun dari satu sumber data terpusat (`src/calculators.js`) dan dirender melalui satu dashboard utama (`src/App.jsx`).

---

## 2. Fitur Platform / Dashboard

### 2.1 Dashboard kalkulator terpusat
Fitur utama aplikasi adalah satu halaman dashboard yang menampilkan seluruh kalkulator dalam bentuk **card/grid layout**. Sidebar di sisi kiri berfungsi sebagai panel navigasi dan kontrol filter, sedangkan area konten utama menampilkan kartu kalkulator per kategori.

**Nilai tambah fitur ini:**
- Memudahkan eksplorasi banyak kalkulator dari satu layar.
- Meminimalkan perpindahan halaman.
- Cocok untuk workflow cepat saat diskusi klinis atau simulasi.

### 2.2 Statistik ringkas di sidebar
Sidebar menampilkan 3 statistik cepat:
- **Total kalkulator**
- **Jumlah kategori**
- **Jumlah kalkulator yang sedang tampil** sesuai filter aktif

**Manfaat:** user langsung memahami skala tool dan dampak filter/pencarian yang sedang dipakai.

### 2.3 Pencarian kalkulator
Terdapat field **Cari kalkulator** yang melakukan pencarian berbasis teks terhadap:
- nama kalkulator
- judul kategori

**Karakteristik implementasi:**
- pencarian bersifat case-insensitive
- pencarian dilakukan secara real-time saat user mengetik
- dapat dipakai untuk menemukan istilah seperti `BED`, `DVH`, `IMRT`, dan sejenisnya

### 2.4 Filter kategori ganda
Aplikasi menyediakan dua bentuk filter kategori:
1. **Dropdown kategori**
2. **Category chips** berwarna

Keduanya mengontrol state filter yang sama. Ini penting karena memberi dua gaya interaksi:
- dropdown untuk bentuk formal/kompak
- chip untuk navigasi cepat dan visual

### 2.5 Sorting kalkulator
User dapat mengurutkan kalkulator berdasarkan:
- **Nomor kalkulator**
- **Nama kalkulator**

Fitur ini sederhana tetapi penting untuk dua mode penggunaan:
- mode referensi tetap (berdasarkan ID)
- mode pencarian alfabetis (berdasarkan nama)

### 2.6 Reset global seluruh input
Tombol **Reset semua input** mengembalikan seluruh kalkulator ke nilai default awalnya.

**Kegunaan praktis:**
- membersihkan state setelah eksplorasi banyak skenario
- menghindari carry-over input antar simulasi
- mempercepat mulai ulang workflow

### 2.7 Empty state saat tidak ada hasil
Jika pencarian atau filter tidak menghasilkan kalkulator yang cocok, aplikasi menampilkan empty state dengan:
- judul pesan
- penjelasan singkat
- tombol **Hapus filter**

Ini meningkatkan UX karena sistem tidak berhenti pada layar kosong tanpa konteks.

### 2.8 Layout responsif
CSS sudah mendukung perubahan layout saat lebar layar mengecil:
- desktop: sidebar + konten dua kolom
- mobile/tablet kecil: menjadi satu kolom

Ini membuat aplikasi tetap dapat diakses pada berbagai ukuran layar tanpa perlu halaman terpisah.

---

## 3. Fitur Personalisasi & Produktivitas

### 3.1 Pin / Favorite calculator
Setiap kartu kalkulator memiliki tombol:
- `☆ Pin`
- `★ Unpin`

Kalkulator yang dipin akan muncul di bagian **Pinned Calculators** di atas daftar kategori.

**Manfaat utama:**
- mempercepat akses ke kalkulator yang paling sering dipakai
- mengurangi waktu scrolling saat jumlah kalkulator besar
- cocok untuk pola penggunaan berulang (mis. BED, EQD2, NTCP, DVH)

### 3.2 Persist pin ke localStorage
Status pin disimpan ke browser melalui key localStorage:
- `pinned_calculators`

Artinya, preferensi user tetap ada saat halaman direfresh atau browser dibuka kembali pada perangkat yang sama.

### 3.3 Preset default per kalkulator
Setiap kalkulator otomatis memiliki preset bawaan:
- **Default**

Preset ini mengembalikan input kalkulator ke nilai default yang berasal dari definisi field di `calculators.js`.

### 3.4 Preset custom user
User dapat menyimpan preset baru dengan tombol **Simpan Preset**. Preset disimpan berdasarkan kondisi input kalkulator saat itu.

**Nilai praktis:**
- cocok untuk regimen atau skenario yang sering dipakai
- mengurangi input ulang angka yang sama berulang kali
- membantu standarisasi workflow internal pengguna

### 3.5 Hapus preset custom terakhir
Jika kalkulator memiliki preset custom, aplikasi menampilkan tombol **Hapus Preset Terakhir**.

Catatan penting: implementasi saat ini menghapus **preset custom paling akhir** pada kalkulator terkait, bukan memilih preset tertentu untuk dihapus satu per satu.

### 3.6 Persist preset custom ke localStorage
Preset custom disimpan ke key:
- `custom_presets`

Dengan demikian, preset user tetap tersedia antar sesi selama masih pada browser yang sama.

### 3.7 Copy hasil kalkulasi ke clipboard
User dapat menyalin hasil kalkulator melalui tombol **Salin hasil**.

**Detail perilaku:**
- hasil disalin dalam format nama kalkulator + nilai + unit
- jika berhasil, label tombol berubah menjadi **Tersalin ✓** sesaat

Fitur ini sangat berguna untuk memindahkan hasil ke catatan, chat tim, atau dokumen cepat.

---

## 4. Fitur Validasi & Safety Layer

### 4.1 Normalisasi metadata field
Field pada kalkulator tidak hanya berisi label dan default value. Sistem juga melakukan normalisasi field untuk menambahkan metadata seperti:
- `min`
- `max`
- `recommendedMin`
- `recommendedMax`
- `unit`
- `helperText`

Ini membuat validasi dapat diterapkan konsisten lintas puluhan kalkulator.

### 4.2 Hard validation limit
Setiap field memiliki **batas minimum dan maksimum keras**. Bila user memasukkan nilai di luar rentang ini:
- field diberi style error
- pesan error ditampilkan
- hasil kalkulasi diblokir

Ini adalah guardrail penting untuk mencegah output yang sangat tidak realistis atau input salah ketik ekstrem.

### 4.3 Warning untuk nilai di luar rentang rekomendasi
Selain hard error, aplikasi juga punya **warning klinis non-blocking** ketika nilai masih valid secara teknis, tetapi di luar rentang rekomendasi.

**Efek UX:**
- user tetap boleh menghitung
- sistem tetap memberi sinyal hati-hati
- membedakan antara “tidak valid” dan “perlu kewaspadaan”

### 4.4 Helper text otomatis per field
Setiap input menampilkan helper text seperti rentang rekomendasi. Ini membantu user memahami ekspektasi nilai tanpa perlu membuka dokumentasi terpisah.

### 4.5 Hasil diblokir jika ada hard error
Jika ada satu saja field dengan hard error, panel hasil menampilkan pesan:
- **Perbaiki input untuk melihat hasil**

Pendekatan ini sangat baik dari sisi safety karena mencegah sistem menampilkan angka seolah valid padahal input tidak layak diproses.

### 4.6 Inferensi rentang otomatis berbasis nama field
Validasi tidak ditulis manual satu per satu untuk semua field. Sistem menggunakan pola berbasis teks (`pattern matching`) pada nama/key field untuk menginferensi rentang default, misalnya untuk:
- dose / Gy / cGy
- cm / distance / depth
- ratio / fraction
- volume / cc
- time / days / hr / sec

**Keuntungan pendekatan ini:**
- scalable untuk kalkulator baru
- mengurangi duplikasi metadata
- memudahkan ekspansi jumlah kalkulator

---

## 5. Fitur Histori & Audit Trail Lokal

### 5.1 Simpan riwayat perhitungan manual
Setelah hasil muncul, user dapat memilih **Simpan riwayat**. Sistem menyimpan:
- ID entri
- timestamp ISO
- input yang digunakan
- output
- unit

### 5.2 Batas histori 20 item per kalkulator
Setiap kalkulator menyimpan maksimal **20 riwayat terakhir**. Ini menjaga localStorage tetap terkendali sambil tetap menyediakan jejak kerja yang cukup berguna.

### 5.3 Drawer histori per kalkulator
Setiap kartu memiliki bagian `<details>` dengan label **Riwayat (n)**. Di dalamnya user dapat melihat daftar hasil terdahulu.

### 5.4 Load ulang input dari histori
Tombol **Load** memungkinkan user memuat kembali input historis ke form kalkulator. Ini sangat bermanfaat untuk:
- mengulangi skenario lama
- membandingkan skenario secara manual
- mengedit sedikit dari baseline sebelumnya

### 5.5 Hapus item histori tertentu
Setiap entri memiliki tombol **Hapus** sehingga user bisa membersihkan histori secara selektif.

### 5.6 Clear seluruh histori kalkulator
Tombol **Clear** akan mengosongkan seluruh histori untuk kalkulator aktif.

### 5.7 Persist histori ke localStorage
Histori disimpan ke key:
- `calc_history`

Artinya jejak perhitungan tetap tersedia antar refresh, selama browser yang sama masih digunakan.

---

## 6. Fitur Ekspor Data

### 6.1 Export histori ke CSV
User dapat mengekspor histori per kalkulator ke file CSV melalui tombol **Export CSV**.

### 6.2 Struktur data CSV
CSV berisi kolom:
- Waktu
- Input
- Output
- Unit

Input diserialisasi ke JSON string agar seluruh parameter tetap terbawa di satu file ekspor.

### 6.3 Download lokal tanpa backend
Ekspor dilakukan murni di browser menggunakan:
- `Blob`
- `URL.createObjectURL`
- elemen anchor sementara

**Keuntungan:**
- tidak perlu server
- cepat
- cocok untuk aplikasi statis/deploy sederhana

---

## 7. Arsitektur Data Kalkulator

### 7.1 Sumber data tunggal untuk semua kalkulator
Semua definisi kalkulator dipusatkan di `src/calculators.js`. Tiap kalkulator memiliki struktur inti:
- `id`
- `name`
- `unit`
- `fields`
- `compute`
- opsional `formatter`

Ini adalah desain yang sangat efektif untuk aplikasi jenis dashboard kalkulator, karena UI bisa dirender generik dari data.

### 7.2 Pendekatan data-driven rendering
`App.jsx` tidak membuat form satu per satu secara manual. Sebaliknya, ia melakukan loop terhadap kategori dan kalkulator, lalu merender field input berdasarkan metadata.

**Dampak positif:**
- maintenance lebih mudah
- penambahan kalkulator baru relatif murah
- konsistensi UX lebih terjaga

### 7.3 Formatter khusus untuk status calculator
Beberapa kalkulator tidak mengembalikan angka, melainkan status, misalnya:
- `PASS ✅ / FAIL ❌`
- `REPLAN ✅ / MONITOR ⚠️`

Ini menunjukkan bahwa sistem tidak terbatas pada kalkulator numerik, tetapi juga mendukung rule-based decision status.

### 7.4 Safe divide untuk mencegah crash pembagian nol
Fungsi utilitas `safeDivide` mengembalikan `Infinity` jika penyebut nol. Di UI, hasil non-finite ditampilkan sebagai `∞`.

**Implikasi:**
- kalkulator tidak crash karena division-by-zero
- user tetap mendapat sinyal ada kondisi matematis spesial

---

## 8. Jabaran Semua Kategori dan Fitur Klinisnya

Di bawah ini adalah seluruh fitur domain kalkulator yang tersedia saat ini.

### 8.1 Kategori: Dosis Dasar (10 kalkulator)
Berisi kalkulator inti radioterapi/fisika dasar:
1. BED
2. EQD2
3. TCP
4. NTCP
5. Therapeutic Ratio
6. PDD
7. TAR
8. TMR
9. Monitor Units Calculation
10. Dose Rate Brachy

**Fungsi klinis kategori ini:**
- mengevaluasi efek biologis dosis
- estimasi kontrol tumor/toksisitas
- perhitungan kedalaman dan transmisi dosis
- estimasi kebutuhan MU dan dose rate brachy

### 8.2 Kategori: Volume & Geometri (10 kalkulator)
Kalkulator dalam kategori ini:
1. Volume Tumor (Spherical)
2. Volume Tumor (Ellipsoid)
3. PTV
4. Conformity Index
5. Homogeneity Index
6. Paddick CI
7. Gradient Index
8. OAR Volume
9. DVH Point
10. Equivalent Sphere Diameter

**Peran utama:**
- estimasi volume target/OAR
- evaluasi kualitas distribusi dosis
- analisa geometri target dan plan quality

### 8.3 Kategori: Koreksi & Faktor (10 kalkulator)
Isi kategori:
1. Inverse Square Law
2. Mayneord F
3. Off-Axis Ratio
4. Scatter-Air Ratio
5. Backscatter Factor
6. Wedge Transmission Factor
7. Tray Transmission Factor
8. Tissue Phantom Ratio (TPR)
9. Collimator Scatter
10. Phantom Scatter

**Nilai klinis/fisika:**
- mendukung koreksi parameter lapangan
- memodelkan perubahan intensitas/transmisi
- menjadi alat bantu evaluasi setup dan beam characteristics

### 8.4 Kategori: Radiobiologi (10 kalkulator)
Kalkulator yang tersedia:
1. LQ Cell Survival
2. Cell Kill Fraction
3. Effective Dose
4. Tumor Doubling Time
5. Clonogenic Survival
6. Dose Recovery Factor
7. Growth Fraction
8. Oxygen Enhancement Ratio
9. Dose Modifying Factor
10. Incomplete Repair Factor

**Fokus analitik:**
- survival sel
- proliferasi dan repair
- efek modifier biologis
- pendekatan radiobiologi yang lebih konseptual dan edukatif

### 8.5 Kategori: Brachytherapy & Advanced (10 kalkulator)
Kalkulator:
1. Brachytherapy Implant Activity
2. Paris System Dosimetry
3. Source Decay Correction
4. IMRT Optimization Score
5. SBRT/SRS Dose Calculation
6. Respiratory Gating Duty Cycle
7. Setup Margin (van Herk)
8. Dose Constraint Evaluation
9. Total Treatment Time
10. Overall Treatment Time Correction

**Nilai tambah:**
- menjembatani brachytherapy, advanced external beam, gating, margin, dan evaluasi constraint dalam satu kategori operasional.

### 8.6 Kategori: Modul Lanjutan (20 kalkulator)
Ini adalah kategori paling kaya secara jumlah dan variasi. Isi kalkulator:
1. Dose Escalation Gain
2. BED Difference
3. EQD2 Difference
4. Tumor Control Gain
5. NTCP Reduction
6. Plan Benefit Index
7. Equivalent Uniform Dose (Linear)
8. Dose Fall-off Rate
9. Residual Tumor Cell Fraction
10. Hypoxia Adjustment Factor
11. Corrected BED with Hypoxia
12. Biological Effective Dose Rate
13. Adaptive Replan Trigger
14. Inter-fraction Motion Margin
15. Combined Setup & Motion Margin
16. Treatment Efficiency Index
17. Dose Delivery Accuracy
18. Cumulative OAR Burden
19. Re-irradiation Safety Ratio
20. Composite Clinical Score

**Makna kategori ini:**
- mendukung analisis perbandingan plan
- evaluasi manfaat vs risiko
- menangkap isu adaptasi, motion, efisiensi, re-irradiation, dan scoring komposit

### 8.7 Kategori: Klaster Serviks (4 kalkulator)
Kalkulator yang tersedia:
1. Point A EQD2
2. Overall Treatment Time Penalty (Serviks)
3. HR-CTV Coverage Ratio
4. OAR D2cc Safety (Bladder)

**Fokusnya:** workflow evaluasi serviks, terutama kombinasi EBRT-brachy, coverage target, dan keselamatan OAR.

### 8.8 Kategori: Klaster Kepala-Leher (4 kalkulator)
Kalkulator:
1. Parotid Mean Dose Risk
2. Larynx Edema Risk Index
3. Nodal Burden Index
4. Feeding Tube Probability Score

**Fokus klinis:** mendukung risk-oriented review pada kasus kepala-leher terkait xerostomia, edema, beban nodal, dan kebutuhan feeding support.

### 8.9 Kategori: Klaster Toksisitas Radioterapi (4 kalkulator)
Kalkulator:
1. Mucositis Risk Score
2. Radiodermatitis Severity Index
3. Pneumonitis Risk (%)
4. Late Fibrosis Index

**Peran kategori:** memberi orientasi cepat terhadap risiko toksisitas akut maupun lanjut berdasarkan parameter sederhana.

### 8.10 Kategori: Klaster Faktor Hematologi-Nutrisi (4 kalkulator)
Kalkulator:
1. NLR (Neutrophil-Lymphocyte Ratio)
2. PLR (Platelet-Lymphocyte Ratio)
3. Prognostic Nutrition Index (PNI)
4. Hemoglobin Adequacy Ratio

**Nilai tambah:** memperluas cakupan aplikasi dari fisika/dosis menjadi parameter biomarker pendukung kondisi pasien.

---

## 9. Analisa UX dan Kekuatan Produk

### 9.1 Kekuatan utama
Beberapa kekuatan paling menonjol dari implementasi saat ini:
- **Data-driven**: mudah ditambah kalkulator baru.
- **Ringan**: tidak bergantung backend untuk fitur inti.
- **Persisten lokal**: pin, preset, dan histori tidak hilang saat refresh.
- **Praktis**: copy hasil, reset, load histori, export CSV.
- **Safety-aware**: ada hard error dan warning klinis.
- **Tersegmentasi baik**: kategori klinis cukup jelas dan membantu navigasi.

### 9.2 Nilai untuk user klinis/edukasi
Aplikasi ini cocok untuk:
- simulasi cepat saat diskusi klinis
- eksplorasi skenario edukasi
- kalkulasi referensi ringan
- pre-check kasar sebelum analisis yang lebih formal

### 9.3 Nilai untuk pengembangan jangka panjang
Struktur saat ini sudah memberi fondasi kuat untuk fitur lanjutan seperti:
- compare mode multi-skenario
- i18n ID/EN
- analytics penggunaan
- PDF export
- disclaimer/guardrail yang lebih kontekstual
- clinical pathway per site penyakit

---

## 10. Keterbatasan Implementasi Saat Ini

Agar analisis tetap jujur, berikut beberapa batasan yang terlihat dari kode saat ini:

### 10.1 Belum ada backend / sinkronisasi cloud
Semua data personalisasi dan histori hanya hidup di browser lokal. Tidak ada akun, sharing lintas perangkat, atau sinkronisasi tim.

### 10.2 Preset custom masih sederhana
Belum ada:
- rename preset
- pilih preset tertentu untuk dihapus
- grouping preset
- preset lintas kalkulator

### 10.3 Histori disimpan manual, bukan otomatis
User harus menekan tombol **Simpan riwayat**. Sistem belum auto-log setiap hasil.

### 10.4 Belum ada compare mode native
Meski histori bisa diload ulang, aplikasi belum menyediakan perbandingan side-by-side antar skenario.

### 10.5 Belum ada ekspor PDF
Implementasi ekspor saat ini masih sebatas CSV histori.

### 10.6 Belum ada a11y mode khusus
Belum tampak fitur high contrast toggle, font scaling, atau keyboard enhancement eksplisit di luar struktur HTML standar.

### 10.7 Disclaimer klinis belum dibuat sebagai layer interaktif
README sudah memuat disclaimer, tetapi UI aplikasi belum memiliki sticky disclaimer, acknowledgement modal, atau warning kontekstual per kalkulator sensitif.

---

## 11. Kesimpulan

Secara keseluruhan, aplikasi ini **sudah lebih dari sekadar kumpulan rumus**. Ia sudah berbentuk **clinical calculation workspace** yang cukup matang untuk penggunaan eksploratif/edukatif, karena menggabungkan:
- katalog kalkulator yang luas,
- struktur kategori yang jelas,
- validasi input,
- personalisasi user,
- histori lokal,
- serta ekspor data ringan.

Jika tujuan Anda adalah memiliki **dashboard kalkulator onkologi radiasi yang praktis, cepat, dan mudah dikembangkan**, fondasi yang ada sekarang sudah sangat baik. Peningkatan selanjutnya paling logis adalah menambah layer **compare, auditability yang lebih kuat, disclaimer klinis interaktif, a11y, dan i18n**.

