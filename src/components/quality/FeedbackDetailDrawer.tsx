import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Calendar,
  FileCheck,
  User,
  UserCircle2,
  Store,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { mockCases } from '@/mock/cases';
import { mockClinics } from '@/mock/clinics';
import { ISSUE_TYPES, FEEDBACK_STATUS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import type { QualityFeedback, OrthoCase, FollowUpVisit, Photo, Clinic } from '@/types';

interface FeedbackDetailDrawerProps {
  feedbackId: string | null;
  onClose: () => void;
  onViewTracker: (feedbackId: string) => void;
  onViewCase: (caseId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  fixed: 'bg-blue-500',
  verified: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

const ISSUE_BG_COLORS: Record<string, string> = {
  blur: 'bg-red-500',
  hookPosition: 'bg-orange-500',
  biteIncorrect: 'bg-amber-500',
  incomplete: 'bg-purple-500',
  lighting: 'bg-yellow-500',
  other: 'bg-slate-500',
};

export default function FeedbackDetailDrawer({
  feedbackId,
  onClose,
  onViewTracker,
  onViewCase,
}: FeedbackDetailDrawerProps) {
  const { feedbacks, updateFeedbackStatus } = useQualityStore();
  const [hoveredIssue, setHoveredIssue] = useState<string | null>(null);

  const feedback = useMemo<QualityFeedback | null>(() => {
    if (!feedbackId) return null;
    return feedbacks.find((fb) => fb.id === feedbackId) || null;
  }, [feedbackId, feedbacks]);

  const caseData = useMemo<OrthoCase | null>(() => {
    if (!feedback) return null;
    return mockCases.find((c) => c.id === feedback.caseId) || null;
  }, [feedback]);

  const visitData = useMemo<FollowUpVisit | null>(() => {
    if (!feedback || !caseData) return null;
    return caseData.visits.find((v) => v.id === feedback.visitId) || null;
  }, [feedback, caseData]);

  const photoData = useMemo<Photo | null>(() => {
    if (!feedback || !visitData) return null;
    return visitData.photos.find((p) => p.id === feedback.photoId) || null;
  }, [feedback, visitData]);

  const clinicData = useMemo<Clinic | null>(() => {
    if (!feedback) return null;
    return mockClinics.find((c) => c.id === feedback.assigneeClinicId) || null;
  }, [feedback]);

  const photoFeedbacks = useMemo<QualityFeedback[]>(() => {
    if (!feedback) return [];
    return feedbacks.filter(
      (fb) =>
        fb.caseId === feedback.caseId &&
        fb.visitId === feedback.visitId &&
        fb.photoId === feedback.photoId
    );
  }, [feedback, feedbacks]);

  const isOpen = !!feedback;

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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!feedback || !caseData) return null;

  const statusConfig = FEEDBACK_STATUS.find((s) => s.key === feedback.status);
  const issueTypeConfig = ISSUE_TYPES.find((t) => t.key === feedback.issueMark.type);

  const genderLabel = caseData.patient.gender === 'male' ? '男' : '女';
  const avatarColor = caseData.patient.gender === 'male'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-pink-100 text-pink-700';

  const handleMarkFixed = () => {
    updateFeedbackStatus(feedback.id, 'fixed');
  };

  const handleVerify = () => {
    updateFeedbackStatus(feedback.id, 'verified');
  };

  const handleReject = () => {
    updateFeedbackStatus(feedback.id, 'rejected');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 bottom-0 w-[864px] max-w-full bg-white z-50 shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out_forwards]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">质控详情</h2>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              statusConfig?.color || 'bg-slate-100 text-slate-700'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                STATUS_COLORS[feedback.status] || 'bg-slate-500'
              )}
            />
            {feedback.statusLabel}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center font-semibold text-xl shrink-0',
                    avatarColor
                  )}
                >
                  {caseData.patient.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800">
                      {caseData.patient.name}
                    </h3>
                    <span className="text-sm text-slate-500">
                      {genderLabel} · {caseData.patient.age}岁
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{caseData.patient.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      <span className="truncate">{caseData.clinicName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      <UserCircle2 className="w-3.5 h-3.5" />
                      <span>主治：{caseData.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>负责护士：{visitData?.nurseName ?? '未知'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                {photoData && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    {photoData.angleLabel}
                  </span>
                )}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  拍摄时间：{visitData?.visitDate ?? '未知'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">照片与标注</h4>
              {photoData ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={photoData.url}
                    alt={photoData.angleLabel}
                    className="w-full h-full object-cover"
                  />
                  {photoFeedbacks.map((fb, idx) => {
                    const issueColor =
                      ISSUE_BG_COLORS[fb.issueMark.type] || 'bg-slate-500';
                    return (
                      <div
                        key={fb.id}
                        className="absolute border-2 border-white/80 rounded-md shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                        style={{
                          left: `${fb.issueMark.rect.x * 100}%`,
                          top: `${fb.issueMark.rect.y * 100}%`,
                          width: `${fb.issueMark.rect.w * 100}%`,
                          height: `${fb.issueMark.rect.h * 100}%`,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={() => setHoveredIssue(fb.id)}
                        onMouseLeave={() => setHoveredIssue(null)}
                      >
                        <div
                          className={cn(
                            'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md',
                            issueColor
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={cn('absolute inset-0 rounded-md', issueColor)}
                          style={{ opacity: 0.15 }}
                        />
                        <div
                          className="absolute inset-0 border-2 rounded-md"
                          style={{ borderColor: 'inherit' }}
                        />
                        {hoveredIssue === fb.id && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-10">
                            {fb.issueMark.typeLabel}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400">照片信息暂缺</p>
                  {feedback.issueMark.rect && (
                    <p className="text-xs text-slate-400">
                      标注区域：左上角 ({Math.round(feedback.issueMark.rect.x * 100)}%, {Math.round(feedback.issueMark.rect.y * 100)}%)
                      ，尺寸 {Math.round(feedback.issueMark.rect.w * 100)}%×{Math.round(feedback.issueMark.rect.h * 100)}%
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-700">
                  问题列表 ({photoFeedbacks.length})
                </h4>
              </div>
              <div className="space-y-3">
                {photoFeedbacks.map((fb, idx) => {
                  const issueConfig = ISSUE_TYPES.find(
                    (t) => t.key === fb.issueMark.type
                  );
                  const issueColor =
                    ISSUE_BG_COLORS[fb.issueMark.type] || 'bg-slate-500';
                  return (
                    <div
                      key={fb.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                            issueColor
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white',
                                issueColor
                              )}
                            >
                              {fb.issueMark.typeLabel}
                            </span>
                            <span
                              className={cn(
                                'text-[11px] font-medium',
                                statusConfig?.color || 'text-slate-500'
                              )}
                            >
                              {fb.statusLabel}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                            {fb.issueMark.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                'rounded-2xl p-5 border',
                feedback.status === 'pending'
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'
                  : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle
                  className={cn(
                    'w-4 h-4',
                    feedback.status === 'pending' ? 'text-amber-600' : 'text-yellow-600'
                  )}
                />
                <h4
                  className={cn(
                    'text-sm font-semibold',
                    feedback.status === 'pending' ? 'text-amber-800' : 'text-yellow-800'
                  )}
                >
                  整改建议
                </h4>
              </div>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  feedback.status === 'pending' ? 'text-amber-700' : 'text-yellow-700'
                )}
              >
                {feedback.suggestion}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">指派人</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                        avatarColor
                      )}
                    >
                      {feedback.assignee.charAt(feedback.assignee.length - 1)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {feedback.assignee}
                      </p>
                      <p className="text-xs text-slate-500">
                        {clinicData?.name || '未知门店'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm text-slate-500">创建时间</span>
                  <span className="text-sm text-slate-700">
                    {new Date(feedback.createdAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {feedback.fixedAt && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-sm text-slate-500">整改时间</span>
                    <span className="text-sm text-slate-700">
                      {new Date(feedback.fixedAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {feedback.verifiedAt && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-sm text-slate-500">验证时间</span>
                    <span className="text-sm text-slate-700">
                      {new Date(feedback.verifiedAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onViewTracker(feedback.id)}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>跳转整改追踪</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {feedback.status === 'pending' && (
                <>
                  <button
                    onClick={() => onViewCase(caseData.id)}
                    className="btn-secondary"
                  >
                    <FileCheck className="w-4 h-4" />
                    查看完整病例
                  </button>
                  <button onClick={handleMarkFixed} className="btn-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    标记已整改
                  </button>
                </>
              )}
              {feedback.status === 'fixed' && (
                <>
                  <button onClick={handleReject} className="btn-danger">
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                  <button onClick={handleVerify} className="btn-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    验证通过
                  </button>
                </>
              )}
              {(feedback.status === 'verified' || feedback.status === 'rejected') && (
                <button onClick={onClose} className="btn-primary">
                  <RotateCcw className="w-4 h-4" />
                  返回
                </button>
              )}
            </div>
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
