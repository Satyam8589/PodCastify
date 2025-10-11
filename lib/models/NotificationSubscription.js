import mongoose from "mongoose";

const NotificationSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    userAgent: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: {
      podcasts: {
        type: Boolean,
        default: true,
      },
      blogs: {
        type: Boolean,
        default: true,
      },
      advertisements: {
        type: Boolean,
        default: true,
      },
    },
    lastNotified: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for better performance
NotificationSubscriptionSchema.index({ endpoint: 1 });
NotificationSubscriptionSchema.index({ isActive: 1 });

// Method to check if subscription is valid
NotificationSubscriptionSchema.methods.isValid = function () {
  return this.endpoint && this.keys && this.keys.p256dh && this.keys.auth;
};

// Static method to get active subscriptions for a specific content type
NotificationSubscriptionSchema.statics.getActiveSubscriptionsFor = function (
  contentType
) {
  const query = { isActive: true };

  if (contentType) {
    query[`preferences.${contentType}`] = true;
  }

  return this.find(query);
};

// Static method to cleanup invalid subscriptions
NotificationSubscriptionSchema.statics.cleanupInvalidSubscriptions =
  function () {
    return this.deleteMany({
      $or: [
        { endpoint: { $exists: false } },
        { endpoint: "" },
        { "keys.p256dh": { $exists: false } },
        { "keys.p256dh": "" },
        { "keys.auth": { $exists: false } },
        { "keys.auth": "" },
      ],
    });
  };

const NotificationSubscription =
  mongoose.models.NotificationSubscription ||
  mongoose.model("NotificationSubscription", NotificationSubscriptionSchema);

export default NotificationSubscription;
