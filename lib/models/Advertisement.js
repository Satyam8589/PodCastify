import mongoose from "mongoose";

const AdvertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxLength: 150,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    link: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Please enter a valid URL",
      },
    },
    category: {
      type: String,
      required: true,
      enum: ["product", "service", "event", "promotion", "brand", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "featured"],
      default: "medium",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: function () {
        // Default to 30 days from start date
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    impressionCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    targetAudience: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      min: 0,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to slugify string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

// Pre-save middleware to generate slug from title
AdvertisementSchema.pre("save", async function (next) {
  if (this.isModified("title") || !this.slug) {
    let baseSlug = slugify(this.title || "advertisement");
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for existing slugs and make it unique
    while (
      await this.constructor.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id },
      })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
  }
  next();
});

// Index for better query performance
AdvertisementSchema.index({ isActive: 1, priority: -1, createdAt: -1 });
AdvertisementSchema.index({ category: 1, isActive: 1 });
AdvertisementSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Advertisement ||
  mongoose.model("Advertisement", AdvertisementSchema);
