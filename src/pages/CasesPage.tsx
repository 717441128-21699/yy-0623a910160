import { useEffect, useMemo, useState } from 'react';
import { useCaseStore } from '@/store/useCaseStore';
import { useQualityStore } from '@/store/useQualityStore';
import CaseFilterBar from '@/components/cases/CaseFilterBar';
import CaseCard from '@/components/cases/CaseCard';
import CaseDetailDrawer from '@/components/cases/CaseDetailDrawer';
import { ChevronLeft, ChevronRight, FolderSearch2, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

export default function CasesPage() {
  const {
    loadCases,
    filteredCases,
    cases,
  } = useCaseStore();
  const { loadInitialData } = useQualityStore();

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
