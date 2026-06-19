import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { Photo, IssueMark, IssueType } from '@/types';
import { ISSUE_TYPES } from '@/utils/constants';
import { cn } from '@/lib/utils';

interface PhotoAnnotationProps {
  photo: Photo | null;
  marks: IssueMark[];
  selectedIssueType: IssueType | null;
  onAddMark: (rect: { x: number; y: number; w: number; h: number }) => void;
  onRemoveMark: (markId: string) => void;
}

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const TYPE_BORDER_COLORS: Record<IssueType, string> = {
  blur: 'border-red-500',
  hookPosition: 'border-orange-500',
  biteIncorrect: 'border-amber-500',
  incomplete: 'border-purple-500',
  lighting: 'border-yellow-500',
  other: 'border-slate-500',
};

const TYPE_BG_COLORS: Record<IssueType, string> = {
  blur: 'bg-red-500',
  hookPosition: 'bg-orange-500',
  biteIncorrect: 'bg-amber-500',
  incomplete: 'bg-purple-500',
  lighting: 'bg-yellow-500',
  other: 'bg-slate-500',
};

export default function PhotoAnnotation({
  photo,
  marks,
  selectedIssueType,
  onAddMark,
  onRemoveMark,
}: PhotoAnnotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const getRelativeCoords = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!photo || !selectedIssueType) return;
      if (e.button !== 0) return;
      const { x, y } = getRelativeCoords(e.clientX, e.clientY);
      setDrawing({
        isDrawing: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      });
    },
    [photo, selectedIssueType, getRelativeCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drawing.isDrawing) return;
      const { x, y } = getRelativeCoords(e.clientX, e.clientY);
      setDrawing((prev) => ({
        ...prev,
        currentX: x,
        currentY: y,
      }));
    },
    [drawing.isDrawing, getRelativeCoords]
  );

  const handleMouseUp = useCallback(() => {
    if (!drawing.isDrawing) return;
    const { startX, startY, currentX, currentY } = drawing;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);

    if (w > 0.02 && h > 0.02) {
      onAddMark({ x, y, w, h });
    }

    setDrawing({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, [drawing, onAddMark]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (drawing.isDrawing) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [drawing.isDrawing, handleMouseUp]);

  const drawingRect = drawing.isDrawing
    ? {
        left: `${Math.min(drawing.startX, drawing.currentX) * 100}%`,
        top: `${Math.min(drawing.startY, drawing.currentY) * 100}%`,
        width: `${Math.abs(drawing.currentX - drawing.startX) * 100}%`,
        height: `${Math.abs(drawing.currentY - drawing.startY) * 100}%`,
      }
    : null;

  if (!photo) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <div className="mb-2 text-4xl">🖼️</div>
          <p className="text-sm">请从左侧列表选择照片</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-slate-700">{photo.angleLabel}</h3>
          {selectedIssueType ? (
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
              已选择: {ISSUE_TYPES.find((t) => t.key === selectedIssueType)?.label}
              <span className="text-blue-400">在照片上拖动绘制</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400">请先从右侧选择问题类型</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={cn(
            'relative max-h-full max-w-full overflow-hidden rounded-lg bg-white shadow-lg',
            selectedIssueType ? 'cursor-crosshair' : 'cursor-default'
          )}
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        >
          <img
            src={photo.url}
            alt={photo.angleLabel}
            draggable={false}
            className="block max-h-[calc(100vh-200px)] max-w-full select-none"
          />

          {marks.map((mark, index) => {
            const issueConfig = ISSUE_TYPES.find((t) => t.key === mark.type);
            const borderColor = TYPE_BORDER_COLORS[mark.type];
            const bgColor = TYPE_BG_COLORS[mark.type];
            return (
              <div
                key={mark.id}
                className={cn(
                  'group absolute border-2',
                  borderColor,
                  'bg-white/10 backdrop-blur-[1px]'
                )}
                style={{
                  left: `${mark.rect.x * 100}%`,
                  top: `${mark.rect.y * 100}%`,
                  width: `${mark.rect.w * 100}%`,
                  height: `${mark.rect.h * 100}%`,
                }}
              >
                <div
                  className={cn(
                    'absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-md',
                    bgColor
                  )}
                >
                  {index + 1}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMark(mark.id);
                  }}
                  className="absolute -top-2 -right-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600 group-hover:flex"
                >
                  <X className="h-3 w-3" />
                </button>
                <div
                  className={cn(
                    'absolute -bottom-1 left-0 rounded-r px-1.5 py-0.5 text-[10px] font-medium text-white whitespace-nowrap',
                    bgColor
                  )}
                >
                  {issueConfig?.label ?? mark.typeLabel}
                </div>
              </div>
            );
          })}

          {drawingRect && selectedIssueType && (
            <div
              className={cn(
                'absolute border-2 border-dashed pointer-events-none',
                TYPE_BORDER_COLORS[selectedIssueType],
                'bg-white/5'
              )}
              style={drawingRect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
