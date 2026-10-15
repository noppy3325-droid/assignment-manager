import { test, expect, type Page } from '@playwright/test';
// Development OIDC credentials stay in memory and are sent only to the exact
// deployment origin, never to Firebase, fonts, redirects or test traces.
test.beforeEach(async ({ context }) => {
  const token = process.env.VERCEL_OIDC_TOKEN;
  if (!token || !process.env.BASE_URL) return;
  const origin = new URL(process.env.BASE_URL).origin;
  await context.route(`${origin}/**`, async route => {
    const response = await route.fetch({ headers: { ...route.request().headers(), 'x-vercel-trusted-oidc-idp-token': token }, maxRedirects: 0 });
    await route.fulfill({ response });
  });
});
async function enter(page: Page) {
  await page.goto('/tasks');
  await page.getByRole('button', { name: 'ログインせずに、この端末で始める' }).click();
  await expect(page.getByRole('navigation', { name: 'メインナビゲーション' })).toBeVisible();
}
async function openTask(page: Page, title: string) {
  const heading = page.getByRole('heading', { name: title, exact: true });
  // A list transition retains its outgoing card until the exit animation ends.
  await expect(heading).toHaveCount(1);
  await heading.click();
}
async function add(page: Page, title = '数学ワーク') {
  await page.getByRole('button', { name: '課題を追加', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '課題を追加 / Add assignment' });
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).fill(title);
  await dialog.locator('input[name="subject"]').fill('数学');
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).click();
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
}
test('create, edit, record, complete, reopen, reload and delete an assignment', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await enter(page); await add(page);
  await openTask(page, '数学ワーク');
  let detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await detail.getByRole('button', { name: 'タスクを編集' }).click();
  const edit = page.getByRole('dialog', { name: '課題を編集 / Edit assignment' });
  await edit.getByRole('textbox', { name: 'タイトル', exact: true }).fill('数学ワーク 改訂');
  await edit.getByRole('textbox', { name: '詳細', exact: true }).fill('第2章を復習');
  await edit.locator('button[type="submit"]').click();
  await openTask(page, '数学ワーク 改訂');
  detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await expect(detail.getByText('第2章を復習')).toBeVisible();
  await detail.getByRole('button', { name: '進捗を入力' }).click();
  const timer = page.getByRole('dialog', { name: '学習タイマー / Study timer' });
  await timer.getByRole('spinbutton', { name: '進んだ量' }).fill('40');
  await timer.getByRole('button', { name: '記録する' }).click();
  await expect(timer).not.toBeVisible();
  await page.reload();
  await openTask(page, '数学ワーク 改訂');
  detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await expect(detail.getByText('+40%')).toBeVisible();
  await detail.getByRole('button', { name: '完了にする' }).click();
  await page.getByRole('navigation').getByRole('button', { name: '学習履歴' }).click();
  await openTask(page, '数学ワーク 改訂');
  detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await detail.getByRole('button', { name: '進行中に戻す' }).click();
  await page.getByRole('navigation').getByRole('button', { name: '課題', exact: true }).click();
  await openTask(page, '数学ワーク 改訂');
  detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await detail.getByRole('button', { name: '削除', exact: true }).click();
  await page.getByRole('dialog', { name: '確認 / Confirmation' }).getByRole('button', { name: 'はい' }).click();
  await expect(page.getByText('数学ワーク 改訂', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('navigation supports browser back/forward, refresh and nested calendar dialogs', async ({ page }) => {
  await enter(page);
  await page.getByRole('navigation').getByRole('button', { name: 'カレンダー' }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await page.reload();
  const calendar = page.getByRole('dialog', { name: 'カレンダー / Calendar' });
  await expect(calendar).toBeVisible();
  await calendar.getByRole('button', { name: '課題を追加' }).click();
  await expect(page).toHaveURL(/\/calendar\?new=1/);
  await expect(page.getByRole('dialog', { name: '課題を追加 / Add assignment' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(calendar).toBeVisible();
  await expect(page).toHaveURL(/\/calendar$/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/tasks$/);
  await page.goBack(); await expect(calendar).toBeVisible();
  await page.goForward(); await expect(calendar).not.toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: '設定' }).click();
  await expect(page.getByRole('dialog', { name: '設定 / Settings' })).toBeVisible();
  await page.reload(); await expect(page.getByRole('dialog', { name: '設定 / Settings' })).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
test('page progress counts both endpoints and rejects reversed ranges', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '課題を追加', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '課題を追加 / Add assignment' });
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).fill('英語 p1〜10');
  await dialog.locator('input[name="subject"]').fill('英語');
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).click();
  await dialog.getByRole('button', { name: 'ページ数' }).click();
  await dialog.getByRole('spinbutton', { name: '開始ページ' }).fill('10');
  await dialog.getByRole('spinbutton', { name: '終了ページ' }).fill('1');
  await dialog.locator('button[type="submit"]').click(); await expect(dialog).toBeVisible();
  await dialog.getByRole('spinbutton', { name: '開始ページ' }).fill('1');
  await dialog.getByRole('spinbutton', { name: '終了ページ' }).fill('10');
  await dialog.locator('button[type="submit"]').click(); await expect(dialog).not.toBeVisible();
  await page.getByRole('heading', { name: '英語 p1〜10', exact: true }).click();
  await page.getByRole('button', { name: '進捗を入力' }).click();
  const timer = page.getByRole('dialog', { name: '学習タイマー / Study timer' });
  await timer.getByRole('spinbutton', { name: '進んだ量' }).fill('1');
  await timer.getByRole('button', { name: '記録する' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved[0].progress).toBe(10); expect(saved[0].currentPage).toBe(1);
});
test('notification-free browsers and damaged preferences still start', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'Notification', { value: undefined, configurable: true });
    localStorage.setItem('app-subjects', '{broken'); localStorage.setItem('app-language', 'unknown');
    localStorage.setItem('lumina-durations', 'null');
  });
  await enter(page);
  await expect(page.getByRole('button', { name: '課題を追加', exact: true })).toBeVisible();
});
test('quick input applies the deadline and duration to the saved task', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '課題を追加', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '課題を追加 / Add assignment' });
  await dialog.getByPlaceholder('例: 明日17時までに数学のテスト勉強 3時間 (優先度: 高)').fill('明日17時までに数学のテスト勉強 3時間');
  await dialog.getByRole('button', { name: '自動解析' }).click();
  await expect(dialog.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('数学のテスト勉強');
  await expect(dialog.getByLabel('締切時刻')).toHaveValue('17:00');
  await dialog.locator('button[type="submit"]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved[0].estimatedHours).toBe(3); expect(saved[0].priority).toBe('high');
  expect(new Date(saved[0].deadline).getTime()).toBeGreaterThan(Date.now());
});
test('pomodoro records work time and excludes the break', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lumina-durations', JSON.stringify({ work: 60, break: 60 })));
  await enter(page); await add(page, '集中セッション');
  await page.getByRole('heading', { name: '集中セッション', exact: true }).click();
  await page.getByRole('button', { name: '取り組む', exact: true }).click();
  await page.clock.install();
  await page.getByRole('dialog', { name: '集中モード / Focus mode' }).getByRole('button', { name: /ポモドーロ/ }).click();
  const timer = page.getByRole('dialog', { name: '学習タイマー / Study timer' });
  await page.clock.runFor(60_100);
  await expect(timer.getByText('休憩フェーズ', { exact: true })).toBeVisible();
  await timer.getByRole('button', { name: '開始 / 一時停止' }).click();
  await page.clock.runFor(30_000);
  await timer.getByRole('button', { name: '終了', exact: true }).click();
  await timer.getByRole('spinbutton', { name: '進んだ量' }).fill('0');
  await timer.getByRole('button', { name: '記録する' }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved[0].activityLogs[0].durationMinutes).toBe(1);
  expect(saved[0].activityLogs[0].progressIncrement).toBe(0);
});
test('a running stopwatch resumes after reloading', async ({ page }) => {
  await enter(page); await add(page, '復元セッション');
  await page.getByRole('heading', { name: '復元セッション', exact: true }).click();
  await page.getByRole('button', { name: '取り組む', exact: true }).click();
  await page.getByRole('dialog', { name: '集中モード / Focus mode' }).getByRole('button', { name: /ストップウォッチ/ }).click();
  await page.waitForTimeout(1200);
  await page.reload();
  const timer = page.getByRole('dialog', { name: '学習タイマー / Study timer' });
  await expect(timer).toBeVisible(); await expect(timer.getByText('復元セッション', { exact: true })).toBeVisible();
  await timer.getByRole('button', { name: '終了', exact: true }).click();
  await timer.getByRole('spinbutton', { name: '進んだ量' }).fill('0');
  await timer.getByRole('button', { name: '記録する' }).click();
  await expect(timer).not.toBeVisible();
});
test('backups download, import and preserve activity ids', async ({ page }) => {
  await enter(page); await add(page, 'バックアップの課題');
  await page.getByRole('navigation').getByRole('button', { name: '設定' }).click();
  const settings = page.getByRole('dialog', { name: '設定 / Settings' });
  const download = page.waitForEvent('download');
  await settings.getByRole('button', { name: '書き出す', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^lumina-backup-/);
  const now = new Date().toISOString();
  const task = { id: 'import-test', title: '読み込んだ課題', subject: '英語', deadline: now, progress: 10, status: 'in-progress', taskType: 'percentage', priority: 'medium', activityLogs: [{ id: 'keep-log-id', timestamp: now, durationMinutes: 2, progressIncrement: 10, type: 'percentage' }] };
  await settings.getByLabel('バックアップファイル').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'lumina-backup', version: 1, tasks: [task] })) });
  await expect(settings.getByText('1件の課題を読み込みました。')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved).toHaveLength(2); expect(saved.find((item: any) => item.title === '読み込んだ課題').activityLogs[0].id).toBe('keep-log-id');
  await settings.getByLabel('バックアップファイル').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'lumina-backup', version: 1, tasks: [task] })) });
  await expect(settings.getByText('0件の課題を読み込みました。')).toBeVisible();
});
test('failed storage writes keep the form and allow a retry', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '課題を追加', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '課題を追加 / Add assignment' });
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).fill('保存を再試行する課題');
  await dialog.locator('input[name="subject"]').fill('数学');
  await dialog.getByRole('textbox', { name: 'タイトル', exact: true }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'lumina-local-tasks-v1') { Storage.prototype.setItem = original; throw new DOMException('Storage full', 'QuotaExceededError'); }
      return original.call(this, key, value);
    };
  });
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('保存を再試行する課題');
  await expect(page.getByRole('alert').filter({ hasText: '保存・読み込みに失敗' })).toBeVisible();
  await page.getByRole('button', { name: 'エラーを閉じる' }).click();
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog).not.toBeVisible();
});
test('Enter activates a focused close button without completing the task', async ({ page }) => {
  await enter(page); await add(page, 'キーボード操作');
  await page.getByRole('heading', { name: 'キーボード操作', exact: true }).click();
  const detail = page.getByRole('dialog', { name: '課題の詳細 / Assignment details' });
  await detail.getByRole('button', { name: '詳細を閉じる / Close details' }).focus();
  await page.keyboard.press('Enter');
  await expect(detail).not.toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved[0].status).toBe('pending');
});
test('deadline sorting stays chronological across different subjects', async ({ page }) => {
  await page.addInitScript(() => {
    const base = { uid: 'local-device', status: 'pending', priority: 'medium', taskType: 'percentage', progress: 0, activityLogs: [] };
    const deadline = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString(); };
    localStorage.setItem('lumina-mode', 'local');
    localStorage.setItem('lumina-local-tasks-v1', JSON.stringify([
      { ...base, id: 'late', title: '数学 遅い締切', subject: '数学', deadline: deadline(3) },
      { ...base, id: 'early', title: '数学 早い締切', subject: '数学', deadline: deadline(1) },
      { ...base, id: 'middle', title: '英語 中間の締切', subject: '英語', deadline: deadline(2) },
    ]));
  });
  await page.goto('/tasks');
  await page.getByRole('button', { name: '締切日順', exact: true }).click();
  await expect(page.locator('main h3')).toHaveText(['数学 早い締切', '英語 中間の締切', '数学 遅い締切']);
});
test('another tab can sync progress without erasing an edit draft', async ({ page, context }) => {
  await enter(page); await add(page, '同期する課題');
  await openTask(page, '同期する課題');
  await page.getByRole('button', { name: 'タスクを編集' }).click();
  const edit = page.getByRole('dialog', { name: '課題を編集 / Edit assignment' });
  await edit.getByRole('textbox', { name: 'タイトル', exact: true }).fill('編集中のタイトル');
  const second = await context.newPage();
  await second.goto('/tasks');
  await second.evaluate(() => {
    const tasks = JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]');
    tasks[0].progress = 33; tasks[0].status = 'in-progress';
    localStorage.setItem('lumina-local-tasks-v1', JSON.stringify(tasks));
  });
  await expect(page.locator('main').getByText('33%', { exact: true })).toBeVisible();
  await expect(edit.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('編集中のタイトル');
  await edit.locator('button[type="submit"]').click();
  await expect(edit).not.toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lumina-local-tasks-v1') || '[]'));
  expect(saved[0].title).toBe('編集中のタイトル'); expect(saved[0].progress).toBe(33);
  await second.close();
});
