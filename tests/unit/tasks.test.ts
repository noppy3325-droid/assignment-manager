import test from 'node:test';
import assert from 'node:assert/strict';
import { activityUpdate, completionUpdate, normalizeTask, progressAfter, repeatDate, toDate } from '../../src/lib/tasks';
import { parseSmartInput } from '../../src/lib/smart-input';
const task = normalizeTask('test', { title: '数学', subject: '数学', deadline: new Date(), taskType: 'pages', startPage: 1, endPage: 10, currentPage: 0, progress: 0 });
test('inclusive page ranges include both the first and last page', () => {
  assert.deepEqual(progressAfter(task, 1), { currentPage: 1, progress: 10 });
  assert.deepEqual(progressAfter(task, 10), { currentPage: 10, progress: 100 });
  assert.deepEqual(progressAfter({ ...task, endPage: 1 }, 1), { currentPage: 1, progress: 100 });
});
test('progress clamps at the end and records the actual increment', () => {
  const update = activityUpdate({ ...task, currentPage: 9, progress: 90 }, 50, 90, 'log');
  assert.equal(update.progress, 100); assert.equal(update.activityLogs[0].progressIncrement, 1);
  assert.equal(update.activityLogs[0].durationMinutes, 1.5);
});
test('zero progress records study without inventing time', () => {
  const update = activityUpdate(task, 0, 0, 'log');
  assert.equal(update.progress, 0); assert.equal(update.activityLogs[0].durationMinutes, 0);
});
test('negative, fractional and nonfinite progress is rejected', () => {
  for (const value of [-1, 1.5, NaN, Infinity]) assert.throws(() => progressAfter(task, value));
});
test('rounding does not complete long assignments before their last page', () => {
  assert.equal(progressAfter({ ...task, endPage: 1000 }, 999).progress, 99);
});
test('reopening a completed task resets progress consistently', () => {
  const update = completionUpdate({ ...task, progress: 100, currentPage: 10 }, false);
  assert.equal(update.progress, 0); assert.equal(update.currentPage, 0); assert.equal(update.completedAt, null);
});
test('monthly recurrences clamp to month end without drifting', () => {
  const date = new Date(2027, 0, 31, 17, 30);
  assert.equal(repeatDate(date, 1, 'monthly').getDate(), 28);
  assert.equal(repeatDate(date, 2, 'monthly').getDate(), 31);
  assert.equal(repeatDate(date, 1, 'monthly').getHours(), 17);
});
test('dates normalize from Firestore timestamps, serialized backups and legacy fields', () => {
  assert.equal(toDate({ seconds: 100 })?.getTime(), 100_000);
  assert.equal(toDate('2026-10-15T00:00:00Z')?.toISOString(), '2026-10-15T00:00:00.000Z');
  assert.equal(toDate('invalid'), undefined);
  assert.equal(normalizeTask('legacy', { ...task, startPage: 1, currentPage: 1, progress: 0 }).currentPage, 0);
});
test('smart input parses Japanese and English deadlines and duration', () => {
  const parsed = parseSmartInput('明日17時までに数学のテスト勉強 3時間', ['数学']);
  assert.equal(parsed?.deadlineTime, '17:00'); assert.equal(parsed?.estimatedHours, 3); assert.equal(parsed?.subject, '数学');
  assert.equal(parsed?.priority, 'high');
  const english = parseSmartInput('math exam tomorrow 17:30 3h', ['math']);
  assert.equal(english?.estimatedHours, 3); assert.equal(english?.deadlineTime, '17:30'); assert.equal(english?.subject, 'math');
});
