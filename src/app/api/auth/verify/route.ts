import { NextResponse } from "next/server";
import { createAdminSessionToken, verifyPassword } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, password } = body as {
      role?: "guest" | "admin";
      password?: string;
    };

    if (!role || !password) {
      return NextResponse.json(
        { error: "Role and password are required." },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(role, password);
    if (!isValid) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    if (role === "admin") {
      const token = createAdminSessionToken();
      return NextResponse.json({ success: true, role, token });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Password verification failed", error);
    return NextResponse.json(
      { error: "Unable to verify password. Check server logs." },
      { status: 500 }
    );
  }
}

