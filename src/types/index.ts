export type Role = 'admin' | 'student';
export type Grade = 'GRADE_10' | 'GRADE_12';
export type AccountStatus = 'active' | 'disabled';
export type MaterialStatus = 'published' | 'draft' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface UserProfile {
  uid: string;
  username: string; // e.g. "inf/thilak", "inf/admin"
  email: string; // internal mapping: inf_thilak@darkdvm.internal
  role: Role;
  gradeAccess: Grade[];
  accountStatus: AccountStatus;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
  passwordHash?: string;
}

export interface Material {
  materialId: string;
  title: string;
  description: string;
  grade: Grade;
  subject: string;
  chapter: string;
  storagePath?: string;
  fileDataUrl?: string; // Base64 or object URL for secure embedded rendering
  fileName?: string;
  fileSize?: string;
  pageCount?: number;
  uploadedAt: string;
  uploadedBy: string;
  status: MaterialStatus;
  pdfPages?: string[]; // Rendered page previews / vector rendered pages
}

export interface MaterialPermission {
  permissionId: string; // usually `${uid}_${materialId}`
  uid: string;
  username: string;
  materialId: string;
  materialTitle: string;
  grade: Grade;
  subject: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  updatedAt: string;
  lastAccessDate?: string;
  notes?: string;
}

export interface AuditLogEntry {
  logId: string;
  adminUid: string;
  adminUsername: string;
  action: string;
  targetUid?: string;
  targetUsername?: string;
  materialId?: string;
  materialTitle?: string;
  timestamp: string;
  details: string;
}

export const PREDEFINED_USERNAMES = [
  'inf/thilak',
  'inf/rag',
  'inf/suji',
  'inf/yuva',
  'inf/rishi',
  'inf/nilav',
  'inf/#',
  'inf/admin'
] as const;

export const DEFAULT_SUBJECTS = {
  GRADE_10: [
    'Mathematics',
    'Science (Physics)',
    'Science (Chemistry)',
    'Science (Biology)',
    'Social Science',
    'English Language & Literature'
  ],
  GRADE_12: [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Biology',
    'English Core'
  ]
};
