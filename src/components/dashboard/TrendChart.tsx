import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useDashboardStore from '../../store/useDashboardStore';
import { generateTrendData } from '../../mock/dashboardStats';
import type { TrendDataPoint } from '../../types';

const TrendChart: React.FC = () => {
  const [days, setDays] = useState<7 | 30>(7);
  const { trendData, loadDashboardData } = useDashboardStore();
  const [displayData, setDisplayData] = useState<TrendDataPoint[]>(trendData);

  useEffect(() => {
    const newData = generateTrendData(days);
    setDisplayData(newData);
  }, [days]);

  useEffect(() => {
    if (trendData.length > 0 && days === 7) {
      setDisplayData(trendData);
    }
  }, [trendData, days]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">质量趋势</h3>
          <p className="text-sm text-slate-500 mt-1">完成率与重拍率变化趋势</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setDays(7)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                days === 7
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              7天
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                days === 30
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              30天
            </button>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="刷新数据"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
              labelFormatter={(label) => formatDate(label as string)}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === 'completionRate' ? '完成率' : '重拍率',
              ]}
            />
            <Legend
              formatter={(value) =>
                value === 'completionRate' ? '完成率' : '重拍率'
              }
              iconType="circle"
              wrapperStyle={{ paddingTop: '16px' }}
            />
            <Line
              type="monotone"
              dataKey="completionRate"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="completionRate"
            />
            <Line
              type="monotone"
              dataKey="retakeRate"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              name="retakeRate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
