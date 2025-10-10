"use client";

import React, { useState, useEffect } from "react";
import { Download, Wifi, WifiOff, X } from "lucide-react";

const PWAFeatures = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showOnlineNotification, setShowOnlineNotification] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
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
  }, []);

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
    </>
  );
};

export default PWAFeatures;
