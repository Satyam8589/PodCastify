import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Podcast ID is required" },
        { status: 400 }
      );
    }

    console.log("Looking for podcast with ID:", id);

    let podcast = null;

    // Use MongoDB only
    try {
      const { default: mongoose } = await import("mongoose");
      const { default: Podcast } = await import(
        "../../../../lib/models/Podcast"
      );

      if (!mongoose.connections[0].readyState) {
        const { default: connectDB } = await import("../../../../lib/mongoose");
        await connectDB();
      }

      // Try to find by MongoDB _id or by custom id field
      let mongoPodcast = await Podcast.findById(id).lean();

      if (!mongoPodcast) {
        // Try finding by custom id field
        mongoPodcast = await Podcast.findOne({ id: id }).lean();
      }

      if (mongoPodcast) {
        podcast = {
          id: mongoPodcast._id.toString(),
          title: mongoPodcast.title,
          description: mongoPodcast.description,
          podcastLink: mongoPodcast.podcastLink,
          date: mongoPodcast.date,
          time: mongoPodcast.time,
          thumbnail: mongoPodcast.thumbnail,
          createdAt: mongoPodcast.createdAt,
          updatedAt: mongoPodcast.updatedAt,
        };
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
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

    if (!podcast) {
      return NextResponse.json(
        { success: false, error: "Podcast not found" },
        { status: 404 }
      );
    }

    console.log("Found podcast:", podcast.title);

    return NextResponse.json({
      success: true,
      data: podcast,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
