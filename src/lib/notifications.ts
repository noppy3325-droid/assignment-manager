export function notify(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon: '/favicon.svg' }); } catch { /* Some mobile browsers do not support the constructor. */ }
}
