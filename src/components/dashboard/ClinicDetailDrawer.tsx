import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Building,
  MapPin,
  User,
  Phone,
  Users,
  Camera,
  AlertTriangle,
  RefreshCw,
  FileSearch,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useDashboardStore from '@/store/useDashboardStore';
import useCaseStore from '@/store/useCaseStore';
import { mockClinics } from '@/mock/clinics';
import { doctorNames, nurseNames, PHOTO_ANGLE_LABELS } from '@/mock/cases';
import { cn } from '@/lib/utils';
import type { PhotoAngle, ClinicInvolvedPerson } from '@/types';

const ANGLE_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#346199',
  '#8b5cf6',
  '#10b981',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

const TIME_RANGES = [
  { days: 7, label: '近7天' },
  { days: 14, label: '近14天' },
  { days: 30, label: '近30天' },
];

export default function ClinicDetailDrawer() {
  const navigate = useNavigate();
  const { selectedClinicId, clinicDetailData, dailyData, selectClinic, trendDays, setTrendDays } = useDashboardStore();
  const { setFilter: setCaseFilter, applyFilter: applyCaseFilter, setReviewSource } = useCaseStore();
  const selectedClinic = mockClinics.find((c) => c.id === selectedClinicId) || null;
  const clinicDailyData = dailyData.find((d) => d.clinicId === selectedClinicId) || null;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isOpen = !!selectedClinic;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectClinic(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectClinic]);

  if (!selectedClinic || !clinicDetailData || !clinicDailyData) return null;

  const totalMissingAngles = clinicDailyData.missingAngles.reduce((s, m) => s + m.count, 0);

  const maxAngleCount = Math.max(...clinicDetailData.missingAngleRanking.map((m) => m.count), 1);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getRoleBadgeClass = (role: 'doctor' | 'nurse') => {
    return role === 'doctor'
      ? 'bg-primary-100 text-primary-700'
      : 'bg-secondary-100 text-secondary-700';
  };

  const getRoleLabel = (role: 'doctor' | 'nurse') => {
    return role === 'doctor' ? '医生' : '护士';
  };

  const getAvatarColor = (name: string, role: 'doctor' | 'nurse') => {
    if (role === 'doctor') {
      const colors = [
        'bg-blue-100 text-blue-700',
        'bg-indigo-100 text-indigo-700',
        'bg-sky-100 text-sky-700',
      ];
      return colors[name.charCodeAt(0) % colors.length];
    }
    const colors = [
      'bg-green-100 text-green-700',
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const handleTimeRangeChange = (days: number) => {
    if (days === trendDays) return;
    setIsTransitioning(true);
    setTrendDays(days);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleAngleClick = (angle: PhotoAngle) => {
    if (!selectedClinicId) return;
    setCaseFilter({
      clinicId: selectedClinicId,
      missingAngle: angle,
      doctorId: null,
      nurseId: null,
      stage: null,
      dateRange: null,
    });
    setReviewSource({
      type: 'clinic',
      clinicId: selectedClinicId,
      clinicName: selectedClinic?.name || '',
      sourceType: 'missingAngle',
      sourceLabel: PHOTO_ANGLE_LABELS[angle],
      trendDays,
    });
    setTimeout(applyCaseFilter, 0);
    selectClinic(null);
    navigate('/cases');
  };

  const handlePersonClick = (person: ClinicInvolvedPerson) => {
    if (!selectedClinicId) return;
    const personList = person.role === 'doctor' ? doctorNames : nurseNames;
    const foundPerson = personList.find((p) => p.name === person.name);

    setCaseFilter({
      clinicId: selectedClinicId,
      missingAngle: null,
      doctorId: person.role === 'doctor' && foundPerson ? foundPerson.id : null,
      nurseId: person.role === 'nurse' && foundPerson ? foundPerson.id : null,
      stage: null,
      dateRange: null,
    });
    setReviewSource({
      type: 'clinic',
      clinicId: selectedClinicId,
      clinicName: selectedClinic?.name || '',
      sourceType: 'involvedPerson',
      sourceLabel: person.name,
      sourceDetail: person.role === 'doctor' ? '医生' : '护士',
      trendDays,
    });
    setTimeout(applyCaseFilter, 0);
    selectClinic(null);
    navigate('/cases');
  };

  const handleCheckCases = () => {
    if (!selectedClinicId) return;
    setCaseFilter({
      clinicId: selectedClinicId,
      missingAngle: null,
      doctorId: null,
      nurseId: null,
      stage: null,
      dateRange: null,
    });
    setTimeout(applyCaseFilter, 0);
    selectClinic(null);
    navigate('/cases');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={() => selectClinic(null)}
      />

      <div className="fixed top-0 right-0 bottom-0 w-[864px] max-w-full bg-white z-50 shadow-2xl flex flex-col animate-[slideInRight_0.3s_ease-out_forwards]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <Building className="w-7 h-7 text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-800 truncate">
                {selectedClinic.name}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedClinic.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>负责人：{selectedClinic.manager}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedClinic.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => selectClinic(null)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
              {TIME_RANGES.map((range) => {
                const isActive = trendDays === range.days;
                return (
                  <button
                    key={range.days}
                    onClick={() => handleTimeRangeChange(range.days)}
                    className={cn(
                      'px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    )}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              'transition-opacity duration-300',
              isTransitioning ? 'opacity-0' : 'opacity-100'
            )}
          >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative bg-white rounded-xl shadow-card border border-slate-100 p-4 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
              <div className="flex items-start gap-3 pl-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-primary-500/10">
                  <Users className="w-5 h-5 text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">复诊人数</p>
                  <p className="text-xl font-semibold text-slate-800 font-mono">
                    {clinicDailyData.totalPatients}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-xl shadow-card border border-slate-100 p-4 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-500" />
              <div className="flex items-start gap-3 pl-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-secondary-500/10">
                  <Camera className="w-5 h-5 text-secondary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">拍照完成率</p>
                  <p className="text-xl font-semibold text-slate-800 font-mono">
                    {clinicDailyData.completionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-xl shadow-card border border-slate-100 p-4 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning-500" />
              <div className="flex items-start gap-3 pl-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-warning-500/10">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">缺失角度总数</p>
                  <p className="text-xl font-semibold text-slate-800 font-mono">
                    {totalMissingAngles}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-xl shadow-card border border-slate-100 p-4 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger-500" />
              <div className="flex items-start gap-3 pl-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-danger-500/10">
                  <RefreshCw className="w-5 h-5 text-danger-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-500 mb-1">重拍率</p>
                  <p className="text-xl font-semibold text-slate-800 font-mono">
                    {clinicDailyData.retakeRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-800">最常漏拍角度 TOP5</h3>
              <p className="text-sm text-slate-500 mt-1">按缺失次数从高到低排列</p>
            </div>
            <div className="space-y-3">
              {clinicDetailData.missingAngleRanking.slice(0, 5).map((item, idx) => {
                const percentage = (item.count / maxAngleCount) * 100;
                const color = ANGLE_COLORS[idx % ANGLE_COLORS.length];
                return (
                  <div
                    key={item.angle}
                    onClick={() => handleAngleClick(item.angle)}
                    className="space-y-2 p-3 -mx-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: color }}
                        >
                          TOP{idx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold font-mono text-slate-800">
                        {item.count} 次
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-800">涉及人员分析</h3>
              <p className="text-sm text-slate-500 mt-1">缺失照片较多的医生和护士</p>
            </div>
            <div className="space-y-2">
              {clinicDetailData.involvedPeople.map((person, idx) => (
                <div
                  key={`${person.name}-${idx}`}
                  onClick={() => handlePersonClick(person)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors duration-200"
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-full flex items-center justify-center font-semibold shrink-0',
                      getAvatarColor(person.name, person.role)
                    )}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{person.name}</span>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          getRoleBadgeClass(person.role)
                        )}
                      >
                        {getRoleLabel(person.role)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {person.role === 'doctor' ? '主治医生' : '拍照护士'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full bg-danger-100 text-danger-700 text-sm font-semibold">
                      {person.missingCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-slate-800">近{clinicDetailData.trendDays}天重拍趋势</h3>
              <p className="text-sm text-slate-500 mt-1">每日重拍率与重拍数量变化</p>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={clinicDetailData.trendData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval={1}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
                    labelFormatter={(label) => formatDate(label as string)}
                    formatter={(value: number, name: string) => {
                      if (name === 'retakeRate') {
                        return [`${value.toFixed(1)}%`, '重拍率'];
                      }
                      return [value, '重拍数'];
                    }}
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'retakeRate' ? '重拍率(%)' : '重拍数(次)'
                    }
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '12px' }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="retakeCount"
                    name="retakeCount"
                    fill="#346199"
                    opacity={0.7}
                    radius={[4, 4, 0, 0]}
                    barSize={16}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="retakeRate"
                    name="retakeRate"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 3.5 }}
                    activeDot={{ r: 5.5, stroke: '#ef4444', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={handleCheckCases}
              className="btn-primary"
            >
              <FileSearch className="w-4 h-4" />
              抽查该门店病例
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
