/* MY ARCHIVE v9.4.1 — opt-in PWA update, with cache isolation and offline fallback. */
const APP_CACHE='my-archive-static-v9.4.1';
const PRECACHE=['./index.html','./manifest.webmanifest','./release.json','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(APP_CACHE);
  await cache.addAll(PRECACHE);
  const clients=await self.clients.matchAll({includeUncontrolled:true});
  for(const client of clients)client.postMessage({type:'MY_ARCHIVE_UPDATE_READY',version:'9.4.0'});
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('my-archive-static-')&&name!==APP_CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type==='MY_ARCHIVE_ACTIVATE_UPDATE')self.skipWaiting();
 if(['MY_ARCHIVE_GET_VERSION','MY_ARCHIVE_CHECK_VERSION'].includes(event.data?.type)){
  const reply={type:'MY_ARCHIVE_VERSION',version:'9.4.0'};
  if(event.ports?.[0])event.ports[0].postMessage(reply);
  else event.source?.postMessage(reply);
 }
});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const u=new URL(req.url),scope=new URL(self.registration.scope);
 if(u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(APP_CACHE);
  if(req.mode==='navigate'){
   const index=await cache.match(new URL('index.html',scope));
   if(index)return index;
   try{return await fetch(req)}catch(_){return Response.error()}
  }
  const cached=await cache.match(req);if(cached)return cached;
  try{return await fetch(req)}catch(_){return Response.error()}
 })());
});
