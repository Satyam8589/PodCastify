"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Settings,
  Check,
  X,
  Loader2,
  HelpCircle,
} from "lucide-react";
import NotificationTroubleshooter from "./NotificationTroubleshooter";
import PermissionHelper from "./PermissionHelper";

const NotificationManager = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [preferences, setPreferences] = useState({
    podcasts: true,
    blogs: true,
    advertisements: true,
  });
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [status, setStatus] = useState("");
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [showPermissionHelper, setShowPermissionHelper] = useState(false);

  // Helper function to create detailed permission instructions
  const createPermissionInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome")) {
      return "To enable: 1) Click the lock/info icon in the address bar, 2) Set 'Notifications' to 'Allow', 3) Refresh the page and try again.";
    } else if (userAgent.includes("firefox")) {
      return "To enable: 1) Click the shield icon in the address bar, 2) Click 'Turn off blocking for this site', 3) Refresh and try again.";
    } else if (userAgent.includes("edge")) {
      return "To enable: 1) Click the lock icon in the address bar, 2) Set 'Notifications' to 'Allow', 3) Refresh the page and try again.";
    } else if (userAgent.includes("safari")) {
      return "To enable: 1) Go to Safari > Preferences > Websites > Notifications, 2) Set this site to 'Allow', 3) Refresh and try again.";
    } else {
      return "Please check your browser settings to allow notifications for this site, then refresh the page and try again.";
    }
  };

  // Check if notifications can be granted (enhanced detection)
  const canGrantNotifications = () => {
    // Basic support check
    if (!("Notification" in window)) {
      return {
        canGrant: false,
        reason: "Notifications not supported in this browser",
      };
    }

    // Secure context check
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      return {
        canGrant: false,
        reason: "Notifications require HTTPS connection",
      };
    }

    // Permission status check
    const permission = Notification.permission;
    if (permission === "denied") {
      return {
        canGrant: false,
        reason: "Notifications are blocked by user or browser policy",
      };
    }

    // Check if permission request function exists
    if (typeof Notification.requestPermission !== "function") {
      return {
        canGrant: false,
        reason: "Browser does not support permission requests",
      };
    }

    return { canGrant: true, reason: "Notifications should be available" };
  };

  // Reset notification permissions (for testing)
  const resetPermissions = async () => {
    try {
      // Unsubscribe first
      if (subscription) {
        await unsubscribe();
      }

      // Clear all related data
      setIsSubscribed(false);
      setSubscription(null);
      setStatus("Permissions reset. Please try subscribing again.");

      // Clear status after 3 seconds
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Error resetting permissions:", error);
      setStatus(
        "Error resetting permissions. Please refresh the page and try again."
      );
    }
  };

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (!supported) {
        setStatus("Push notifications are not supported in this browser");
        return;
      }

      // Register service worker if not already registered
      try {
        if ("serviceWorker" in navigator) {
          // Check if service worker is already registered
          const existingRegistration =
            await navigator.serviceWorker.getRegistration();

          if (!existingRegistration) {
            console.log("No service worker found, attempting to register...");

            // Try to register the service worker
            try {
              const registration = await navigator.serviceWorker.register(
                "/sw.js"
              );
              console.log("Service worker registered:", registration);

              // Wait for the service worker to be ready
              await navigator.serviceWorker.ready;
            } catch (swError) {
              console.warn("Service worker registration failed:", swError);
              setStatus(
                "Service worker registration failed. Please refresh the page and try again."
              );
              return;
            }
          } else {
            console.log(
              "Service worker already registered:",
              existingRegistration
            );
          }
        }
      } catch (error) {
        console.error("Error checking/registering service worker:", error);
        setStatus(
          `Service worker error: ${error.message}. Some features may not work properly.`
        );
      }

      // Check current subscription status
      checkSubscriptionStatus();
    };

    checkSupport();
  }, []);

  // Check current subscription status
  const checkSubscriptionStatus = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        console.log("Service worker not supported");
        return;
      }

      console.log("Checking subscription status...");

      // Wait for service worker to be ready with timeout
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Service worker timeout")), 10000)
        ),
      ]);

      console.log("Service worker ready:", registration);

      const currentSubscription =
        await registration.pushManager.getSubscription();
      console.log("Current subscription:", currentSubscription);

      if (currentSubscription) {
        setSubscription(currentSubscription);
        setIsSubscribed(true);

        // Get preferences from server
        await loadPreferences(currentSubscription.endpoint);
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setStatus(`Error checking notification status: ${error.message}`);

      setTimeout(() => setStatus(""), 5000);
    }
  };

  // Helper function to detect browser and provide specific instructions
  const getBrowserSpecificInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome")) {
      return {
        browser: "Chrome",
        steps: [
          "Click the 🔒 lock icon or ⚙️ settings icon in the address bar",
          'Find "Notifications" in the permissions list',
          'Change from "Block" to "Allow"',
          "Refresh the page and try subscribing again",
        ],
      };
    } else if (userAgent.includes("firefox")) {
      return {
        browser: "Firefox",
        steps: [
          "Click the 🛡️ shield icon in the address bar",
          "Look for notification permissions",
          "Or go to Settings → Privacy & Security → Permissions → Notifications",
          "Remove this site from the exceptions list and refresh",
        ],
      };
    } else if (userAgent.includes("safari")) {
      return {
        browser: "Safari",
        steps: [
          "Go to Safari → Preferences → Websites → Notifications",
          "Find this website in the list",
          'Change the setting to "Allow"',
          "Refresh the page and try again",
        ],
      };
    } else if (userAgent.includes("edge")) {
      return {
        browser: "Edge",
        steps: [
          "Click the 🔒 lock icon in the address bar",
          'Click "Permissions for this site"',
          'Find "Notifications" and set to "Allow"',
          "Refresh the page and try subscribing again",
        ],
      };
    } else {
      return {
        browser: "Your Browser",
        steps: [
          "Look for a lock, shield, or settings icon in your address bar",
          "Click it to open site permissions",
          'Find notification settings and change to "Allow"',
          "Refresh the page and try again",
        ],
      };
    }
  };

  const loadPreferences = async (endpoint) => {
    try {
      const response = await fetch(
        `/api/notifications/preferences?endpoint=${encodeURIComponent(
          endpoint
        )}`
      );
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  // Subscribe to push notifications
  const subscribe = async () => {
    if (!isSupported) {
      setStatus("Push notifications are not supported");
      return;
    }

    // Enhanced pre-check before attempting subscription
    const availabilityCheck = canGrantNotifications();
    if (!availabilityCheck.canGrant) {
      setStatus(`❌ Cannot enable notifications: ${availabilityCheck.reason}`);
      setShowTroubleshooter(true);
      return;
    }

    setLoading(true);
    setStatus("Checking permission status...");

    // Add overall timeout for the entire subscription process
    const subscribeWithTimeout = async () => {
      try {
        // First check current permission status
        const currentPermission = Notification.permission;
        console.log("Current notification permission:", currentPermission);

        // Check if notifications are supported and available
        if (!("Notification" in window)) {
          setStatus("❌ Notifications are not supported in this browser");
          return;
        }

        // Check if we're in a secure context (HTTPS or localhost)
        if (
          !window.isSecureContext &&
          window.location.hostname !== "localhost"
        ) {
          setStatus(`
🔒 Notifications require HTTPS

Your connection is not secure. Notifications only work on:
📍 HTTPS websites (https://)
📍 Localhost for development
📍 Secure domains

SOLUTION: Access this site via HTTPS
          `);
          return;
        }

        if (currentPermission === "denied") {
          setStatus("❌ Notifications are permanently blocked for this site");
          setShowPermissionHelper(true);
          setShowTroubleshooter(true);

          setTimeout(() => {
            setStatus(`
🚫 NOTIFICATIONS BLOCKED - Here's how to fix it:

📍 QUICK FIX - Click the lock icon (🔒) next to the URL:
   → Find "Notifications" 
   → Change from "Block" to "Allow"
   → Refresh this page

⚙️ BROWSER SETTINGS METHOD:
   → Go to browser Settings
   → Search for "Site Settings" or "Notifications"
   → Find this website in blocked list
   → Remove or change to "Allow"

🔄 COMPLETE RESET:
   → Use the troubleshooter below
   → Close this tab completely
   → Clear browser data for this site
   → Reopen and allow notifications when prompted

💡 TIP: Look for notification icons in your address bar!
            `);
          }, 1000);

          return;
        }

        // Request notification permission
        setStatus("Requesting permission...");

        let permission;
        try {
          // Enhanced permission request with timeout and error handling
          permission = await Promise.race([
            new Promise((resolve) => {
              // If permission is already determined, don't show redundant prompts
              if (currentPermission !== "default") {
                resolve(currentPermission);
                return;
              }

              // For default state, request permission with better handling
              if (typeof Notification.requestPermission === "function") {
                Notification.requestPermission()
                  .then(resolve)
                  .catch(() => {
                    resolve("denied"); // If request fails, treat as denied
                  });
              } else {
                // Fallback for older browsers
                resolve("denied");
              }
            }),
            // Timeout after 10 seconds if no response
            new Promise((resolve) =>
              setTimeout(() => resolve("timeout"), 10000)
            ),
          ]);
        } catch (error) {
          console.error("Permission request failed:", error);
          permission = "denied";
        }

        console.log("Notification permission after request:", permission);

        // Handle different permission states with detailed guidance
        if (permission === "denied") {
          const instructions = createPermissionInstructions();
          setStatus(`🚫 Notifications are blocked. ${instructions}`);
          setShowPermissionHelper(true);
          setShowTroubleshooter(true);
          return;
        } else if (permission === "timeout") {
          setStatus(`
⏱️ Permission request timed out

This usually means:
📍 Browser blocked the permission popup
� Permission dialog was ignored or closed
📍 Browser security settings prevent notifications

SOLUTIONS:
🔧 Check if permission popup was blocked (look for popup blocker icon)
🔧 Manually enable notifications via browser settings
🔧 Try refreshing the page and allowing when prompted
🔧 Use the troubleshooter below for detailed instructions
          `);
          setShowPermissionHelper(true);
          setShowTroubleshooter(true);
          return;
        } else if (permission !== "granted") {
          setStatus(`
🔔 Permission not granted (Status: ${permission})

IMMEDIATE FIXES:
📍 Look for a notification permission popup that might be hidden
📍 Check if your browser blocked the permission request
📍 Click the 🔒 lock icon next to the website URL
📍 Find "Notifications" and change to "Allow"
📍 Refresh the page and try again

If you don't see permission options:
🔧 Your browser may have notifications globally disabled
🔧 Check browser settings → Privacy & Security → Notifications
🔧 Use the troubleshooter below for step-by-step help
          `);
          setShowPermissionHelper(true);
          setShowTroubleshooter(true);
          return;
        }

        setStatus("Getting configuration...");

        // Get VAPID public key
        const keyResponse = await fetch("/api/notifications", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Key response status:", keyResponse.status);

        if (!keyResponse.ok) {
          throw new Error(
            `Failed to get VAPID key: ${keyResponse.status} ${keyResponse.statusText}`
          );
        }

        const keyData = await keyResponse.json();
        console.log("Key data received:", keyData);

        if (!keyData.success) {
          throw new Error(
            keyData.error || "Failed to get notification configuration"
          );
        }

        if (!keyData.publicKey) {
          throw new Error("No VAPID public key received from server");
        }

        setStatus("Setting up service worker...");

        // Check if service worker is available
        if (!("serviceWorker" in navigator)) {
          throw new Error("Service Worker not supported");
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;
        console.log("Service worker ready:", registration);

        if (!registration) {
          throw new Error("Service worker not registered");
        }

        setStatus("Creating subscription...");

        // Subscribe to push notifications with timeout
        const newSubscription = await Promise.race([
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyData.publicKey,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Subscription timeout after 30 seconds")),
              30000
            )
          ),
        ]);

        console.log("Push subscription created:", newSubscription);

        setStatus("Saving subscription...");

        // Send subscription to server
        const subscribeResponse = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: newSubscription.toJSON(),
            preferences,
            userAgent: navigator.userAgent,
          }),
        });

        console.log("Subscribe response status:", subscribeResponse.status);

        if (!subscribeResponse.ok) {
          throw new Error(
            `Failed to save subscription: ${subscribeResponse.status} ${subscribeResponse.statusText}`
          );
        }

        const subscribeData = await subscribeResponse.json();
        console.log("Subscribe data received:", subscribeData);

        if (subscribeData.success) {
          setSubscription(newSubscription);
          setIsSubscribed(true);
          setStatus("Successfully subscribed to notifications!");

          // Clear status after 3 seconds
          setTimeout(() => setStatus(""), 3000);
        } else {
          throw new Error(subscribeData.error || "Failed to subscribe");
        }
      } catch (error) {
        console.error("Error subscribing to notifications:", error);

        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes("timeout")) {
          errorMessage =
            "Subscription took too long. Please check your connection and try again.";
        } else if (error.message.includes("not supported")) {
          errorMessage =
            "Push notifications are not supported in this browser.";
        } else if (error.message.includes("permission")) {
          errorMessage = "Please grant notification permission to subscribe.";
        } else if (error.message.includes("VAPID")) {
          errorMessage = "Server configuration error. Please contact support.";
        }

        setStatus(`Error: ${errorMessage}`);

        setTimeout(() => setStatus(""), 8000);
      }
    };

    try {
      // Overall timeout for entire process (60 seconds)
      await Promise.race([
        subscribeWithTimeout(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Overall subscription process timeout")),
            60000
          )
        ),
      ]);
    } catch (error) {
      console.error("Subscription process timeout:", error);
      setStatus(
        "Subscription process took too long. Please refresh the page and try again."
      );
      setTimeout(() => setStatus(""), 8000);
    } finally {
      setLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (!subscription) return;

    setLoading(true);
    setStatus("");

    try {
      // Unsubscribe from push notifications
      await subscription.unsubscribe();

      // Remove subscription from server
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(null);
        setIsSubscribed(false);
        setStatus("Successfully unsubscribed from notifications");
      } else {
        throw new Error(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences) => {
    if (!subscription) return;

    setLoading(true);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          preferences: newPreferences,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreferences(newPreferences);
        setStatus("Preferences updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test notification
  const testNotification = () => {
    if (!isSubscribed) {
      setStatus("Please subscribe to notifications first");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from PodCastify!",
        icon: "/icon-192x192.png",
        badge: "/icon-96x96.png",
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <BellOff className="text-yellow-600 mr-2" size={20} />
          <span className="text-yellow-800">
            Push notifications are not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Troubleshooter Modal */}
      {showTroubleshooter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowTroubleshooter(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
            >
              <X size={16} />
            </button>
            <NotificationTroubleshooter />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2" size={20} />
          Push Notifications
        </h3>

        <div className="flex items-center space-x-2">
          {isSupported && (
            <button
              onClick={() => setShowTroubleshooter(true)}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Need help with notifications?"
            >
              <HelpCircle size={16} />
            </button>
          )}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-gray-500 hover:text-gray-700"
            disabled={!isSubscribed}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Message */}
        {status && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status.includes("Error") ||
              status.includes("🚫") ||
              status.includes("blocked")
                ? "bg-red-50 text-red-700 border border-red-200"
                : status.includes("🔔") || status.includes("Permission needed")
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {status}
            </pre>

            {/* Show Try Again button when there's a permission issue */}
            {(status.includes("Permission needed") ||
              status.includes("not granted") ||
              status.includes("blocked")) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStatus("");
                    setShowPermissionHelper(false);
                    setShowTroubleshooter(false);
                    subscribe();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => {
                    setStatus("");
                    window.location.reload();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  🔄 Refresh Page
                </button>
                <button
                  onClick={() => setShowTroubleshooter(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  🛠️ Open Troubleshooter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Subscription Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {isSubscribed
                ? "Notifications Enabled"
                : "Notifications Disabled"}
            </p>
            <p className="text-sm text-gray-600">
              {isSubscribed
                ? "You will receive notifications for new content"
                : "Subscribe to get notified about new podcasts, blogs, and ads"}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {!isSubscribed && (
              <button
                onClick={() => {
                  const check = canGrantNotifications();
                  if (check.canGrant) {
                    setStatus(
                      "✅ Notifications are available! You can subscribe safely."
                    );
                  } else {
                    setStatus(
                      `❌ ${check.reason}\n\nUse the troubleshooter below for help enabling notifications.`
                    );
                    setShowTroubleshooter(true);
                  }
                  setTimeout(() => setStatus(""), 5000);
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition"
              >
                Check Permissions
              </button>
            )}

            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                isSubscribed
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : isSubscribed ? (
                <BellOff size={16} />
              ) : (
                <Bell size={16} />
              )}
              {loading
                ? "Processing..."
                : isSubscribed
                ? "Unsubscribe"
                : "Subscribe"}
            </button>
          </div>
        </div>

        {/* Preferences */}
        {showPreferences && isSubscribed && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Notification Preferences</h4>

            <div className="space-y-3">
              {Object.entries(preferences).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {key} Notifications
                  </span>
                  <button
                    onClick={() => {
                      const newPreferences = { ...preferences, [key]: !value };
                      updatePreferences(newPreferences);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      value ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>

            <button
              onClick={testNotification}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm transition"
            >
              Test Notification
            </button>
          </div>
        )}

        {/* Status and Help Section */}
        {status && (
          <div className="border-t pt-4">
            <div
              className={`p-3 rounded-lg text-sm ${
                status.includes("Successfully") ||
                status.includes("Test notification")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : status.includes("blocked") ||
                    status.includes("denied") ||
                    status.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {status}
            </div>

            {(status.includes("blocked") || status.includes("denied")) && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={resetPermissions}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded-lg text-sm transition"
                >
                  Reset & Try Again
                </button>
                <button
                  onClick={() => setShowTroubleshooter(true)}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg text-sm transition"
                >
                  Open Troubleshooter
                </button>
                <div className="text-xs text-gray-500">
                  Note: You may need to refresh the page after changing browser
                  settings
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Helper Modal */}
      <PermissionHelper
        show={showPermissionHelper}
        onClose={() => setShowPermissionHelper(false)}
      />
    </div>
  );
};

export default NotificationManager;
