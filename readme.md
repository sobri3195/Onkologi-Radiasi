# 🏥 Radiation Oncology Calculator

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-sobri3195-181717?logo=github)](https://github.com/sobri3195)

Sistem perhitungan komprehensif untuk onkologi radiasi dengan 50 fitur untuk perencanaan dan evaluasi radioterapi.

## 👨‍⚕️ Author

**Lettu Kes dr. Muhammad Sobri Maulana, S.Kom, CEH, OSCP, OSCE**

- 📧 Email: muhammadsobrimaulana31@gmail.com
- 🐙 GitHub: [@sobri3195](https://github.com/sobri3195)
- 🎥 YouTube: [@muhammadsobrimaulana6013](https://www.youtube.com/@muhammadsobrimaulana6013)
- 📱 Telegram: [@winlin_exploit](https://t.me/winlin_exploit)
- 🎵 TikTok: [@dr.sobri](https://www.tiktok.com/@dr.sobri)
- 💬 WhatsApp Group: [Join Here](https://chat.whatsapp.com/B8nwRZOBMo64GjTwdXV8Bl)

## 💰 Support & Donation

Jika proyek ini bermanfaat, dukung pengembangan lebih lanjut:

[![Donate](https://img.shields.io/badge/Donate-Lynk.id-orange)](https://lynk.id/muhsobrimaulana)

**Donasi via:** [https://lynk.id/muhsobrimaulana](https://lynk.id/muhsobrimaulana)

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [Dokumentasi Fitur](#-dokumentasi-fitur)
- [Contoh Kasus Klinis](#-contoh-kasus-klinis)
- [Persyaratan](#-persyaratan)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)
- [Disclaimer](#%EF%B8%8F-disclaimer)

---

## 🎯 Fitur

Sistem ini menyediakan **50 fitur perhitungan** yang dikelompokkan dalam 5 kategori utama:

### 1️⃣ Perhitungan Dosis Dasar (Fitur 1-10)
- ✅ BED (Biologically Effective Dose)
- ✅ EQD2 (Equivalent Dose in 2 Gy fractions)
- ✅ TCP (Tumor Control Probability)
- ✅ NTCP (Normal Tissue Complication Probability)
- ✅ Therapeutic Ratio
- ✅ PDD (Percentage Depth Dose)
- ✅ TAR (Tissue Air Ratio)
- ✅ TMR (Tissue Maximum Ratio)
- ✅ Monitor Units Calculation
- ✅ Dose Rate untuk Brachytherapy

### 2️⃣ Volume & Geometri (Fitur 11-20)
- ✅ Volume Tumor (Spherical & Ellipsoid)
- ✅ PTV (Planning Target Volume)
- ✅ Conformity Index & Paddick CI
- ✅ Homogeneity Index
- ✅ Gradient Index
- ✅ OAR Volume Calculation
- ✅ DVH Point Calculation
- ✅ Equivalent Sphere Diameter

### 3️⃣ Koreksi & Faktor (Fitur 21-30)
- ✅ Inverse Square Law
- ✅ Mayneord F Factor
- ✅ Off-Axis Ratio
- ✅ Scatter-Air Ratio
- ✅ Backscatter Factor
- ✅ Wedge Transmission Factor
- ✅ Tray Transmission Factor
- ✅ Tissue Phantom Ratio
- ✅ Collimator & Phantom Scatter Factor

### 4️⃣ Radiobiologi (Fitur 31-40)
- ✅ Linear-Quadratic Cell Survival
- ✅ Cell Kill Fraction
- ✅ Effective Dose (Proton/Ion Therapy)
- ✅ Tumor Doubling Time
- ✅ Clonogenic Cell Survival
- ✅ Dose Recovery Factor
- ✅ Growth Fraction
- ✅ Oxygen Enhancement Ratio
- ✅ Dose Modifying Factor
- ✅ Incomplete Repair Factor

### 5️⃣ Brachytherapy & Advanced (Fitur 41-50)
- ✅ Brachytherapy Implant Activity
- ✅ Paris System Dosimetry
- ✅ Source Decay Correction
- ✅ IMRT Optimization Score
- ✅ SBRT/SRS Dose Calculation
- ✅ Respiratory Gating Duty Cycle
- ✅ Setup Margin (van Herk Formula)
- ✅ Dose Constraint Evaluation
- ✅ Total Treatment Time
- ✅ Overall Treatment Time Correction

---

## 🚀 Instalasi

### Prasyarat
```bash
Python 3.8 atau lebih tinggi
numpy (akan diinstal otomatis)
```

### Clone Repository
```bash
git clone https://github.com/sobri3195/radiation-oncology-calculator.git
cd radiation-oncology-calculator
```

### Install Dependencies
```bash
pip install numpy
```

### Atau Install dari Requirements
```bash
pip install -r requirements.txt
```

---

## 💻 Penggunaan

### Penggunaan Dasar

```python
from radiation_oncology_calculator import RadiationOncologyCalculator

# Inisialisasi kalkulator
calc = RadiationOncologyCalculator()

# Contoh perhitungan BED
total_dose = 78  # Gy
dose_per_fraction = 2  # Gy
alpha_beta = 3  # untuk prostat

bed = calc.biologically_effective_dose(total_dose, dose_per_fraction, alpha_beta)
print(f"BED: {bed:.2f} Gy")
```

### Menjalankan Demo Lengkap

```bash
python radiation_oncology_calculator.py
```

---

## 📖 Dokumentasi Fitur

### Contoh Perhitungan TCP dan NTCP

```python
# Tumor Control Probability
tcp = calc.tumor_control_probability(
    dose_gy=70,
    d50=50,  # dose untuk 50% kontrol tumor
    gamma=2  # slope parameter
)

# Normal Tissue Complication Probability
ntcp = calc.normal_tissue_complication_probability(
    dose_gy=70,
    td50=60,  # tolerance dose
    m=0.4    # slope parameter
)

# Therapeutic Ratio
ratio = calc.therapeutic_ratio(tcp, ntcp)
```

### Contoh Perhitungan Volume

```python
# Volume tumor spherical
diameter = 4.0  # cm
tumor_vol = calc.tumor_volume_sphere(diameter)

# Planning Target Volume
ptv_vol = calc.planning_target_volume(
    gtv_cc=tumor_vol,
    ctv_margin_cm=0.5,
    ptv_margin_cm=0.5
)

# Conformity Index
ci = calc.conformity_index(
    volume_95_percent=ptv_vol * 0.95,
    ptv_volume=ptv_vol
)
```

### Contoh Brachytherapy

```python
# Dose rate calculation
dose_rate = calc.dose_rate_calculation(
    source_activity_ci=10,
    distance_cm=1
)

# Source decay correction
current_activity = calc.source_decay_correction(
    initial_activity=10,
    time_days=30,
    half_life_days=73.8  # Ir-192
)
```

### Contoh SBRT/SRS

```python
# BED untuk SBRT
sbrt_bed = calc.stereotactic_dose_calculation(
    prescribed_dose_gy=48,
    number_of_fractions=4
)

# Setup margin (van Herk formula)
margin = calc.setup_margin_calculation(
    systematic_error_cm=0.3,
    random_error_cm=0.4
)
```

---

## 🏥 Contoh Kasus Klinis

### Kasus 1: Kanker Prostat (Konvensional)

```python
calc = RadiationOncologyCalculator()

# Parameter
total_dose = 78  # Gy
dose_per_fx = 2  # Gy
num_fractions = 39
alpha_beta = 3

# Perhitungan
bed = calc.biologically_effective_dose(total_dose, dose_per_fx, alpha_beta)
eqd2 = calc.equivalent_dose_2gy(total_dose, dose_per_fx, alpha_beta)
tcp = calc.tumor_control_probability(total_dose, d50=70)

print(f"BED: {bed:.2f} Gy")
print(f"EQD2: {eqd2:.2f} Gy")
print(f"TCP: {tcp*100:.2f}%")
```

**Output:**
```
BED: 130.00 Gy
EQD2: 78.00 Gy
TCP: 89.35%
```

### Kasus 2: SBRT Paru (Lung SBRT)

```python
# SBRT 48 Gy dalam 4 fraksi
sbrt_dose = 48
sbrt_fractions = 4

sbrt_bed = calc.stereotactic_dose_calculation(sbrt_dose, sbrt_fractions)
print(f"SBRT BED: {sbrt_bed:.2f} Gy (α/β=10)")

# Evaluasi conformity
tumor_vol = calc.tumor_volume_sphere(3.0)  # 3 cm diameter
ptv_vol = calc.planning_target_volume(tumor_vol, 0.5, 0.5)
ci = calc.conformity_index(ptv_vol * 0.98, ptv_vol)

print(f"Tumor Volume: {tumor_vol:.2f} cc")
print(f"PTV Volume: {ptv_vol:.2f} cc")
print(f"Conformity Index: {ci:.3f}")
```

### Kasus 3: Brachytherapy Serviks

```python
# HDR Brachytherapy
prescribed_dose = 7  # Gy per fraksi
treatment_time = 10  # menit
distance = 1  # cm dari sumber

# Konversi waktu ke jam
treatment_time_hr = treatment_time / 60

# Hitung aktivitas yang diperlukan
activity = calc.brachytherapy_implant_activity(
    prescribed_dose, 
    treatment_time_hr, 
    distance
)

print(f"Required Activity: {activity:.2f} Ci")

# Dose rate
dose_rate = calc.dose_rate_calculation(activity, distance)
print(f"Dose Rate: {dose_rate:.2f} cGy/hr")
```

---

## 📊 Parameter Klinis Umum

### α/β Ratio untuk Berbagai Jaringan

| Jaringan | α/β Ratio |
|----------|-----------|
| Prostat | 1.5 - 3 |
| Payudara | 3 - 4 |
| Paru | 3 - 4 |
| Melanoma | 0.5 - 1 |
| Otak | 2 - 3 |
| Rektum | 3 - 5 |
| Kandung Kemih | 3 - 7 |
| Tumor Jinak | 2 - 5 |
| Jaringan Terlambat | 1 - 4 |
| Jaringan Akut | 7 - 20 |

### Tolerance Doses (TD 5/5)

| Organ | Dosis Toleransi | Endpoint |
|-------|----------------|----------|
| Spinal Cord | 50 Gy | Myelitis |
| Brainstem | 54 Gy | Nekrosis |
| Optik Nerve | 55 Gy | Blindness |
| Lens | 10 Gy | Katarak |
| Paru (V20) | <30% | Pneumonitis |
| Jantung | 40 Gy (mean) | Perikarditis |
| Ginjal | 23 Gy (bilateral) | Nefropati |
| Liver | 30 Gy (mean) | Hepatitis |

---

## 📚 Persyaratan

```
Python >= 3.8
numpy >= 1.19.0
```

### requirements.txt
```txt
numpy>=1.19.0
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

### Guidelines Kontribusi

- Pastikan kode mengikuti PEP 8 style guide
- Tambahkan unit tests untuk fitur baru
- Update dokumentasi sesuai perubahan
- Validasi perhitungan dengan literatur klinis

---

## 📝 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

## ⚠️ Disclaimer

**PENTING: PERHATIAN MEDIS**

1. **Untuk Keperluan Edukasi**: Software ini dikembangkan untuk tujuan edukasi dan penelitian dalam bidang onkologi radiasi.

2. **Bukan Pengganti Sistem Klinis**: Aplikasi ini TIDAK dimaksudkan untuk menggantikan Treatment Planning System (TPS) yang telah tervalidasi dan disetujui secara klinis.

3. **Verifikasi Diperlukan**: Semua hasil perhitungan HARUS diverifikasi oleh fisikawan medis yang berkualifikasi sebelum digunakan dalam perawatan pasien.

4. **Tanggung Jawab Klinis**: Keputusan klinis tetap menjadi tanggung jawab penuh dari tim onkologi radiasi (radiation oncologist, medical physicist, dosimetrist).

5. **Tidak Ada Jaminan**: Author tidak memberikan jaminan atas akurasi perhitungan untuk penggunaan klinis. Penggunaan dalam praktek klinis sepenuhnya menjadi tanggung jawab pengguna.

6. **Konsultasi Profesional**: Selalu konsultasikan dengan profesional kesehatan yang berkualifikasi untuk keputusan perawatan pasien.

**Dengan menggunakan software ini, Anda menyetujui bahwa:**
- Anda memahami keterbatasan software ini
- Anda akan menggunakan software ini secara bertanggung jawab
- Anda tidak akan menggunakan hasil perhitungan langsung untuk perawatan pasien tanpa verifikasi yang sesuai

---

## 📞 Kontak & Dukungan

Untuk pertanyaan, saran, atau dukungan:

- **Email**: muhammadsobrimaulana31@gmail.com
- **GitHub Issues**: [Create an Issue](https://github.com/sobri3195/radiation-oncology-calculator/issues)
- **WhatsApp Group**: [Join Discussion](https://chat.whatsapp.com/B8nwRZOBMo64GjTwdXV8Bl)

---

## 🌟 Acknowledgments

- Terima kasih kepada komunitas onkologi radiasi Indonesia
- Inspirasi dari berbagai literatur dan guideline internasional (ICRU, AAPM, ESTRO)
- Kontributor dan pengguna yang memberikan feedback

---

## 📈 Roadmap

- [ ] Tambahkan GUI (Graphical User Interface)
- [ ] Integrasi dengan DICOM RT
- [ ] Export ke PDF report
- [ ] Database pasien
- [ ] Web-based application
- [ ] Machine learning untuk optimisasi dosis
- [ ] Support untuk proton therapy
- [ ] Real-time dose calculation

---

## 📖 Referensi

1. Khan's The Physics of Radiation Therapy, 5th Edition
2. ICRU Report 50, 62, 83
3. AAPM TG Reports (TG-43, TG-101, TG-263)
4. Hall & Giaccia - Radiobiology for the Radiologist
5. Joiner & van der Kogel - Basic Clinical Radiobiology

---

## 🎓 Kutipan

Jika Anda menggunakan software ini dalam penelitian atau publikasi, mohon kutip sebagai:

```bibtex
@software{radiation_oncology_calculator,
  author = {Muhammad Sobri Maulana},
  title = {Radiation Oncology Calculator: Comprehensive Radiotherapy Planning Tool},
  year = {2025},
  url = {https://github.com/sobri3195/radiation-oncology-calculator}
}
```

---

<div align="center">

**⭐ Jika proyek ini bermanfaat, berikan star di GitHub! ⭐**

**💖 Support development via [Lynk.id](https://lynk.id/muhsobrimaulana) 💖**

Made with ❤️ by **dr. Muhammad Sobri Maulana**

[⬆ Back to Top](#-radiation-oncology-calculator)

</div>
