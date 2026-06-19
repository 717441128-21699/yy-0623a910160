import { useState, useMemo, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { mockCases } from '@/mock/cases';
import type { FeedbackStatus, QualityFeedback, IssueType } from '@/types';
import { FEEDBACK_STATUS, ISSUE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

type TabKey = 'all' | FeedbackStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待整改' },
  { key: 'fixed', label: '已整改' },
  { key: 'verified', label: '已验证' },
  { key: 'rejected', label: '已驳回' },
];

const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  fixed: 'bg-blue-100 text-blue-700 border-blue-200',
  verified: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const ISSUE_TYPE_BADGE: Record<IssueType, string> = {
  blur: 'bg-red-100 text-red-700 border-red-200',
  hookPosition: 'bg-orange-100 text-orange-700 border-orange-200',
  biteIncorrect: 'bg-amber-100 text-amber-700 border-amber-200',
  incomplete: 'bg-purple-100 text-purple-700 border-purple-200',
  lighting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

interface FeedbackWithMeta extends QualityFeedback {
  patientName?: string;
  clinicName?: string;
  thumbUrl?: string;
  angleLabel?: string;
}

export default function FeedbackStatusTracker() {
  const { feedbacks, updateFeedbackStatus, highlightedFeedbackIds, selectedFeedbackId } = useQualityStore();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const feedbacksWithMeta = useMemo<FeedbackWithMeta[]>(() => {
    return feedbacks.map((fb) => {
      const caseItem = mockCases.find((c) => c.id === fb.caseId);
      let thumbUrl: string | undefined;
      let angleLabel: string | undefined;

      if (caseItem) {
        for (const visit of caseItem.visits) {
          const photo = visit.photos.find((p) => p.id === fb.photoId);
          if (photo) {
            thumbUrl = photo.thumbUrl;
            angleLabel = photo.angleLabel;
            break;
          }
        }
      }

      return {
        ...fb,
        patientName: caseItem?.patient.name,
        clinicName: caseItem?.clinicName,
        thumbUrl,
        angleLabel,
      };
    });
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (activeTab === 'all') return feedbacksWithMeta;
    return feedbacksWithMeta.filter((fb) => fb.status === activeTab);
  }, [feedbacksWithMeta, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      all: feedbacksWithMeta.length,
      pending: 0,
      fixed: 0,
      verified: 0,
      rejected: 0,
    };
    feedbacksWithMeta.forEach((fb) => {
      counts[fb.status]++;
    });
    return counts;
  }, [feedbacksWithMeta]);

  useEffect(() => {
    if (highlightedFeedbackIds.length > 0 || selectedFeedbackId) {
      setActiveTab('all');
      setTimeout(() => {
        const targetId = highlightedFeedbackIds.length > 0 ? highlightedFeedbackIds[0] : selectedFeedbackId;
        if (targetId) {
          const rowElement = rowRefs.current.get(targetId);
          if (rowElement && scrollContainerRef.current) {
            rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [highlightedFeedbackIds, selectedFeedbackId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-6 pt-4">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-auto">
        {filteredFeedbacks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
            {activeTab === 'pending' ? (
              <CheckCircle2 className="h-12 w-12 text-green-300" />
            ) : activeTab === 'verified' ? (
              <CheckCircle2 className="h-12 w-12 text-green-300" />
            ) : (
              <Clock className="h-12 w-12 text-slate-300" />
            )}
            <p className="text-sm">暂无{activeTab === 'all' ? '' : FEEDBACK_STATUS.find((s) => s.key === activeTab)?.label}数据</p>
          </div>
        ) : (
          <table className="w-full min-w-full">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  患者 / 角度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  问题类型
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  整改建议
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  指派人
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredFeedbacks.map((fb) => {
                const statusConfig = FEEDBACK_STATUS.find((s) => s.key === fb.status);
                const issueConfig = ISSUE_TYPES.find((t) => t.key === fb.issueMark.type);
                const IssueIcon = issueConfig?.icon;
                const isHighlighted = highlightedFeedbackIds.includes(fb.id);
                const isSelected = selectedFeedbackId === fb.id;

                return (
                  <tr
                    key={fb.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(fb.id, el);
                    }}
                    className={cn(
                      'relative transition-colors hover:bg-slate-50/60',
                      isHighlighted && 'fade-highlight',
                      isSelected && 'bg-primary-50/60'
                    )}
                  >
                    <td
                      className={cn(
                        'whitespace-nowrap py-3',
                        (isHighlighted || isSelected) ? 'pl-3' : 'px-4'
                      )}
                      style={
                        isHighlighted
                          ? {
                              boxShadow: 'inset 4px 0 0 0 #22c55e',
                            }
                          : isSelected
                          ? {
                              boxShadow: 'inset 4px 0 0 0 #3b82f6',
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                          {fb.thumbUrl ? (
                            <img
                              src={fb.thumbUrl}
                              alt={fb.angleLabel ?? ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-300">
                              <Eye className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800">
                            {fb.patientName ?? '未知患者'}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {fb.angleLabel ?? '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
                          ISSUE_TYPE_BADGE[fb.issueMark.type]
                        )}
                      >
                        {IssueIcon && <IssueIcon className="h-3 w-3" />}
                        {issueConfig?.label ?? fb.issueMark.typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="max-w-xs text-sm text-slate-600 line-clamp-2">
                        {fb.suggestion || '-'}
                      </p>
                      {fb.issueMark.description && (
                        <p className="mt-1 max-w-xs text-xs text-slate-400 line-clamp-1">
                          备注：{fb.issueMark.description}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm text-slate-700">{fb.assignee}</div>
                      {fb.clinicName && (
                        <div className="mt-0.5 text-xs text-slate-400">{fb.clinicName}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          STATUS_BADGE_CLASSES[fb.status]
                        )}
                      >
                        {fb.status === 'pending' && <AlertTriangle className="h-3 w-3" />}
                        {fb.status === 'fixed' && <Clock className="h-3 w-3" />}
                        {fb.status === 'verified' && <CheckCircle2 className="h-3 w-3" />}
                        {fb.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        {statusConfig?.label ?? fb.statusLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatDate(fb.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {fb.status === 'pending' && (
                          <button
                            onClick={() => updateFeedbackStatus(fb.id, 'fixed')}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            标记已整改
                          </button>
                        )}
                        {fb.status === 'fixed' && (
                          <>
                            <button
                              onClick={() => updateFeedbackStatus(fb.id, 'verified')}
                              className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-100"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              验证通过
                            </button>
                            <button
                              onClick={() => updateFeedbackStatus(fb.id, 'rejected')}
                              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              驳回
                            </button>
                          </>
                        )}
                        {(fb.status === 'verified' || fb.status === 'rejected') && (
                          <span className="text-xs text-slate-400">已完成</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
