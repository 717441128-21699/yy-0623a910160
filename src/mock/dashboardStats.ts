import type { ClinicDailyData, TrendDataPoint, MissingAngle, PhotoAngle, ClinicDetailData, ClinicDetailTrendPoint, ClinicMissingAngleRank, ClinicInvolvedPerson } from '../types';

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

export const generateClinicDetail = (clinicId: string, days: number): ClinicDetailData => {
  const seed = parseInt(clinicId.replace(/\D/g, ''), 10) || 1;

  const formatDate = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const trendData: ClinicDetailTrendPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const daySeed = i * 5 + seed * 3;
    trendData.push({
      date: formatDate(d),
      retakeRate: 3 + (daySeed % 8) + Math.round(((daySeed * 2) % 100) / 100) / 10,
      retakeCount: 2 + ((daySeed + 1) % 6),
    });
  }

  const angles: PhotoAngle[] = ['lateral', 'upperOcclusal', 'lowerOcclusal', 'occlusion', 'overjet', 'overbite', 'frontalSmile', 'lateral45', 'frontal'];
  const missingAngleRanking: ClinicMissingAngleRank[] = [];
  const rankCount = Math.min(5 + (seed % 3), angles.length);
  for (let i = 0; i < rankCount; i++) {
    const angle = angles[(seed + i) % angles.length];
    if (!missingAngleRanking.find((m) => m.angle === angle)) {
      missingAngleRanking.push({
        angle,
        label: PHOTO_ANGLE_LABELS[angle],
        count: Math.round((((seed * 2 + i * 5) % 12) + 3) * (days / 14)),
      });
    }
  }
  missingAngleRanking.sort((a, b) => b.count - a.count);

  const doctorNames = ['张伟', '李静', '王磊', '刘洋', '陈静', '杨帆'];
  const nurseNames = ['赵雪', '孙丽', '周敏', '吴芳', '郑婷', '黄琳'];
  const involvedPeople: ClinicInvolvedPerson[] = [];
  const personCount = 4 + (seed % 4);
  for (let i = 0; i < personCount; i++) {
    const isDoctor = i % 2 === 0;
    const namePool = isDoctor ? doctorNames : nurseNames;
    const name = namePool[(seed + i) % namePool.length];
    if (!involvedPeople.find((p) => p.name === name)) {
      involvedPeople.push({
        name,
        role: isDoctor ? 'doctor' : 'nurse',
        missingCount: Math.round((((seed * 3 + i * 7) % 10) + 1) * (days / 14)),
      });
    }
  }
  involvedPeople.sort((a, b) => b.missingCount - a.missingCount);

  return {
    trendDays: days,
    trendData,
    missingAngleRanking,
    involvedPeople,
  };
};

export { PHOTO_ANGLE_LABELS };
