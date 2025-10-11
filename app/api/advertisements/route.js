import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/mongoose";
import Advertisement from "@/lib/models/Advertisement";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(file) {
  try {
    console.log("Starting Cloudinary upload for advertisement...");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "advertisement-images",
            transformation: [
              { width: 1200, height: 800, crop: "fill" },
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

// GET - Retrieve all advertisements
export async function GET(request) {
  try {
    console.log("GET /api/advertisements called");

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset") || "0";
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const active = searchParams.get("active");

    console.log("Query params:", { limit, offset, category, priority, active });

    // Build query
    let query = {};

    // Filter by active status
    if (active !== null && active !== undefined) {
      query.isActive = active === "true";
    } else {
      query.isActive = true; // Default to active ads only
    }

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by priority
    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Filter by date range (only show active campaigns)
    const now = new Date();
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };

    let mongoQuery = Advertisement.find(query);

    // Sort by priority (featured first, then high, medium, low) and creation date
    // We'll use aggregation to properly sort by priority order
    const advertisements = await Advertisement.aggregate([
      { $match: query },
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "featured"] }, then: 4 },
                { case: { $eq: ["$priority", "high"] }, then: 3 },
                { case: { $eq: ["$priority", "medium"] }, then: 2 },
                { case: { $eq: ["$priority", "low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityOrder: -1, createdAt: -1 } },
      { $skip: limit ? parseInt(offset) : 0 },
      ...(limit ? [{ $limit: parseInt(limit) }] : []),
    ]);

    const total = await Advertisement.countDocuments(query);

    const response = {
      success: true,
      data: advertisements,
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
    console.error("Error in GET /api/advertisements:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch advertisements: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Create new advertisement
export async function POST(request) {
  try {
    console.log("POST /api/advertisements called");

    await connectToDatabase();

    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const link = formData.get("link");
    const category = formData.get("category") || "other";
    const priority = formData.get("priority") || "medium";
    const targetAudience = formData.get("targetAudience");
    const budget = formData.get("budget");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const tags = formData.get("tags");
    const imageFile = formData.get("image");

    console.log("Form data received:", {
      title,
      description,
      shortDescription,
      link,
      category,
      priority,
      hasFile: !!imageFile,
    });

    // Validate required fields
    if (!title || !description || !shortDescription || !link) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, description, short description, and link are required",
        },
        { status: 400 }
      );
    }

    // Validate link format
    try {
      new URL(link);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid link URL" },
        { status: 400 }
      );
    }

    // Validate short description length
    if (shortDescription.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error: "Short description must be 150 characters or less",
        },
        { status: 400 }
      );
    }

    // Handle image upload to Cloudinary
    let imageData = {
      url: "/images/default-ad.jpg",
      public_id: "default-ad",
    };

    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Please upload a valid image file" },
          { status: 400 }
        );
      }

      // Validate file size (10MB limit for ads)
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image file must be smaller than 10MB" },
          { status: 400 }
        );
      }

      try {
        imageData = await uploadToCloudinary(imageFile);
      } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Generate unique slug
    const baseSlug = slugify(title.trim());
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await Advertisement.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Prepare advertisement data
    const adData = {
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      link: link.trim(),
      category,
      priority,
      image: imageData,
      slug: uniqueSlug,
    };

    // Add optional fields
    if (targetAudience) adData.targetAudience = targetAudience.trim();
    if (budget) adData.budget = parseFloat(budget);
    if (startDate) adData.startDate = new Date(startDate);
    if (endDate) adData.endDate = new Date(endDate);
    if (tags) {
      try {
        adData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch {
        adData.tags = [];
      }
    }

    // Create new advertisement
    const newAdvertisement = new Advertisement(adData);
    const savedAdvertisement = await newAdvertisement.save();

    console.log(
      "New advertisement created successfully:",
      savedAdvertisement._id
    );

    // Send push notifications to subscribers
    try {
      const { sendPushNotificationToAll, createAdvertisementNotification } =
        await import("../../../lib/pushNotification");
      const NotificationSubscription = (
        await import("../../../lib/models/NotificationSubscription")
      ).default;

      // Get all active subscribers who want advertisement notifications
      const activeSubscriptions =
        await NotificationSubscription.getActiveSubscriptionsFor(
          "advertisements"
        );

      if (activeSubscriptions.length > 0) {
        console.log(
          `Sending advertisement push notifications to ${activeSubscriptions.length} subscribers`
        );

        // Create notification payload
        const notificationPayload = createAdvertisementNotification({
          id: savedAdvertisement._id.toString(),
          title: savedAdvertisement.title,
          description: savedAdvertisement.description,
          image: savedAdvertisement.image,
        });

        // Send notifications to all subscribers
        const notificationResults = await sendPushNotificationToAll(
          activeSubscriptions.map((sub) => ({
            endpoint: sub.endpoint,
            keys: sub.keys,
          })),
          notificationPayload
        );

        console.log(
          "Advertisement push notification results:",
          notificationResults
        );

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
        console.log("No active advertisement subscribers found");
      }
    } catch (notificationError) {
      console.error(
        "Error sending advertisement push notifications:",
        notificationError
      );
      // Don't fail the advertisement creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: "Advertisement created successfully!",
      data: savedAdvertisement,
    });
  } catch (error) {
    console.error("Error in POST /api/advertisements:", error);

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
        error: `Failed to create advertisement: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing advertisement
export async function PUT(request) {
  try {
    console.log("PUT /api/advertisements called");

    await connectToDatabase();

    const formData = await request.formData();
    const id = formData.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Extract and update fields
    const title = formData.get("title");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const link = formData.get("link");
    const category = formData.get("category");
    const priority = formData.get("priority");
    const targetAudience = formData.get("targetAudience");
    const budget = formData.get("budget");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const tags = formData.get("tags");
    const imageFile = formData.get("image");
    const isActive = formData.get("isActive");

    // Update basic fields
    if (title) advertisement.title = title.trim();
    if (description) advertisement.description = description.trim();
    if (shortDescription) {
      if (shortDescription.length > 150) {
        return NextResponse.json(
          {
            success: false,
            error: "Short description must be 150 characters or less",
          },
          { status: 400 }
        );
      }
      advertisement.shortDescription = shortDescription.trim();
    }
    if (link) {
      try {
        new URL(link);
        advertisement.link = link.trim();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid link URL" },
          { status: 400 }
        );
      }
    }
    if (category) advertisement.category = category;
    if (priority) advertisement.priority = priority;
    if (targetAudience) advertisement.targetAudience = targetAudience.trim();
    if (budget) advertisement.budget = parseFloat(budget);
    if (startDate) advertisement.startDate = new Date(startDate);
    if (endDate) advertisement.endDate = new Date(endDate);
    if (isActive !== null && isActive !== undefined)
      advertisement.isActive = isActive === "true";
    if (tags) {
      try {
        advertisement.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch {
        // Keep existing tags if parsing fails
      }
    }

    // Handle new image upload
    if (imageFile && imageFile.size > 0) {
      // Validate file type
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Please upload a valid image file" },
          { status: 400 }
        );
      }

      // Validate file size
      if (imageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "Image file must be smaller than 10MB" },
          { status: 400 }
        );
      }

      try {
        // Delete old image from Cloudinary if it's not the default
        if (
          advertisement.image.public_id &&
          advertisement.image.public_id !== "default-ad"
        ) {
          await cloudinary.uploader.destroy(advertisement.image.public_id);
        }

        // Upload new image
        const imageData = await uploadToCloudinary(imageFile);
        advertisement.image = imageData;
      } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { success: false, error: `Image upload failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    const updatedAdvertisement = await advertisement.save();

    console.log("Advertisement updated successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Advertisement updated successfully!",
      data: updatedAdvertisement,
    });
  } catch (error) {
    console.error("Error in PUT /api/advertisements:", error);

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
        error: `Failed to update advertisement: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete advertisement
export async function DELETE(request) {
  try {
    console.log("DELETE /api/advertisements called");

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

    const advertisement = await Advertisement.findById(id);
    if (!advertisement) {
      return NextResponse.json(
        { success: false, error: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if it's not the default
    if (
      advertisement.image.public_id &&
      advertisement.image.public_id !== "default-ad"
    ) {
      try {
        await cloudinary.uploader.destroy(advertisement.image.public_id);
        console.log(
          "Deleted image from Cloudinary:",
          advertisement.image.public_id
        );
      } catch (error) {
        console.warn("Failed to delete image from Cloudinary:", error);
      }
    }

    await Advertisement.findByIdAndDelete(id);

    console.log("Advertisement deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Advertisement deleted successfully!",
    });
  } catch (error) {
    console.error("Error in DELETE /api/advertisements:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete advertisement: ${error.message}`,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
