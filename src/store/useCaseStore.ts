import { create } from 'zustand';
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

export const useCaseStore = create<CaseState>((set, get) => ({
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
    set({ cases: mockCases, filteredCases: mockCases });
  },
}));

export default useCaseStore;
