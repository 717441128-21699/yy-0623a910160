import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FollowUpVisit, QualityFeedback, Photo, CaseFilter } from '@/types';
import PhotoGrid from './PhotoGrid';
import { PHOTO_ANGLE_LABELS } from '@/mock/cases';
import { useQualityStore } from '@/store/useQualityStore';
import { TREATMENT_STAGES } from '@/utils/constants';
import {
  Stethoscope,
  UserRound,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ClipboardCheck,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitHitInfo {
  type: 'missingAngle' | 'doctor' | 'nurse';
  label: string;
}

interface VisitTimelineProps {
  visits: FollowUpVisit[];
  caseId: string;
  filter: CaseFilter;
}

const STAGE_DOT_COLORS: Record<string, string> = {
  initial: 'bg-slate-500',
  alignment: 'bg-blue-500',
  spaceClosing: 'bg-green-500',
  finishing: 'bg-amber-500',
  retention: 'bg-emerald-500',
};

const ISSUE_TYPE_COLORS: Record<string, string> = {
  blur: 'bg-purple-500',
  hookPosition: 'bg-orange-500',
  biteIncorrect: 'bg-red-500',
  incomplete: 'bg-pink-500',
  lighting: 'bg-yellow-500',
  other: 'bg-slate-500',
};

const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  fixed: 'bg-primary-100 text-primary-700',
  verified: 'bg-secondary-100 text-secondary-700',
  rejected: 'bg-danger-100 text-danger-700',
};

const ISSUE_TYPE_COLORS_DETAIL: Record<string, string> = {
  blur: 'bg-purple-500',
  hookPosition: 'bg-orange-500',
  biteIncorrect: 'bg-red-500',
  incomplete: 'bg-pink-500',
  lighting: 'bg-yellow-500',
  other: 'bg-slate-500',
};

const STATUS_COLORS_DETAIL: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  fixed: 'bg-primary-100 text-primary-700',
  verified: 'bg-secondary-100 text-secondary-700',
  rejected: 'bg-danger-100 text-danger-700',
};

export default function VisitTimeline({ visits, caseId, filter }: VisitTimelineProps) {
  const { feedbacks, addHighlights, selectFeedback } = useQualityStore();
  const navigate = useNavigate();
  const sortedVisits = useMemo(() => [...visits].reverse(), [visits]);
  const [expandedId, setExpandedId] = useState<string | null>(
    sortedVisits.length > 0 ? sortedVisits[0].id : null
  );
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photo: Photo;
    visitId: string;
  } | null>(null);
  const feedbackSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getVisitHitInfo = (visit: FollowUpVisit): VisitHitInfo[] => {
    const hits: VisitHitInfo[] = [];

    if (filter.missingAngle && visit.missingAngles.includes(filter.missingAngle)) {
      hits.push({ type: 'missingAngle', label: PHOTO_ANGLE_LABELS[filter.missingAngle] });
    }

    if (filter.doctorId && visit.doctorId === filter.doctorId) {
      hits.push({ type: 'doctor', label: visit.doctorName });
    }

    if (filter.nurseId && visit.nurseId === filter.nurseId) {
      hits.push({ type: 'nurse', label: visit.nurseName });
    }

    return hits;
  };

  const hasActiveFilter = !!(filter.missingAngle || filter.doctorId || filter.nurseId);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleJumpToFeedback = (visitId: string) => {
    if (expandedId !== visitId) {
      setExpandedId(visitId);
    }
    setTimeout(() => {
      const ref = feedbackSectionRefs.current[visitId];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const getVisitFeedbacks = (visitId: string): QualityFeedback[] => {
    return feedbacks.filter(
      (fb) => fb.caseId === caseId && fb.visitId === visitId
    );
  };

  const getPhotoFeedbacks = (visitId: string, photoId: string): QualityFeedback[] => {
    return feedbacks.filter(
      (fb) => fb.caseId === caseId && fb.visitId === visitId && fb.photoId === photoId
    );
  };

  const getFeedbackStats = (visitId: string) => {
    const visitFeedbacks = getVisitFeedbacks(visitId);
    return {
      total: visitFeedbacks.length,
      pending: visitFeedbacks.filter((fb) => fb.status === 'pending').length,
      fixed: visitFeedbacks.filter((fb) => fb.status === 'fixed').length,
      verified: visitFeedbacks.filter((fb) => fb.status === 'verified').length,
    };
  };

  const handleFeedbackClick = (photo: Photo, visitId: string) => {
    setSelectedPhoto({ photo, visitId });
  };

  const closePhotoModal = () => setSelectedPhoto(null);

  const handleViewFullQuality = (photoFeedbacks: QualityFeedback[]) => {
    if (photoFeedbacks.length > 0) {
      addHighlights(photoFeedbacks.map((fb) => fb.id));
      selectFeedback(photoFeedbacks[0].id);
    }
    navigate('/quality');
  };

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-5">
        {sortedVisits.map((visit, index) => {
          const isExpanded = expandedId === visit.id;
          const stageConfig = TREATMENT_STAGES.find((s) => s.key === visit.stage);
          const isLatest = index === 0;
          const hasMissingAngles = visit.missingAngles.length > 0;
          const stats = getFeedbackStats(visit.id);
          const visitFeedbacks = getVisitFeedbacks(visit.id);
          const hitInfos = hasActiveFilter ? getVisitHitInfo(visit) : [];
          const isHit = hitInfos.length > 0;
          const hasFeedbacks = stats.total > 0;

          return (
            <div key={visit.id} className="relative pl-12">
              <div
                className={cn(
                  'absolute left-0 top-5 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md transition-all duration-300',
                  STAGE_DOT_COLORS[visit.stage] || 'bg-slate-500',
                  isHit && 'ring-4 ring-amber-400 ring-offset-2'
                )}
              >
                <span className="w-3 h-3 rounded-full bg-white/90" />
              </div>

              <div
                onClick={() => toggleExpand(visit.id)}
                className={cn(
                  'rounded-2xl border shadow-card cursor-pointer transition-all duration-300 overflow-hidden',
                  isHit
                    ? 'bg-amber-50/40 border-l-4 border-l-amber-400 border-t border-r border-b border-slate-200'
                    : 'bg-white border-slate-100',
                  isExpanded ? 'shadow-elevated' : 'hover:shadow-elevated'
                )}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-800">
                          {visit.visitDate}
                        </span>
                        {isLatest && (
                          <span className="badge bg-primary-100 text-primary-700 text-[11px]">
                            最新
                          </span>
                        )}
                      </div>
                      {stageConfig && (
                        <span className={cn('badge text-[11px]', stageConfig.color)}>
                          {visit.stageLabel}
                        </span>
                      )}
                      {isHit && hitInfos.map((hit, idx) => (
                        <div key={`${hit.type}-${idx}`} className="flex items-center gap-1">
                          {hit.type === 'missingAngle' && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              漏拍：{hit.label}
                            </div>
                          )}
                          {hit.type === 'doctor' && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[11px] font-medium">
                              <Stethoscope className="w-3 h-3" />
                              医生：{hit.label}
                            </div>
                          )}
                          {hit.type === 'nurse' && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[11px] font-medium">
                              <UserRound className="w-3 h-3" />
                              护士：{hit.label}
                            </div>
                          )}
                        </div>
                      ))}
                      {isHit && hasFeedbacks && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToFeedback(visit.id);
                          }}
                          className="flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-full text-[11px] font-medium transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" />
                          质控已介入
                        </button>
                      )}
                      {stats.total > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-warning-100 text-warning-700 rounded-full text-[11px] font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            {stats.pending}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[11px] font-medium">
                            <ClipboardCheck className="w-3 h-3" />
                            {stats.fixed}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-secondary-100 text-secondary-700 rounded-full text-[11px] font-medium">
                            <ClipboardCheck className="w-3 h-3" />
                            {stats.verified}
                          </div>
                        </div>
                      )}
                    </div>
                    <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-slate-400" />
                      <span>{visit.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserRound className="w-4 h-4 text-slate-400" />
                      <span>{visit.nurseName}</span>
                    </div>
                  </div>

                  {hasMissingAngles && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        缺失拍摄角度：
                        {visit.missingAngles.map((angle, i) => (
                          <span key={angle}>
                            {i > 0 && '、'}
                            {PHOTO_ANGLE_LABELS[angle]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-5 animate-fadeIn">
                    <div
                      ref={(el) => {
                        feedbackSectionRefs.current[visit.id] = el;
                      }}
                      className="mb-5 scroll-mt-24"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardCheck className="w-4 h-4 text-primary-600" />
                        <h4 className="text-sm font-semibold text-slate-700">
                          质控点评
                        </h4>
                      </div>
                      {visitFeedbacks.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-500">
                          暂无质控反馈
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visitFeedbacks.map((fb) => {
                            const photo = visit.photos.find((p) => p.id === fb.photoId);
                            return (
                              <div
                                key={fb.id}
                                className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => photo && handleFeedbackClick(photo, visit.id)}
                              >
                                {photo ? (
                                  <img
                                    src={photo.thumbUrl}
                                    alt={photo.angleLabel}
                                    className="w-16 h-12 rounded-lg object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-16 h-12 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center">
                                    <ClipboardCheck className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                      <span className="text-xs font-medium text-slate-500 shrink-0">
                                        {photo?.angleLabel || '未知角度'}
                                      </span>
                                      <span
                                        className={cn(
                                          'badge text-[10px] text-white',
                                          ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                                        )}
                                      >
                                        {fb.issueMark.typeLabel}
                                      </span>
                                    </div>
                                    <span
                                      className={cn(
                                        'badge text-[10px] shrink-0',
                                        FEEDBACK_STATUS_COLORS[fb.status]
                                      )}
                                    >
                                      {fb.statusLabel}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                    {fb.suggestion}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        复诊照片
                      </h4>
                      <PhotoGrid
                        photos={visit.photos}
                        missingAngles={visit.missingAngles}
                        visitId={visit.id}
                        caseId={caseId}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        医生备注
                      </h4>
                      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed">
                        {visit.doctorNotes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn"
          onClick={closePhotoModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  质控反馈详情
                </h3>
                <span className="badge bg-slate-100 text-slate-700">
                  {selectedPhoto.photo.angleLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewFullQuality(getPhotoFeedbacks(selectedPhoto.visitId, selectedPhoto.photo.id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看完整质控
                </button>
                <button
                  onClick={closePhotoModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    照片预览
                  </h4>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={selectedPhoto.photo.url}
                      alt={selectedPhoto.photo.angleLabel}
                      className="w-full h-full object-cover"
                    />
                    {getPhotoFeedbacks(selectedPhoto.visitId, selectedPhoto.photo.id).map((fb, idx) => (
                      <div
                        key={fb.id}
                        className={cn(
                          'absolute border-2 border-white/80 rounded-md shadow-lg',
                          ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'bg-slate-500'
                        )}
                        style={{
                          left: `${fb.issueMark.rect.x * 100}%`,
                          top: `${fb.issueMark.rect.y * 100}%`,
                          width: `${fb.issueMark.rect.w * 100}%`,
                          height: `${fb.issueMark.rect.h * 100}%`,
                          backgroundColor: 'transparent',
                        }}
                      >
                        <div
                          className={cn(
                            'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md',
                            ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'bg-slate-500'
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={cn(
                            'absolute inset-0 rounded-md',
                            ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'bg-slate-500'
                          )}
                          style={{ opacity: 0.15 }}
                        />
                        <div
                          className={cn(
                            'absolute inset-0 border-2 rounded-md',
                            ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'border-slate-500'
                          )}
                          style={{ borderColor: 'inherit' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    质控反馈 ({getPhotoFeedbacks(selectedPhoto.visitId, selectedPhoto.photo.id).length})
                  </h4>
                  <div className="space-y-4">
                    {getPhotoFeedbacks(selectedPhoto.visitId, selectedPhoto.photo.id).length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl text-center text-sm text-slate-500">
                        暂无质控反馈
                      </div>
                    ) : (
                      getPhotoFeedbacks(selectedPhoto.visitId, selectedPhoto.photo.id).map((fb, idx) => (
                        <div
                          key={fb.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                                  ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'bg-slate-500'
                                )}
                              >
                                {idx + 1}
                              </div>
                              <span className={cn(
                                'badge text-white',
                                ISSUE_TYPE_COLORS_DETAIL[fb.issueMark.type] || 'bg-slate-500'
                              )}>
                                {fb.issueMark.typeLabel}
                              </span>
                            </div>
                            <span className={cn('badge text-[11px]', STATUS_COLORS_DETAIL[fb.status])}>
                              {fb.statusLabel}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">问题描述</p>
                              <p className="text-sm text-slate-700">{fb.issueMark.description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">整改建议</p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {fb.suggestion}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                              <span>指派给：{fb.assignee}</span>
                              <span>
                                {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
