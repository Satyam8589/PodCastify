"use client";

import React, { useState, useEffect } from "react";
import { Download, Wifi, WifiOff, X, Shield, Smartphone } from "lucide-react";

const PWAFeatures = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);
  const [showManualInstallInfo, setShowManualInstallInfo] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if we're on localhost or HTTPS
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const isHTTPS = window.location.protocol === "https:";

      console.log("PWA Install Check:", {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isLocalhost,
        isHTTPS,
        canShowPrompt: isLocalhost || isHTTPS,
      });

      if (isLocalhost || isHTTPS) {
        setShowInstallPrompt(true);
      } else {
        console.warn(
          "PWA install prompt blocked: HTTPS required for network access"
        );
      }
    };

    // Handle online/offline status
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      if (!isOnline && online) {
        // Just came back online
        setShowOnlineNotification(true);
        setTimeout(() => setShowOnlineNotification(false), 3000);
      }
      setIsOnline(online);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      console.log("App installed successfully");
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Initial checks
    checkInstalled();
    handleOnlineStatus();

    // Register service worker manually if needed
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Log PWA readiness info
    console.log("PWA Readiness Check:", {
      serviceWorker: "serviceWorker" in navigator,
      manifest: document.querySelector('link[rel="manifest"]') !== null,
      isSecureContext: window.isSecureContext,
      location: window.location.href,
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to avoid showing again soon
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Check if install prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }

    // Show manual install info if not localhost and not HTTPS
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const isHTTPS = window.location.protocol === "https:";

    if (!isLocalhost && !isHTTPS && !isInstalled) {
      // Delay showing manual install info to avoid overwhelming the user
      setTimeout(() => {
        const manualDismissed = localStorage.getItem(
          "manual-install-dismissed"
        );
        if (!manualDismissed) {
          setShowManualInstallInfo(true);
        }
      }, 5000);
    }
  }, [isInstalled]);

  const dismissManualInstallInfo = () => {
    setShowManualInstallInfo(false);
    localStorage.setItem("manual-install-dismissed", Date.now().toString());
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're offline. Some features may not be available.
            </span>
          </div>
        </div>
      )}

      {/* Online Indicator (brief notification when coming back online) */}
      {showOnlineNotification && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-50 transition-opacity duration-300">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">
              Back online! All features are available.
            </span>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && !isInstalled && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Install PodCastify
                </h4>
                <p className="text-sm text-gray-600">Get the app experience</p>
              </div>
            </div>
            <button
              onClick={dismissInstallPrompt}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Install PodCastify for faster access, offline reading, and a native
            app experience.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Install App
            </button>
            <button
              onClick={dismissInstallPrompt}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Manual Install Instructions (for non-HTTPS network access) */}
      {showManualInstallInfo && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">
                  Install PodCastify App
                </h4>
                <p className="text-sm text-blue-700">
                  Manual Installation Guide
                </p>
              </div>
            </div>
            <button
              onClick={dismissManualInstallInfo}
              className="text-blue-400 hover:text-blue-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium">HTTPS Required</p>
                <p className="text-xs text-blue-600">
                  PWA installation requires a secure connection when accessed
                  over the network.
                </p>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <p className="font-medium mb-2">Manual Installation Steps:</p>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>Chrome/Edge:</strong> Menu → "Install PodCastify" or
                  "Add to Home Screen"
                </p>
                <p>
                  <strong>Safari:</strong> Share button → "Add to Home Screen"
                </p>
                <p>
                  <strong>Firefox:</strong> Menu → "Install" (if available)
                </p>
              </div>
            </div>

            <div className="bg-blue-100 rounded p-2 text-xs">
              <p>
                <strong>Tip:</strong> For the best experience, access this site
                via HTTPS or deploy to a secure hosting platform.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={dismissManualInstallInfo}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAFeatures;
