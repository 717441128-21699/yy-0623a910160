import { useState } from 'react';
import type { FollowUpVisit, QualityFeedback } from '@/types';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitTimelineProps {
  visits: FollowUpVisit[];
  caseId: string;
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

export default function VisitTimeline({ visits, caseId }: VisitTimelineProps) {
  const { feedbacks } = useQualityStore();
  const sortedVisits = [...visits].reverse();
  const [expandedId, setExpandedId] = useState<string | null>(
    sortedVisits.length > 0 ? sortedVisits[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getVisitFeedbacks = (visitId: string): QualityFeedback[] => {
    return feedbacks.filter(
      (fb) => fb.caseId === caseId && fb.visitId === visitId
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

          return (
            <div key={visit.id} className="relative pl-12">
              <div
                className={cn(
                  'absolute left-0 top-5 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-md',
                  STAGE_DOT_COLORS[visit.stage] || 'bg-slate-500'
                )}
              >
                <span className="w-3 h-3 rounded-full bg-white/90" />
              </div>

              <div
                onClick={() => toggleExpand(visit.id)}
                className={cn(
                  'bg-white rounded-2xl border border-slate-100 shadow-card cursor-pointer transition-all duration-300',
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
                    <div className="mb-5">
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
                                className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
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
    </div>
  );
}
