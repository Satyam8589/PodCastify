import { NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/analytics";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "dashboard";

    if (type === "dashboard") {
      const analytics = await AnalyticsService.getDashboardAnalytics();

      if (!analytics) {
        return NextResponse.json(
          { error: "Failed to fetch analytics data" },
          { status: 500 }
        );
      }

      return NextResponse.json(analytics);
    }

    return NextResponse.json(
      { error: "Invalid analytics type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === "track_visit") {
      const { page } = data;
      await AnalyticsService.trackVisit(request, page);
      return NextResponse.json({ success: true });
    }

    if (action === "track_interaction") {
      const { contentType, contentId, contentTitle, actionType } = data;
      await AnalyticsService.trackContentInteraction(
        contentType,
        contentId,
        contentTitle,
        actionType,
        request
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
