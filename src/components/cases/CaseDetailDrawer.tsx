import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '@/store/useCaseStore';
import { useQualityStore } from '@/store/useQualityStore';
import VisitTimeline from './VisitTimeline';
import {
  X,
  Building,
  Calendar,
  FileCheck,
  User,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { TREATMENT_STAGES } from '@/utils/constants';
import { cn } from '@/lib/utils';

export default function CaseDetailDrawer() {
  const { selectedCaseId, cases, selectCase, filter } = useCaseStore();
  const { getFeedbacksByCase, addHighlights, selectFeedback } = useQualityStore();
  const navigate = useNavigate();
  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;

  const isOpen = !!selectedCase;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectCase(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectCase]);

  const caseFeedbacks = useMemo(() => {
    if (!selectedCase) return [];
    return getFeedbacksByCase(selectedCase.id);
  }, [getFeedbacksByCase, selectedCase]);

  const totalFeedbacks = caseFeedbacks.length;
  const pendingCount = caseFeedbacks.filter((fb) => fb.status === 'pending').length;
  const verifiedCount = caseFeedbacks.filter((fb) => fb.status === 'verified').length;
  const fixedCount = caseFeedbacks.filter((fb) => fb.status === 'fixed').length;

  const handleGoToQuality = () => {
    if (caseFeedbacks.length > 0) {
      addHighlights(caseFeedbacks.map((fb) => fb.id));
      selectFeedback(caseFeedbacks[0].id);
    }
    selectCase(null);
    navigate('/quality');
  };

  if (!selectedCase) return null;

  const stageConfig = TREATMENT_STAGES.find((s) => s.key === selectedCase.currentStage);
  const avatarColor = selectedCase.patient.gender === 'male'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-pink-100 text-pink-700';

  const genderLabel = selectedCase.patient.gender === 'male' ? '男' : '女';

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={() => selectCase(null)}
      />

      <div className="fixed top-0 right-0 bottom-0 w-[864px] max-w-full bg-white z-50 shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out_forwards]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center font-semibold text-xl shrink-0',
                avatarColor
              )}
            >
              {selectedCase.patient.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800 truncate">
                  {selectedCase.patient.name}
                </h2>
                {stageConfig && (
                  <span className={cn('badge text-xs', stageConfig.color)}>
                    {selectedCase.currentStageLabel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{genderLabel} · {selectedCase.patient.age}岁</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{selectedCase.patient.caseNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span className="truncate">{selectedCase.clinicName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>开始：{selectedCase.startDate}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => selectCase(null)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {totalFeedbacks > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-primary-50/30 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary-600" />
                  <h3 className="text-sm font-semibold text-slate-700">质控总览</h3>
                </div>
                <button
                  onClick={handleGoToQuality}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  查看详情
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ClipboardCheck className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-medium">累计反馈</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800">{totalFeedbacks}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-warning-100 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-warning-600" />
                    <span className="text-[10px] text-warning-600 font-medium">待整改</span>
                  </div>
                  <p className="text-xl font-bold text-warning-600">{pendingCount}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-primary-100 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ClipboardCheck className="w-3 h-3 text-primary-600" />
                    <span className="text-[10px] text-primary-600 font-medium">已整改</span>
                  </div>
                  <p className="text-xl font-bold text-primary-600">{fixedCount}</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-secondary-100 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ShieldCheck className="w-3 h-3 text-secondary-600" />
                    <span className="text-[10px] text-secondary-600 font-medium">已验证</span>
                  </div>
                  <p className="text-xl font-bold text-secondary-600">{verifiedCount}</p>
                </div>
              </div>
            </div>
          )}

          <VisitTimeline visits={selectedCase.visits} caseId={selectedCase.id} filter={filter} />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              累计复诊 <span className="font-semibold text-slate-700">{selectedCase.totalVisits}</span> 次
              <span className="mx-2">·</span>
              最近复诊 <span className="font-semibold text-slate-700">{selectedCase.latestVisitDate}</span>
            </div>
            <button onClick={handleGoToQuality} className="btn-primary">
              <FileCheck className="w-4 h-4" />
              进入质控反馈
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
