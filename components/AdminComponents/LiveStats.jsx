"use client";

import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, Users, Eye } from "lucide-react";

const LiveStats = () => {
  const [stats, setStats] = useState({
    onlineUsers: 0,
    todayVisits: 0,
    realtimeClicks: 0,
    activePages: [],
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        onlineUsers: Math.max(1, Math.floor(Math.random() * 50) + 10),
        todayVisits: prev.todayVisits + Math.floor(Math.random() * 3),
        realtimeClicks: prev.realtimeClicks + Math.floor(Math.random() * 2),
        activePages: [
          { page: "/podcast", users: Math.floor(Math.random() * 15) + 5 },
          { page: "/blogs", users: Math.floor(Math.random() * 10) + 3 },
          { page: "/", users: Math.floor(Math.random() * 20) + 8 },
          { page: "/news", users: Math.floor(Math.random() * 8) + 2 },
        ].sort((a, b) => b.users - a.users),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Activity className="mr-2 text-green-500" size={20} />
        Real-Time Activity
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <Users className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.onlineUsers}
          </p>
          <p className="text-sm text-gray-600">Online Now</p>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Eye className="mx-auto text-blue-600 mb-2" size={20} />
          <p className="text-2xl font-bold text-blue-600">
            {stats.todayVisits}
          </p>
          <p className="text-sm text-gray-600">Today's Visits</p>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="mx-auto text-purple-600 mb-2" size={20} />
          <p className="text-2xl font-bold text-purple-600">
            {stats.realtimeClicks}
          </p>
          <p className="text-sm text-gray-600">Total Clicks</p>
        </div>

        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Activity className="mx-auto text-orange-600 mb-2" size={20} />
          <p className="text-2xl font-bold text-orange-600">
            {stats.activePages.reduce((sum, page) => sum + page.users, 0)}
          </p>
          <p className="text-sm text-gray-600">Active Sessions</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-800 mb-3">Most Active Pages</h4>
        <div className="space-y-2">
          {stats.activePages.slice(0, 4).map((page, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
            >
              <span className="text-sm font-medium text-gray-700">
                {page.page}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600">
                  {page.users} users
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
