import { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useQualityStore } from '@/store/useQualityStore';
import { mockCases } from '@/mock/cases';
import { cn } from '@/lib/utils';

export default function PendingFeedbackList() {
  const { pendingPhotos, selectedPendingIndex, setCurrentAnnotationPhoto } = useQualityStore();
  const [searchText, setSearchText] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return pendingPhotos;
    const keyword = searchText.toLowerCase();
    return pendingPhotos.filter((item) => {
      const caseItem = mockCases.find((c) => c.id === item.caseId);
      const patientName = caseItem?.patient.name?.toLowerCase() ?? '';
      const clinicName = caseItem?.clinicName?.toLowerCase() ?? '';
      const angleLabel = item.photo.angleLabel?.toLowerCase() ?? '';
      const photographer = item.photo.photographer?.toLowerCase() ?? '';
      return (
        patientName.includes(keyword) ||
        clinicName.includes(keyword) ||
        angleLabel.includes(keyword) ||
        photographer.includes(keyword)
      );
    });
  }, [pendingPhotos, searchText]);

  const handleSelect = (index: number, item: typeof pendingPhotos[number]) => {
    const realIndex = pendingPhotos.findIndex((p) => p.photo.id === item.photo.id);
    if (realIndex >= 0) {
      setCurrentAnnotationPhoto(item.photo.id);
    }
  };

  return (
    <div className="flex h-full w-[320px] flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">待质控照片</h2>
          <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
            <AlertCircle className="h-3 w-3" />
            {pendingPhotos.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索患者/门店/角度..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-slate-400">
            <Search className="h-8 w-8 text-slate-300" />
            <p>未找到匹配的照片</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const caseItem = mockCases.find((c) => c.id === item.caseId);
              const realIndex = pendingPhotos.findIndex((p) => p.photo.id === item.photo.id);
              const isSelected = realIndex === selectedPendingIndex;

              return (
                <li
                  key={item.photo.id}
                  onClick={() => handleSelect(realIndex, item)}
                  className={cn(
                    'relative flex cursor-pointer gap-3 px-4 py-3 transition-colors',
                    isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-blue-500" />
                  )}
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={item.photo.thumbUrl}
                      alt={item.photo.angleLabel}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {caseItem?.patient.name ?? '未知患者'}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {item.photo.angleLabel}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="truncate">{item.photo.photographer}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {caseItem?.clinicName ?? ''}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
