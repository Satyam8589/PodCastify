// Test script for notification system functionality
// Run this in the browser console to test notifications

console.log("🔔 PodCastify Notification System Test");

// Test 1: Check notification support
function testNotificationSupport() {
  console.log("\n1. Testing Notification Support:");

  const supported =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  console.log("✅ Service Worker supported:", "serviceWorker" in navigator);
  console.log("✅ Push Manager supported:", "PushManager" in window);
  console.log("✅ Notifications supported:", "Notification" in window);
  console.log("📱 Overall support:", supported);

  return supported;
}

// Test 2: Check VAPID key endpoint
async function testVapidEndpoint() {
  console.log("\n2. Testing VAPID Key Endpoint:");

  try {
    const response = await fetch("/api/notifications");
    const data = await response.json();

    console.log("📡 API Response:", data);
    console.log("🔑 VAPID Key available:", !!data.publicKey);

    return data.success && data.publicKey;
  } catch (error) {
    console.error("❌ VAPID endpoint error:", error);
    return false;
  }
}

// Test 3: Test notification permission
async function testNotificationPermission() {
  console.log("\n3. Testing Notification Permission:");

  try {
    const permission = await Notification.requestPermission();
    console.log("🔔 Permission status:", permission);

    return permission === "granted";
  } catch (error) {
    console.error("❌ Permission error:", error);
    return false;
  }
}

// Test 4: Test simple browser notification
async function testBrowserNotification() {
  console.log("\n4. Testing Browser Notification:");

  if (Notification.permission === "granted") {
    try {
      // Use service worker registration for notifications
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("🎉 Test Notification", {
        body: "PodCastify notification system is working!",
        icon: "/web-app-manifest-192x192.png",
        badge: "/favicon-96x96.jpg",
        tag: "test-script",
      });
      console.log("✅ Test notification sent via service worker");
      return true;
    } catch (error) {
      console.error("❌ Error showing notification:", error);
      return false;
    }
  } else {
    console.log("❌ Permission not granted");
    return false;
  }
}

// Test 5: Test service worker registration
async function testServiceWorker() {
  console.log("\n5. Testing Service Worker:");

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker registered:", !!registration);
      console.log("📋 Registration details:", registration);

      return !!registration;
    } else {
      console.log("❌ Service Worker not supported");
      return false;
    }
  } catch (error) {
    console.error("❌ Service Worker error:", error);
    return false;
  }
}

// Test 6: Test push subscription
async function testPushSubscription() {
  console.log("\n6. Testing Push Subscription:");

  try {
    // Get VAPID key
    const keyResponse = await fetch("/api/notifications");
    const keyData = await keyResponse.json();

    if (!keyData.success || !keyData.publicKey) {
      console.log("❌ VAPID key not available");
      return false;
    }

    // Get service worker
    const registration = await navigator.serviceWorker.ready;

    // Test subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyData.publicKey,
    });

    console.log("✅ Push subscription created:", !!subscription);
    console.log("📋 Subscription details:", subscription.toJSON());

    // Clean up - unsubscribe
    await subscription.unsubscribe();
    console.log("🧹 Test subscription cleaned up");

    return true;
  } catch (error) {
    console.error("❌ Push subscription error:", error);
    return false;
  }
}

// Test 7: Test subscription API
async function testSubscriptionAPI() {
  console.log("\n7. Testing Subscription API:");

  try {
    // Create a test subscription
    const keyResponse = await fetch("/api/notifications");
    const keyData = await keyResponse.json();

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyData.publicKey,
    });

    // Test API subscription
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: {
          podcasts: true,
          blogs: true,
          advertisements: true,
        },
        userAgent: navigator.userAgent,
      }),
    });

    const data = await response.json();
    console.log("✅ Subscription API response:", data);

    // Test unsubscription
    const unsubResponse = await fetch("/api/notifications", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    const unsubData = await unsubResponse.json();
    console.log("✅ Unsubscription API response:", unsubData);

    // Clean up
    await subscription.unsubscribe();

    return data.success && unsubData.success;
  } catch (error) {
    console.error("❌ Subscription API error:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting PodCastify Notification System Tests...\n");

  const results = {
    support: testNotificationSupport(),
    vapidEndpoint: await testVapidEndpoint(),
    permission: await testNotificationPermission(),
    browserNotification: testBrowserNotification(),
    serviceWorker: await testServiceWorker(),
    pushSubscription: await testPushSubscription(),
    subscriptionAPI: await testSubscriptionAPI(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log("========================");

  Object.entries(results).forEach(([test, passed]) => {
    console.log(
      `${passed ? "✅" : "❌"} ${test}: ${passed ? "PASSED" : "FAILED"}`
    );
  });

  const allPassed = Object.values(results).every((result) => result);

  console.log(
    "\n🎯 Overall Status:",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"
  );

  if (allPassed) {
    console.log("🎉 Notification system is fully functional!");
  } else {
    console.log("⚠️ Please check failed tests and configuration");
  }

  return results;
}

// Export for use
window.testNotifications = runAllTests;

console.log("📋 Notification test script loaded!");
console.log("💡 Run 'testNotifications()' in console to start tests");
