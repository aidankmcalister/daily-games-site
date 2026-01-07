import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ListsClient } from "./lists-client";

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
          link: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const config = await prisma.siteConfig.findUnique({
    where: { id: "default" },
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-muted-foreground text-sm font-medium mb-8">
          Organize your games into custom collections.
        </p>
        <ListsClient
          initialLists={lists}
          showPresetLists={config?.showPresetLists ?? true}
        />
      </div>
    </main>
  );
}
