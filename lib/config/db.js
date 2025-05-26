import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://blog-next-app:700700700@cluster0.ztrrk90.mongodb.net/blog-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};