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
  generateClinicDetail,
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
  trendDays: number;
  setSelectedDate: (date: string) => void;
  toggleClinic: (id: string) => void;
  setAllClinics: (ids: string[]) => void;
  loadDashboardData: () => void;
  selectClinic: (id: string | null) => void;
  loadClinicDetail: (clinicId: string) => void;
  setTrendDays: (days: number) => void;
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
      trendDays: 14,

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
        const { trendDays } = get();
        const detailData = generateClinicDetail(clinicId, trendDays);
        set({ clinicDetailData: detailData });
      },

      setTrendDays: (days: number) => {
        const { selectedClinicId } = get();
        if (selectedClinicId) {
          const detailData = generateClinicDetail(selectedClinicId, days);
          set({ trendDays: days, clinicDetailData: detailData });
        } else {
          set({ trendDays: days });
        }
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
