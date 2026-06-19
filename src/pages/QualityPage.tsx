import { useState, useEffect } from 'react';
import { ImageIcon, ClipboardList, ShieldCheck, BellRing } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
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
  } = useQualityStore();

  const [activeTab, setActiveTab] = useState<PageTab>('pending');
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
            <NurseReminderView />
          </div>
        )}
      </main>
    </div>
  );
}
