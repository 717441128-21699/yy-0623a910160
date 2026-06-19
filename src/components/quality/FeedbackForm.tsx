import { useState, useMemo } from 'react';
import { Trash2, Send, X, UserCheck } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { mockCases, nurseNames } from '@/mock/cases';
import type { Photo, IssueMark, IssueType } from '@/types';
import { ISSUE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface FeedbackFormProps {
  photo: Photo | null;
  marks: IssueMark[];
  onUpdateMarkDescription: (markId: string, description: string) => void;
  onRemoveMark: (markId: string) => void;
  onCancel: () => void;
  onSubmitSuccess?: (feedbackIds: string[], assignee: string) => void;
}

const TYPE_COLOR_CLASSES: Record<IssueType, string> = {
  blur: 'bg-red-100 text-red-700 border-red-200',
  hookPosition: 'bg-orange-100 text-orange-700 border-orange-200',
  biteIncorrect: 'bg-amber-100 text-amber-700 border-amber-200',
  incomplete: 'bg-purple-100 text-purple-700 border-purple-200',
  lighting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function FeedbackForm({
  photo,
  marks,
  onUpdateMarkDescription,
  onRemoveMark,
  onCancel,
  onSubmitSuccess,
}: FeedbackFormProps) {
  const { pendingPhotos, selectedPendingIndex, submitFeedback } = useQualityStore();
  const [suggestion, setSuggestion] = useState('');
  const [assignee, setAssignee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingItem = pendingPhotos[selectedPendingIndex];

  const caseItem = useMemo(() => {
    if (!pendingItem) return null;
    return mockCases.find((c) => c.id === pendingItem.caseId);
  }, [pendingItem]);

  const clinicNurses = useMemo(() => {
    if (!caseItem) return nurseNames;
    return nurseNames.filter((n) => n.clinicId === caseItem.clinicId);
  }, [caseItem]);

  const canSubmit = marks.length > 0 && suggestion.trim() && assignee.trim();

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newFeedbackIds = submitFeedback({
        suggestion: suggestion.trim(),
        assignee,
      });
      if (newFeedbackIds.length > 0 && onSubmitSuccess) {
        onSubmitSuccess(newFeedbackIds, assignee);
      }
      setSuggestion('');
      setAssignee('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800">整改建议</h3>
        {photo && (
          <div className="mt-3 flex gap-3 rounded-lg bg-slate-50 p-2">
            <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
              <img
                src={photo.thumbUrl}
                alt={photo.angleLabel}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-700">
                {caseItem?.patient.name ?? '未知患者'}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{photo.angleLabel}</div>
              <div className="mt-1 text-xs text-slate-400">
                门店：{caseItem?.clinicName ?? '-'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600">
              已标记问题 ({marks.length})
            </label>
          </div>
          {marks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
              请先在照片上标注问题区域
            </div>
          ) : (
            <ul className="space-y-2">
              {marks.map((mark, index) => {
                const issueConfig = ISSUE_TYPES.find((t) => t.key === mark.type);
                const Icon = issueConfig?.icon;
                return (
                  <li
                    key={mark.id}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white',
                            mark.type === 'blur' && 'bg-red-500',
                            mark.type === 'hookPosition' && 'bg-orange-500',
                            mark.type === 'biteIncorrect' && 'bg-amber-500',
                            mark.type === 'incomplete' && 'bg-purple-500',
                            mark.type === 'lighting' && 'bg-yellow-500',
                            mark.type === 'other' && 'bg-slate-500'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                            TYPE_COLOR_CLASSES[mark.type]
                          )}
                        >
                          {Icon && <Icon className="h-3 w-3" />}
                          {issueConfig?.label ?? mark.typeLabel}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveMark(mark.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="问题描述（可选）"
                      value={mark.description}
                      onChange={(e) => onUpdateMarkDescription(mark.id, e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-medium text-slate-600">
            整改建议 <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="请输入具体的整改建议和要求..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-600">
            指派护士 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">请选择护士</option>
              {clinicNurses.length > 0 ? (
                clinicNurses.map((nurse) => (
                  <option key={nurse.id} value={nurse.name}>
                    {nurse.name}
                  </option>
                ))
              ) : (
                nurseNames.map((nurse) => (
                  <option key={nurse.id} value={nurse.name}>
                    {nurse.name}
                  </option>
                ))
              )}
            </select>
          </div>
          {caseItem && (
            <p className="mt-1 text-[11px] text-slate-400">
              当前门店：{caseItem.clinicName}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-200 p-4">
        <button
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium text-white transition-all',
            canSubmit && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              : 'cursor-not-allowed bg-slate-300'
          )}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? '提交中...' : '提交反馈'}
        </button>
      </div>
    </div>
  );
}
