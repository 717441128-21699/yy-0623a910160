import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ClinicDailyData,
  TrendDataPoint,
  MissingAngle,
  ClinicDetailData,
  ClinicDetailTrendPoint,
  ClinicMissingAngleRank,
  ClinicInvolvedPerson,
  PhotoAngle,
} from '../types';
import { mockClinics } from '../mock/clinics';
import {
  getToday,
  generateDailyData,
  generateTrendData,
  generateMissingAngleDist,
  PHOTO_ANGLE_LABELS,
} from '../mock/dashboardStats';

interface DashboardState {
  selectedDate: string;
  selectedClinicIds: string[];
  dailyData: ClinicDailyData[];
  trendData: TrendDataPoint[];
  missingAngleDist: MissingAngle[];
  selectedClinicId: string | null;
  clinicDetailData: ClinicDetailData | null;
  setSelectedDate: (date: string) => void;
  toggleClinic: (id: string) => void;
  setAllClinics: (ids: string[]) => void;
  loadDashboardData: () => void;
  selectClinic: (id: string | null) => void;
  loadClinicDetail: (clinicId: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      selectedDate: getToday(),
      selectedClinicIds: [],
      dailyData: [],
      trendData: [],
      missingAngleDist: [],
      selectedClinicId: null,
      clinicDetailData: null,

      setSelectedDate: (date: string) => {
        const { selectedClinicIds } = get();
        const clinics = selectedClinicIds.length > 0
          ? mockClinics.filter((c) => selectedClinicIds.includes(c.id))
          : mockClinics;
        const newDailyData = generateDailyData(date, clinics);
        set({
          selectedDate: date,
          dailyData: newDailyData,
          missingAngleDist: generateMissingAngleDist(newDailyData),
        });
      },

      toggleClinic: (id: string) => {
        const { selectedClinicIds, selectedDate } = get();
        const exists = selectedClinicIds.includes(id);
        const newIds = exists
          ? selectedClinicIds.filter((cid) => cid !== id)
          : [...selectedClinicIds, id];
        const clinics = newIds.length > 0
          ? mockClinics.filter((c) => newIds.includes(c.id))
          : mockClinics;
        const newDailyData = generateDailyData(selectedDate, clinics);
        set({
          selectedClinicIds: newIds,
          dailyData: newDailyData,
          missingAngleDist: generateMissingAngleDist(newDailyData),
        });
      },

      setAllClinics: (ids: string[]) => {
        const { selectedDate } = get();
        const clinics = ids.length > 0
          ? mockClinics.filter((c) => ids.includes(c.id))
          : mockClinics;
        const newDailyData = generateDailyData(selectedDate, clinics);
        set({
          selectedClinicIds: ids,
          dailyData: newDailyData,
          missingAngleDist: generateMissingAngleDist(newDailyData),
        });
      },

      loadDashboardData: () => {
        const { selectedDate, selectedClinicIds } = get();
        const clinics = selectedClinicIds.length > 0
          ? mockClinics.filter((c) => selectedClinicIds.includes(c.id))
          : mockClinics;
        const newDailyData = generateDailyData(selectedDate, clinics);
        set({
          dailyData: newDailyData,
          trendData: generateTrendData(7),
          missingAngleDist: generateMissingAngleDist(newDailyData),
        });
      },

      selectClinic: (id: string | null) => {
        if (id) {
          get().loadClinicDetail(id);
        }
        set({
          selectedClinicId: id,
          clinicDetailData: id ? get().clinicDetailData : null,
        });
      },

      loadClinicDetail: (clinicId: string) => {
        const clinicIdx = mockClinics.findIndex((c) => c.id === clinicId);
        const seed = clinicIdx >= 0 ? clinicIdx + 1 : 1;

        const formatDate = (d: Date): string => {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const trend14Days: ClinicDetailTrendPoint[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const daySeed = i * 5 + seed * 3;
          trend14Days.push({
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
              count: ((seed * 2 + i * 5) % 12) + 3,
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
              missingCount: ((seed * 3 + i * 7) % 10) + 1,
            });
          }
        }
        involvedPeople.sort((a, b) => b.missingCount - a.missingCount);

        set({
          clinicDetailData: {
            trend14Days,
            missingAngleRanking,
            involvedPeople,
          },
        });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        selectedClinicIds: state.selectedClinicIds,
      }),
    }
  )
);

export default useDashboardStore;
