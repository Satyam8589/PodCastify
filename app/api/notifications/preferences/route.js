import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import NotificationSubscription from "@/lib/models/NotificationSubscription";

// PUT - Update notification preferences
export async function PUT(request) {
  try {
    const body = await request.json();
    const { endpoint, preferences } = body;

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: "Endpoint is required",
        },
        { status: 400 }
      );
    }

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid preferences object is required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const subscription = await NotificationSubscription.findOne({ endpoint });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription not found",
        },
        { status: 404 }
      );
    }

    // Update preferences
    subscription.preferences = {
      ...subscription.preferences,
      ...preferences,
    };

    await subscription.save();

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: subscription.preferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notification preferences",
      },
      { status: 500 }
    );
  }
}

// GET - Get notification preferences
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          error: "Endpoint is required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const subscription = await NotificationSubscription.findOne({ endpoint });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: subscription.preferences,
      isActive: subscription.isActive,
    });
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get notification preferences",
      },
      { status: 500 }
    );
  }
}
