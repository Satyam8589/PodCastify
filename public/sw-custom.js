// Custom Service Worker for PodCastify
// This extends the default next-pwa service worker with custom functionality

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// ===== PUSH NOTIFICATION HANDLERS =====

// Handle push notification events
self.addEventListener("push", function (event) {
  console.log("Push notification received:", event);

  if (!event.data) {
    console.log("Push event without data");
    return;
  }

  try {
    const data = event.data.json();
    console.log("Push notification data:", data);

    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      badge: data.badge || "/icon-96x96.png",
      image: data.image,
      data: data.data,
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      tag: data.tag || "default",
      timestamp: data.data?.timestamp || Date.now(),
      vibrate: [200, 100, 200], // Vibration pattern for mobile
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error("Error handling push notification:", error);

    // Show a fallback notification
    event.waitUntil(
      self.registration.showNotification("New Update Available!", {
        body: "Check out the latest content on PodCastify",
        icon: "/icon-192x192.png",
        badge: "/icon-96x96.png",
        tag: "fallback",
      })
    );
  }
});

// Handle notification click events
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === "dismiss") {
    return; // Just close the notification
  }

  // Default action or specific action handling
  let url = "/";

  if (data.url) {
    url = data.url;
  } else if (data.type === "podcast" && data.id) {
    url = `/podcast/${data.id}`;
  } else if (data.type === "blog" && data.id) {
    url = `/blogs/${data.id}`;
  } else if (data.type === "advertisement") {
    url = "/advertisement";
  }

  // Handle specific actions
  if (action === "listen" || action === "read" || action === "view") {
    // These actions use the default URL
  }

  // Open the app/page
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        // Try to focus existing window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              if ("navigate" in client) {
                return client.navigate(url);
              }
            });
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close events
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);

  // Optional: Track notification close analytics
  const data = event.notification.data || {};
  if (data.type) {
    console.log(`Notification closed: ${data.type}`, data);
  }
});

// ===== CACHING STRATEGIES =====

// Cache API responses with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Cache images with stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache audio files (podcasts) with cache-first strategy
registerRoute(
  ({ request }) => request.destination === "audio",
  new CacheFirst({
    cacheName: "audio-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Cache external resources (fonts, CDN assets)
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com" ||
    url.origin === "https://res.cloudinary.com",
  new CacheFirst({
    cacheName: "external-resources",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache navigation requests with network-first strategy
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Handle offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open("pages").then((cache) => {
          return cache.match("/offline") || cache.match("/");
        });
      })
    );
  }
});

// Background sync for form submissions when online
self.addEventListener("sync", (event) => {
  if (event.tag === "contact-form-sync") {
    event.waitUntil(
      // Handle queued form submissions when back online
      syncContactForm()
    );
  }
});

// Function to sync contact form submissions
async function syncContactForm() {
  try {
    const cache = await caches.open("form-submissions");
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes("/api/contact")) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.log("Failed to sync form submission:", error);
        }
      }
    }
  } catch (error) {
    console.log("Background sync failed:", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon-96x96.jpg",
      badge: "/favicon-96x96.jpg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "Go to PodCastify",
          icon: "/favicon-96x96.jpg",
        },
        {
          action: "close",
          title: "Close notification",
          icon: "/favicon-96x96.jpg",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

console.log("PodCastify Service Worker loaded successfully!");
