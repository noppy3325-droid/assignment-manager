export type SubmissionStatus = 'pending' | 'in-progress' | 'completed';

export interface ActivityLog {
  id: string;
  timestamp: any;
  durationMinutes: number;
  progressIncrement: number; // pages or percentage
  type: 'pages' | 'percentage';
}

export interface Submission {
  id: string;
  uid: string;
  title: string;
  subject: string;
  deadline: Date;
  progress: number; // 0 to 100
  status: SubmissionStatus;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
  taskType: 'pages' | 'percentage';
  startPage?: number;
  endPage?: number;
  currentPage?: number;
  activityLogs?: ActivityLog[];
  isDeleted?: boolean;
  deletedAt?: any;
  completedAt?: any;
}
