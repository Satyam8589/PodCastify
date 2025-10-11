import {
  Visitor,
  ContentInteraction,
  AnalyticsStats,
} from "@/lib/models/Analytics";
import connectDB from "@/lib/config/mongodb";

export class AnalyticsService {
  // Track a page visit
  static async trackVisit(req, page) {
    try {
      await connectDB();

      // Get IP address from various possible headers
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.headers["cf-connecting-ip"] ||
        req.ip ||
        "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      const sessionId =
        req.headers["x-session-id"] || `session_${Date.now()}_${Math.random()}`;

      // Extract device and browser info
      const device = this.getDeviceType(userAgent);
      const browser = this.getBrowserType(userAgent);

      const visit = new Visitor({
        ip,
        userAgent,
        page,
        sessionId,
        device,
        browser,
      });

      await visit.save();
      return visit;
    } catch (error) {
      console.error("Error tracking visit:", error);
      return null;
    }
  }

  // Track content interaction
  static async trackContentInteraction(
    contentType,
    contentId,
    contentTitle,
    actionType,
    req
  ) {
    try {
      await connectDB();

      // Get IP address from various possible headers
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.headers["cf-connecting-ip"] ||
        req.ip ||
        "unknown";
      const userAgent = req.headers["user-agent"] || "unknown";
      const sessionId =
        req.headers["x-session-id"] || `session_${Date.now()}_${Math.random()}`;

      const interaction = new ContentInteraction({
        contentType,
        contentId,
        contentTitle,
        actionType,
        ip,
        userAgent,
        sessionId,
      });

      await interaction.save();
      return interaction;
    } catch (error) {
      console.error("Error tracking content interaction:", error);
      return null;
    }
  }

  // Get analytics data for dashboard
  static async getDashboardAnalytics() {
    try {
      await connectDB();

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get visitor stats
      const [dailyVisitors, weeklyVisitors, monthlyVisitors] =
        await Promise.all([
          this.getVisitorStats(today, now),
          this.getVisitorStats(thisWeek, now),
          this.getVisitorStats(thisMonth, now),
        ]);

      // Get content interaction stats
      const [dailyInteractions, weeklyInteractions, monthlyInteractions] =
        await Promise.all([
          this.getInteractionStats(today, now),
          this.getInteractionStats(thisWeek, now),
          this.getInteractionStats(thisMonth, now),
        ]);

      // Get top content
      const topContent = await this.getTopContent(thisMonth, now);

      // Get device and browser stats
      const deviceStats = await this.getDeviceStats(thisMonth, now);
      const browserStats = await this.getBrowserStats(thisMonth, now);

      return {
        visitors: {
          daily: dailyVisitors,
          weekly: weeklyVisitors,
          monthly: monthlyVisitors,
        },
        interactions: {
          daily: dailyInteractions,
          weekly: weeklyInteractions,
          monthly: monthlyInteractions,
        },
        topContent,
        deviceStats,
        browserStats,
      };
    } catch (error) {
      console.error("Error getting dashboard analytics:", error);
      return null;
    }
  }

  // Helper method to get visitor stats
  static async getVisitorStats(startDate, endDate) {
    const visitors = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$ip" },
        },
      },
      {
        $project: {
          totalVisits: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
        },
      },
    ]);

    return visitors[0] || { totalVisits: 0, uniqueVisitors: 0 };
  }

  // Helper method to get interaction stats
  static async getInteractionStats(startDate, endDate) {
    const interactions = await ContentInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$contentType",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      podcast: 0,
      blog: 0,
      advertisement: 0,
    };

    interactions.forEach((item) => {
      stats[item._id] = item.count;
    });

    return stats;
  }

  // Get top performing content
  static async getTopContent(startDate, endDate) {
    return await ContentInteraction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            contentType: "$contentType",
            contentId: "$contentId",
            title: "$contentTitle",
          },
          views: { $sum: 1 },
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          contentType: "$_id.contentType",
          contentId: "$_id.contentId",
          title: "$_id.title",
          views: 1,
        },
      },
    ]);
  }

  // Get device statistics
  static async getDeviceStats(startDate, endDate) {
    const devices = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    };

    devices.forEach((item) => {
      stats[item._id] = item.count;
    });

    return stats;
  }

  // Get browser statistics
  static async getBrowserStats(startDate, endDate) {
    const browsers = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$browser",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      chrome: 0,
      firefox: 0,
      safari: 0,
      edge: 0,
      other: 0,
    };

    browsers.forEach((item) => {
      if (stats.hasOwnProperty(item._id)) {
        stats[item._id] = item.count;
      } else {
        stats.other += item.count;
      }
    });

    return stats;
  }

  // Utility methods
  static getDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|ios|iphone|ipad/.test(ua)) {
      if (/ipad|tablet/.test(ua)) return "tablet";
      return "mobile";
    }
    return "desktop";
  }

  static getBrowserType(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes("chrome")) return "chrome";
    if (ua.includes("firefox")) return "firefox";
    if (ua.includes("safari")) return "safari";
    if (ua.includes("edge")) return "edge";
    return "other";
  }
}
