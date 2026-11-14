/* Offline support: the app and its photos are kept on the phone; map tiles you've viewed stay available. */
const V='hb-v5',SHELL=['./','index.html','manifest.json','icons/icon-192.png?v=4','icons/icon-512.png?v=4','icons/favicon-64.png?v=4'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='hb-tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const TILE=/arcgisonline\.com|tile\.openstreetmap\.org|upload\.wikimedia\.org|cdn\.jsdelivr\.net/;
async function trimTiles(c){const ks=await c.keys();if(ks.length>1500)for(const k of ks.slice(0,ks.length-1500))await c.delete(k)}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){ // fresh when online, cached when not
      e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));return}
    if(/\.webm$/.test(u.pathname)||r.headers.has('range'))return;
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));return}
  if(TILE.test(u.host)){e.respondWith(caches.open('hb-tiles').then(async c=>{const m=await c.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){c.put(r,res.clone());trimTiles(c)}return res}).catch(()=>m);return m||net}))}
});
