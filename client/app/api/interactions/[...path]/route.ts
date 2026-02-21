import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { path } = await params;
  const pathStr = path.join("/");
  const body = await request.text();

  try {
    const backendRes = await fetch(
      `${BACKEND_URL}/api/v2/interactions/${pathStr}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": session.user.id,
          "X-Internal-Secret": process.env.AUTH_SECRET || "",
        },
        body,
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach backend" },
      { status: 502 }
    );
  }
}
