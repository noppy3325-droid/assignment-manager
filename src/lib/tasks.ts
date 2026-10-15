import { Timestamp } from 'firebase/firestore';
import type { Submission } from '../types';

export function toDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  let date: Date;
  if (value instanceof Date) date = value;
  else if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') date = value.toDate();
  else if (typeof value === 'object' && 'seconds' in value) date = new Date(Number(value.seconds) * 1000);
  else date = new Date(value as string | number);
  return Number.isFinite(date.getTime()) ? date : undefined;
}
export function normalizeTask(id: string, data: Record<string, any>): Submission {
  const task = { ...data, id, title: String(data.title || ''), subject: String(data.subject || 'その他'),
    progress: Math.max(0, Math.min(100, Number(data.progress) || 0)),
    deadline: toDate(data.deadline) || new Date(), scheduledDate: toDate(data.scheduledDate),
    priority: data.priority || 'medium', taskType: data.taskType || 'percentage', activityLogs: data.activityLogs || [],
  } as Submission;
  if (task.taskType === 'pages' && task.progress === 0 && task.currentPage === task.startPage) task.currentPage = (task.startPage ?? 0) - 1;
  return task;
}
export function progressAfter(task: Submission, increment: number) {
  if (!Number.isInteger(increment) || increment < 0) throw new Error('進捗は0以上の整数で入力してください。');
  if (task.taskType === 'pages') {
    const start = task.startPage ?? 0, end = task.endPage ?? 0;
    if (end < start) throw new Error('終了ページは開始ページ以上にしてください。');
    const currentPage = Math.min(end, Math.max(start - 1, task.currentPage ?? start - 1) + increment);
    return { currentPage, progress: currentPage === end ? 100 : Math.min(99, Math.round((currentPage - start + 1) / (end - start + 1) * 100)) };
  }
  return { currentPage: 0, progress: Math.min(100, task.progress + increment) };
}
export function activityUpdate(task: Submission, increment: number, durationSeconds: number, logId: string) {
  const next = progressAfter(task, increment);
  const actualIncrement = task.taskType === 'pages' ? next.currentPage - (task.currentPage ?? (task.startPage ?? 0) - 1) : next.progress - task.progress;
  return { ...next, status: next.progress === 100 ? 'completed' : next.progress > 0 ? 'in-progress' : 'pending',
    completedAt: next.progress === 100 ? Timestamp.now() : null,
    activityLogs: [...(task.activityLogs || []), { id: logId, timestamp: Timestamp.now(),
      durationMinutes: Math.round(durationSeconds / 60 * 10) / 10, progressIncrement: actualIncrement, type: task.taskType }],
  };
}
export function completionUpdate(task: Submission, complete: boolean) {
  return { progress: complete ? 100 : 0, status: complete ? 'completed' : 'pending', completedAt: complete ? Timestamp.now() : null,
    currentPage: task.taskType === 'pages' ? complete ? task.endPage : (task.startPage ?? 0) - 1 : 0 };
}
export function repeatDate(date: Date, index: number, type: 'daily' | 'weekly' | 'monthly') {
  const result = new Date(date);
  if (type === 'monthly') {
    result.setDate(1); result.setMonth(result.getMonth() + index);
    result.setDate(Math.min(date.getDate(), new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  } else result.setDate(result.getDate() + index * (type === 'weekly' ? 7 : 1));
  return result;
}
