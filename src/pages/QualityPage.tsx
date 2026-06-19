import { useState, useEffect, useRef } from 'react';
import { ImageIcon, ClipboardList, ShieldCheck, BellRing, CheckCircle2, ArrowRight, ListChecks } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { useCaseStore } from '@/store/useCaseStore';
import PendingFeedbackList from '@/components/quality/PendingFeedbackList';
import PhotoAnnotation from '@/components/quality/PhotoAnnotation';
import IssueSidebar from '@/components/quality/IssueSidebar';
import FeedbackForm from '@/components/quality/FeedbackForm';
import FeedbackStatusTracker from '@/components/quality/FeedbackStatusTracker';
import NurseReminderView from '@/components/quality/NurseReminderView';
import type { IssueType, IssueMark } from '@/types';
import { ISSUE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

type PageTab = 'pending' | 'tracker' | 'nurse';

export default function QualityPage() {
  const {
    pendingPhotos,
    selectedPendingIndex,
    currentAnnotation,
    setCurrentAnnotationPhoto,
    addMark,
    removeMark,
    loadInitialData,
    addHighlights,
    clearHighlights,
    selectedFeedbackId,
    highlightedFeedbackIds,
    selectFeedback,
  } = useQualityStore();
  const { selectCase } = useCaseStore();

  const [activeTab, setActiveTab] = useState<PageTab>('pending');
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState<string[]>([]);
  const [submittedAssignee, setSubmittedAssignee] = useState('');
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  const handleViewTracker = (feedbackId: string) => {
    addHighlights([feedbackId]);
    selectFeedback(feedbackId);
    setActiveTab('tracker');
  };

  const handleViewCase = (caseId: string) => {
    selectCase(caseId);
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (selectedFeedbackId || (highlightedFeedbackIds && highlightedFeedbackIds.length > 0)) {
      setActiveTab('tracker');
    }
  }, [selectedFeedbackId, highlightedFeedbackIds]);

  useEffect(() => {
    if (activeTab !== 'tracker') {
      if (selectedFeedbackId) {
        selectFeedback(null);
      }
      if (highlightedFeedbackIds.length > 0) {
        clearHighlights();
      }
    }
  }, [activeTab, selectedFeedbackId, highlightedFeedbackIds, selectFeedback, clearHighlights]);

  useEffect(() => {
    if (pendingPhotos.length > 0 && currentAnnotation.photoId === null) {
      const firstPhoto = pendingPhotos[0];
      setCurrentAnnotationPhoto(firstPhoto.photo.id);
    }
  }, [pendingPhotos, currentAnnotation.photoId, setCurrentAnnotationPhoto]);

  const currentPhoto =
    pendingPhotos[selectedPendingIndex]?.photo ?? null;

  const handleAddMark = (rect: { x: number; y: number; w: number; h: number }) => {
    if (!selectedIssueType || !currentPhoto) return;

    const issueConfig = ISSUE_TYPES.find((t) => t.key === selectedIssueType);
    const mark: IssueMark = {
      id: `mark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedIssueType,
      typeLabel: issueConfig?.label ?? '',
      description: '',
      rect,
      createdAt: new Date().toISOString(),
      createdBy: '质控专员',
    };
    addMark(mark);
  };

  const handleUpdateMarkDescription = (markId: string, description: string) => {
    const mark = currentAnnotation.marks.find((m) => m.id === markId);
    if (!mark) return;
    removeMark(markId);
    addMark({ ...mark, description });
  };

  const handleCancel = () => {
    currentAnnotation.marks.forEach((m) => removeMark(m.id));
    setSelectedIssueType(null);
  };

  const handleSubmitSuccess = (feedbackIds: string[], assignee: string) => {
    setSubmittedFeedbackIds(feedbackIds);
    setSubmittedAssignee(assignee);
    setShowSuccessModal(true);
    setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 100);
  };

  const handleContinueNext = () => {
    setShowSuccessModal(false);
    setSubmittedFeedbackIds([]);
    setSubmittedAssignee('');
    clearHighlights();
    if (pendingPhotos.length > 0) {
      setCurrentAnnotationPhoto(pendingPhotos[0].photo.id);
    }
  };

  const handleGoToTracker = () => {
    setShowSuccessModal(false);
    addHighlights(submittedFeedbackIds);
    setActiveTab('tracker');
    setTimeout(() => {
      clearHighlights();
    }, 2500);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSubmittedFeedbackIds([]);
    setSubmittedAssignee('');
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">照片质控反馈</h1>
              <p className="text-xs text-slate-500">正畸复诊照片质量审核与整改追踪</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === 'pending'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <ImageIcon className="h-4 w-4" />
              待处理照片
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === 'tracker'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <ClipboardList className="h-4 w-4" />
              整改追踪
            </button>
            <button
              onClick={() => setActiveTab('nurse')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === 'nurse'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <BellRing className="h-4 w-4" />
              护士提醒
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'pending' ? (
          <div className="flex h-full w-full">
            <PendingFeedbackList />

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <PhotoAnnotation
                  photo={currentPhoto}
                  marks={currentAnnotation.marks}
                  selectedIssueType={selectedIssueType}
                  onAddMark={handleAddMark}
                  onRemoveMark={removeMark}
                />
              </div>

              <div className="flex w-[380px] flex-shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
                <IssueSidebar
                  selectedType={selectedIssueType}
                  onSelectType={setSelectedIssueType}
                  disabled={!currentPhoto}
                />
                <FeedbackForm
                  photo={currentPhoto}
                  marks={currentAnnotation.marks}
                  onUpdateMarkDescription={handleUpdateMarkDescription}
                  onRemoveMark={removeMark}
                  onCancel={handleCancel}
                  onSubmitSuccess={handleSubmitSuccess}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'tracker' ? (
          <div className="h-full overflow-hidden">
            <FeedbackStatusTracker />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <NurseReminderView
              onViewTracker={handleViewTracker}
              onViewCase={handleViewCase}
            />
          </div>
        )}
      </main>

      {showSuccessModal && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="modal-content mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 px-6 pb-8 pt-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold">反馈提交成功！</h2>
            </div>
            <div className="-mt-4 px-6 pb-6">
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <p className="text-center text-sm text-slate-600">
                  已向{' '}
                  <span className="font-semibold text-slate-800">
                    {submittedAssignee}
                  </span>{' '}
                  发送{' '}
                  <span className="font-semibold text-blue-600">
                    {submittedFeedbackIds.length}
                  </span>{' '}
                  条整改提醒
                </p>
              </div>
              <div className="mt-5 space-y-3">
                <button
                  ref={primaryButtonRef}
                  onClick={handleContinueNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  继续标注下一张
                </button>
                <button
                  onClick={handleGoToTracker}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <ListChecks className="h-4 w-4" />
                  前往整改追踪查看
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
