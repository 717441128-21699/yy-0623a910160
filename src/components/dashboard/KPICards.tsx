import React from 'react';
import { Users, Camera, AlertTriangle, RefreshCw } from 'lucide-react';
import StatCard from '../common/StatCard';
import useDashboardStore from '../../store/useDashboardStore';

const KPICards: React.FC = () => {
  const { dailyData } = useDashboardStore();

  const totalPatients = dailyData.reduce((sum, d) => sum + d.totalPatients, 0);
  const avgCompletionRate = dailyData.length > 0
    ? dailyData.reduce((sum, d) => sum + d.completionRate, 0) / dailyData.length
    : 0;
  const totalMissingAngles = dailyData.reduce(
    (sum, d) => sum + d.missingAngles.reduce((s, m) => s + m.count, 0),
    0
  );
  const avgRetakeRate = dailyData.length > 0
    ? dailyData.reduce((sum, d) => sum + d.retakeRate, 0) / dailyData.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="总复诊人数"
        value={totalPatients}
        trend={2.3}
        trendDirection="up"
        icon={Users}
        accentColor="#346199"
      />
      <StatCard
        title="平均拍照完成率"
        value={`${avgCompletionRate.toFixed(1)}%`}
        trend={1.5}
        trendDirection="up"
        icon={Camera}
        accentColor="#10b981"
      />
      <StatCard
        title="总缺失角度数"
        value={totalMissingAngles}
        trend={-0.8}
        trendDirection="down"
        icon={AlertTriangle}
        accentColor="#f59e0b"
      />
      <StatCard
        title="平均重拍率"
        value={`${avgRetakeRate.toFixed(1)}%`}
        trend={-0.5}
        trendDirection="down"
        icon={RefreshCw}
        accentColor="#ef4444"
      />
    </div>
  );
};

export default KPICards;
