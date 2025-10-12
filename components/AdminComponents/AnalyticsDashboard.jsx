"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Eye,
  MousePointer,
  BookOpen,
  Mic,
  Megaphone,
  TrendingUp,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Compass,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics?type=dashboard");
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", data.error);
        // Set dummy data for demo
        setAnalytics(getDummyData());
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set dummy data for demo
      setAnalytics(getDummyData());
    } finally {
      setLoading(false);
    }
  };

  const getDummyData = () => ({
    visitors: {
      daily: { totalVisits: 127, uniqueVisitors: 89 },
      weekly: { totalVisits: 1456, uniqueVisitors: 892 },
      monthly: { totalVisits: 6789, uniqueVisitors: 3456 },
    },
    interactions: {
      daily: { podcast: 45, blog: 23, advertisement: 12 },
      weekly: { podcast: 345, blog: 234, advertisement: 123 },
      monthly: { podcast: 1567, blog: 987, advertisement: 456 },
    },
    topContent: [
      { contentType: "podcast", title: "Tech Talk #15", views: 234 },
      { contentType: "blog", title: "AI in 2025", views: 189 },
      { contentType: "podcast", title: "Career Growth Tips", views: 156 },
      { contentType: "blog", title: "Web Development Trends", views: 134 },
      {
        contentType: "advertisement",
        title: "Premium Course Offer",
        views: 98,
      },
    ],
    deviceStats: { mobile: 45, desktop: 35, tablet: 20 },
    browserStats: { chrome: 60, firefox: 20, safari: 15, edge: 3, other: 2 },
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 text-sm font-medium">
                {trend}
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("border-l-", "bg-")
            .replace("-500", "-100")}`}
        >
          <Icon className={`h-8 w-8 ${color.replace("border-l-", "text-")}`} />
        </div>
      </div>
    </div>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Stats Row */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 text-purple-500" size={20} />
          Overall Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Visitors"
            value={formatNumber(analytics?.visitors?.overall?.uniqueVisitors)}
            subtitle="All time"
            icon={Users}
            color="border-l-purple-500"
          />
          <StatCard
            title="Total Blogs"
            value={analytics?.contentCounts?.blogs || 0}
            subtitle="Published"
            icon={BookOpen}
            color="border-l-yellow-500"
          />
          <StatCard
            title="Total Podcasts"
            value={analytics?.contentCounts?.podcasts || 0}
            subtitle="Available"
            icon={Mic}
            color="border-l-red-500"
          />
          <StatCard
            title="Total Ads"
            value={analytics?.contentCounts?.advertisements || 0}
            subtitle="Active"
            icon={Megaphone}
            color="border-l-indigo-500"
          />
        </div>
      </div>

      {/* Visitor Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2 text-blue-500" size={20} />
          Website Visitors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Today"
            value={formatNumber(analytics?.visitors?.daily?.uniqueVisitors)}
            subtitle={`${
              analytics?.visitors?.daily?.totalVisits || 0
            } total visits`}
            icon={Calendar}
            color="border-l-blue-500"
            trend={
              analytics?.trends?.weeklyGrowth > 0
                ? `+${analytics.trends.weeklyGrowth}%`
                : `${analytics?.trends?.weeklyGrowth || 0}%`
            }
          />
          <StatCard
            title="This Week"
            value={formatNumber(analytics?.visitors?.weekly?.uniqueVisitors)}
            subtitle={`${
              analytics?.visitors?.weekly?.totalVisits || 0
            } total visits`}
            icon={Clock}
            color="border-l-green-500"
            trend={
              analytics?.trends?.weeklyGrowth > 0
                ? `+${analytics.trends.weeklyGrowth}%`
                : `${analytics?.trends?.weeklyGrowth || 0}%`
            }
          />
          <StatCard
            title="This Month"
            value={formatNumber(analytics?.visitors?.monthly?.uniqueVisitors)}
            subtitle={`${
              analytics?.visitors?.monthly?.totalVisits || 0
            } total visits`}
            icon={BarChart3}
            color="border-l-purple-500"
            trend={
              analytics?.trends?.monthlyGrowth > 0
                ? `+${analytics.trends.monthlyGrowth}%`
                : `${analytics?.trends?.monthlyGrowth || 0}%`
            }
          />
        </div>
      </div>

      {/* Content Engagement */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MousePointer className="mr-2 text-green-500" size={20} />
          Content Engagement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Podcast Plays"
            value={formatNumber(analytics?.interactions?.monthly?.podcast)}
            subtitle="This month"
            icon={Mic}
            color="border-l-red-500"
          />
          <StatCard
            title="Blog Reads"
            value={formatNumber(analytics?.interactions?.monthly?.blog)}
            subtitle="This month"
            icon={BookOpen}
            color="border-l-yellow-500"
          />
          <StatCard
            title="Ad Clicks"
            value={formatNumber(
              analytics?.interactions?.monthly?.advertisement
            )}
            subtitle="This month"
            icon={Megaphone}
            color="border-l-indigo-500"
          />
        </div>
      </div>

      {/* Daily Engagement */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Podcast Clicks</p>
                <p className="text-2xl font-bold text-red-500">
                  {analytics?.interactions?.daily?.podcast || 0}
                </p>
              </div>
              <Mic className="text-red-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Blog Reads</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {analytics?.interactions?.daily?.blog || 0}
                </p>
              </div>
              <BookOpen className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ad Clicks</p>
                <p className="text-2xl font-bold text-indigo-500">
                  {analytics?.interactions?.daily?.advertisement || 0}
                </p>
              </div>
              <Megaphone className="text-indigo-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTopContent = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="mr-2 text-orange-500" size={20} />
        Top Performing Content
      </h3>
      <div className="space-y-4">
        {analytics?.topContent?.slice(0, 10).map((content, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <span className="text-sm font-semibold text-gray-600">
                  {index + 1}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {content.contentType === "podcast" && (
                  <Mic className="text-red-500" size={16} />
                )}
                {content.contentType === "blog" && (
                  <BookOpen className="text-yellow-500" size={16} />
                )}
                {content.contentType === "advertisement" && (
                  <Megaphone className="text-indigo-500" size={16} />
                )}
                <div>
                  <p className="font-medium text-gray-800">{content.title}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {content.contentType}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{content.views}</p>
              <p className="text-sm text-gray-500">views</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeviceStats = () => (
    <div className="space-y-6">
      {/* Device Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Monitor className="mr-2 text-blue-500" size={20} />
          Device Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Monitor className="mx-auto text-blue-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-blue-600">
              {analytics?.deviceStats?.desktop || 0}%
            </p>
            <p className="text-gray-600">Desktop</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Smartphone className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-green-600">
              {analytics?.deviceStats?.mobile || 0}%
            </p>
            <p className="text-gray-600">Mobile</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Tablet className="mx-auto text-purple-500 mb-2" size={32} />
            <p className="text-2xl font-bold text-purple-600">
              {analytics?.deviceStats?.tablet || 0}%
            </p>
            <p className="text-gray-600">Tablet</p>
          </div>
        </div>
      </div>

      {/* Browser Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Chrome className="mr-2 text-orange-500" size={20} />
          Browser Usage
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics?.browserStats || {}).map(
            ([browser, percentage]) => (
              <div key={browser} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {browser === "chrome" && (
                    <Chrome className="text-blue-500" size={20} />
                  )}
                  {browser === "firefox" && (
                    <Globe className="text-orange-500" size={20} />
                  )}
                  {browser === "safari" && (
                    <Compass className="text-blue-400" size={20} />
                  )}
                  {browser === "edge" && (
                    <Monitor className="text-blue-600" size={20} />
                  )}
                  {browser === "other" && (
                    <Eye className="text-gray-500" size={20} />
                  )}
                  <span className="capitalize font-medium">{browser}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="mr-3 text-blue-500" size={28} />
          Website Analytics
        </h2>
        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "content"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("content")}
        >
          Top Content
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "devices"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("devices")}
        >
          Devices & Browsers
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "content" && renderTopContent()}
      {activeTab === "devices" && renderDeviceStats()}
    </div>
  );
};

export default AnalyticsDashboard;
