import { useCaseStore } from '@/store/useCaseStore';
import { doctorNames, nurseNames } from '@/mock/cases';
import { mockClinics } from '@/mock/clinics';
import { PHOTO_ANGLE_LABELS } from '@/mock/dashboardStats';
import type { TreatmentStage, PhotoAngle } from '@/types';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_TABS: { key: 'all' | TreatmentStage; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'initial', label: '初诊' },
  { key: 'alignment', label: '排齐' },
  { key: 'spaceClosing', label: '收缝' },
  { key: 'finishing', label: '精细' },
  { key: 'retention', label: '保持' },
];

export default function CaseFilterBar() {
  const { filter, setFilter, applyFilter } = useCaseStore();

  const handleStageChange = (key: 'all' | TreatmentStage) => {
    setFilter({ stage: key === 'all' ? null : key });
    setTimeout(applyFilter, 0);
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ clinicId: e.target.value || null });
    setTimeout(applyFilter, 0);
  };

  const handleMissingAngleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ missingAngle: (e.target.value as PhotoAngle) || null });
    setTimeout(applyFilter, 0);
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ doctorId: e.target.value || null });
    setTimeout(applyFilter, 0);
  };

  const handleNurseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ nurseId: e.target.value || null });
    setTimeout(applyFilter, 0);
  };

  const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    const end = filter.dateRange?.[1] || '';
    setFilter({ dateRange: start || end ? [start, end] as [string, string] : null });
  };

  const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = filter.dateRange?.[0] || '';
    const end = e.target.value;
    setFilter({ dateRange: start || end ? [start, end] as [string, string] : null });
  };

  const handleDateBlur = () => {
    if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
      setTimeout(applyFilter, 0);
    }
  };

  const handleReset = () => {
    setFilter({
      clinicId: null,
      doctorId: null,
      nurseId: null,
      stage: null,
      missingAngle: null,
      dateRange: null,
    });
    setTimeout(applyFilter, 0);
  };

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">门店</label>
          <select
            className="input-field !py-2 !text-sm min-w-[180px]"
            value={filter.clinicId || ''}
            onChange={handleClinicChange}
          >
            <option value="">全部门店</option>
            {mockClinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">医生</label>
          <select
            className="input-field !py-2 !text-sm min-w-[140px]"
            value={filter.doctorId || ''}
            onChange={handleDoctorChange}
          >
            <option value="">全部医生</option>
            {doctorNames.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">护士</label>
          <select
            className="input-field !py-2 !text-sm min-w-[140px]"
            value={filter.nurseId || ''}
            onChange={handleNurseChange}
          >
            <option value="">全部护士</option>
            {nurseNames.map((nurse) => (
              <option key={nurse.id} value={nurse.id}>
                {nurse.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">缺失角度</label>
          <select
            className="input-field !py-2 !text-sm min-w-[160px]"
            value={filter.missingAngle || ''}
            onChange={handleMissingAngleChange}
          >
            <option value="">全部角度</option>
            {Object.entries(PHOTO_ANGLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">治疗阶段</label>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            {STAGE_TABS.map((tab) => {
              const isActive = tab.key === 'all' ? filter.stage === null : filter.stage === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleStageChange(tab.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">日期范围</label>
          <input
            type="date"
            className="input-field !py-2 !text-sm min-w-[140px]"
            value={filter.dateRange?.[0] || ''}
            onChange={handleDateStartChange}
            onBlur={handleDateBlur}
          />
          <span className="text-slate-400">至</span>
          <input
            type="date"
            className="input-field !py-2 !text-sm min-w-[140px]"
            value={filter.dateRange?.[1] || ''}
            onChange={handleDateEndChange}
            onBlur={handleDateBlur}
          />
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>
    </div>
  );
}
