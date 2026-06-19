export interface Clinic {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
}

export type PhotoAngle =
  | 'frontal'
  | 'frontalSmile'
  | 'lateral'
  | 'lateral45'
  | 'upperOcclusal'
  | 'lowerOcclusal'
  | 'occlusion'
  | 'overjet'
  | 'overbite';

export interface MissingAngle {
  angle: PhotoAngle;
  label: string;
  count: number;
}

export interface ClinicDailyData {
  clinicId: string;
  clinicName: string;
  date: string;
  totalPatients: number;
  photographedCount: number;
  missingAngles: MissingAngle[];
  retakeCount: number;
  retakeRate: number;
  completionRate: number;
}

export type TreatmentStage =
  | 'initial'
  | 'alignment'
  | 'spaceClosing'
  | 'finishing'
  | 'retention';

export interface Doctor {
  id: string;
  name: string;
  clinicId: string;
  title: string;
}

export interface Nurse {
  id: string;
  name: string;
  clinicId: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  caseNumber: string;
}

export type IssueType =
  | 'blur'
  | 'hookPosition'
  | 'biteIncorrect'
  | 'incomplete'
  | 'lighting'
  | 'other';

export interface IssueMark {
  id: string;
  type: IssueType;
  typeLabel: string;
  description: string;
  rect: { x: number; y: number; w: number; h: number };
  createdAt: string;
  createdBy: string;
}

export interface Photo {
  id: string;
  angle: PhotoAngle;
  angleLabel: string;
  url: string;
  thumbUrl: string;
  takenAt: string;
  photographer: string;
  hasIssue: boolean;
  issueMarks?: IssueMark[];
}

export interface FollowUpVisit {
  id: string;
  caseId: string;
  visitDate: string;
  stage: TreatmentStage;
  stageLabel: string;
  doctorId: string;
  doctorName: string;
  nurseId: string;
  nurseName: string;
  photos: Photo[];
  missingAngles: PhotoAngle[];
  doctorNotes: string;
  feedbackStatus: 'pending' | 'processing' | 'completed';
}

export interface OrthoCase {
  id: string;
  patientId: string;
  patient: Patient;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  currentStage: TreatmentStage;
  currentStageLabel: string;
  startDate: string;
  totalVisits: number;
  latestVisitDate: string;
  visits: FollowUpVisit[];
}

export type FeedbackStatus = 'pending' | 'fixed' | 'verified' | 'rejected';

export interface QualityFeedback {
  id: string;
  caseId: string;
  visitId: string;
  photoId: string;
  issueMark: IssueMark;
  suggestion: string;
  assignee: string;
  assigneeClinicId: string;
  status: FeedbackStatus;
  statusLabel: string;
  createdAt: string;
  fixedAt?: string;
  verifiedAt?: string;
}

export interface TrendDataPoint {
  date: string;
  completionRate: number;
  retakeRate: number;
}

export interface PendingPhotoItem {
  caseId: string;
  visitId: string;
  photo: Photo;
}

export interface CaseFilter {
  clinicId: string | null;
  doctorId: string | null;
  nurseId: string | null;
  stage: TreatmentStage | null;
  missingAngle: PhotoAngle | null;
  dateRange: [string, string] | null;
}

export interface CurrentAnnotation {
  photoId: string | null;
  marks: IssueMark[];
}

export interface ClinicDetailTrendPoint {
  date: string;
  retakeRate: number;
  retakeCount: number;
}

export interface ClinicMissingAngleRank {
  angle: PhotoAngle;
  count: number;
  label: string;
}

export interface ClinicInvolvedPerson {
  name: string;
  role: 'doctor' | 'nurse';
  missingCount: number;
}

export interface ClinicDetailData {
  trendDays: number;
  trendData: ClinicDetailTrendPoint[];
  missingAngleRanking: ClinicMissingAngleRank[];
  involvedPeople: ClinicInvolvedPerson[];
}

export interface QualityFilter {
  clinicId: string | null;
  doctorId: string | null;
  nurseId: string | null;
  missingAngle: PhotoAngle | null;
  status: FeedbackStatus | null;
}

export interface ReviewSource {
  type: 'clinic';
  clinicId: string;
  clinicName: string;
  sourceType: 'missingAngle' | 'involvedPerson';
  sourceLabel: string;
  sourceDetail?: string;
  trendDays: number;
  doctorId?: string;
  doctorName?: string;
  nurseId?: string;
  nurseName?: string;
}
