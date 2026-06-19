import type { Clinic } from '../types';

export const mockClinics: Clinic[] = [
  {
    id: 'clinic-001',
    name: '美齿口腔（朝阳旗舰店）',
    address: '北京市朝阳区建国路88号SOHO现代城1层',
    manager: '张明',
    phone: '010-55667788',
  },
  {
    id: 'clinic-002',
    name: '美齿口腔（海淀分院）',
    address: '北京市海淀区中关村大街1号中关村广场2层',
    manager: '李娜',
    phone: '010-66778899',
  },
  {
    id: 'clinic-003',
    name: '美齿口腔（西城分院）',
    address: '北京市西城区金融街35号国际企业大厦B1层',
    manager: '王强',
    phone: '010-77889900',
  },
  {
    id: 'clinic-004',
    name: '美齿口腔（东城分院）',
    address: '北京市东城区王府井大街88号银泰中心3层',
    manager: '刘芳',
    phone: '010-88990011',
  },
  {
    id: 'clinic-005',
    name: '美齿口腔（丰台分院）',
    address: '北京市丰台区丰台北路58号丰台科技园A座',
    manager: '陈伟',
    phone: '010-99001122',
  },
];

export default mockClinics;
