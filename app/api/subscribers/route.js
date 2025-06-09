import connectToDatabase from "@/lib/mongoose";
import Subscriber from "@/lib/models/Subscriber";

export async function GET() {
  try {
    await connectToDatabase();
    const subscribers = await Subscriber.find().sort({ date: -1 });
    return Response.json({ success: true, subscribers });
  } catch (error) {
    console.error("GET /api/subscribers error:", error);
    return Response.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return Response.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return Response.json({ success: false, message: "Already subscribed" }, { status: 409 });
    }

    await Subscriber.create({ email });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscribers error:", error);
    return Response.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
