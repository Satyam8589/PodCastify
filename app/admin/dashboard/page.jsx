import Maintanance from "@/components/Maintanance";
import NotificationStats from "@/components/AdminComponents/NotificationStats";
import AnalyticsDashboard from "@/components/AdminComponents/AnalyticsDashboard";
import LiveStats from "@/components/AdminComponents/LiveStats";
import React from "react";

const page = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Live Real-time Stats */}
      <LiveStats />

      {/* Website Analytics */}
      <AnalyticsDashboard />

      {/* Notification Statistics */}
      <NotificationStats />

      {/* Maintenance Section */}
      <Maintanance />
    </div>
  );
};

export default page;
