import { create } from 'zustand';
import type {
  PendingPhotoItem,
  CurrentAnnotation,
  IssueMark,
  QualityFeedback,
  FeedbackStatus,
} from '../types';
import { mockCases, extractPendingPhotos } from '../mock/cases';
import { mockFeedbacks } from '../mock/feedbacks';

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待整改',
  fixed: '已整改',
  verified: '已验证',
  rejected: '已驳回',
};

interface QualityState {
  pendingPhotos: PendingPhotoItem[];
  currentAnnotation: CurrentAnnotation;
  feedbacks: QualityFeedback[];
  selectedPendingIndex: number;
  setCurrentAnnotationPhoto: (photoId: string | null) => void;
  addMark: (mark: IssueMark) => void;
  removeMark: (markId: string) => void;
  submitFeedback: (data: { suggestion: string; assignee: string }) => void;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  loadInitialData: () => void;
}

const genId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useQualityStore = create<QualityState>((set, get) => ({
  pendingPhotos: [],
  currentAnnotation: {
    photoId: null,
    marks: [],
  },
  feedbacks: [],
  selectedPendingIndex: 0,

  setCurrentAnnotationPhoto: (photoId: string | null) => {
    const { pendingPhotos } = get();
    const index = photoId
      ? pendingPhotos.findIndex((item) => item.photo.id === photoId)
      : -1;
    const pendingItem = index >= 0 ? pendingPhotos[index] : null;
    const marks = pendingItem?.photo.issueMarks ?? [];
    set({
      selectedPendingIndex: index >= 0 ? index : 0,
      currentAnnotation: {
        photoId,
        marks: marks.length > 0 ? [...marks] : [],
      },
    });
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
    const { currentAnnotation, pendingPhotos, selectedPendingIndex } = get();
    const pendingItem = pendingPhotos[selectedPendingIndex];

    if (!pendingItem || currentAnnotation.marks.length === 0) return;

    const caseItem = mockCases.find((c) => c.id === pendingItem.caseId);

    currentAnnotation.marks.forEach((mark, idx) => {
      const feedback: QualityFeedback = {
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
      };

      set((state) => ({
        feedbacks: [feedback, ...state.feedbacks],
      }));
    });

    set((state) => ({
      currentAnnotation: {
        photoId: null,
        marks: [],
      },
      selectedPendingIndex: Math.max(
        0,
        Math.min(state.selectedPendingIndex, state.pendingPhotos.length - 2)
      ),
    }));
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
  },

  loadInitialData: () => {
    const pending = extractPendingPhotos(mockCases);
    set({
      pendingPhotos: pending,
      feedbacks: [...mockFeedbacks],
      selectedPendingIndex: 0,
      currentAnnotation: {
        photoId: null,
        marks: [],
      },
    });
  },
}));

export default useQualityStore;
