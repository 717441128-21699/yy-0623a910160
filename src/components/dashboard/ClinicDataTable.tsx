import React from 'react';
import { Eye } from 'lucide-react';
import useDashboardStore from '../../store/useDashboardStore';
import { formatMissingAngles } from '../../utils/format';

const getCompletionRateColor = (rate: number): string => {
  if (rate >= 95) return 'text-secondary-600';
  if (rate >= 85) return 'text-warning-600';
  return 'text-danger-600';
};

const ClinicDataTable: React.FC = () => {
  const { dailyData, selectClinic } = useDashboardStore();

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                门店名称
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">
                复诊人数
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">
                已拍照 / 完成率
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                缺失角度详情
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">
                重拍数 / 重拍率
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {dailyData.map((row, idx) => {
              const totalMissing = row.missingAngles.reduce((s, m) => s + m.count, 0);
              return (
                <tr
                  key={row.clinicId}
                  className={`border-t border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''} hover:bg-primary-50/30 transition-colors`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                    {row.clinicName}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-mono text-slate-700 whitespace-nowrap">
                    {row.totalPatients}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-700">
                      {row.photographedCount}
                    </span>
                    <span className="mx-1.5 text-slate-300">/</span>
                    <span className={`text-sm font-semibold font-mono ${getCompletionRateColor(row.completionRate)}`}>
                      {row.completionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-[200px]">
                      {totalMissing > 0 ? (
                        formatMissingAngles(row.missingAngles)
                      ) : (
                        <span className="text-sm text-slate-400">无缺失</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-mono text-slate-700">
                      {row.retakeCount}
                    </span>
                    <span className="mx-1.5 text-slate-300">/</span>
                    <span className="text-sm font-semibold font-mono text-danger-600">
                      {row.retakeRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => selectClinic(row.clinicId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                  </td>
                </tr>
              );
            })}
            {dailyData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClinicDataTable;
