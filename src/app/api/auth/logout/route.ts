import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_URL || "https://hyperliquid-dashboard.duckdns.org";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Send logout request to backend
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    // Logout can return different status codes, but we treat it as success
    // even if the backend returns an error (token might already be invalid)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API Error:", error);
    // Even if logout fails on backend, we still return success
    // since the client will clear the token anyway
    return NextResponse.json({ success: true });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
