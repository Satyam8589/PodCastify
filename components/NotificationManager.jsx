"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, Settings, Check, X, Loader2 } from "lucide-react";

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

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (!supported) {
        setStatus("Push notifications are not supported in this browser");
        return;
      }

      // Check current subscription status
      checkSubscriptionStatus();
    };

    checkSupport();
  }, []);

  // Check current subscription status
  const checkSubscriptionStatus = async () => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const currentSubscription =
        await registration.pushManager.getSubscription();

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
      setStatus("Error checking notification status");
    }
  };

  // Load preferences from server
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

    setLoading(true);
    setStatus("");

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Notification permission denied");
        setLoading(false);
        return;
      }

      // Get VAPID public key
      const keyResponse = await fetch("/api/notifications");
      const keyData = await keyResponse.json();

      if (!keyData.success) {
        throw new Error(
          keyData.error || "Failed to get notification configuration"
        );
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyData.publicKey,
      });

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

      const subscribeData = await subscribeResponse.json();

      if (subscribeData.success) {
        setSubscription(newSubscription);
        setIsSubscribed(true);
        setStatus("Successfully subscribed to notifications!");
      } else {
        throw new Error(subscribeData.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      setStatus(`Error: ${error.message}`);
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2" size={20} />
          Push Notifications
        </h3>

        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="text-gray-500 hover:text-gray-700"
          disabled={!isSubscribed}
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Status Message */}
        {status && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {status}
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
      </div>
    </div>
  );
};

export default NotificationManager;
