// Push notification service for sending notifications to users
import webpush from "web-push";

// Configure web-push with VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    "mailto:your-email@example.com", // Replace with your email
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(subscription, payload) {
  try {
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.warn("VAPID keys not configured, skipping push notification");
      return { success: false, error: "VAPID keys not configured" };
    }

    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log("Push notification sent successfully:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendPushNotificationToAll(subscriptions, payload) {
  const results = [];

  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      results.push({ subscription: subscription.endpoint, ...result });
    } catch (error) {
      results.push({
        subscription: subscription.endpoint,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Create notification payload for new podcast
 */
export function createPodcastNotification(podcast) {
  return {
    title: "🎙️ New Podcast Available!",
    body: `"${podcast.title}" - Listen now on PodCastify`,
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    image:
      podcast.thumbnail?.url ||
      podcast.thumbnail ||
      "/images/default-podcast.jpg",
    data: {
      type: "podcast",
      id: podcast.id || podcast._id,
      url: `/podcast/${podcast.id || podcast._id}`,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "listen",
        title: "Listen Now",
        icon: "/icons/play.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/close.png",
      },
    ],
    requireInteraction: true,
    tag: "new-podcast",
  };
}

/**
 * Create notification payload for new blog post
 */
export function createBlogNotification(blog) {
  return {
    title: "📝 New Blog Post!",
    body: `"${blog.title}" - Read the latest insights`,
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    image: blog.image?.url || blog.image || "/images/default-blog.jpg",
    data: {
      type: "blog",
      id: blog.id || blog._id,
      url: `/blogs/${blog.id || blog._id}`,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "read",
        title: "Read Now",
        icon: "/icons/read.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/close.png",
      },
    ],
    requireInteraction: true,
    tag: "new-blog",
  };
}

/**
 * Create notification payload for new advertisement
 */
export function createAdvertisementNotification(ad) {
  return {
    title: "📢 New Advertisement!",
    body: `"${ad.title}" - Check out this opportunity`,
    icon: "/icon-192x192.png",
    badge: "/icon-96x96.png",
    image: ad.image?.url || ad.image || "/images/default-ad.jpg",
    data: {
      type: "advertisement",
      id: ad.id || ad._id,
      url: `/advertisement`,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "view",
        title: "View Details",
        icon: "/icons/view.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/close.png",
      },
    ],
    requireInteraction: true,
    tag: "new-advertisement",
  };
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey() {
  return vapidKeys.publicKey;
}
