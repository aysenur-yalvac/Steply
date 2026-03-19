import { NextRequest, NextResponse } from "next/server";
import { initializeStorage } from "@/lib/init-storage";

/**
 * GET /api/setup
 * Initializes storage bucket and DB on first deploy.
 * Requires Authorization: Bearer <SETUP_SECRET> header.
 * Set SETUP_SECRET in your environment variables.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.SETUP_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storageResult = await initializeStorage();

  return NextResponse.json({
    storage: storageResult,
    timestamp: new Date().toISOString(),
  });
}
