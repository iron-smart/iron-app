/* איירון — Service Worker להתראות לטלפון (פילוט, 13/10/2026).
   🔴 בכוונה **אין כאן fetch handler ואין מטמון**: מנגנון הגרסה של המערכת (VER) תלוי בכך שכל טעינה
   מגיעה מהרשת. SW שמגיש מהמטמון היה משאיר משתמשים על גרסה ישנה. כאן רק push ו-notificationclick. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch(_e) { d = { title: 'איירון', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'איירון', {
    body: d.body || '', icon: '/assets/icon-192.png', badge: '/assets/icon-192.png',
    dir: 'rtl', lang: 'he', tag: d.tag || undefined, data: { url: d.url || '/' }
  }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (c.url.indexOf(self.location.origin) === 0 && 'focus' in c) {
        c.postMessage({ t: 'nf-open', url: url });
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
