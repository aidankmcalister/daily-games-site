import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { Topic } from "@/app/generated/prisma/client";
import { cleanText } from "@/lib/filter";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    // Only allow authenticated users to submit to prevent spam
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if community submissions are enabled
    const config = await prisma.siteConfig.findFirst();
    if (config && !config.enableCommunitySubmissions) {
      return NextResponse.json(
        { error: "Submissions are currently disabled" },
        { status: 403 }
      );
    }

    const { title, link, topic, description } = await request.json();

    if (!title || !link || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const submission = await prisma.gameSubmission.create({
      data: {
        title: cleanText(title),
        link,
        topic: topic as Topic,
        description: description ? cleanText(description) : "",
        submittedBy: session.user.id,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to create submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
