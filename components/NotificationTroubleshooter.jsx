"use client";

import React, { useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const NotificationTroubleshooter = () => {
  const [step, setStep] = useState(0);
  const [testResults, setTestResults] = useState({});

  const steps = [
    {
      title: "Check Browser Support",
      test: () => {
        const supported =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        return {
          passed: supported,
          message: supported
            ? "Browser supports notifications"
            : "Browser doesn't support push notifications",
        };
      },
    },
    {
      title: "Check Service Worker",
      test: async () => {
        try {
          if (!("serviceWorker" in navigator)) {
            return { passed: false, message: "Service Worker not supported" };
          }

          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            return { passed: true, message: "Service Worker is registered" };
          } else {
            // Try to register
            await navigator.serviceWorker.register("/sw.js");
            return {
              passed: true,
              message: "Service Worker registered successfully",
            };
          }
        } catch (error) {
          return {
            passed: false,
            message: `Service Worker error: ${error.message}`,
          };
        }
      },
    },
    {
      title: "Check Notification Permission",
      test: () => {
        const permission = Notification.permission;
        return {
          passed: permission === "granted",
          message: `Permission status: ${permission}`,
          action:
            permission === "denied"
              ? "reset"
              : permission === "default"
              ? "request"
              : null,
        };
      },
    },
    {
      title: "Test Basic Notification",
      test: async () => {
        try {
          if (Notification.permission === "granted") {
            // Use service worker registration for notifications
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification("Test Notification", {
              body: "This is a test notification from PodCastify",
              icon: "/web-app-manifest-192x192.png",
              badge: "/favicon-96x96.jpg",
              tag: "troubleshooter-test",
            });
            return {
              passed: true,
              message: "Test notification sent successfully",
            };
          } else {
            return {
              passed: false,
              message: "Cannot send notification - permission not granted",
            };
          }
        } catch (error) {
          return {
            passed: false,
            message: `Notification error: ${error.message}`,
          };
        }
      },
    },
  ];

  const runTest = async (index) => {
    const test = steps[index];
    const result = await test.test();
    setTestResults((prev) => ({ ...prev, [index]: result }));

    if (result.passed && index < steps.length - 1) {
      setTimeout(() => setStep(index + 1), 1000);
    }
  };

  const resetAllPermissions = async () => {
    try {
      // Clear test results
      setTestResults({});
      setStep(0);

      // Unregister service worker
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }

      alert(
        "Service worker unregistered. Please:\n1. Close this tab\n2. Go to browser settings and reset permissions for this site\n3. Reopen the site and try again"
      );
    } catch (error) {
      console.error("Reset error:", error);
      alert(
        "Manual reset required. Please clear your browser data for this site and try again."
      );
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome")) {
      return {
        title: "Chrome Instructions",
        steps: [
          "Click the lock icon in the address bar",
          "Find 'Notifications' in the permissions list",
          "Change it from 'Block' to 'Allow'",
          "Refresh the page and try again",
        ],
      };
    } else if (userAgent.includes("firefox")) {
      return {
        title: "Firefox Instructions",
        steps: [
          "Click the shield icon in the address bar",
          "Click 'Turn off Tracking Protection for this site'",
          "Or go to Settings > Privacy & Security > Permissions > Notifications",
          "Remove this site from blocked list and refresh",
        ],
      };
    } else {
      return {
        title: "General Instructions",
        steps: [
          "Look for a notification/bell icon in your address bar",
          "Click it and select 'Allow notifications'",
          "If not available, check browser settings for notification permissions",
          "Remove this site from any blocked lists and refresh",
        ],
      };
    }
  };

  const instructions = getBrowserInstructions();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <AlertTriangle className="text-orange-500 mr-2" size={20} />
        <h3 className="text-lg font-semibold">Notification Troubleshooter</h3>
      </div>

      <div className="space-y-4">
        {steps.map((stepInfo, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${
              index === step
                ? "border-blue-500 bg-blue-50"
                : testResults[index]
                ? testResults[index].passed
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{stepInfo.title}</span>
              {testResults[index] ? (
                testResults[index].passed ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <XCircle className="text-red-500" size={16} />
                )
              ) : index === step ? (
                <button
                  onClick={() => runTest(index)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                >
                  Test
                </button>
              ) : null}
            </div>

            {testResults[index] && (
              <div className="mt-2 text-sm text-gray-600">
                {testResults[index].message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Browser-specific instructions */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-medium mb-2">{instructions.title}</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          {instructions.steps.map((step, index) => (
            <li key={index} className="flex">
              <span className="text-blue-500 mr-2">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Enhanced help for denied permissions */}
      {testResults[2] &&
        !testResults[2].passed &&
        testResults[2].details?.includes("denied") && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-start">
              <div className="text-red-500 mr-2">🚫</div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">
                  Notifications Are Blocked
                </h4>
                <p className="text-red-700 text-sm mb-3">
                  You previously blocked notifications. Here are 3 ways to fix
                  this:
                </p>

                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded border border-red-200">
                    <strong className="text-red-800">
                      🔒 Quick Fix - Address Bar:
                    </strong>
                    <div className="mt-1 text-red-700">
                      Click the lock icon (🔒) or blocked icon (🚫) next to the
                      URL → Find "Notifications" → Change to "Allow" → Refresh
                      page
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-red-200">
                    <strong className="text-red-800">
                      ⚙️ Browser Settings:
                    </strong>
                    <div className="mt-1 text-red-700">
                      Browser Settings → Privacy/Security → Site Settings →
                      Notifications → Remove this site from blocked list
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-red-200">
                    <strong className="text-red-800">🔄 Complete Reset:</strong>
                    <div className="mt-1 text-red-700">
                      Click "Reset Everything" below → Close tab → Clear site
                      data → Reopen site → Click "Allow" when prompted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Reset button */}
      <div className="mt-6 space-y-2">
        <button
          onClick={resetAllPermissions}
          className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg text-sm transition flex items-center justify-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Reset Everything & Start Over
        </button>
        <div className="text-xs text-gray-500 text-center">
          This will clear all notification data and require you to restart the
          browser
        </div>
      </div>
    </div>
  );
};

export default NotificationTroubleshooter;
