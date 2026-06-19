import { useState } from 'react';
import type { FollowUpVisit } from '@/types';
import PhotoGrid from './PhotoGrid';
import { PHOTO_ANGLE_LABELS } from '@/mock/cases';
import { TREATMENT_STAGES } from '@/utils/constants';
import { Stethoscope, UserRound, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitTimelineProps {
  visits: FollowUpVisit[];
}

const STAGE_DOT_COLORS: Record<string, string> = {
  initial: 'bg-slate-500',
  alignment: 'bg-blue-500',
  spaceClosing: 'bg-green-500',
  finishing: 'bg-amber-500',
  retention: 'bg-emerald-500',
};

export default function VisitTimeline({ visits }: VisitTimelineProps) {
  const sortedVisits = [...visits].reverse();
  const [expandedId, setExpandedId] = useState<string | null>(
    sortedVisits.length > 0 ? sortedVisits[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        复诊照片
                      </h4>
                      <PhotoGrid
                        photos={visit.photos}
                        missingAngles={visit.missingAngles}
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
