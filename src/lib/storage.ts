export function readSetting<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw) as T; }
  catch { return fallback; }
}
export function writeSetting(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Optional preferences. */ }
}
export function readText(key: string, fallback = '') {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function writeText(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Keep this session usable. */ }
}
