import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClinicDailyData, TrendDataPoint, MissingAngle } from '../types';
import { mockClinics } from '../mock/clinics';
import {
  getToday,
  generateDailyData,
  generateTrendData,
  generateMissingAngleDist,
} from '../mock/dashboardStats';

interface DashboardState {
  selectedDate: string;
  selectedClinicIds: string[];
  dailyData: ClinicDailyData[];
  trendData: TrendDataPoint[];
  missingAngleDist: MissingAngle[];
  setSelectedDate: (date: string) => void;
  toggleClinic: (id: string) => void;
  setAllClinics: (ids: string[]) => void;
  loadDashboardData: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      selectedDate: getToday(),
      selectedClinicIds: [],
      dailyData: [],
      trendData: [],
      missingAngleDist: [],

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
