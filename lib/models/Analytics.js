import mongoose from "mongoose";

// Schema for tracking website visits
const VisitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  page: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  sessionId: {
    type: String,
    required: true,
  },
  country: String,
  city: String,
  device: String,
  browser: String,
});

// Schema for tracking content interactions
const ContentInteractionSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ["podcast", "blog", "advertisement"],
    required: true,
  },
  contentId: {
    type: String,
    required: true,
  },
  contentTitle: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    enum: ["view", "click", "play", "read", "share"],
    required: true,
  },
  ip: String,
  userAgent: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  duration: Number, // in seconds for podcasts/videos
});

// Schema for tracking daily, weekly, monthly stats
const AnalyticsStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  },
  visitors: {
    unique: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  pageViews: { type: Number, default: 0 },
  podcastClicks: { type: Number, default: 0 },
  blogReads: { type: Number, default: 0 },
  advertisementClicks: { type: Number, default: 0 },
  topContent: [
    {
      contentType: String,
      contentId: String,
      title: String,
      views: Number,
    },
  ],
  deviceStats: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
  },
  browserStats: {
    chrome: { type: Number, default: 0 },
    firefox: { type: Number, default: 0 },
    safari: { type: Number, default: 0 },
    edge: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
});

const Visitor =
  mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
const ContentInteraction =
  mongoose.models.ContentInteraction ||
  mongoose.model("ContentInteraction", ContentInteractionSchema);
const AnalyticsStats =
  mongoose.models.AnalyticsStats ||
  mongoose.model("AnalyticsStats", AnalyticsStatsSchema);

export { Visitor, ContentInteraction, AnalyticsStats };
