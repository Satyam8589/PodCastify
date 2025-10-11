// Simple Service Worker for PodCastify Push Notifications
console.log("PodCastify Service Worker starting...");

// Install event
self.addEventListener("install", function (event) {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", function (event) {
  console.log("Service Worker activating...");
  event.waitUntil(clients.claim());
});

// Push notification event handler
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
      icon: data.icon || "/web-app-manifest-192x192.png",
      badge: data.badge || "/favicon-96x96.jpg",
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
        icon: "/web-app-manifest-192x192.png",
        badge: "/favicon-96x96.jpg",
        tag: "fallback",
      })
    );
  }
});

// Handle notification click events
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  // Handle different actions
  if (
    event.action === "listen" ||
    event.action === "read" ||
    event.action === "view"
  ) {
    // Open the specific content
    const url = data.url || "/";
    event.waitUntil(clients.openWindow(url));
  } else if (event.action === "dismiss") {
    // Just close the notification (already done above)
    console.log("Notification dismissed");
  } else {
    // Default click action - open the app
    const url = data.url || "/";
    event.waitUntil(
      clients.matchAll().then(function (clientList) {
        // Check if there's already a window/tab open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle notification close events
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event);
  // You could track notification close events here if needed
});

console.log("PodCastify Service Worker loaded successfully!");