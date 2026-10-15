import { addDoc, collection, deleteDoc, doc, runTransaction, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { activityUpdate, normalizeTask } from './tasks';
import type { Submission } from '../types';
const KEY = 'lumina-local-tasks-v1';
const EVENT = 'lumina-tasks-changed';
function readLocal(): Submission[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('端末の保存データを読み込めません。バックアップから復元してください。');
  return data.map(task => normalizeTask(task.id, task));
}
function serialize(value: any): any {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && value._methodName === 'serverTimestamp') return new Date().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  return value;
}
function saveLocal(tasks: Submission[]) {
  localStorage.setItem(KEY, JSON.stringify(serialize(tasks)));
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeLocal(onTasks: (tasks: Submission[]) => void, onError: (error: unknown) => void) {
  const read = () => { try { onTasks(readLocal()); } catch (error) { onError(error); } };
  const storage = (event: StorageEvent) => { if (event.key === KEY) read(); };
  read(); window.addEventListener(EVENT, read); window.addEventListener('storage', storage);
  return () => { window.removeEventListener(EVENT, read); window.removeEventListener('storage', storage); };
}
export function taskRepository(local: boolean) {
  return {
    async create(data: Record<string, any>) {
      if (!local) return addDoc(collection(db, 'submissions'), data);
      const id = crypto.randomUUID();
      saveLocal([...readLocal(), normalizeTask(id, serialize({ ...data, createdAt: new Date() }))]);
      return { id };
    },
    async createMany(items: Record<string, any>[]) {
      if (local) saveLocal([...readLocal(), ...items.map(data => normalizeTask(crypto.randomUUID(), serialize({ ...data, createdAt: new Date() })))]);
      else {
        const batch = writeBatch(db);
        items.forEach(data => batch.set(doc(collection(db, 'submissions')), data));
        await batch.commit();
      }
    },
    async update(id: string, data: Record<string, any>) {
      if (!local) return updateDoc(doc(db, 'submissions', id), data);
      const tasks = readLocal();
      if (!tasks.some(task => task.id === id)) throw new Error('課題が見つかりません。');
      saveLocal(tasks.map(task => task.id === id ? normalizeTask(id, { ...task, ...serialize(data) }) : task));
    },
    async remove(id: string) {
      if (!local) return deleteDoc(doc(db, 'submissions', id));
      saveLocal(readLocal().filter(task => task.id !== id));
    },
    async record(id: string, increment: number, duration: number, logId: string) {
      if (local) {
        const tasks = readLocal(), task = tasks.find(task => task.id === id);
        if (!task) throw new Error('課題が見つかりません。');
        if (task.activityLogs?.some(log => log.id === logId)) return;
        const update = activityUpdate(task, increment, duration, logId);
        saveLocal(tasks.map(item => item.id === id ? normalizeTask(id, { ...item, ...serialize(update) }) : item));
      } else await runTransaction(db, async transaction => {
        const ref = doc(db, 'submissions', id), snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error('課題が見つかりません。');
        const task = normalizeTask(id, snapshot.data());
        if (task.activityLogs?.some(log => log.id === logId)) return;
        transaction.update(ref, activityUpdate(task, increment, duration, logId));
      });
    },
  };
}
