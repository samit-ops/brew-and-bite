import { NextResponse } from "next/server";
import dbconnect from "@/lib/db";
import mongoose from "mongoose";
import { sendNotification } from "@/lib/sendNotification";

const Token =
  mongoose.models.Token ||
  mongoose.model("Token", new mongoose.Schema({ token: String }));

export async function GET() {
  try {
    await dbconnect();

    const tokensData = await Token.find({});
    const tokens = tokensData.map((t) => t.token);

    if (tokens.length === 0) {
      return NextResponse.json({ message: "No tokens found" });
    }

    await sendNotification(tokens, "Test Notification", "It works 🎉");

    return NextResponse.json({ success: true });
  } catch (error) {
  console.error("Test Notification Error:", error);
  return NextResponse.json({
    success: false,
    error: error.message,
  });
}
}