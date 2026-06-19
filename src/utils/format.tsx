import React from 'react';
import type { MissingAngle } from '../types';
import { PHOTO_ANGLES } from './constants';

export function formatPercent(value: number): string {
  const percent = (value * 100).toFixed(1);
  return `${percent}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatMissingAngles(angles: MissingAngle[]): React.ReactNode {
  if (!angles || angles.length === 0) {
    return <span className="text-slate-400">无缺失</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {angles.map((missing) => {
        const config = PHOTO_ANGLES.find((p) => p.key === missing.angle);
        const label = config?.label ?? missing.angle;
        const colorClass =
          config?.color ?? 'bg-slate-100 text-slate-700 border-slate-200';
        return (
          <span
            key={missing.angle}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
          >
            {label}
            {missing.count > 1 && (
              <span className="ml-1 opacity-70">×{missing.count}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
