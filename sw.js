// id: core.instalable · tipo: proceso_base · módulo: core
// Siempre pide la versión nueva; solo usa la copia guardada si no hay internet. Nunca guarda datos de Supabase.
const CACHE = 'control-obra-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  // no-cache: siempre pregunta al servidor si hay versión nueva (evita la copia de 10 min de GitHub)
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => {
    const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request)));
});
