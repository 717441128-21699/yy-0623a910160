import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PendingPhotoItem,
  CurrentAnnotation,
  IssueMark,
  QualityFeedback,
  FeedbackStatus,
  QualityFilter,
  ReviewSource,
} from '../types';
import { mockCases, extractPendingPhotos } from '../mock/cases';
import { mockFeedbacks } from '../mock/feedbacks';

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待整改',
  fixed: '已整改',
  verified: '已验证',
  rejected: '已驳回',
};

const initialFilter: QualityFilter = {
  clinicId: null,
  doctorId: null,
  nurseId: null,
  missingAngle: null,
  status: null,
};

interface QualityState {
  pendingPhotos: PendingPhotoItem[];
  filteredPendingPhotos: PendingPhotoItem[];
  currentAnnotation: CurrentAnnotation;
  feedbacks: QualityFeedback[];
  filteredFeedbacks: QualityFeedback[];
  qualityFilter: QualityFilter;
  reviewSource: ReviewSource | null;
  selectedPendingIndex: number;
  highlightedFeedbackIds: string[];
  selectedFeedbackId: string | null;
  setCurrentAnnotationPhoto: (photoId: string | null) => void;
  addMark: (mark: IssueMark) => void;
  removeMark: (markId: string) => void;
  submitFeedback: (data: { suggestion: string; assignee: string }) => string[];
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  addHighlights: (ids: string[]) => void;
  clearHighlights: () => void;
  selectFeedback: (id: string | null) => void;
  getFeedbacksByCase: (caseId: string) => QualityFeedback[];
  getFeedbacksByVisit: (visitId: string) => QualityFeedback[];
  getFeedbacksByPhoto: (photoId: string) => QualityFeedback[];
  loadInitialData: () => void;
  refreshPendingPhotos: () => void;
  setQualityFilter: (partial: Partial<QualityFilter>) => void;
  applyQualityFilter: () => void;
  resetQualityFilter: () => void;
  setReviewSource: (source: ReviewSource | null) => void;
  applyReviewSourceFilter: () => void;
  clearReviewSource: () => void;
}

const genId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useQualityStore = create<QualityState>()(
  persist(
    (set, get) => ({
      pendingPhotos: [],
      filteredPendingPhotos: [],
      currentAnnotation: {
        photoId: null,
        marks: [],
      },
      feedbacks: [],
      filteredFeedbacks: [],
      qualityFilter: initialFilter,
      reviewSource: null,
      selectedPendingIndex: 0,
      highlightedFeedbackIds: [],
      selectedFeedbackId: null,

      setCurrentAnnotationPhoto: (photoId: string | null) => {
        const { filteredPendingPhotos } = get();
        if (!photoId) {
          set({
            selectedPendingIndex: 0,
            currentAnnotation: { photoId: null, marks: [] },
          });
          return;
        }
        const index = filteredPendingPhotos.findIndex((item) => item.photo.id === photoId);
        if (index >= 0) {
          const marks = filteredPendingPhotos[index].photo.issueMarks ?? [];
          set({
            selectedPendingIndex: index,
            currentAnnotation: { photoId, marks: marks.length > 0 ? [...marks] : [] },
          });
        } else if (filteredPendingPhotos.length > 0) {
          const marks = filteredPendingPhotos[0].photo.issueMarks ?? [];
          set({
            selectedPendingIndex: 0,
            currentAnnotation: { photoId: filteredPendingPhotos[0].photo.id, marks: marks.length > 0 ? [...marks] : [] },
          });
        } else {
          set({
            selectedPendingIndex: 0,
            currentAnnotation: { photoId: null, marks: [] },
          });
        }
      },

      addMark: (mark: IssueMark) => {
        set((state) => ({
          currentAnnotation: {
            ...state.currentAnnotation,
            marks: [...state.currentAnnotation.marks, mark],
          },
        }));
      },

      removeMark: (markId: string) => {
        set((state) => ({
          currentAnnotation: {
            ...state.currentAnnotation,
            marks: state.currentAnnotation.marks.filter((m) => m.id !== markId),
          },
        }));
      },

      submitFeedback: (data: { suggestion: string; assignee: string }) => {
        const { currentAnnotation, filteredPendingPhotos, selectedPendingIndex } = get();
        const pendingItem = filteredPendingPhotos[selectedPendingIndex];

        if (!pendingItem || currentAnnotation.marks.length === 0) return [];

        const caseItem = mockCases.find((c) => c.id === pendingItem.caseId);

        const newFeedbacks: QualityFeedback[] = currentAnnotation.marks.map((mark, idx) => ({
          id: `feedback-${genId()}-${idx}`,
          caseId: pendingItem.caseId,
          visitId: pendingItem.visitId,
          photoId: pendingItem.photo.id,
          issueMark: mark,
          suggestion: data.suggestion,
          assignee: data.assignee,
          assigneeClinicId: caseItem?.clinicId ?? '',
          status: 'pending',
          statusLabel: STATUS_LABELS.pending,
          createdAt: new Date().toISOString(),
        }));

        const newFeedbackIds = newFeedbacks.map((fb) => fb.id);

        set((state) => ({
          feedbacks: [...newFeedbacks, ...state.feedbacks],
          currentAnnotation: {
            photoId: null,
            marks: [],
          },
        }));

        get().applyQualityFilter();
        get().refreshPendingPhotos();

        return newFeedbackIds;
      },

      addHighlights: (ids: string[]) => {
        set({ highlightedFeedbackIds: ids });
      },

      clearHighlights: () => {
        set({ highlightedFeedbackIds: [] });
      },

      selectFeedback: (id: string | null) => {
        set({ selectedFeedbackId: id });
      },

      getFeedbacksByCase: (caseId: string) => {
        return get().feedbacks.filter((fb) => fb.caseId === caseId);
      },

      getFeedbacksByVisit: (visitId: string) => {
        return get().feedbacks.filter((fb) => fb.visitId === visitId);
      },

      getFeedbacksByPhoto: (photoId: string) => {
        return get().feedbacks.filter((fb) => fb.photoId === photoId);
      },

      updateFeedbackStatus: (id: string, status: FeedbackStatus) => {
        const now = new Date().toISOString();
        set((state) => ({
          feedbacks: state.feedbacks.map((fb) => {
            if (fb.id !== id) return fb;
            return {
              ...fb,
              status,
              statusLabel: STATUS_LABELS[status],
              fixedAt: status !== 'pending' ? now : fb.fixedAt,
              verifiedAt: status === 'verified' ? now : fb.verifiedAt,
            };
          }),
        }));
        get().applyQualityFilter();
      },

      refreshPendingPhotos: () => {
        const { feedbacks } = get();
        const feedbackPhotoIds = new Set(feedbacks.map((fb) => fb.photoId));
        const allPending = extractPendingPhotos(mockCases);
        const filtered = allPending.filter((item) => !feedbackPhotoIds.has(item.photo.id));
        set({ pendingPhotos: filtered, selectedPendingIndex: 0 });
        get().applyQualityFilter();
      },

      loadInitialData: () => {
        const pending = extractPendingPhotos(mockCases);
        const existingFeedbacks = get().feedbacks;

        let mergedFeedbacks: QualityFeedback[];
        if (existingFeedbacks && existingFeedbacks.length > 0) {
          const existingIds = new Set(existingFeedbacks.map((fb) => fb.id));
          const newFeedbacks = mockFeedbacks.filter((fb) => !existingIds.has(fb.id));
          mergedFeedbacks = [...existingFeedbacks, ...newFeedbacks];
        } else {
          mergedFeedbacks = [...mockFeedbacks];
        }

        const feedbackPhotoIds = new Set(mergedFeedbacks.map((fb) => fb.photoId));
        const filtered = pending.filter((item) => !feedbackPhotoIds.has(item.photo.id));

        set({
          pendingPhotos: filtered,
          feedbacks: mergedFeedbacks,
          selectedPendingIndex: 0,
          currentAnnotation: {
            photoId: null,
            marks: [],
          },
        });

        get().applyQualityFilter();

        if (get().reviewSource) {
          get().applyReviewSourceFilter();
        }
      },

      setQualityFilter: (partial: Partial<QualityFilter>) => {
        set((state) => ({
          qualityFilter: { ...state.qualityFilter, ...partial },
        }));
        setTimeout(() => get().applyQualityFilter(), 0);
      },

      applyQualityFilter: () => {
        const { feedbacks, pendingPhotos, qualityFilter } = get();
        let resultFeedbacks = [...feedbacks];
        let resultPending = [...pendingPhotos];

        if (qualityFilter.clinicId) {
          resultFeedbacks = resultFeedbacks.filter((fb) => fb.assigneeClinicId === qualityFilter.clinicId);
          resultPending = resultPending.filter((item) => {
            const caseItem = mockCases.find((c) => c.id === item.caseId);
            return caseItem?.clinicId === qualityFilter.clinicId;
          });
        }

        if (qualityFilter.doctorId) {
          resultFeedbacks = resultFeedbacks.filter((fb) => {
            const caseItem = mockCases.find((c) => c.id === fb.caseId);
            return caseItem?.doctorId === qualityFilter.doctorId;
          });
          resultPending = resultPending.filter((item) => {
            const caseItem = mockCases.find((c) => c.id === item.caseId);
            return caseItem?.doctorId === qualityFilter.doctorId;
          });
        }

        if (qualityFilter.nurseId) {
          resultFeedbacks = resultFeedbacks.filter((fb) => {
            const caseItem = mockCases.find((c) => c.id === fb.caseId);
            if (!caseItem) return false;
            return caseItem.visits.some((v) => v.nurseId === qualityFilter.nurseId);
          });
          resultPending = resultPending.filter((item) => {
            const caseItem = mockCases.find((c) => c.id === item.caseId);
            if (!caseItem) return false;
            return caseItem.visits.some((v) => v.nurseId === qualityFilter.nurseId);
          });
        }

        if (qualityFilter.missingAngle) {
          resultPending = resultPending.filter((item) => {
            const caseItem = mockCases.find((c) => c.id === item.caseId);
            if (!caseItem) return false;
            return caseItem.visits.some((v) => v.missingAngles.includes(qualityFilter.missingAngle!));
          });
        }

        if (qualityFilter.status) {
          resultFeedbacks = resultFeedbacks.filter((fb) => fb.status === qualityFilter.status);
        }

        set({
          filteredFeedbacks: resultFeedbacks,
          filteredPendingPhotos: resultPending,
        });
      },

      resetQualityFilter: () => {
        set({ qualityFilter: initialFilter });
        setTimeout(() => get().applyQualityFilter(), 0);
      },

      setReviewSource: (source: ReviewSource | null) => {
        set({ reviewSource: source });
        if (source) {
          get().applyReviewSourceFilter();
        }
      },

      applyReviewSourceFilter: () => {
        const { reviewSource } = get();
        if (!reviewSource) return;

        set({
          qualityFilter: {
            clinicId: reviewSource.clinicId,
            doctorId: reviewSource.doctorId ?? null,
            nurseId: reviewSource.nurseId ?? null,
            missingAngle: null,
            status: null,
          },
        });
        setTimeout(() => get().applyQualityFilter(), 0);
      },

      clearReviewSource: () => {
        set({ reviewSource: null });
        get().resetQualityFilter();
      },
    }),
    {
      name: 'quality-storage',
      partialize: (state) => ({
        feedbacks: state.feedbacks,
        selectedPendingIndex: state.selectedPendingIndex,
        qualityFilter: state.qualityFilter,
        reviewSource: state.reviewSource,
      }),
    }
  )
);

export default useQualityStore;
