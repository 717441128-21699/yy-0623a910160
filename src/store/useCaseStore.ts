import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrthoCase, CaseFilter } from '../types';
import { mockCases } from '../mock/cases';

interface CaseState {
  cases: OrthoCase[];
  filteredCases: OrthoCase[];
  selectedCaseId: string | null;
  filter: CaseFilter;
  setFilter: (partialFilter: Partial<CaseFilter>) => void;
  applyFilter: () => void;
  selectCase: (id: string | null) => void;
  loadCases: () => void;
}

const initialFilter: CaseFilter = {
  clinicId: null,
  doctorId: null,
  nurseId: null,
  stage: null,
  missingAngle: null,
  dateRange: null,
};

export const useCaseStore = create<CaseState>()(
  persist(
    (set, get) => ({
      cases: [],
      filteredCases: [],
      selectedCaseId: null,
      filter: initialFilter,

      setFilter: (partialFilter: Partial<CaseFilter>) => {
        set((state) => ({
          filter: { ...state.filter, ...partialFilter },
        }));
      },

      applyFilter: () => {
        const { cases, filter } = get();
        let result = [...cases];

        if (filter.clinicId) {
          result = result.filter((c) => c.clinicId === filter.clinicId);
        }

        if (filter.doctorId) {
          result = result.filter((c) => c.doctorId === filter.doctorId);
        }

        if (filter.stage) {
          result = result.filter((c) => c.currentStage === filter.stage);
        }

        if (filter.nurseId) {
          result = result.filter((c) =>
            c.visits.some((v) => v.nurseId === filter.nurseId)
          );
        }

        if (filter.missingAngle) {
          result = result.filter((c) =>
            c.visits.some((v) => v.missingAngles.includes(filter.missingAngle!))
          );
        }

        if (filter.dateRange) {
          const [start, end] = filter.dateRange;
          result = result.filter((c) => {
            const latestDate = c.latestVisitDate;
            return latestDate >= start && latestDate <= end;
          });
        }

        set({ filteredCases: result });
      },

      selectCase: (id: string | null) => {
        set({ selectedCaseId: id });
      },

      loadCases: () => {
        const { filter } = get();
        set({ cases: mockCases });
        const hasActiveFilter =
          filter.clinicId ||
          filter.doctorId ||
          filter.nurseId ||
          filter.stage ||
          filter.missingAngle ||
          filter.dateRange;
        if (hasActiveFilter) {
          setTimeout(() => get().applyFilter(), 0);
        } else {
          set({ filteredCases: mockCases });
        }
      },
    }),
    {
      name: 'case-storage',
      partialize: (state) => ({
        filter: state.filter,
        filteredCases: state.filteredCases,
      }),
    }
  )
);

export default useCaseStore;
