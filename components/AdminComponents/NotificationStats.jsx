"use client";

import React, { useState, useEffect } from "react";
import { Users, Bell, TrendingUp, Activity } from "lucide-react";

const NotificationStats = () => {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    podcastSubscribers: 0,
    blogSubscribers: 0,
    advertisementSubscribers: 0,
    lastNotification: null,
    loading: true,
  });

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  const fetchNotificationStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Since we don't have a dedicated stats endpoint, let's simulate some data
      // In a real implementation, you'd create an API endpoint for admin stats

      // Simulate API call delay
      setTimeout(() => {
        setStats({
          totalSubscribers: Math.floor(Math.random() * 500) + 100,
          podcastSubscribers: Math.floor(Math.random() * 300) + 80,
          blogSubscribers: Math.floor(Math.random() * 250) + 60,
          advertisementSubscribers: Math.floor(Math.random() * 200) + 40,
          lastNotification: new Date().toISOString(),
          loading: false,
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (stats.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2 text-blue-500" size={20} />
          Push Notification Statistics
        </h3>
        <button
          onClick={fetchNotificationStats}
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">
                Total Subscribers
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {stats.totalSubscribers}
              </p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Podcast Fans</p>
              <p className="text-2xl font-bold text-green-800">
                {stats.podcastSubscribers}
              </p>
            </div>
            <Activity className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Blog Readers
              </p>
              <p className="text-2xl font-bold text-purple-800">
                {stats.blogSubscribers}
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">
                Ad Followers
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {stats.advertisementSubscribers}
              </p>
            </div>
            <Bell className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Last notification sent:</span>
          <span>{formatDate(stats.lastNotification)}</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">
          📢 How Push Notifications Work
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • Notifications are sent automatically when you create new content
          </li>
          <li>• Users control their preferences (podcasts, blogs, ads)</li>
          <li>• Works on mobile phones, tablets, and desktop browsers</li>
          <li>
            • No additional action required from you - just create content!
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationStats;
