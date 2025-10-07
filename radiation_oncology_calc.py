import numpy as np
import math
from dataclasses import dataclass
from typing import List, Tuple, Dict

@dataclass
class TumorData:
    """Data tumor untuk perhitungan"""
    volume_cc: float
    depth_cm: float
    alpha_beta_ratio: float
    
@dataclass
class DoseData:
    """Data dosis radiasi"""
    total_dose_gy: float
    dose_per_fraction_gy: float
    number_of_fractions: int

class RadiationOncologyCalculator:
    """Kalkulator komprehensif untuk onkologi radiasi"""
    
    def __init__(self):
        self.tissue_density = 1.0  # g/cm³
        
    # ============ FITUR 1-10: PERHITUNGAN DOSIS DASAR ============
    
    def biologically_effective_dose(self, total_dose: float, dose_per_fx: float, 
                                   alpha_beta: float) -> float:
        """1. BED (Biologically Effective Dose)"""
        return total_dose * (1 + dose_per_fx / alpha_beta)
    
    def equivalent_dose_2gy(self, total_dose: float, dose_per_fx: float, 
                           alpha_beta: float) -> float:
        """2. EQD2 (Equivalent Dose in 2 Gy fractions)"""
        bed = self.biologically_effective_dose(total_dose, dose_per_fx, alpha_beta)
        return bed / (1 + 2 / alpha_beta)
    
    def tumor_control_probability(self, dose_gy: float, d50: float = 50, 
                                  gamma: float = 2) -> float:
        """3. TCP (Tumor Control Probability)"""
        return 1 / (1 + (d50/dose_gy)**(4*gamma))
    
    def normal_tissue_complication_probability(self, dose_gy: float, 
                                              td50: float = 60, m: float = 0.4) -> float:
        """4. NTCP (Normal Tissue Complication Probability) - Model Lyman"""
        t = (dose_gy - td50) / (m * td50)
        return 0.5 * (1 + math.erf(t / math.sqrt(2)))
    
    def therapeutic_ratio(self, tcp: float, ntcp: float) -> float:
        """5. Therapeutic Ratio"""
        return tcp / ntcp if ntcp > 0 else float('inf')
    
    def percentage_depth_dose(self, depth_cm: float, ssd_cm: float = 100, 
                             energy_mv: float = 6) -> float:
        """6. PDD (Percentage Depth Dose)"""
        dmax = 1.5 if energy_mv == 6 else 3.0  # depth of maximum dose
        if depth_cm <= dmax:
            return 100
        tpr = 0.975 ** (depth_cm - dmax)  # Simplified model
        isf = ((ssd_cm + dmax) / (ssd_cm + depth_cm)) ** 2
        return 100 * tpr * isf
    
    def tissue_air_ratio(self, depth_cm: float, field_size_cm: float, 
                        energy_mv: float = 6) -> float:
        """7. TAR (Tissue Air Ratio)"""
        mu = 0.04 if energy_mv == 6 else 0.03  # attenuation coefficient
        return math.exp(-mu * depth_cm) * (1 + 0.01 * field_size_cm)
    
    def tissue_maximum_ratio(self, depth_cm: float, field_size_cm: float) -> float:
        """8. TMR (Tissue Maximum Ratio)"""
        dmax = 1.5
        if depth_cm <= dmax:
            return 1.0
        return math.exp(-0.04 * (depth_cm - dmax)) * (1 + 0.01 * field_size_cm)
    
    def monitor_units_calculation(self, prescribed_dose_cgy: float, 
                                 output_factor: float = 1.0,
                                 tpr: float = 1.0) -> float:
        """9. Monitor Units Calculation"""
        return prescribed_dose_cgy / (output_factor * tpr)
    
    def dose_rate_calculation(self, source_activity_ci: float, 
                             distance_cm: float) -> float:
        """10. Dose Rate untuk Brachytherapy (cGy/hr)"""
        exposure_rate_constant = 0.35  # R·cm²/(mCi·hr) untuk Ir-192
        dose_rate = (source_activity_ci * 1000 * exposure_rate_constant) / (distance_cm ** 2)
        return dose_rate * 0.95  # conversion factor R to cGy
    
    # ============ FITUR 11-20: PERHITUNGAN VOLUME DAN GEOMETRI ============
    
    def tumor_volume_sphere(self, diameter_cm: float) -> float:
        """11. Volume tumor (spherical)"""
        return (4/3) * math.pi * (diameter_cm/2) ** 3
    
    def tumor_volume_ellipsoid(self, a_cm: float, b_cm: float, c_cm: float) -> float:
        """12. Volume tumor (ellipsoid)"""
        return (4/3) * math.pi * a_cm * b_cm * c_cm
    
    def planning_target_volume(self, gtv_cc: float, ctv_margin_cm: float = 0.5,
                              ptv_margin_cm: float = 0.5) -> float:
        """13. PTV (Planning Target Volume)"""
        # Simplified: assume spherical expansion
        gtv_radius = (3 * gtv_cc / (4 * math.pi)) ** (1/3)
        ptv_radius = gtv_radius + ctv_margin_cm + ptv_margin_cm
        return (4/3) * math.pi * ptv_radius ** 3
    
    def conformity_index(self, volume_95_percent: float, ptv_volume: float) -> float:
        """14. CI (Conformity Index)"""
        return volume_95_percent / ptv_volume
    
    def homogeneity_index(self, d2_percent: float, d98_percent: float, 
                         d50_percent: float) -> float:
        """15. HI (Homogeneity Index)"""
        return (d2_percent - d98_percent) / d50_percent
    
    def paddick_conformity_index(self, tv_piv: float, tv: float, piv: float) -> float:
        """16. Paddick Conformity Index"""
        return (tv_piv ** 2) / (tv * piv)
    
    def gradient_index(self, volume_50_percent: float, 
                      volume_prescription: float) -> float:
        """17. Gradient Index"""
        return volume_50_percent / volume_prescription
    
    def organ_at_risk_volume(self, total_volume_cc: float, 
                            overlap_with_ptv_cc: float = 0) -> float:
        """18. OAR Volume - volume at risk"""
        return total_volume_cc - overlap_with_ptv_cc
    
    def dose_volume_histogram_point(self, dose_gy: float, total_dose_gy: float) -> float:
        """19. DVH point calculation (simplified)"""
        return 100 * (1 - dose_gy / total_dose_gy) if dose_gy < total_dose_gy else 0
    
    def equivalent_sphere_diameter(self, volume_cc: float) -> float:
        """20. ESD (Equivalent Sphere Diameter)"""
        return 2 * (3 * volume_cc / (4 * math.pi)) ** (1/3)
    
    # ============ FITUR 21-30: KOREKSI DAN FAKTOR ============
    
    def inverse_square_law(self, intensity_1: float, distance_1: float, 
                          distance_2: float) -> float:
        """21. Inverse Square Law"""
        return intensity_1 * (distance_1 / distance_2) ** 2
    
    def mayneord_f_factor(self, ssd1: float, depth: float, ssd2: float) -> float:
        """22. Mayneord F Factor"""
        return ((ssd1 + depth) / (ssd2 + depth)) ** 2 * (ssd2 / ssd1) ** 2
    
    def off_axis_ratio(self, distance_from_axis_cm: float, 
                      field_size_cm: float) -> float:
        """23. OAR (Off-Axis Ratio)"""
        sigma = field_size_cm / 4
        return math.exp(-(distance_from_axis_cm ** 2) / (2 * sigma ** 2))
    
    def scatter_air_ratio(self, field_size_cm: float, depth_cm: float) -> float:
        """24. SAR (Scatter-Air Ratio)"""
        return 0.01 * field_size_cm * math.exp(-0.02 * depth_cm)
    
    def backscatter_factor(self, field_size_cm: float, energy_mv: float = 6) -> float:
        """25. BSF (Backscatter Factor)"""
        bsf_max = 1.04 if energy_mv == 6 else 1.02
        return 1 + (bsf_max - 1) * (1 - math.exp(-0.1 * field_size_cm))
    
    def wedge_transmission_factor(self, wedge_angle: float) -> float:
        """26. Wedge Transmission Factor"""
        return 1 - (wedge_angle / 90) * 0.5
    
    def tray_transmission_factor(self, tray_thickness_cm: float, 
                                energy_mv: float = 6) -> float:
        """27. Tray Transmission Factor"""
        mu = 0.05 if energy_mv == 6 else 0.03
        return math.exp(-mu * tray_thickness_cm)
    
    def tissue_phantom_ratio(self, depth_cm: float, field_size_cm: float) -> float:
        """28. TPR (Tissue Phantom Ratio)"""
        return self.tissue_maximum_ratio(depth_cm, field_size_cm)
    
    def collimator_scatter_factor(self, field_size_cm: float) -> float:
        """29. Collimator Scatter Factor"""
        return 0.95 + 0.05 * (1 - math.exp(-0.05 * field_size_cm))
    
    def phantom_scatter_factor(self, field_size_cm: float) -> float:
        """30. Phantom Scatter Factor"""
        return 1 + 0.01 * field_size_cm * (1 - math.exp(-0.05 * field_size_cm))
    
    # ============ FITUR 31-40: RADIOBIOLOGI ============
    
    def linear_quadratic_survival(self, dose_gy: float, alpha: float, 
                                  beta: float) -> float:
        """31. Linear-Quadratic Cell Survival"""
        return math.exp(-alpha * dose_gy - beta * dose_gy ** 2)
    
    def cell_kill_fraction(self, dose_gy: float, alpha: float, beta: float) -> float:
        """32. Cell Kill Fraction"""
        return 1 - self.linear_quadratic_survival(dose_gy, alpha, beta)
    
    def effective_dose(self, physical_dose_gy: float, rbe: float = 1.1) -> float:
        """33. Effective Dose (untuk proton/ion therapy)"""
        return physical_dose_gy * rbe
    
    def tumor_doubling_time(self, initial_volume: float, final_volume: float, 
                           time_days: float) -> float:
        """34. Tumor Doubling Time"""
        if final_volume <= initial_volume:
            return float('inf')
        return time_days * math.log(2) / math.log(final_volume / initial_volume)
    
    def clonogenic_cell_survival(self, dose_gy: float, d0: float = 3) -> float:
        """35. Clonogenic Cell Survival (exponential model)"""
        return math.exp(-dose_gy / d0)
    
    def dose_recovery_factor(self, time_between_fractions_hr: float, 
                            half_time_hr: float = 1.5) -> float:
        """36. Dose Recovery Factor"""
        return 1 - math.exp(-math.log(2) * time_between_fractions_hr / half_time_hr)
    
    def tumor_growth_fraction(self, proliferating_cells: float, 
                             total_cells: float) -> float:
        """37. Growth Fraction"""
        return proliferating_cells / total_cells
    
    def oxygen_enhancement_ratio(self, po2_mmhg: float, k: float = 3) -> float:
        """38. OER (Oxygen Enhancement Ratio)"""
        return (k * po2_mmhg + k) / (po2_mmhg + k)
    
    def dose_modifying_factor(self, dose_with_modifier: float, 
                             dose_without_modifier: float) -> float:
        """39. DMF (Dose Modifying Factor)"""
        return dose_without_modifier / dose_with_modifier
    
    def incomplete_repair_factor(self, time_interval_hr: float, 
                                repair_half_time_hr: float = 0.5) -> float:
        """40. Incomplete Repair Factor"""
        return math.exp(-math.log(2) * time_interval_hr / repair_half_time_hr)
    
    # ============ FITUR 41-50: BRACHYTHERAPY & ADVANCED ============
    
    def brachytherapy_implant_activity(self, prescribed_dose_gy: float,
                                      treatment_time_hr: float,
                                      distance_cm: float) -> float:
        """41. Activity untuk Brachytherapy Implant (Ci)"""
        exposure_rate_constant = 0.35
        return (prescribed_dose_gy * 100 * distance_cm ** 2) / (treatment_time_hr * exposure_rate_constant * 1000 * 0.95)
    
    def paris_system_dosimetry(self, length_cm: float, activity_per_cm: float) -> float:
        """42. Paris System - Reference Dose (cGy/hr)"""
        return 0.85 * activity_per_cm * length_cm
    
    def source_decay_correction(self, initial_activity: float, time_days: float,
                               half_life_days: float = 73.8) -> float:
        """43. Decay Correction untuk sumber radioaktif"""
        return initial_activity * math.exp(-math.log(2) * time_days / half_life_days)
    
    def imrt_optimization_score(self, target_coverage: float, oar_sparing: float,
                               conformity: float) -> float:
        """44. IMRT Optimization Score"""
        return 0.5 * target_coverage + 0.3 * oar_sparing + 0.2 * conformity
    
    def stereotactic_dose_calculation(self, prescribed_dose_gy: float,
                                     number_of_fractions: int) -> float:
        """45. BED untuk SBRT/SRS"""
        dose_per_fx = prescribed_dose_gy / number_of_fractions
        return self.biologically_effective_dose(prescribed_dose_gy, dose_per_fx, 10)
    
    def respiratory_gating_duty_cycle(self, gate_on_time_sec: float,
                                     breathing_cycle_sec: float) -> float:
        """46. Duty Cycle untuk Respiratory Gating"""
        return gate_on_time_sec / breathing_cycle_sec
    
    def setup_margin_calculation(self, systematic_error_cm: float,
                                random_error_cm: float) -> float:
        """47. Setup Margin (van Herk formula)"""
        return 2.5 * systematic_error_cm + 0.7 * random_error_cm
    
    def dose_constraint_evaluation(self, delivered_dose: float,
                                  constraint_dose: float) -> bool:
        """48. Evaluasi Dose Constraint"""
        return delivered_dose <= constraint_dose
    
    def total_treatment_time(self, number_of_fractions: int,
                           fractions_per_week: int = 5) -> int:
        """49. Total Treatment Time (hari)"""
        weeks = math.ceil(number_of_fractions / fractions_per_week)
        return weeks * 7
    
    def overall_treatment_time_correction(self, planned_days: int, actual_days: int,
                                         dose_loss_per_day_gy: float = 0.6) -> float:
        """50. OTT Correction - dosis tambahan yang diperlukan"""
        if actual_days <= planned_days:
            return 0
        extra_days = actual_days - planned_days
        return extra_days * dose_loss_per_day_gy


# ============ CONTOH PENGGUNAAN ============

def main():
    calc = RadiationOncologyCalculator()
    
    print("=" * 70)
    print("SISTEM PERHITUNGAN ONKOLOGI RADIASI - 50 FITUR")
    print("=" * 70)
    
    # Contoh kasus: Kanker prostat
    print("\n📋 KASUS CONTOH: Kanker Prostat")
    print("-" * 70)
    
    # Parameter
    total_dose = 78  # Gy
    dose_per_fx = 2  # Gy
    num_fractions = 39
    alpha_beta = 3  # untuk prostat
    
    print(f"\nTotal Dose: {total_dose} Gy")
    print(f"Dose per Fraction: {dose_per_fx} Gy")
    print(f"Number of Fractions: {num_fractions}")
    print(f"α/β ratio: {alpha_beta}")
    
    # Perhitungan dosis
    print("\n" + "=" * 70)
    print("PERHITUNGAN DOSIS & RADIOBIOLOGI")
    print("=" * 70)
    
    bed = calc.biologically_effective_dose(total_dose, dose_per_fx, alpha_beta)
    print(f"\n1. BED (Biologically Effective Dose): {bed:.2f} Gy")
    
    eqd2 = calc.equivalent_dose_2gy(total_dose, dose_per_fx, alpha_beta)
    print(f"2. EQD2 (Equivalent Dose in 2 Gy): {eqd2:.2f} Gy")
    
    tcp = calc.tumor_control_probability(total_dose, d50=70, gamma=2)
    print(f"3. TCP (Tumor Control Probability): {tcp*100:.2f}%")
    
    ntcp = calc.normal_tissue_complication_probability(total_dose, td50=80, m=0.4)
    print(f"4. NTCP (Normal Tissue Complication): {ntcp*100:.2f}%")
    
    tr = calc.therapeutic_ratio(tcp, ntcp)
    print(f"5. Therapeutic Ratio: {tr:.2f}")
    
    # Perhitungan fisika
    print("\n" + "=" * 70)
    print("PERHITUNGAN FISIKA RADIASI")
    print("=" * 70)
    
    pdd = calc.percentage_depth_dose(10, 100, 6)
    print(f"\n6. PDD at 10 cm depth: {pdd:.2f}%")
    
    tar = calc.tissue_air_ratio(10, 10, 6)
    print(f"7. TAR (Tissue Air Ratio): {tar:.3f}")
    
    tmr = calc.tissue_maximum_ratio(10, 10)
    print(f"8. TMR (Tissue Maximum Ratio): {tmr:.3f}")
    
    mu = calc.monitor_units_calculation(200, 1.0, tmr)
    print(f"9. Monitor Units: {mu:.1f} MU")
    
    # Perhitungan volume
    print("\n" + "=" * 70)
    print("PERHITUNGAN VOLUME & GEOMETRI")
    print("=" * 70)
    
    tumor_vol = calc.tumor_volume_sphere(4.0)
    print(f"\n11. Tumor Volume (diameter 4 cm): {tumor_vol:.2f} cc")
    
    ptv_vol = calc.planning_target_volume(tumor_vol, 0.5, 0.5)
    print(f"13. PTV Volume: {ptv_vol:.2f} cc")
    
    ci = calc.conformity_index(ptv_vol * 0.95, ptv_vol)
    print(f"14. Conformity Index: {ci:.3f}")
    
    hi = calc.homogeneity_index(82, 76, 78)
    print(f"15. Homogeneity Index: {hi:.3f}")
    
    esd = calc.equivalent_sphere_diameter(tumor_vol)
    print(f"20. Equivalent Sphere Diameter: {esd:.2f} cm")
    
    # Koreksi dan faktor
    print("\n" + "=" * 70)
    print("KOREKSI DAN FAKTOR")
    print("=" * 70)
    
    isl = calc.inverse_square_law(100, 100, 80)
    print(f"\n21. Inverse Square Law correction: {isl:.2f}")
    
    bsf = calc.backscatter_factor(10, 6)
    print(f"25. Backscatter Factor: {bsf:.3f}")
    
    wedge = calc.wedge_transmission_factor(45)
    print(f"26. Wedge Transmission (45°): {wedge:.3f}")
    
    # Radiobiologi lanjutan
    print("\n" + "=" * 70)
    print("RADIOBIOLOGI LANJUTAN")
    print("=" * 70)
    
    survival = calc.linear_quadratic_survival(2, 0.35, 0.05)
    print(f"\n31. Cell Survival (2 Gy): {survival:.6f}")
    
    kill_fraction = calc.cell_kill_fraction(2, 0.35, 0.05)
    print(f"32. Cell Kill Fraction: {kill_fraction*100:.4f}%")
    
    oer = calc.oxygen_enhancement_ratio(20)
    print(f"38. Oxygen Enhancement Ratio: {oer:.3f}")
    
    # Brachytherapy
    print("\n" + "=" * 70)
    print("BRACHYTHERAPY")
    print("=" * 70)
    
    dose_rate = calc.dose_rate_calculation(10, 1)
    print(f"\n10. Dose Rate (10 Ci at 1 cm): {dose_rate:.2f} cGy/hr")
    
    activity = calc.brachytherapy_implant_activity(10, 24, 1)
    print(f"41. Required Activity: {activity:.2f} Ci")
    
    decay = calc.source_decay_correction(10, 30, 73.8)
    print(f"43. Activity after 30 days: {decay:.2f} Ci")
    
    # Advanced calculations
    print("\n" + "=" * 70)
    print("PERHITUNGAN ADVANCED")
    print("=" * 70)
    
    sbrt_bed = calc.stereotactic_dose_calculation(48, 4)
    print(f"\n45. SBRT BED (48 Gy in 4 fx): {sbrt_bed:.2f} Gy")
    
    setup_margin = calc.setup_margin_calculation(0.3, 0.4)
    print(f"47. Setup Margin (van Herk): {setup_margin:.2f} cm")
    
    treatment_days = calc.total_treatment_time(39, 5)
    print(f"49. Total Treatment Time: {treatment_days} days")
    
    ott_correction = calc.overall_treatment_time_correction(55, 60, 0.6)
    print(f"50. OTT Correction needed: {ott_correction:.2f} Gy")
    
    print("\n" + "=" * 70)
    print("PERHITUNGAN SELESAI")
    print("=" * 70)

if __name__ == "__main__":
    main()
