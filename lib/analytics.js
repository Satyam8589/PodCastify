import {
  Visitor,
  ContentInteraction,
  AnalyticsStats,
} from "@/lib/models/Analytics";
import connectToDatabase from "@/lib/mongoose";

export class AnalyticsService {
  // Track a page visit
  static async trackVisit(req, page) {
    try {
      await connectToDatabase();

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
      await connectToDatabase();

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
      await connectToDatabase();

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const overall = new Date(2020, 0, 1); // Overall stats from 2020

      // Get visitor stats
      const [dailyVisitors, weeklyVisitors, monthlyVisitors, overallVisitors] =
        await Promise.all([
          this.getVisitorStats(today, now),
          this.getVisitorStats(thisWeek, now),
          this.getVisitorStats(thisMonth, now),
          this.getVisitorStats(overall, now),
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

      // Get real content counts from database
      const contentCounts = await this.getContentCounts();

      // Get trend data for better insights
      const trends = await this.getTrendData();

      return {
        visitors: {
          daily: dailyVisitors,
          weekly: weeklyVisitors,
          monthly: monthlyVisitors,
          overall: overallVisitors,
        },
        interactions: {
          daily: dailyInteractions,
          weekly: weeklyInteractions,
          monthly: monthlyInteractions,
        },
        topContent,
        deviceStats: this.calculatePercentages(deviceStats),
        browserStats: this.calculatePercentages(browserStats),
        contentCounts,
        trends,
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

  // Get content counts from database
  static async getContentCounts() {
    try {
      // Import models dynamically to avoid circular dependencies
      const { default: BlogPost } = await import("@/lib/models/BlogPost");
      const { default: Advertisement } = await import(
        "@/lib/models/Advertisement"
      );

      // For podcasts, we'll need to count from the podcasts.json file or create a Podcast model
      const fs = await import("fs").then((m) => m.promises);
      const path = await import("path");

      let podcastCount = 0;
      try {
        const podcastsPath = path.join(process.cwd(), "data", "podcasts.json");
        const podcastsData = await fs.readFile(podcastsPath, "utf8");
        const podcasts = JSON.parse(podcastsData);
        podcastCount = podcasts.length;
      } catch (error) {
        console.log("Could not read podcasts.json, using 0 for podcast count");
      }

      const [blogCount, adCount] = await Promise.all([
        BlogPost.countDocuments({}),
        Advertisement.countDocuments({}),
      ]);

      return {
        blogs: blogCount,
        podcasts: podcastCount,
        advertisements: adCount,
      };
    } catch (error) {
      console.error("Error getting content counts:", error);
      return {
        blogs: 0,
        podcasts: 0,
        advertisements: 0,
      };
    }
  }

  // Get trend data for analytics
  static async getTrendData() {
    try {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [thisWeekVisits, lastWeekVisits] = await Promise.all([
        this.getVisitorStats(lastWeek, now),
        this.getVisitorStats(twoWeeksAgo, lastWeek),
      ]);

      const visitorTrend =
        lastWeekVisits.totalVisits > 0
          ? (
              ((thisWeekVisits.totalVisits - lastWeekVisits.totalVisits) /
                lastWeekVisits.totalVisits) *
              100
            ).toFixed(1)
          : 0;

      return {
        visitorTrend: `${visitorTrend > 0 ? "+" : ""}${visitorTrend}%`,
        isPositiveTrend: visitorTrend >= 0,
      };
    } catch (error) {
      console.error("Error getting trend data:", error);
      return {
        visitorTrend: "0%",
        isPositiveTrend: true,
      };
    }
  }

  // Calculate percentages for stats
  static calculatePercentages(stats) {
    const total = Object.values(stats).reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      return stats;
    }

    const percentages = {};
    Object.entries(stats).forEach(([key, value]) => {
      percentages[key] = Math.round((value / total) * 100);
    });

    return percentages;
  }

  // Calculate percentages for stats
  static calculatePercentages(stats) {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return stats;

    const percentages = {};
    Object.entries(stats).forEach(([key, count]) => {
      percentages[key] = Math.round((count / total) * 100);
    });

    return percentages;
  }

  // Get content counts from database
  static async getContentCounts() {
    try {
      // Import models dynamically to avoid circular dependencies
      const BlogPost = (await import("@/lib/models/BlogPost")).default;
      const Advertisement = (await import("@/lib/models/Advertisement"))
        .default;

      // Get podcast count from data file
      const fs = require("fs");
      const path = require("path");
      let podcastCount = 0;

      try {
        const podcastDataPath = path.join(
          process.cwd(),
          "data",
          "podcasts.json"
        );
        const podcastData = JSON.parse(
          fs.readFileSync(podcastDataPath, "utf8")
        );
        podcastCount = Array.isArray(podcastData) ? podcastData.length : 0;
      } catch (error) {
        console.warn("Could not read podcast data:", error.message);
      }

      const [blogCount, adCount] = await Promise.all([
        BlogPost.countDocuments({}),
        Advertisement.countDocuments({}),
      ]);

      return {
        totalBlogs: blogCount,
        totalPodcasts: podcastCount,
        totalAdvertisements: adCount,
        totalContent: blogCount + podcastCount + adCount,
      };
    } catch (error) {
      console.error("Error getting content counts:", error);
      return {
        totalBlogs: 0,
        totalPodcasts: 0,
        totalAdvertisements: 0,
        totalContent: 0,
      };
    }
  }

  // Get trend data for comparison
  static async getTrendData() {
    try {
      const now = new Date();
      const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previousWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        currentWeekStats,
        previousWeekStats,
        currentMonthStats,
        previousMonthStats,
      ] = await Promise.all([
        this.getVisitorStats(currentWeek, now),
        this.getVisitorStats(previousWeek, currentWeek),
        this.getVisitorStats(currentMonth, now),
        this.getVisitorStats(previousMonth, endPreviousMonth),
      ]);

      return {
        weeklyGrowth: this.calculateGrowthRate(
          previousWeekStats.uniqueVisitors,
          currentWeekStats.uniqueVisitors
        ),
        monthlyGrowth: this.calculateGrowthRate(
          previousMonthStats.uniqueVisitors,
          currentMonthStats.uniqueVisitors
        ),
      };
    } catch (error) {
      console.error("Error getting trend data:", error);
      return {
        weeklyGrowth: 0,
        monthlyGrowth: 0,
      };
    }
  }

  // Calculate growth rate percentage
  static calculateGrowthRate(previous, current) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
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
