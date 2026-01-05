import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ListsClient } from "./lists-client";
import { PageHeader } from "@/components/layout/page-header";
import { UserButton } from "@/components/layout/user-button";

export default async function ListsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  const lists = await prisma.gameList.findMany({
    where: { userId: session.user.id },
    include: {
      games: {
        select: {
          id: true,
          title: true,
          topic: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Lists"
            subtitle="Organize your games into custom collections."
            backHref="/dashboard"
          />
          <UserButton />
        </div>
        <ListsClient initialLists={lists} />
      </div>
    </main>
  );
}
