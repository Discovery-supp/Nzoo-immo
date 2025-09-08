// Service Worker pour les notifications push
const CACHE_NAME = 'nzoo-immo-v1';
const STATIC_CACHE = 'nzoo-immo-static-v1';
const DYNAMIC_CACHE = 'nzoo-immo-dynamic-v1';

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/logo-nzoo-immo-header.svg',
        '/icons/calendar-reminder.png',
        '/icons/calendar-update.png',
        '/icons/payment-success.png',
        '/icons/payment-failed.png'
      ]);
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Suppression du cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la réponse du cache si disponible
      if (response) {
        return response;
      }
      
      // Sinon, faire la requête réseau
      return fetch(event.request).then((response) => {
        // Mettre en cache les requêtes réussies
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      });
    })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notification push reçue', event);
  
  let notificationData = {
    title: 'N\'zoo Immo',
    body: 'Vous avez une nouvelle notification',
    icon: '/logo-nzoo-immo-header.svg',
    badge: '/logo-nzoo-immo-header.svg',
    tag: 'nzoo-notification',
    requireInteraction: false,
    silent: false,
    data: {}
  };
  
  // Récupérer les données de la notification si disponibles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Erreur lors du parsing des données de notification:', error);
    }
  }
  
  // Afficher la notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Ouvrir',
          icon: '/icons/open.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icons/close.png'
        }
      ]
    })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clic sur notification', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Ouvrir l'application ou une page spécifique
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focaliser
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification fermée', event);
  
  // Marquer la notification comme lue dans la base de données
  if (event.notification.data?.notificationId) {
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId
      })
    }).catch(error => {
      console.error('Erreur lors du marquage de la notification:', error);
    });
  }
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message reçu', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Synchronisation', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Effectuer des tâches de synchronisation
      syncNotifications()
    );
  }
});

// Fonction de synchronisation des notifications
async function syncNotifications() {
  try {
    // Récupérer les nouvelles notifications depuis le serveur
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const notifications = await response.json();
      
      // Afficher les nouvelles notifications
      for (const notification of notifications) {
        await self.registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          tag: notification.tag,
          data: notification.data
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
}

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('Service Worker: Erreur', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Promesse rejetée non gérée', event.reason);
});
