import { NextResponse } from "next/server";
import {
  SiteContent,
  getSiteContent,
  updateSiteContent,
} from "@/lib/siteContent";
import { verifyAdminSessionToken } from "@/lib/security";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Failed to load site content", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load site content.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { content } = body as { content?: SiteContent };

    if (!content) {
      return NextResponse.json(
        { error: "Site content payload is required." },
        { status: 400 }
      );
    }

    await updateSiteContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update site content", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update site content.",
      },
      { status: 500 }
    );
  }
}

