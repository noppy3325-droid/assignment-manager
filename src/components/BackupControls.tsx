import { useRef, useState } from 'react';
import type { Submission } from '../types';
import { toDate } from '../lib/tasks';
export function BackupControls({ tasks, onImport, language }: { tasks: Submission[]; onImport: (tasks: Record<string, any>[]) => Promise<void>; language: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const ja = language === 'ja';
  const exportTasks = () => {
    const blob = new Blob([JSON.stringify({ format: 'lumina-backup', version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `lumina-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="space-y-3 border-t pt-5 border-[var(--m3-outline-variant)]">
    <h3 className="font-bold">{ja ? '課題のバックアップ' : 'Assignment backup'}</h3>
    <p className="text-sm opacity-75">{ja ? 'JSONで書き出し、別の端末やアカウントに追加できます。既存の課題は保持されます。' : 'Export JSON and add it to another device or account. Existing tasks are kept.'}</p>
    <div className="flex gap-2"><button className="m3-button-outline flex-1 !px-3" onClick={exportTasks}>{ja ? '書き出す' : 'Export'}</button>
      <button className="m3-button-outline flex-1 !px-3" disabled={busy} onClick={() => input.current?.click()}>{busy ? (ja ? '読み込み中…' : 'Importing…') : (ja ? '読み込む' : 'Import')}</button></div>
    <input ref={input} type="file" accept="application/json,.json" className="hidden" aria-label={ja ? 'バックアップファイル' : 'Backup file'} onChange={async event => {
      const file = event.target.files?.[0]; if (!file) return;
      setBusy(true); setMessage('');
      try {
        if (file.size > 4_000_000) throw new Error(ja ? '4MB以下のファイルを選んでください。' : 'Choose a file smaller than 4MB.');
        const backup = JSON.parse(await file.text());
        if (backup.format !== 'lumina-backup' || backup.version !== 1 || !Array.isArray(backup.tasks) || backup.tasks.length > 400) throw new Error(ja ? 'Luminaのバックアップ（400件以内）を選んでください。' : 'Choose a Lumina backup with at most 400 tasks.');
        const existing = new Set(tasks.flatMap(task => [task.id, task.sourceId].filter(Boolean)));
        const items = backup.tasks.filter((task: any) => task && !existing.has(task.sourceId || task.id)).map((task: any) => {
          if (typeof task.id !== 'string' || !task.id || task.id.length > 128 || (task.sourceId != null && (typeof task.sourceId !== 'string' || task.sourceId.length > 128))) throw new Error(ja ? '課題IDの形式が正しくありません。' : 'Invalid assignment ID.');
          if (!task || typeof task.title !== 'string' || !task.title.trim() || task.title.length > 100 || typeof task.subject !== 'string' || !task.subject.trim() || task.subject.length > 50 || (task.description && (typeof task.description !== 'string' || task.description.length > 1000)) || (task.estimatedHours != null && (!Number.isFinite(task.estimatedHours) || task.estimatedHours <= 0 || task.estimatedHours > 10000)) || !toDate(task.deadline) || !Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100 || !['pending', 'in-progress', 'completed'].includes(task.status) || !['pages', 'percentage'].includes(task.taskType) || !['low', 'medium', 'high'].includes(task.priority)) throw new Error(ja ? '課題の形式が正しくありません。' : 'Invalid assignment format.');
          if (task.taskType === 'pages' && (!Number.isInteger(task.startPage) || !Number.isInteger(task.endPage) || task.startPage < 0 || task.endPage < task.startPage)) throw new Error(ja ? 'ページ範囲が正しくありません。' : 'Invalid page range.');
          return { ...task, sourceId: task.sourceId || task.id };
        });
        await onImport(items);
        setMessage(ja ? `${items.length}件の課題を読み込みました。` : `Imported ${items.length} assignments.`);
      } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); }
      finally { setBusy(false); event.target.value = ''; }
    }} />
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
