"use client";

import React from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

const OfflinePage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Offline Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            It looks like you've lost your internet connection. Don't worry! You
            can still browse some content that's been cached for offline
            viewing.
          </p>

          {/* Available Features */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Available Offline:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Previously viewed pages</li>
              <li>• Cached podcast thumbnails</li>
              <li>• Blog posts you've read</li>
              <li>• Basic navigation</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
          </div>

          {/* Tips */}
          <div className="mt-6 text-xs text-gray-500">
            <p>
              💡 Tip: Once you're back online, pages will automatically update
              with the latest content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
