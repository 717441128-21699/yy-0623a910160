import type { OrthoCase, PendingPhotoItem, TreatmentStage, PhotoAngle, Photo, IssueMark, IssueType } from '../types';

const PHOTO_ANGLE_LABELS: Record<PhotoAngle, string> = {
  frontal: '正面像',
  frontalSmile: '正面微笑像',
  lateral: '侧面像（侧貌）',
  lateral45: '45°侧面像',
  upperOcclusal: '上颌咬合像',
  lowerOcclusal: '下颌咬合像',
  occlusion: '正中咬合像',
  overjet: '覆盖像',
  overbite: '覆𬌗像',
};

const STAGE_LABELS: Record<TreatmentStage, string> = {
  initial: '初诊/检查',
  alignment: '排齐期',
  spaceClosing: '收缝期',
  finishing: '精细调整',
  retention: '保持期',
};

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  blur: '焦点模糊',
  hookPosition: '拉钩不到位',
  biteIncorrect: '牙列未咬紧',
  incomplete: '拍摄不全',
  lighting: '光线问题',
  other: '其他',
};

const randomBetween = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const genId = (prefix: string, idx: number): string => `${prefix}-${String(idx).padStart(4, '0')}`;

const photoAngleList: PhotoAngle[] = [
  'frontal', 'frontalSmile', 'lateral', 'lateral45',
  'upperOcclusal', 'lowerOcclusal', 'occlusion', 'overjet', 'overbite'
];

const patientNames = [
  '王小明', '李小红', '张明明', '刘芳芳', '陈大伟',
  '杨雪梅', '赵志强', '黄丽娟', '周建国', '吴婷婷',
  '徐浩然', '孙梦琪', '朱子豪', '郭雨萱', '何雨桐',
  '林诗涵', '马浩然', '梁梓涵', '宋思远', '郑雅文',
];

const doctorNames = [
  { id: 'doc-001', name: '刘医生', title: '正畸主任', clinicId: 'clinic-001' },
  { id: 'doc-002', name: '陈医生', title: '副主任医师', clinicId: 'clinic-001' },
  { id: 'doc-003', name: '王医生', title: '主治医师', clinicId: 'clinic-002' },
  { id: 'doc-004', name: '李医生', title: '正畸医师', clinicId: 'clinic-002' },
  { id: 'doc-005', name: '张医生', title: '主任医师', clinicId: 'clinic-003' },
  { id: 'doc-006', name: '赵医生', title: '主治医师', clinicId: 'clinic-003' },
  { id: 'doc-007', name: '孙医生', title: '副主任医师', clinicId: 'clinic-004' },
  { id: 'doc-008', name: '周医生', title: '正畸医师', clinicId: 'clinic-005' },
];

const nurseNames = [
  { id: 'nur-001', name: '护士小王', clinicId: 'clinic-001' },
  { id: 'nur-002', name: '护士小李', clinicId: 'clinic-001' },
  { id: 'nur-003', name: '护士小张', clinicId: 'clinic-002' },
  { id: 'nur-004', name: '护士小刘', clinicId: 'clinic-002' },
  { id: 'nur-005', name: '护士小陈', clinicId: 'clinic-003' },
  { id: 'nur-006', name: '护士小杨', clinicId: 'clinic-004' },
  { id: 'nur-007', name: '护士小赵', clinicId: 'clinic-004' },
  { id: 'nur-008', name: '护士小孙', clinicId: 'clinic-005' },
];

const clinicList = [
  { id: 'clinic-001', name: '美齿口腔（朝阳旗舰店）' },
  { id: 'clinic-002', name: '美齿口腔（海淀分院）' },
  { id: 'clinic-003', name: '美齿口腔（西城分院）' },
  { id: 'clinic-004', name: '美齿口腔（东城分院）' },
  { id: 'clinic-005', name: '美齿口腔（丰台分院）' },
];

const generatePhoto = (caseIdx: number, visitIdx: number, angleIdx: number, hasIssue: boolean): Photo => {
  const angle = photoAngleList[angleIdx % photoAngleList.length];
  const seed = caseIdx * 100 + visitIdx * 10 + angleIdx;
  const date = new Date();
  date.setDate(date.getDate() - (visitIdx * 30) - randomBetween(0, 20));
  const nurse = nurseNames[seed % nurseNames.length];

  const issueMarks: IssueMark[] = hasIssue ? [
    {
      id: `mark-${seed}`,
      type: (['blur', 'hookPosition', 'biteIncorrect', 'lighting'] as IssueType[])[seed % 4],
      typeLabel: ISSUE_TYPE_LABELS[(['blur', 'hookPosition', 'biteIncorrect', 'lighting'] as IssueType[])[seed % 4]],
      description: '拍摄质量需要改进',
      rect: { x: 0.2 + (seed % 5) * 0.1, y: 0.2 + (seed % 3) * 0.1, w: 0.3, h: 0.3 },
      createdAt: date.toISOString(),
      createdBy: '质控主任',
    },
  ] : undefined;

  return {
    id: `photo-${caseIdx}-${visitIdx}-${angleIdx}`,
    angle,
    angleLabel: PHOTO_ANGLE_LABELS[angle],
    url: `https://picsum.photos/seed/ortho${seed}/800/600`,
    thumbUrl: `https://picsum.photos/seed/ortho${seed}/200/150`,
    takenAt: date.toISOString(),
    photographer: nurse.name,
    hasIssue,
    issueMarks,
  };
};

const generateVisits = (caseIdx: number, doctorId: string, nurseId: string, caseId: string) => {
  const visitCount = randomBetween(2, 6);
  const doctor = doctorNames.find((d) => d.id === doctorId)!;
  const nurse = nurseNames.find((n) => n.id === nurseId)!;
  const visits = [];
  const stages: TreatmentStage[] = ['initial', 'alignment', 'spaceClosing', 'finishing', 'retention'];

  for (let i = 0; i < visitCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - ((visitCount - i) * 30) - randomBetween(0, 20));
    const stage = stages[Math.min(i, stages.length - 1)];
    const photoCount = randomBetween(6, 9);
    const photos: Photo[] = [];
    const missingAngles: PhotoAngle[] = [];

    const anglesUsed = new Set<number>();
    for (let p = 0; p < photoCount; p++) {
      let angleIdx = randomBetween(0, photoAngleList.length - 1);
      while (anglesUsed.has(angleIdx)) {
        angleIdx = (angleIdx + 1) % photoAngleList.length;
      }
      anglesUsed.add(angleIdx);
      const hasIssue = i === visitCount - 1 && (caseIdx + p) % 3 === 0;
      photos.push(generatePhoto(caseIdx, i, angleIdx, hasIssue));
    }

    if (photoCount < photoAngleList.length) {
      for (let a = 0; a < photoAngleList.length; a++) {
        if (!anglesUsed.has(a)) {
          missingAngles.push(photoAngleList[a]);
        }
      }
    }

    visits.push({
      id: `visit-${caseIdx}-${i}`,
      caseId,
      visitDate: date.toISOString().split('T')[0],
      stage,
      stageLabel: STAGE_LABELS[stage],
      doctorId: doctor.id,
      doctorName: doctor.name,
      nurseId: nurse.id,
      nurseName: nurse.name,
      photos,
      missingAngles,
      doctorNotes: `本次复诊：患者配合良好，继续当前方案。下次复诊时间：${randomBetween(4, 8)}周后。`,
      feedbackStatus: (['pending', 'processing', 'completed'] as const)[i % 3],
    });
  }
  return visits;
};

const generateCases = (): OrthoCase[] => {
  const cases: OrthoCase[] = [];
  for (let i = 0; i < 24; i++) {
    const clinic = clinicList[i % clinicList.length];
    const doctor = doctorNames[i % doctorNames.length];
    const nurse = nurseNames[i % nurseNames.length];
    const caseId = genId('case', i + 1);
    const visits = generateVisits(i, doctor.id, nurse.id, caseId);
    const latestVisit = visits[visits.length - 1];
    const startDate = visits[0].visitDate;

    cases.push({
      id: caseId,
      patientId: genId('patient', i + 1),
      patient: {
        id: genId('patient', i + 1),
        name: patientNames[i % patientNames.length],
        gender: (i % 2 === 0 ? 'male' : 'female') as 'male' | 'female',
        age: 12 + (i % 18),
        caseNumber: `ZJ${String(20240001 + i).padStart(8, '0')}`,
      },
      clinicId: clinic.id,
      clinicName: clinic.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      currentStage: latestVisit.stage,
      currentStageLabel: latestVisit.stageLabel,
      startDate,
      totalVisits: visits.length,
      latestVisitDate: latestVisit.visitDate,
      visits,
    });
  }
  return cases;
};

export const mockCases: OrthoCase[] = generateCases();

export const extractPendingPhotos = (cases: OrthoCase[]): PendingPhotoItem[] => {
  const pending: PendingPhotoItem[] = [];
  cases.forEach((c) => {
    c.visits.forEach((v) => {
      v.photos.forEach((p) => {
        if (p.hasIssue) {
          pending.push({
            caseId: c.id,
            visitId: v.id,
            photo: p,
          });
        }
      });
    });
  });
  return pending;
};

export { STAGE_LABELS, ISSUE_TYPE_LABELS, PHOTO_ANGLE_LABELS, doctorNames, nurseNames, clinicList };

export default mockCases;
