"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Lock, RefreshCw, ExternalLink } from "lucide-react";

const PermissionHelper = ({ show, onClose }) => {
  const [browserInfo, setBrowserInfo] = useState(null);

  useEffect(() => {
    if (show) {
      detectBrowser();
    }
  }, [show]);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome")) {
      setBrowserInfo({
        name: "Chrome",
        icon: "🌐",
        lockIcon: "🔒",
        steps: [
          "Look for the 🔒 lock icon in your address bar (left side)",
          "Click on the lock icon",
          'Find "Notifications" in the dropdown menu',
          'Change from "Block" to "Allow"',
          "Refresh this page and try again",
        ],
        settingsPath: "chrome://settings/content/notifications",
      });
    } else if (userAgent.includes("firefox")) {
      setBrowserInfo({
        name: "Firefox",
        icon: "🦊",
        lockIcon: "🛡️",
        steps: [
          "Look for the 🛡️ shield icon in your address bar",
          "Click on it to open permissions",
          'Find "Receive Notifications" and enable it',
          "Or go to Settings → Privacy & Security → Permissions",
          "Refresh this page and try again",
        ],
        settingsPath: "about:preferences#privacy",
      });
    } else if (userAgent.includes("safari")) {
      setBrowserInfo({
        name: "Safari",
        icon: "🧭",
        lockIcon: "🔒",
        steps: [
          "Go to Safari menu → Preferences",
          'Click on "Websites" tab',
          'Select "Notifications" from left sidebar',
          'Find this website and set to "Allow"',
          "Refresh this page and try again",
        ],
        settingsPath: null,
      });
    } else if (userAgent.includes("edge")) {
      setBrowserInfo({
        name: "Edge",
        icon: "🔷",
        lockIcon: "🔒",
        steps: [
          "Click the 🔒 lock icon in your address bar",
          'Click "Permissions for this site"',
          'Find "Notifications" and set to "Allow"',
          "Refresh this page and try again",
        ],
        settingsPath: "edge://settings/content/notifications",
      });
    } else {
      setBrowserInfo({
        name: "Your Browser",
        icon: "🌐",
        lockIcon: "🔒",
        steps: [
          "Look for a lock or settings icon in your address bar",
          "Click it to open site permissions",
          "Find notification settings and enable them",
          "Refresh this page and try again",
        ],
        settingsPath: null,
      });
    }
  };

  const openBrowserSettings = () => {
    if (browserInfo?.settingsPath) {
      window.open(browserInfo.settingsPath, "_blank");
    }
  };

  const resetAndReload = () => {
    // Clear any cached permission data
    localStorage.removeItem("notificationSubscription");
    localStorage.removeItem("notificationPermission");

    // Unregister service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Show instructions and reload
    alert(`Service worker cleared. Please:
1. Close this tab completely
2. Clear your browser data for this site (optional)
3. Reopen the website
4. Click "Allow" when prompted for notifications`);

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!show || !browserInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={24} />
              <h3 className="text-lg font-semibold">Notifications Blocked</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-800 font-medium mb-2">
                {browserInfo.icon} {browserInfo.name} has blocked notifications
                for this site
              </p>
              <p className="text-red-700 text-sm">
                You need to manually allow notifications in your browser
                settings.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Lock className="mr-2" size={16} />
                Quick Fix Instructions:
              </h4>
              <ol className="space-y-2 text-sm text-blue-700">
                {browserInfo.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="font-medium mr-2 text-blue-500">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-gray-800">
                Still having trouble?
              </h4>

              <div className="grid gap-2">
                {browserInfo.settingsPath && (
                  <button
                    onClick={openBrowserSettings}
                    className="flex items-center justify-center w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg text-sm transition"
                  >
                    <ExternalLink className="mr-2" size={16} />
                    Open {browserInfo.name} Notification Settings
                  </button>
                )}

                <button
                  onClick={resetAndReload}
                  className="flex items-center justify-center w-full bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 px-4 rounded-lg text-sm transition"
                >
                  <RefreshCw className="mr-2" size={16} />
                  Reset Everything & Restart
                </button>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <strong>💡 Pro Tip:</strong> When the browser asks for
                permission, make sure to click "Allow" not "Block" or "Not now".
                Some browsers remember your choice permanently.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionHelper;
