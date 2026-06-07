import { NextResponse } from "next/server";
import dbconnect from "@/lib/db";
import mongoose from "mongoose";

// simple schema (no need to touch existing ones)
const TokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

// prevent model overwrite in dev
const Token =
  mongoose.models.Token || mongoose.model("Token", TokenSchema);

export async function POST(req) {
  try {
    await dbconnect();

    const body = await req.json();

const { token, role } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 400 }
      );
    }

    // avoid duplicates
    // FORCE CREATE OR UPDATE (no duplicates, no stale data)
await Token.findOneAndUpdate(
  { token },
  { token, role },
  { upsert: true, new: true }
);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Token Error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}