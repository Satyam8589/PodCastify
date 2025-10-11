import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongoose";
import Podcast from "@/lib/models/Podcast";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(file) {
  try {
    console.log("Starting Cloudinary upload for podcast...");
    console.log("Cloudinary config check:", {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("File buffer size:", buffer.length);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "podcast-images",
            transformation: [
              { width: 800, height: 600, crop: "fill" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success:", {
                url: result.secure_url,
                public_id: result.public_id,
              });
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

// GET - Retrieve all podcasts
export async function GET(request) {
  try {
    console.log("GET /api/podcasts called");

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset") || "0";

    console.log("Query params:", { limit, offset });

    let podcasts = [];
    let total = 0;

    try {
      // Use MongoDB only
      await connectToDatabase();

      let query = Podcast.find({});
      query = query.sort({ createdAt: -1 });

      if (limit) {
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        query = query.skip(offsetNum).limit(limitNum);
      }

      const mongoDbPodcasts = await query.exec();
      total = await Podcast.countDocuments();

      // Transform MongoDB documents to ensure consistent ID field
      podcasts = mongoDbPodcasts.map((podcast) => {
        const podcastObj = podcast.toObject();
        return {
          id: podcastObj._id.toString(), // Ensure ID is a string
          title: podcastObj.title,
          description: podcastObj.description,
          podcastLink: podcastObj.podcastLink,
          date: podcastObj.date,
          time: podcastObj.time,
          thumbnail: podcastObj.thumbnail,
          createdAt: podcastObj.createdAt,
          updatedAt: podcastObj.updatedAt,
        };
      });
    } catch (dbError) {
      console.error("MongoDB connection failed:", dbError.message);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to database",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      data: podcasts,
      total,
      hasMore: limit ? parseInt(offset) + parseInt(limit) < total : false,
    };

    console.log("Returning response:", {
      success: response.success,
      dataCount: response.data.length,
      total: response.total,
      hasMore: response.hasMore,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/podcasts:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch podcasts: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Create new podcast
export async function POST(request) {
  try {
    console.log("POST /api/podcasts called");

    await connectToDatabase();

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title");
    const description = formData.get("description");
    const podcastLink = formData.get("podcastLink");
    const date = formData.get("date");
    const time = formData.get("time");
    const thumbnailFile = formData.get("thumbnail");

    console.log("Form data received:", {
      title,
      description,
      podcastLink,
      date,
      time,
      hasFile: !!thumbnailFile,
    });

    // Validate required fields
    if (!title || !description || !podcastLink || !date || !time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate podcast link format
    try {
      new URL(podcastLink);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid podcast link URL" },
        { status: 400 }
      );
    }

    // Handle thumbnail upload to Cloudinary
    let thumbnailData = {
      url: "/images/default-podcast.jpg",
      public_id: "default-podcast",
    };

    if (thumbnailFile && thumbnailFile.size > 0) {
      // Validate file type
      if (!thumbnailFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Please upload a valid image file" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (thumbnailFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image file must be smaller than 5MB" },
          { status: 400 }
        );
      }

      try {
        thumbnailData = await uploadToCloudinary(thumbnailFile);
      } catch (error) {
        console.error("Thumbnail upload failed:", error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Helper function to slugify string (same as in model)
    function slugify(text) {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
    }

    // Generate unique slug
    const baseSlug = slugify(title.trim());
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for existing slugs and make it unique
    while (await Podcast.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new podcast object
    const newPodcast = new Podcast({
      title: title.trim(),
      description: description.trim(),
      podcastLink: podcastLink.trim(),
      date: date,
      time: time,
      thumbnail: thumbnailData,
      slug: uniqueSlug,
    });

    // Save to database
    const savedPodcast = await newPodcast.save();

    console.log("New podcast created successfully:", savedPodcast._id);

    // Send push notifications to subscribers
    try {
      const { sendPushNotificationToAll, createPodcastNotification } =
        await import("../../../lib/pushNotification");
      const NotificationSubscription = (
        await import("../../../lib/models/NotificationSubscription")
      ).default;

      // Get all active subscribers who want podcast notifications
      const activeSubscriptions =
        await NotificationSubscription.getActiveSubscriptionsFor("podcasts");

      if (activeSubscriptions.length > 0) {
        console.log(
          `Sending push notifications to ${activeSubscriptions.length} subscribers`
        );

        // Create notification payload
        const notificationPayload = createPodcastNotification({
          id: savedPodcast._id.toString(),
          title: savedPodcast.title,
          description: savedPodcast.description,
          thumbnail: savedPodcast.thumbnail,
        });

        // Send notifications to all subscribers
        const notificationResults = await sendPushNotificationToAll(
          activeSubscriptions.map((sub) => ({
            endpoint: sub.endpoint,
            keys: sub.keys,
          })),
          notificationPayload
        );

        console.log("Push notification results:", notificationResults);

        // Update last notified timestamp for successful notifications
        const successfulEndpoints = notificationResults
          .filter((result) => result.success)
          .map((result) => result.subscription);

        if (successfulEndpoints.length > 0) {
          await NotificationSubscription.updateMany(
            { endpoint: { $in: successfulEndpoints } },
            { lastNotified: new Date() }
          );
        }
      } else {
        console.log("No active podcast subscribers found");
      }
    } catch (notificationError) {
      console.error("Error sending push notifications:", notificationError);
      // Don't fail the podcast creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: "Podcast uploaded successfully!",
      data: savedPodcast,
    });
  } catch (error) {
    console.error("Error in POST /api/podcasts:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationErrors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to create podcast: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing podcast
export async function PUT(request) {
  try {
    console.log("PUT /api/podcasts called");

    await connectToDatabase();

    const formData = await request.formData();
    const id = formData.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Podcast ID is required" },
        { status: 400 }
      );
    }

    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return NextResponse.json(
        { success: false, error: "Podcast not found" },
        { status: 404 }
      );
    }

    // Extract and update fields
    const title = formData.get("title");
    const description = formData.get("description");
    const podcastLink = formData.get("podcastLink");
    const date = formData.get("date");
    const time = formData.get("time");
    const thumbnailFile = formData.get("thumbnail");

    // Update basic fields
    if (title) podcast.title = title.trim();
    if (description) podcast.description = description.trim();
    if (podcastLink) {
      try {
        new URL(podcastLink);
        podcast.podcastLink = podcastLink.trim();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid podcast link URL" },
          { status: 400 }
        );
      }
    }
    if (date) podcast.date = date;
    if (time) podcast.time = time;

    // Handle new thumbnail upload
    if (thumbnailFile && thumbnailFile.size > 0) {
      // Validate file type
      if (!thumbnailFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Please upload a valid image file" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (thumbnailFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image file must be smaller than 5MB" },
          { status: 400 }
        );
      }

      try {
        // Delete old image from Cloudinary if it's not the default
        if (
          podcast.thumbnail.public_id &&
          podcast.thumbnail.public_id !== "default-podcast"
        ) {
          await cloudinary.uploader.destroy(podcast.thumbnail.public_id);
        }

        // Upload new image
        const thumbnailData = await uploadToCloudinary(thumbnailFile);
        podcast.thumbnail = thumbnailData;
      } catch (error) {
        console.error("Thumbnail upload failed:", error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    const updatedPodcast = await podcast.save();

    console.log("Podcast updated successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Podcast updated successfully!",
      data: updatedPodcast,
    });
  } catch (error) {
    console.error("Error in PUT /api/podcasts:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validationErrors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to update podcast: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete podcast
export async function DELETE(request) {
  try {
    console.log("DELETE /api/podcasts called");

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Podcast ID is required" },
        { status: 400 }
      );
    }

    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return NextResponse.json(
        { success: false, error: "Podcast not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it's not the default
    if (
      podcast.thumbnail.public_id &&
      podcast.thumbnail.public_id !== "default-podcast"
    ) {
      try {
        await cloudinary.uploader.destroy(podcast.thumbnail.public_id);
        console.log(
          "Deleted image from Cloudinary:",
          podcast.thumbnail.public_id
        );
      } catch (error) {
        console.warn("Failed to delete image from Cloudinary:", error);
      }
    }

    await Podcast.findByIdAndDelete(id);

    console.log("Podcast deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Podcast deleted successfully!",
    });
  } catch (error) {
    console.error("Error in DELETE /api/podcasts:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete podcast: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
