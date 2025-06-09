import connectToDatabase from "@/lib/mongoose";
import Subscriber from "@/lib/models/Subscriber";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();
    await Subscriber.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
