const safeDivide = (num, den) => (den === 0 ? Number.POSITIVE_INFINITY : num / den);

const categories = [
  {
    id: 'dosis-dasar',
    title: 'Dosis Dasar',
    color: '#2563eb',
    calculators: [
      { id: 1, name: 'BED', unit: 'Gy', fields: [['totalDose', 'Total dose (Gy)', 78], ['dosePerFx', 'Dose/fraction (Gy)', 2], ['alphaBeta', 'α/β', 3]], compute: ({ totalDose, dosePerFx, alphaBeta }) => totalDose * (1 + dosePerFx / alphaBeta) },
      { id: 2, name: 'EQD2', unit: 'Gy', fields: [['totalDose', 'Total dose (Gy)', 78], ['dosePerFx', 'Dose/fraction (Gy)', 2], ['alphaBeta', 'α/β', 3]], compute: ({ totalDose, dosePerFx, alphaBeta }) => {
        const bed = totalDose * (1 + dosePerFx / alphaBeta);
        return bed / (1 + 2 / alphaBeta);
      } },
      { id: 3, name: 'TCP', unit: '%', fields: [['doseGy', 'Dose (Gy)', 70], ['d50', 'D50 (Gy)', 50], ['gamma', 'Gamma', 2]], compute: ({ doseGy, d50, gamma }) => 100 * (1 / (1 + (d50 / doseGy) ** (4 * gamma))) },
      { id: 4, name: 'NTCP', unit: '%', fields: [['doseGy', 'Dose (Gy)', 70], ['td50', 'TD50 (Gy)', 60], ['m', 'm', 0.4]], compute: ({ doseGy, td50, m }) => {
        const t = (doseGy - td50) / (m * td50);
        return 50 * (1 + erf(t / Math.sqrt(2)));
      } },
      { id: 5, name: 'Therapeutic Ratio', unit: 'ratio', fields: [['tcp', 'TCP (0-1)', 0.8], ['ntcp', 'NTCP (0-1)', 0.2]], compute: ({ tcp, ntcp }) => safeDivide(tcp, ntcp) },
      { id: 6, name: 'PDD', unit: '%', fields: [['depthCm', 'Depth (cm)', 10], ['ssdCm', 'SSD (cm)', 100], ['energyMv', 'Energy (MV)', 6]], compute: ({ depthCm, ssdCm, energyMv }) => {
        const dmax = energyMv === 6 ? 1.5 : 3;
        if (depthCm <= dmax) return 100;
        const tpr = 0.975 ** (depthCm - dmax);
        const isf = ((ssdCm + dmax) / (ssdCm + depthCm)) ** 2;
        return 100 * tpr * isf;
      } },
      { id: 7, name: 'TAR', unit: 'ratio', fields: [['depthCm', 'Depth (cm)', 10], ['fieldSizeCm', 'Field size (cm)', 10], ['energyMv', 'Energy (MV)', 6]], compute: ({ depthCm, fieldSizeCm, energyMv }) => Math.exp(-(energyMv === 6 ? 0.04 : 0.03) * depthCm) * (1 + 0.01 * fieldSizeCm) },
      { id: 8, name: 'TMR', unit: 'ratio', fields: [['depthCm', 'Depth (cm)', 10], ['fieldSizeCm', 'Field size (cm)', 10]], compute: ({ depthCm, fieldSizeCm }) => (depthCm <= 1.5 ? 1 : Math.exp(-0.04 * (depthCm - 1.5)) * (1 + 0.01 * fieldSizeCm)) },
      { id: 9, name: 'Monitor Units Calculation', unit: 'MU', fields: [['doseCgy', 'Prescribed dose (cGy)', 200], ['outputFactor', 'Output factor', 1], ['tpr', 'TPR/TMR', 0.8]], compute: ({ doseCgy, outputFactor, tpr }) => safeDivide(doseCgy, outputFactor * tpr) },
      { id: 10, name: 'Dose Rate Brachy', unit: 'cGy/hr', fields: [['sourceActivityCi', 'Source activity (Ci)', 10], ['distanceCm', 'Distance (cm)', 1]], compute: ({ sourceActivityCi, distanceCm }) => ((sourceActivityCi * 1000 * 0.35) / (distanceCm ** 2)) * 0.95 }
    ]
  },
  {
    id: 'volume-geometri',
    title: 'Volume & Geometri',
    color: '#0d9488',
    calculators: [
      { id: 11, name: 'Volume Tumor (Spherical)', unit: 'cc', fields: [['diameterCm', 'Diameter (cm)', 4]], compute: ({ diameterCm }) => (4 / 3) * Math.PI * (diameterCm / 2) ** 3 },
      { id: 12, name: 'Volume Tumor (Ellipsoid)', unit: 'cc', fields: [['aCm', 'a (cm)', 3], ['bCm', 'b (cm)', 2], ['cCm', 'c (cm)', 2]], compute: ({ aCm, bCm, cCm }) => (4 / 3) * Math.PI * aCm * bCm * cCm },
      { id: 13, name: 'PTV', unit: 'cc', fields: [['gtvCc', 'GTV (cc)', 34], ['ctvMarginCm', 'CTV margin (cm)', 0.5], ['ptvMarginCm', 'PTV margin (cm)', 0.5]], compute: ({ gtvCc, ctvMarginCm, ptvMarginCm }) => {
        const gtvRadius = (3 * gtvCc / (4 * Math.PI)) ** (1 / 3);
        const ptvRadius = gtvRadius + ctvMarginCm + ptvMarginCm;
        return (4 / 3) * Math.PI * ptvRadius ** 3;
      } },
      { id: 14, name: 'Conformity Index', unit: 'ratio', fields: [['v95', 'Volume 95% isodose', 120], ['ptvVolume', 'PTV volume', 130]], compute: ({ v95, ptvVolume }) => safeDivide(v95, ptvVolume) },
      { id: 15, name: 'Homogeneity Index', unit: 'ratio', fields: [['d2', 'D2%', 82], ['d98', 'D98%', 76], ['d50', 'D50%', 78]], compute: ({ d2, d98, d50 }) => safeDivide(d2 - d98, d50) },
      { id: 16, name: 'Paddick CI', unit: 'ratio', fields: [['tvPiv', 'TV_PIV', 110], ['tv', 'TV', 130], ['piv', 'PIV', 140]], compute: ({ tvPiv, tv, piv }) => safeDivide(tvPiv ** 2, tv * piv) },
      { id: 17, name: 'Gradient Index', unit: 'ratio', fields: [['v50', 'Volume 50%', 250], ['vPres', 'Volume prescription', 120]], compute: ({ v50, vPres }) => safeDivide(v50, vPres) },
      { id: 18, name: 'OAR Volume', unit: 'cc', fields: [['totalVolumeCc', 'Total volume', 180], ['overlapCc', 'Overlap with PTV', 15]], compute: ({ totalVolumeCc, overlapCc }) => totalVolumeCc - overlapCc },
      { id: 19, name: 'DVH Point', unit: '%', fields: [['doseGy', 'Dose point (Gy)', 30], ['totalDoseGy', 'Total dose (Gy)', 70]], compute: ({ doseGy, totalDoseGy }) => (doseGy < totalDoseGy ? 100 * (1 - doseGy / totalDoseGy) : 0) },
      { id: 20, name: 'Equivalent Sphere Diameter', unit: 'cm', fields: [['volumeCc', 'Volume (cc)', 34]], compute: ({ volumeCc }) => 2 * (3 * volumeCc / (4 * Math.PI)) ** (1 / 3) }
    ]
  },
  {
    id: 'koreksi-faktor',
    title: 'Koreksi & Faktor',
    color: '#7c3aed',
    calculators: [
      { id: 21, name: 'Inverse Square Law', unit: 'intensity', fields: [['intensity1', 'Intensity 1', 100], ['distance1', 'Distance 1 (cm)', 100], ['distance2', 'Distance 2 (cm)', 80]], compute: ({ intensity1, distance1, distance2 }) => intensity1 * (distance1 / distance2) ** 2 },
      { id: 22, name: 'Mayneord F', unit: 'ratio', fields: [['ssd1', 'SSD1 (cm)', 100], ['depth', 'Depth (cm)', 10], ['ssd2', 'SSD2 (cm)', 90]], compute: ({ ssd1, depth, ssd2 }) => (((ssd1 + depth) / (ssd2 + depth)) ** 2) * ((ssd2 / ssd1) ** 2) },
      { id: 23, name: 'Off-Axis Ratio', unit: 'ratio', fields: [['distanceFromAxisCm', 'Distance from axis (cm)', 2], ['fieldSizeCm', 'Field size (cm)', 10]], compute: ({ distanceFromAxisCm, fieldSizeCm }) => {
        const sigma = fieldSizeCm / 4;
        return Math.exp(-(distanceFromAxisCm ** 2) / (2 * sigma ** 2));
      } },
      { id: 24, name: 'Scatter-Air Ratio', unit: 'ratio', fields: [['fieldSizeCm', 'Field size (cm)', 10], ['depthCm', 'Depth (cm)', 10]], compute: ({ fieldSizeCm, depthCm }) => 0.01 * fieldSizeCm * Math.exp(-0.02 * depthCm) },
      { id: 25, name: 'Backscatter Factor', unit: 'ratio', fields: [['fieldSizeCm', 'Field size (cm)', 10], ['energyMv', 'Energy (MV)', 6]], compute: ({ fieldSizeCm, energyMv }) => {
        const bsfMax = energyMv === 6 ? 1.04 : 1.02;
        return 1 + (bsfMax - 1) * (1 - Math.exp(-0.1 * fieldSizeCm));
      } },
      { id: 26, name: 'Wedge Transmission Factor', unit: 'ratio', fields: [['wedgeAngle', 'Wedge angle (°)', 45]], compute: ({ wedgeAngle }) => 1 - (wedgeAngle / 90) * 0.5 },
      { id: 27, name: 'Tray Transmission Factor', unit: 'ratio', fields: [['trayThicknessCm', 'Tray thickness (cm)', 1], ['energyMv', 'Energy (MV)', 6]], compute: ({ trayThicknessCm, energyMv }) => Math.exp(-(energyMv === 6 ? 0.05 : 0.03) * trayThicknessCm) },
      { id: 28, name: 'Tissue Phantom Ratio (TPR)', unit: 'ratio', fields: [['depthCm', 'Depth (cm)', 10], ['fieldSizeCm', 'Field size (cm)', 10]], compute: ({ depthCm, fieldSizeCm }) => (depthCm <= 1.5 ? 1 : Math.exp(-0.04 * (depthCm - 1.5)) * (1 + 0.01 * fieldSizeCm)) },
      { id: 29, name: 'Collimator Scatter', unit: 'ratio', fields: [['fieldSizeCm', 'Field size (cm)', 10]], compute: ({ fieldSizeCm }) => 0.95 + 0.05 * (1 - Math.exp(-0.05 * fieldSizeCm)) },
      { id: 30, name: 'Phantom Scatter', unit: 'ratio', fields: [['fieldSizeCm', 'Field size (cm)', 10]], compute: ({ fieldSizeCm }) => 1 + 0.01 * fieldSizeCm * (1 - Math.exp(-0.05 * fieldSizeCm)) }
    ]
  },
  {
    id: 'radiobiologi',
    title: 'Radiobiologi',
    color: '#db2777',
    calculators: [
      { id: 31, name: 'LQ Cell Survival', unit: 'fraction', fields: [['doseGy', 'Dose (Gy)', 2], ['alpha', 'α', 0.35], ['beta', 'β', 0.05]], compute: ({ doseGy, alpha, beta }) => Math.exp(-alpha * doseGy - beta * doseGy ** 2) },
      { id: 32, name: 'Cell Kill Fraction', unit: 'fraction', fields: [['doseGy', 'Dose (Gy)', 2], ['alpha', 'α', 0.35], ['beta', 'β', 0.05]], compute: ({ doseGy, alpha, beta }) => 1 - Math.exp(-alpha * doseGy - beta * doseGy ** 2) },
      { id: 33, name: 'Effective Dose', unit: 'Gy(RBE)', fields: [['physicalDoseGy', 'Physical dose (Gy)', 60], ['rbe', 'RBE', 1.1]], compute: ({ physicalDoseGy, rbe }) => physicalDoseGy * rbe },
      { id: 34, name: 'Tumor Doubling Time', unit: 'days', fields: [['initialVolume', 'Initial volume', 25], ['finalVolume', 'Final volume', 50], ['timeDays', 'Elapsed days', 30]], compute: ({ initialVolume, finalVolume, timeDays }) => (finalVolume <= initialVolume ? Number.POSITIVE_INFINITY : timeDays * Math.log(2) / Math.log(finalVolume / initialVolume)) },
      { id: 35, name: 'Clonogenic Survival', unit: 'fraction', fields: [['doseGy', 'Dose (Gy)', 2], ['d0', 'D0', 3]], compute: ({ doseGy, d0 }) => Math.exp(-doseGy / d0) },
      { id: 36, name: 'Dose Recovery Factor', unit: 'fraction', fields: [['timeBetweenFractionsHr', 'Time between fractions (hr)', 6], ['halfTimeHr', 'Repair half time (hr)', 1.5]], compute: ({ timeBetweenFractionsHr, halfTimeHr }) => 1 - Math.exp(-Math.log(2) * timeBetweenFractionsHr / halfTimeHr) },
      { id: 37, name: 'Growth Fraction', unit: 'fraction', fields: [['proliferatingCells', 'Proliferating cells', 700], ['totalCells', 'Total cells', 1000]], compute: ({ proliferatingCells, totalCells }) => safeDivide(proliferatingCells, totalCells) },
      { id: 38, name: 'Oxygen Enhancement Ratio', unit: 'ratio', fields: [['po2Mmhg', 'pO2 (mmHg)', 20], ['k', 'k', 3]], compute: ({ po2Mmhg, k }) => (k * po2Mmhg + k) / (po2Mmhg + k) },
      { id: 39, name: 'Dose Modifying Factor', unit: 'ratio', fields: [['doseWithModifier', 'Dose with modifier', 55], ['doseWithoutModifier', 'Dose without modifier', 60]], compute: ({ doseWithModifier, doseWithoutModifier }) => safeDivide(doseWithoutModifier, doseWithModifier) },
      { id: 40, name: 'Incomplete Repair Factor', unit: 'fraction', fields: [['timeIntervalHr', 'Interval (hr)', 1], ['repairHalfTimeHr', 'Repair half-time (hr)', 0.5]], compute: ({ timeIntervalHr, repairHalfTimeHr }) => Math.exp(-Math.log(2) * timeIntervalHr / repairHalfTimeHr) }
    ]
  },
  {
    id: 'advanced',
    title: 'Brachytherapy & Advanced',
    color: '#ea580c',
    calculators: [
      { id: 41, name: 'Brachytherapy Implant Activity', unit: 'Ci', fields: [['prescribedDoseGy', 'Prescribed dose (Gy)', 10], ['treatmentTimeHr', 'Treatment time (hr)', 24], ['distanceCm', 'Distance (cm)', 1]], compute: ({ prescribedDoseGy, treatmentTimeHr, distanceCm }) => (prescribedDoseGy * 100 * distanceCm ** 2) / (treatmentTimeHr * 0.35 * 1000 * 0.95) },
      { id: 42, name: 'Paris System Dosimetry', unit: 'cGy/hr', fields: [['lengthCm', 'Length (cm)', 10], ['activityPerCm', 'Activity per cm', 0.8]], compute: ({ lengthCm, activityPerCm }) => 0.85 * activityPerCm * lengthCm },
      { id: 43, name: 'Source Decay Correction', unit: 'Ci', fields: [['initialActivity', 'Initial activity (Ci)', 10], ['timeDays', 'Time (days)', 30], ['halfLifeDays', 'Half-life (days)', 73.8]], compute: ({ initialActivity, timeDays, halfLifeDays }) => initialActivity * Math.exp(-Math.log(2) * timeDays / halfLifeDays) },
      { id: 44, name: 'IMRT Optimization Score', unit: 'score', fields: [['targetCoverage', 'Target coverage', 0.96], ['oarSparing', 'OAR sparing', 0.88], ['conformity', 'Conformity', 0.91]], compute: ({ targetCoverage, oarSparing, conformity }) => 0.5 * targetCoverage + 0.3 * oarSparing + 0.2 * conformity },
      { id: 45, name: 'SBRT/SRS Dose Calculation', unit: 'Gy', fields: [['prescribedDoseGy', 'Prescribed dose (Gy)', 48], ['numberOfFractions', 'Fractions', 4]], compute: ({ prescribedDoseGy, numberOfFractions }) => {
        const dosePerFx = prescribedDoseGy / numberOfFractions;
        return prescribedDoseGy * (1 + dosePerFx / 10);
      } },
      { id: 46, name: 'Respiratory Gating Duty Cycle', unit: 'fraction', fields: [['gateOnTimeSec', 'Gate-on time (sec)', 2], ['breathingCycleSec', 'Breathing cycle (sec)', 5]], compute: ({ gateOnTimeSec, breathingCycleSec }) => safeDivide(gateOnTimeSec, breathingCycleSec) },
      { id: 47, name: 'Setup Margin (van Herk)', unit: 'cm', fields: [['systematicErrorCm', 'Systematic error (cm)', 0.3], ['randomErrorCm', 'Random error (cm)', 0.4]], compute: ({ systematicErrorCm, randomErrorCm }) => 2.5 * systematicErrorCm + 0.7 * randomErrorCm },
      { id: 48, name: 'Dose Constraint Evaluation', unit: 'status', fields: [['deliveredDose', 'Delivered dose', 28], ['constraintDose', 'Constraint dose', 30]], compute: ({ deliveredDose, constraintDose }) => (deliveredDose <= constraintDose ? 1 : 0), formatter: (value) => value === 1 ? 'PASS ✅' : 'FAIL ❌' },
      { id: 49, name: 'Total Treatment Time', unit: 'days', fields: [['numberOfFractions', 'Number of fractions', 39], ['fractionsPerWeek', 'Fractions/week', 5]], compute: ({ numberOfFractions, fractionsPerWeek }) => Math.ceil(numberOfFractions / fractionsPerWeek) * 7 },
      { id: 50, name: 'Overall Treatment Time Correction', unit: 'Gy', fields: [['plannedDays', 'Planned days', 55], ['actualDays', 'Actual days', 60], ['doseLossPerDayGy', 'Dose loss/day (Gy)', 0.6]], compute: ({ plannedDays, actualDays, doseLossPerDayGy }) => (actualDays <= plannedDays ? 0 : (actualDays - plannedDays) * doseLossPerDayGy) }
    ]
  }
];


const hardRangeDefaults = [
  { pattern: /(fraction|ratio|ntcp|tcp|m$|gamma$|outputfactor|tpr|tmr|conformity|oarsparing|targetcoverage|rbe|alpha|beta|k$|duty|survival)/i, min: 0, max: 10 },
  { pattern: /(percent|%|v95|v50|d2|d50|d98|dose point)/i, min: 0, max: 1000 },
  { pattern: /(distance|depth|diameter|margin|cm|length)/i, min: 0, max: 300 },
  { pattern: /(time|days|hr|sec)/i, min: 0, max: 3650 },
  { pattern: /(dose|gy|cgy|td50|d50|d0|half|activity|ci|mu|volume|cells|fractions|ssd|field size|po2)/i, min: 0, max: 10000 }
];

const recommendedRangeDefaults = [
  { pattern: /(fraction|ratio|ntcp|tcp|conformity|oarsparing|targetcoverage|rbe|alpha|beta|survival)/i, min: 0, max: 1.5 },
  { pattern: /(distance|depth|diameter|margin|cm|length)/i, min: 0, max: 50 },
  { pattern: /(time|days)/i, min: 0, max: 365 },
  { pattern: /(hr)/i, min: 0, max: 48 },
  { pattern: /(sec)/i, min: 0, max: 120 },
  { pattern: /(fractions)/i, min: 1, max: 45 },
  { pattern: /(dose|gy|cgy|td50|d50|d0)/i, min: 0, max: 100 },
  { pattern: /(activity|ci)/i, min: 0, max: 30 },
  { pattern: /(volume|cc)/i, min: 0, max: 5000 },
  { pattern: /(cells)/i, min: 0, max: 1000000000 }
];

const inferRange = (sourceText, defaults, fallbackMin, fallbackMax) => {
  const lower = sourceText.toLowerCase();
  const matched = defaults.find(({ pattern }) => pattern.test(lower));
  return {
    min: matched?.min ?? fallbackMin,
    max: matched?.max ?? fallbackMax
  };
};

const normalizeField = (field) => {
  if (Array.isArray(field)) {
    const [key, label, defaultValue] = field;
    const source = `${key} ${label}`;
    const hardRange = inferRange(source, hardRangeDefaults, -1000000, 1000000);
    const recommendedRange = inferRange(source, recommendedRangeDefaults, hardRange.min, hardRange.max);
    const unitMatch = /\(([^)]+)\)/.exec(label);
    return {
      key,
      label,
      defaultValue,
      unit: unitMatch?.[1] ?? '',
      min: hardRange.min,
      max: hardRange.max,
      recommendedMin: recommendedRange.min,
      recommendedMax: recommendedRange.max,
      helperText: `Rentang rekomendasi ${recommendedRange.min} - ${recommendedRange.max}${unitMatch?.[1] ? ` ${unitMatch[1]}` : ''}`
    };
  }

  const source = `${field.key} ${field.label}`;
  const hardRange = inferRange(source, hardRangeDefaults, -1000000, 1000000);
  const recommendedRange = inferRange(source, recommendedRangeDefaults, hardRange.min, hardRange.max);
  return {
    unit: '',
    min: hardRange.min,
    max: hardRange.max,
    recommendedMin: recommendedRange.min,
    recommendedMax: recommendedRange.max,
    helperText: '',
    ...field
  };
};

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

const categoriesWithValidation = categories.map((category) => ({
  ...category,
  calculators: category.calculators.map((calculator) => ({
    ...calculator,
    fields: calculator.fields.map(normalizeField)
  }))
}));

export const calculatorCategories = categoriesWithValidation;
export const allCalculators = categoriesWithValidation.flatMap((category) =>
  category.calculators.map((calculator) => ({ ...calculator, categoryId: category.id, categoryTitle: category.title, color: category.color }))
);
