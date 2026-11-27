// id: core.instalable · tipo: proceso_base · módulo: core
// Siempre la versión nueva: pide al servidor sin caché; la copia guardada solo se usa sin internet.
// Nunca guarda datos de Supabase (otro dominio); solo la librería de Supabase para abrir sin señal.
const CACHE = 'control-obra-v5', LIBS = 'control-obra-libs-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== LIBS).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Librerías con versión fija (Supabase): primero la copia guardada, así la app abre sin señal.
  if (u.hostname === 'cdn.jsdelivr.net' && /@supabase\/supabase-js@/.test(u.pathname)) {
    e.respondWith(caches.open(LIBS).then((c) => c.match(e.request).then((g) => g || fetch(e.request).then((r) => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((g) => g || (e.request.mode === 'navigate' ? caches.match('./', { ignoreSearch: true }).then((x) => x || caches.match('index.html', { ignoreSearch: true })) : undefined))));
});
// Aviso del lunes (llega sin contenido): muestra la notificación; al tocarla abre la app en Inicio con el resumen.
self.addEventListener('push', (e) => e.waitUntil(self.registration.showNotification('📋 Resumen de la semana listo', {
  body: 'Toca para ver lo gastado, el avance y las alertas.', icon: 'iconos/icono-192.png', badge: 'iconos/icono-192.png', tag: 'resumen-lunes', renotify: true })));
self.addEventListener('notificationclick', (e) => { e.notification.close(); e.waitUntil(
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => { const c = cs.find((x) => x.url.startsWith(self.registration.scope)); return c ? c.focus() : self.clients.openWindow(self.registration.scope); })); });
