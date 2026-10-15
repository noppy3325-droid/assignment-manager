import type { Submission } from '../types';
import { isSameDay, startOfDay, addDays } from 'date-fns';
export type StudyFilter = 'all' | 'today' | 'overdue' | 'week';
export function matchesStudyFilter(task: Submission, filter: StudyFilter, now = new Date()) {
  if (filter === 'today') return isSameDay(task.scheduledDate || task.deadline, now);
  if (filter === 'overdue') return task.deadline.getTime() < now.getTime();
  if (filter === 'week') return task.deadline >= startOfDay(now) && task.deadline < addDays(startOfDay(now), 7);
  return true;
}
export function StudyOverview({ tasks, filter, onFilter, language }: { tasks: Submission[]; filter: StudyFilter; onFilter: (value: StudyFilter) => void; language: string }) {
  const active = tasks.filter(task => !task.isEvent && !task.isDeleted && task.status !== 'completed');
  const options: { value: StudyFilter; label: string }[] = language === 'ja'
    ? [{ value: 'all', label: 'すべての課題' }, { value: 'today', label: '今日取り組む' }, { value: 'overdue', label: '締切を過ぎた課題' }, { value: 'week', label: '7日以内の締切' }]
    : [{ value: 'all', label: 'All assignments' }, { value: 'today', label: 'Study today' }, { value: 'overdue', label: 'Overdue' }, { value: 'week', label: 'Due in 7 days' }];
  return <section aria-label={language === 'ja' ? '学習の見通し' : 'Study overview'} className="study-overview">
    {options.map(({ value, label }) => <button key={value} aria-pressed={filter === value} onClick={() => onFilter(value)} className={filter === value ? 'overview-card selected' : 'overview-card'}>
      <span>{label}</span><strong>{active.filter(task => matchesStudyFilter(task, value)).length}<small>{language === 'ja' ? '件' : ' tasks'}</small></strong>
    </button>)}
  </section>;
}
