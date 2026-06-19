import type { OrthoCase } from '@/types';
import { useCaseStore } from '@/store/useCaseStore';
import { Building, Stethoscope, UserRound, ArrowRight, CalendarDays } from 'lucide-react';
import { TREATMENT_STAGES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface CaseCardProps {
  orthoCase: OrthoCase;
}

export default function CaseCard({ orthoCase }: CaseCardProps) {
  const { selectedCaseId, selectCase } = useCaseStore();
  const isSelected = selectedCaseId === orthoCase.id;

  const stageConfig = TREATMENT_STAGES.find((s) => s.key === orthoCase.currentStage);

  const handleClick = () => {
    selectCase(isSelected ? null : orthoCase.id);
  };

  const avatarColor = orthoCase.patient.gender === 'male'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-pink-100 text-pink-700';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'card cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1',
        isSelected && 'ring-2 ring-primary shadow-elevated -translate-y-1'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center font-semibold text-base shrink-0',
              avatarColor
            )}
          >
            {orthoCase.patient.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{orthoCase.patient.name}</h3>
              {stageConfig && (
                <span className={cn('badge text-[11px] shrink-0', stageConfig.color)}>
                  {orthoCase.currentStageLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{orthoCase.patient.caseNumber}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{orthoCase.clinicName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Stethoscope className="w-4 h-4 text-slate-400 shrink-0" />
          <span>主治医生：{orthoCase.doctorName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <UserRound className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            负责护士：{orthoCase.visits[orthoCase.visits.length - 1]?.nurseName || '-'}
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-100 -mx-6 mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{orthoCase.totalVisits}次</span>
          </div>
          <span>最近：{orthoCase.latestVisitDate}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            selectCase(orthoCase.id);
          }}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
        >
          查看详情
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
