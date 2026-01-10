import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { Topic } from "@/app/generated/prisma/client";
import { cleanText } from "@/lib/filter";
import { submissionSchema } from "@/lib/validation";

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

    // Enforce daily submission rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const submissionCount = await prisma.gameSubmission.count({
      where: {
        submittedBy: session.user.id,
        createdAt: { gte: today },
      },
    });

    const maxPerDay = config?.maxSubmissionsPerDay ?? 5;
    if (submissionCount >= maxPerDay) {
      return NextResponse.json(
        {
          error: `Daily submission limit (${maxPerDay}) reached. Try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = submissionSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { title, link, topic, description } = result.data;

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
