import { EyeOff, Magnet, Dumbbell, ImageOff, Lightbulb, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PhotoAngle, TreatmentStage, IssueType, FeedbackStatus } from '../types';

export interface PhotoAngleConfig {
  key: PhotoAngle;
  label: string;
  color: string;
}

export interface TreatmentStageConfig {
  key: TreatmentStage;
  label: string;
  color: string;
}

export interface IssueTypeConfig {
  key: IssueType;
  label: string;
  color: string;
  icon: LucideIcon;
}

export interface FeedbackStatusConfig {
  key: FeedbackStatus;
  label: string;
  color: string;
}

export const PHOTO_ANGLES: PhotoAngleConfig[] = [
  { key: 'frontal', label: '正面像', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'frontalSmile', label: '正面微笑像', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { key: 'lateral', label: '侧面像', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'lateral45', label: '45°侧面像', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'upperOcclusal', label: '上颌咬合面', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'lowerOcclusal', label: '下颌咬合面', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'occlusion', label: '咬合像', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'overjet', label: '覆盖像', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { key: 'overbite', label: '覆合像', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export const TREATMENT_STAGES: TreatmentStageConfig[] = [
  { key: 'initial', label: '初诊', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'alignment', label: '排齐整平', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'spaceClosing', label: '关闭间隙', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'finishing', label: '精细调整', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'retention', label: '保持阶段', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

export const ISSUE_TYPES: IssueTypeConfig[] = [
  { key: 'blur', label: '模糊', color: 'bg-red-100 text-red-700 border-red-200', icon: EyeOff },
  { key: 'hookPosition', label: '挂钩位置', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Magnet },
  { key: 'biteIncorrect', label: '咬合不正确', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Dumbbell },
  { key: 'incomplete', label: '不完整', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ImageOff },
  { key: 'lighting', label: '光线问题', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Lightbulb },
  { key: 'other', label: '其他', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle },
];

export const FEEDBACK_STATUS: FeedbackStatusConfig[] = [
  { key: 'pending', label: '待处理', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'fixed', label: '已修复', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'verified', label: '已验证', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'rejected', label: '已驳回', color: 'bg-red-100 text-red-700 border-red-200' },
];
