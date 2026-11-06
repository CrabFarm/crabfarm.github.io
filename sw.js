// Ne gère que les fichiers de la page d'accueil : les applis hébergées
// dans d'autres dossiers (ex. /pointage/) gardent leur propre fonctionnement.
const CACHE = "hub-shell-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-192.png", "./icon-maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png"];
const SHELL = new Set(FILES.map(f => new URL(f, self.registration.scope).href));
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("hub-shell") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url); u.hash = ""; u.search = "";
  if (e.request.method !== "GET" || !SHELL.has(u.href)) return;
  e.respondWith(
    fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(u.href, c)); return r; })
      .catch(() => caches.match(u.href).then(r => r || caches.match(new URL("./index.html", self.registration.scope).href)))
  );
});
