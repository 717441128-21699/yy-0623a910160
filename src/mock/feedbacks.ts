import type { QualityFeedback, FeedbackStatus, IssueMark } from '../types';

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: '待整改',
  fixed: '已整改',
  verified: '已验证',
  rejected: '已驳回',
};

const generateMockFeedbacks = (): QualityFeedback[] => {
  const feedbacks: QualityFeedback[] = [];
  const issueTypes = [
    { type: 'blur' as const, label: '焦点模糊' },
    { type: 'hookPosition' as const, label: '拉钩不到位' },
    { type: 'biteIncorrect' as const, label: '牙列未咬紧' },
    { type: 'lighting' as const, label: '光线问题' },
  ];
  const suggestions = [
    '拍摄时请确保患者保持静止，对焦后再按下快门。',
    '拉钩位置需要更靠后，充分暴露牙列。',
    '请确认患者上下牙列完全咬紧后再拍摄。',
    '建议调整灯光位置，避免反光和阴影。',
  ];
  const assignees = [
    { name: '护士小王', clinicId: 'clinic-001' },
    { name: '护士小张', clinicId: 'clinic-002' },
    { name: '护士小陈', clinicId: 'clinic-003' },
    { name: '护士小杨', clinicId: 'clinic-004' },
  ];
  const statuses: FeedbackStatus[] = ['pending', 'pending', 'pending', 'fixed', 'verified'];

  for (let i = 0; i < 12; i++) {
    const issueType = issueTypes[i % issueTypes.length];
    const status = statuses[i % statuses.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i % 7));
    const seed = i * 17 + 5;

    const issueMark: IssueMark = {
      id: `mark-fb-${i}`,
      type: issueType.type,
      typeLabel: issueType.label,
      description: issueType.label + '问题',
      rect: { x: 0.25, y: 0.25, w: 0.3, h: 0.3 },
      createdAt: createdAt.toISOString(),
      createdBy: '质控主任',
    };

    const feedback: QualityFeedback = {
      id: `feedback-${String(i + 1).padStart(4, '0')}`,
      caseId: `case-${String(((seed % 24) + 1)).padStart(4, '0')}`,
      visitId: `visit-${seed}-${(seed % 3) + 1}`,
      photoId: `photo-${seed}-0-${i}`,
      issueMark,
      suggestion: suggestions[i % suggestions.length],
      assignee: assignees[i % assignees.length].name,
      assigneeClinicId: assignees[i % assignees.length].clinicId,
      status,
      statusLabel: STATUS_LABELS[status],
      createdAt: createdAt.toISOString(),
      fixedAt: status !== 'pending' ? new Date(createdAt.getTime() + 86400000).toISOString() : undefined,
      verifiedAt: status === 'verified' ? new Date(createdAt.getTime() + 172800000).toISOString() : undefined,
    };

    feedbacks.push(feedback);
  }

  return feedbacks;
};

export const mockFeedbacks: QualityFeedback[] = generateMockFeedbacks();

export { STATUS_LABELS };

export default mockFeedbacks;
