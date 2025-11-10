import { NextResponse } from "next/server";
import {
  Role,
  updatePassword,
  verifyAdminSessionToken,
  verifyPassword,
} from "@/lib/security";

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Admin authorization token missing." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.json(
        { error: "Invalid or expired admin session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role, newPassword, currentAdminPassword } = body as {
      role?: Role;
      newPassword?: string;
      currentAdminPassword?: string;
    };

    if (!role || !newPassword) {
      return NextResponse.json(
        { error: "Role and new password are required." },
        { status: 400 }
      );
    }

    if (role === "guest") {
      // Gate guest password change behind admin password confirmation for safety.
      if (!currentAdminPassword) {
        return NextResponse.json(
          { error: "Current admin password required to update guest password." },
          { status: 403 }
        );
      }

      const adminValid = await verifyPassword("admin", currentAdminPassword);
      if (!adminValid) {
        return NextResponse.json(
          { error: "Current admin password is incorrect." },
          { status: 403 }
        );
      }
    }

    await updatePassword(role, newPassword);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update password", error);
    return NextResponse.json(
      { error: "Unable to update password." },
      { status: 500 }
    );
  }
}

