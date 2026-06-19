import type { IssueType } from '@/types';
import { ISSUE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface IssueSidebarProps {
  selectedType: IssueType | null;
  onSelectType: (type: IssueType) => void;
  disabled?: boolean;
}

const TYPE_DESCRIPTIONS: Record<IssueType, string> = {
  blur: '照片模糊、焦点不准',
  hookPosition: '拉钩位置不当、暴露不充分',
  biteIncorrect: '咬合关系不正确、未咬紧',
  incomplete: '拍摄范围不完整、缺牙位',
  lighting: '光线过暗/过强、反光严重',
  other: '其他质量问题',
};

export default function IssueSidebar({
  selectedType,
  onSelectType,
  disabled = false,
}: IssueSidebarProps) {
  return (
    <div className="border-b border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">问题类型</h3>
      <div className="space-y-2">
        {ISSUE_TYPES.map((issue) => {
          const Icon = issue.icon;
          const isSelected = selectedType === issue.key;
          return (
            <button
              key={issue.key}
              onClick={() => !disabled && onSelectType(issue.key)}
              disabled={disabled}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all',
                isSelected
                  ? 'border-blue-400 bg-blue-50 shadow-sm ring-2 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border',
                  issue.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-blue-700' : 'text-slate-700'
                  )}
                >
                  {issue.label}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                  {TYPE_DESCRIPTIONS[issue.key]}
                </div>
              </div>
              {isSelected && (
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
