import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon: LucideIcon;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendDirection,
  icon: Icon,
  accentColor,
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-secondary-600';
    if (trendDirection === 'down') return 'text-danger-600';
    return 'text-slate-500';
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-card border border-slate-100 p-5 overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5">
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-start gap-4 pl-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 font-mono tracking-tight">
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${getTrendColor()}`}>
              {trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : trendDirection === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
              <span className="text-slate-400 font-normal ml-1">较昨日</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
