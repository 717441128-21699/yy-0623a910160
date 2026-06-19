import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Photo, PhotoAngle, QualityFeedback } from '@/types';
import { PHOTO_ANGLES } from '@/utils/constants';
import { PHOTO_ANGLE_LABELS } from '@/mock/cases';
import { useQualityStore } from '@/store/useQualityStore';
import { AlertCircle, XCircle, ClipboardCheck, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  missingAngles: PhotoAngle[];
  visitId: string;
  caseId: string;
}

const ISSUE_TYPE_COLORS: Record<string, string> = {
  blur: 'bg-purple-500',
  hookPosition: 'bg-orange-500',
  biteIncorrect: 'bg-red-500',
  incomplete: 'bg-pink-500',
  lighting: 'bg-yellow-500',
  other: 'bg-slate-500',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-700',
  fixed: 'bg-primary-100 text-primary-700',
  verified: 'bg-secondary-100 text-secondary-700',
  rejected: 'bg-danger-100 text-danger-700',
};

export default function PhotoGrid({ photos, missingAngles, visitId, caseId }: PhotoGridProps) {
  const { feedbacks, selectFeedback, addHighlights } = useQualityStore();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoMap = useMemo(() => new Map(photos.map((p) => [p.angle, p])), [photos]);

  const photoFeedbackMap = useMemo(() => {
    const map = new Map<string, QualityFeedback[]>();
    photos.forEach((photo) => {
      const photoFeedbacks = feedbacks.filter(
        (fb) => fb.caseId === caseId && fb.visitId === visitId && fb.photoId === photo.id
      );
      map.set(photo.id, photoFeedbacks);
    });
    return map;
  }, [photos, feedbacks, caseId, visitId]);

  const getPhotoFeedbacks = (photoId: string): QualityFeedback[] => {
    return photoFeedbackMap.get(photoId) || [];
  };

  const closeModal = () => setSelectedPhoto(null);

  const handleViewFullQuality = (photoFeedbacks: QualityFeedback[]) => {
    if (photoFeedbacks.length > 0) {
      addHighlights(photoFeedbacks.map((fb) => fb.id));
      selectFeedback(photoFeedbacks[0].id);
    }
    navigate('/quality');
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {PHOTO_ANGLES.map((angleConfig) => {
          const photo = photoMap.get(angleConfig.key);
          const isMissing = missingAngles.includes(angleConfig.key) || !photo;
          const photoFeedbacks = photo ? (photoFeedbackMap.get(photo.id) || []) : [];
          const feedbackCount = photoFeedbacks.length;
          const hasIssues = feedbackCount > 0;

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
              <div
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group cursor-pointer"
                onClick={() => setSelectedPhoto(photo!)}
              >
                <img
                  src={photo!.thumbUrl}
                  alt={photo!.angleLabel}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-300',
                    'group-hover:scale-[1.02]'
                  )}
                  loading="lazy"
                />
                {hasIssues && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[11px] font-medium rounded-lg shadow-md">
                    <AlertCircle className="w-3 h-3" />
                    有问题
                  </div>
                )}
                {feedbackCount > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-[11px] font-medium rounded-lg shadow-md">
                    <ClipboardCheck className="w-3 h-3" />
                    {feedbackCount}
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

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  质控反馈详情
                </h3>
                <span className="badge bg-slate-100 text-slate-700">
                  {selectedPhoto.angleLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewFullQuality(getPhotoFeedbacks(selectedPhoto.id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  查看完整质控
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    照片预览
                  </h4>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={selectedPhoto.url}
                      alt={selectedPhoto.angleLabel}
                      className="w-full h-full object-cover"
                    />
                    {getPhotoFeedbacks(selectedPhoto.id).map((fb, idx) => (
                      <div
                        key={fb.id}
                        className={cn(
                          'absolute border-2 border-white/80 rounded-md shadow-lg',
                          ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                        )}
                        style={{
                          left: `${fb.issueMark.rect.x * 100}%`,
                          top: `${fb.issueMark.rect.y * 100}%`,
                          width: `${fb.issueMark.rect.w * 100}%`,
                          height: `${fb.issueMark.rect.h * 100}%`,
                          backgroundColor: 'transparent',
                        }}
                      >
                        <div
                          className={cn(
                            'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md',
                            ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={cn(
                            'absolute inset-0 rounded-md',
                            ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                          )}
                          style={{ opacity: 0.15 }}
                        />
                        <div
                          className={cn(
                            'absolute inset-0 border-2 rounded-md',
                            ISSUE_TYPE_COLORS[fb.issueMark.type] || 'border-slate-500'
                          )}
                          style={{ borderColor: 'inherit' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    质控反馈 ({getPhotoFeedbacks(selectedPhoto.id).length})
                  </h4>
                  <div className="space-y-4">
                    {getPhotoFeedbacks(selectedPhoto.id).length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl text-center text-sm text-slate-500">
                        暂无质控反馈
                      </div>
                    ) : (
                      getPhotoFeedbacks(selectedPhoto.id).map((fb, idx) => (
                        <div
                          key={fb.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                                  ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                                )}
                              >
                                {idx + 1}
                              </div>
                              <span className={cn(
                                'badge text-white',
                                ISSUE_TYPE_COLORS[fb.issueMark.type] || 'bg-slate-500'
                              )}>
                                {fb.issueMark.typeLabel}
                              </span>
                            </div>
                            <span className={cn('badge text-[11px]', STATUS_COLORS[fb.status])}>
                              {fb.statusLabel}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">问题描述</p>
                              <p className="text-sm text-slate-700">{fb.issueMark.description}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">整改建议</p>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {fb.suggestion}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                              <span>指派给：{fb.assignee}</span>
                              <span>
                                {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
