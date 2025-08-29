import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ portfolio_id: string }> }
) {
  try {
    const { portfolio_id } = await params;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication token not found" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/user/portfolio/${portfolio_id}/sync`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.detail || "Failed to sync portfolio" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Portfolio sync API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
