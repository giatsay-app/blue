/* Blue Laundry — lưu app vào máy để mở nhanh và dùng được khi mất mạng */
var CACHE = 'blue-laundry-v1';
var FILES = ['./', 'index.html', 'nhanvien.html', 'quanly.html',
             'icon-nhanvien.png', 'icon-quanly.png', 'staff.webmanifest', 'manager.webmanifest'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  /* Dữ liệu Firebase và Telegram luôn đi thẳng ra mạng, không được lưu tạm */
  if (url.indexOf('firebasedatabase.app') >= 0 || url.indexOf('googleapis.com') >= 0 || url.indexOf('telegram.org') >= 0) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return res;
    }).catch(function(){ return caches.match(e.request).then(function(r){ return r || caches.match('index.html'); }); })
  );
});
