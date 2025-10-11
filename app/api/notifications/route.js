import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import NotificationSubscription from "@/lib/models/NotificationSubscription";
import { getVapidPublicKey } from "@/lib/pushNotification";

// GET - Get VAPID public key for client subscription
export async function GET() {
  try {
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Push notifications not configured",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      publicKey,
    });
  } catch (error) {
    console.error("Error getting VAPID public key:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get notification configuration",
      },
      { status: 500 }
    );
  }
}

// POST - Subscribe to push notifications
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, preferences, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid subscription data",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if subscription already exists
    const existingSubscription = await NotificationSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.keys = subscription.keys;
      existingSubscription.userAgent = userAgent || "";
      existingSubscription.isActive = true;

      if (preferences) {
        existingSubscription.preferences = {
          ...existingSubscription.preferences,
          ...preferences,
        };
      }

      await existingSubscription.save();

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        subscription: existingSubscription,
      });
    }

    // Create new subscription
    const newSubscription = new NotificationSubscription({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent || "",
      preferences: preferences || {
        podcasts: true,
        blogs: true,
        advertisements: true,
      },
    });

    await newSubscription.save();

    return NextResponse.json({
      success: true,
      message: "Subscribed to notifications successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to subscribe to notifications",
      },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

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

    // Mark as inactive instead of deleting
    subscription.isActive = false;
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: "Unsubscribed from notifications successfully",
    });
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unsubscribe from notifications",
      },
      { status: 500 }
    );
  }
}
