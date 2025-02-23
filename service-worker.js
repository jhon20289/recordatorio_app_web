// service-worker.js
     self.addEventListener('install', event => {
       console.log('Service Worker instalado!');
     });

     self.addEventListener('push', event => {
       const data = event.data.json();
       self.registration.showNotification(data.title, {
         body: data.body,
         icon: 'images/icon.png'
       });
     });
