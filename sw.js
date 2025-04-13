self.addEventListener('install', event => {
  console.log('📦 Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activated');
});

self.addEventListener('fetch', event => {
  // You can cache responses here for offline access
  // For now, just let the network handle it
});
