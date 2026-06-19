import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '@/store/useCaseStore';
import { useQualityStore } from '@/store/useQualityStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import CaseFilterBar from '@/components/cases/CaseFilterBar';
import CaseCard from '@/components/cases/CaseCard';
import CaseDetailDrawer from '@/components/cases/CaseDetailDrawer';
import {
  ChevronLeft,
  ChevronRight,
  FolderSearch2,
  ClipboardList,
  Building,
  Stethoscope,
  UserRound,
  AlertTriangle,
  Activity,
  Calendar,
  X,
  Link2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockClinics } from '@/mock/clinics';
import { doctorNames, nurseNames, PHOTO_ANGLE_LABELS, STAGE_LABELS } from '@/mock/cases';
import type { CaseFilter } from '@/types';

const PAGE_SIZE = 12;

export default function CasesPage() {
  const navigate = useNavigate();
  const {
    loadCases,
    filteredCases,
    cases,
    filter,
    setFilter,
    applyFilter,
    resetFilter,
    reviewSource,
    clearReviewSource,
  } = useCaseStore();
  const { loadInitialData } = useQualityStore();
  const { selectClinic: selectDashboardClinic } = useDashboardStore();

  useEffect(() => {
    if (cases.length === 0) {
      loadCases();
    }
  }, [cases.length, loadCases]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCases.length]);

  const pagedCases = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCases.slice(start, start + PAGE_SIZE);
  }, [filteredCases, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const hasActiveFilter = useMemo(() => {
    return (
      filter.clinicId ||
      filter.doctorId ||
      filter.nurseId ||
      filter.stage ||
      filter.missingAngle ||
      filter.dateRange
    );
  }, [filter]);

  const handleRemoveFilter = (key: keyof CaseFilter) => {
    if (key === 'dateRange') {
      setFilter({ dateRange: null });
    } else {
      setFilter({ [key]: null } as Partial<CaseFilter>);
    }
    setTimeout(applyFilter, 0);
  };

  const handleReturnToDashboard = () => {
    if (reviewSource) {
      selectDashboardClinic(reviewSource.clinicId);
    }
    navigate('/dashboard');
  };

  const getSourceDescription = () => {
    if (!reviewSource) return '';
    if (reviewSource.sourceType === 'missingAngle') {
      return `缺失角度 ${reviewSource.sourceLabel}`;
    }
    if (reviewSource.sourceDetail) {
      return `涉及${reviewSource.sourceDetail} ${reviewSource.sourceLabel}`;
    }
    return reviewSource.sourceLabel;
  };

  const filterTags = useMemo(() => {
    const tags: {
      key: keyof CaseFilter;
      label: string;
      icon: typeof Building;
      color: string;
    }[] = [];

    if (filter.clinicId) {
      const clinic = mockClinics.find((c) => c.id === filter.clinicId);
      if (clinic) {
        tags.push({
          key: 'clinicId',
          label: clinic.name,
          icon: Building,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
        });
      }
    }

    if (filter.doctorId) {
      const doctor = doctorNames.find((d) => d.id === filter.doctorId);
      if (doctor) {
        tags.push({
          key: 'doctorId',
          label: doctor.name,
          icon: Stethoscope,
          color: 'bg-violet-100 text-violet-700 border-violet-200',
        });
      }
    }

    if (filter.nurseId) {
      const nurse = nurseNames.find((n) => n.id === filter.nurseId);
      if (nurse) {
        tags.push({
          key: 'nurseId',
          label: nurse.name,
          icon: UserRound,
          color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        });
      }
    }

    if (filter.missingAngle) {
      tags.push({
        key: 'missingAngle',
        label: PHOTO_ANGLE_LABELS[filter.missingAngle],
        icon: AlertTriangle,
        color: 'bg-orange-100 text-orange-700 border-orange-200',
      });
    }

    if (filter.stage) {
      tags.push({
        key: 'stage',
        label: STAGE_LABELS[filter.stage],
        icon: Activity,
        color: 'bg-green-100 text-green-700 border-green-200',
      });
    }

    if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
      tags.push({
        key: 'dateRange',
        label: `${filter.dateRange[0]} ~ ${filter.dateRange[1]}`,
        icon: Calendar,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      });
    }

    return tags;
  }, [filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">病例抽查</h1>
              <p className="text-sm text-slate-500">浏览正畸病例，检查复诊照片质量</p>
            </div>
          </div>
        </div>

        {reviewSource && (
          <div className="mb-5 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-semibold text-primary-700">
                    来自门店复盘
                  </span>
                  <span className="text-primary-400">·</span>
                  <span className="text-sm font-medium text-slate-700">
                    {reviewSource.clinicName}
                  </span>
                  <span className="text-primary-400">·</span>
                  <span className="text-sm text-slate-600">
                    近{reviewSource.trendDays}天
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  您正在查看{' '}
                  <span className="font-medium text-slate-800">
                    {getSourceDescription()}
                  </span>{' '}
                  的病例（共{' '}
                  <span className="font-semibold text-slate-800">
                    {filteredCases.length}
                  </span>{' '}
                  例）
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleReturnToDashboard}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors duration-200 shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    返回门店详情继续复盘
                  </button>
                  <button
                    onClick={clearReviewSource}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    清除来源
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasActiveFilter && (
          <div className="mb-5 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-600 shrink-0">
              当前筛选：
            </span>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {filterTags.map((tag) => {
                const Icon = tag.icon;
                return (
                  <span
                    key={tag.key}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                      tag.color
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="max-w-[200px] truncate">{tag.label}</span>
                    <button
                      onClick={() => handleRemoveFilter(tag.key)}
                      className="ml-0.5 p-0.5 rounded hover:bg-black/5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <button
              onClick={resetFilter}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              清空筛选
            </button>
          </div>
        )}

        <div className="mb-5">
          <CaseFilterBar />
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="text-sm text-slate-600">
            共找到{' '}
            <span className="font-semibold text-slate-800">{filteredCases.length}</span>{' '}
            个病例
          </div>
          {filteredCases.length > 0 && (
            <div className="text-sm text-slate-500">
              第 {currentPage} / {totalPages} 页
            </div>
          )}
        </div>

        {filteredCases.length === 0 ? (
          <div className="card py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FolderSearch2 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                暂无匹配的病例
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                请尝试调整筛选条件，或者清空筛选后重新搜索
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
              {pagedCases.map((orthoCase) => (
                <CaseCard key={orthoCase.id} orthoCase={orthoCase} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={cn(
                      'min-w-[40px] h-10 px-3 rounded-xl text-sm font-medium transition-all duration-200',
                      currentPage === page
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CaseDetailDrawer />
    </div>
  );
}
