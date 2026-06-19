import { useState, useMemo } from 'react';
import { CheckCircle, ChevronRight, AlertTriangle, Store, UserCircle2 } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { mockClinics } from '@/mock/clinics';
import { mockCases, nurseNames } from '@/mock/cases';
import { cn } from '@/lib/utils';
import { ISSUE_TYPES } from '@/utils/constants';
import type { QualityFeedback } from '@/types';
import FeedbackDetailDrawer from './FeedbackDetailDrawer';

interface NurseReminderViewProps {
  onViewTracker: () => void;
  onViewCase: (caseId: string) => void;
}

interface ExtendedFeedback extends QualityFeedback {
  patientName: string;
  thumbUrl: string;
  angleLabel: string;
}

interface NurseGroup {
  nurseName: string;
  clinicId: string;
  clinicName: string;
  feedbacks: ExtendedFeedback[];
  overdueCount: number;
}

const OVERDUE_DAYS = 3;

function getInitials(name: string): string {
  const match = name.match(/[\u4e00-\u9fa5a-zA-Z]/g);
  if (!match) return name.slice(0, 2);
  return match.slice(-2).join('').toUpperCase();
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isOverdue(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > OVERDUE_DAYS;
}

function getIssueTypeColor(issueType: string): string {
  const config = ISSUE_TYPES.find((t) => t.key === issueType);
  return config?.color ?? 'bg-slate-100 text-slate-700 border-slate-200';
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-fuchsia-400 to-pink-500',
    'from-cyan-400 to-sky-500',
    'from-lime-400 to-green-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function NurseReminderView({ onViewTracker, onViewCase }: NurseReminderViewProps) {
  const { feedbacks } = useQualityStore();
  const [selectedClinicId, setSelectedClinicId] = useState<string>('all');
  const [selectedNurse, setSelectedNurse] = useState<string>('all');
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);

  const extendedFeedbacks = useMemo<ExtendedFeedback[]>(() => {
    return feedbacks
      .filter((fb) => fb.status === 'pending')
      .map((fb) => {
        const caseItem = mockCases.find((c) => c.id === fb.caseId);
        const visit = caseItem?.visits.find((v) => v.id === fb.visitId);
        const photo = visit?.photos.find((p) => p.id === fb.photoId);
        return {
          ...fb,
          patientName: caseItem?.patient.name ?? '未知患者',
          thumbUrl: photo?.thumbUrl ?? '',
          angleLabel: photo?.angleLabel ?? '',
        };
      });
  }, [feedbacks]);

  const availableNurses = useMemo(() => {
    if (selectedClinicId === 'all') return nurseNames;
    return nurseNames.filter((n) => n.clinicId === selectedClinicId);
  }, [selectedClinicId]);

  const filteredFeedbacks = useMemo(() => {
    let result = extendedFeedbacks;
    if (selectedClinicId !== 'all') {
      result = result.filter((fb) => fb.assigneeClinicId === selectedClinicId);
    }
    if (selectedNurse !== 'all') {
      result = result.filter((fb) => fb.assignee === selectedNurse);
    }
    return result;
  }, [extendedFeedbacks, selectedClinicId, selectedNurse]);

  const nurseGroups = useMemo<NurseGroup[]>(() => {
    const groups = new Map<string, NurseGroup>();

    filteredFeedbacks.forEach((fb) => {
      const nurseName = fb.assignee;
      const clinicId = fb.assigneeClinicId;
      const clinic = mockClinics.find((c) => c.id === clinicId);

      if (!groups.has(nurseName)) {
        groups.set(nurseName, {
          nurseName,
          clinicId,
          clinicName: clinic?.name ?? '未知门店',
          feedbacks: [],
          overdueCount: 0,
        });
      }

      const group = groups.get(nurseName)!;
      group.feedbacks.push(fb);
      if (isOverdue(fb.createdAt)) {
        group.overdueCount++;
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
      return b.feedbacks.length - a.feedbacks.length;
    });
  }, [filteredFeedbacks]);

  const totalPending = filteredFeedbacks.length;
  const totalOverdue = filteredFeedbacks.filter((fb) => isOverdue(fb.createdAt)).length;

  const handleClinicChange = (value: string) => {
    setSelectedClinicId(value);
    setSelectedNurse('all');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      <div className="flex-shrink-0 border-b border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-600">门店</label>
            </div>
            <select
              value={selectedClinicId}
              onChange={(e) => handleClinicChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">全部门店</option>
              {mockClinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 ml-2">
              <UserCircle2 className="h-4 w-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-600">护士</label>
            </div>
            <select
              value={selectedNurse}
              onChange={(e) => setSelectedNurse(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">全部护士</option>
              {availableNurses.map((nurse) => (
                <option key={nurse.id} value={nurse.name}>
                  {nurse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                {totalPending} <span className="font-normal text-red-500">项待整改</span>
              </span>
            </div>
            {totalOverdue > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1.5">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">
                  {totalOverdue} <span className="font-normal text-orange-500">项已超期</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {nurseGroups.length === 0 ? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-slate-700">
                该筛选条件下暂无待整改事项
              </p>
              <p className="mt-1 text-sm text-slate-500">所有护士做得很棒！</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {nurseGroups.map((group) => (
              <div
                key={group.nurseName}
                className={cn(
                  'group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300',
                  'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60'
                )}
              >
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md',
                          getAvatarColor(group.nurseName)
                        )}
                      >
                        {getInitials(group.nurseName)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-800">
                          {group.nurseName}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                          <Store className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{group.clinicName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white shadow-sm">
                        {group.feedbacks.length}
                      </span>
                      {group.overdueCount > 0 && (
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-bold text-white shadow-sm">
                          {group.overdueCount}超期
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 divide-y divide-slate-100">
                  {group.feedbacks.map((fb) => {
                    const overdue = isOverdue(fb.createdAt);
                    return (
                      <div
                        key={fb.id}
                        onClick={() => setSelectedFeedbackId(fb.id)}
                        className="flex gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 group/item relative"
                      >
                        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {fb.thumbUrl && (
                            <img
                              src={fb.thumbUrl}
                              alt={fb.patientName}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800 group-hover/item:text-blue-700 transition-colors">
                                {fb.patientName}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-slate-500">
                                  {fb.angleLabel}
                                </span>
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                                    getIssueTypeColor(fb.issueMark.type)
                                  )}
                                >
                                  {fb.issueMark.typeLabel}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {overdue && (
                                <span className="flex-shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                  超期
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-blue-500 transition-all" />
                            </div>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-400">
                            上次质控：{formatDate(fb.createdAt)}
                          </p>

                          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                            <span className="text-slate-400">指出问题：</span>
                            {fb.issueMark.description || fb.suggestion}
                          </p>

                          <div
                            className={cn(
                              'mt-2 rounded-lg px-3 py-2 text-xs font-medium leading-relaxed',
                              overdue
                                ? 'bg-gradient-to-r from-red-500 to-red-500/90 text-white'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            )}
                          >
                            <span className="opacity-90">注意：</span>
                            {fb.suggestion}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                  <button
                    onClick={() => group.feedbacks.length > 0 && setSelectedFeedbackId(group.feedbacks[0].id)}
                    className="group/btn flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100/60"
                  >
                    <span>查看完整质控详情</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FeedbackDetailDrawer
        feedbackId={selectedFeedbackId}
        onClose={() => setSelectedFeedbackId(null)}
        onViewTracker={onViewTracker}
        onViewCase={onViewCase}
      />
    </div>
  );
}
