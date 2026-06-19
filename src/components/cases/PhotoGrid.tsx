import type { Photo, PhotoAngle } from '@/types';
import { PHOTO_ANGLES } from '@/utils/constants';
import { PHOTO_ANGLE_LABELS } from '@/mock/cases';
import { AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  missingAngles: PhotoAngle[];
}

export default function PhotoGrid({ photos, missingAngles }: PhotoGridProps) {
  const photoMap = new Map(photos.map((p) => [p.angle, p]));

  return (
    <div className="grid grid-cols-3 gap-3">
      {PHOTO_ANGLES.map((angleConfig) => {
        const photo = photoMap.get(angleConfig.key);
        const isMissing = missingAngles.includes(angleConfig.key) || !photo;

        if (isMissing) {
          return (
            <div key={angleConfig.key} className="flex flex-col">
              <div className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center">
                <XCircle className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs text-slate-500 font-medium">
                  {PHOTO_ANGLE_LABELS[angleConfig.key]}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-center text-slate-500">
                {angleConfig.label}
              </p>
            </div>
          );
        }

        return (
          <div key={angleConfig.key} className="flex flex-col">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group cursor-pointer">
              <img
                src={photo!.thumbUrl}
                alt={photo!.angleLabel}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300',
                  'group-hover:scale-[1.02]'
                )}
                loading="lazy"
              />
              {photo!.hasIssue && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[11px] font-medium rounded-lg shadow-md">
                  <AlertCircle className="w-3 h-3" />
                  有问题
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-center text-slate-600">
              {angleConfig.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
