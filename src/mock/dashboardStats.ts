import type { ClinicDailyData, TrendDataPoint, MissingAngle, PhotoAngle } from '../types';

const PHOTO_ANGLE_LABELS: Record<PhotoAngle, string> = {
  frontal: '正面像',
  frontalSmile: '正面微笑像',
  lateral: '侧面像（侧貌）',
  lateral45: '45°侧面像',
  upperOcclusal: '上颌咬合像',
  lowerOcclusal: '下颌咬合像',
  occlusion: '正中咬合像',
  overjet: '覆盖像',
  overbite: '覆𬌗像',
};

export const getToday = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (d: Date): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const genMissingAngles = (seed: number): MissingAngle[] => {
  const angles: PhotoAngle[] = ['lateral', 'upperOcclusal', 'lowerOcclusal', 'occlusion', 'overjet', 'overbite'];
  const result: MissingAngle[] = [];
  const count = (seed % 4) + 1;
  for (let i = 0; i < count; i++) {
    const angle = angles[(seed + i) % angles.length];
    if (!result.find((m) => m.angle === angle)) {
      result.push({
        angle,
        label: PHOTO_ANGLE_LABELS[angle],
        count: ((seed + i * 3) % 6) + 1,
      });
    }
  }
  return result;
};

export const generateDailyData = (date: string, clinics: { id: string; name: string }[]): ClinicDailyData[] => {
  return clinics.map((clinic, idx) => {
    const seed = idx + date.split('-').reduce((a, b) => a + parseInt(b), 0);
    const totalPatients = 15 + (seed % 25);
    const photographedCount = Math.max(0, totalPatients - (seed % 8) - 2);
    const retakeCount = (seed % 5) + 1;
    const completionRate = Math.round((photographedCount / totalPatients) * 10000) / 100;
    const retakeRate = Math.round((retakeCount / Math.max(1, photographedCount)) * 10000) / 100;
    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      date,
      totalPatients,
      photographedCount,
      missingAngles: genMissingAngles(seed),
      retakeCount,
      retakeRate,
      completionRate,
    };
  });
};

export const generateTrendData = (days = 7): TrendDataPoint[] => {
  const result: TrendDataPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = i * 7 + 13;
    result.push({
      date: formatDate(d),
      completionRate: 82 + (seed % 15) + Math.round((seed % 100) / 100) / 10,
      retakeRate: 4 + (seed % 6) + Math.round(((seed * 3) % 100) / 100) / 10,
    });
  }
  return result;
};

export const generateMissingAngleDist = (dailyData: ClinicDailyData[]): MissingAngle[] => {
  const dist: Record<PhotoAngle, MissingAngle> = {} as Record<PhotoAngle, MissingAngle>;
  dailyData.forEach((d) => {
    d.missingAngles.forEach((m) => {
      if (!dist[m.angle]) {
        dist[m.angle] = { angle: m.angle, label: m.label, count: 0 };
      }
      dist[m.angle].count += m.count;
    });
  });
  return Object.values(dist).sort((a, b) => b.count - a.count);
};

export { PHOTO_ANGLE_LABELS };
