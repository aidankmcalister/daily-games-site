import { Topic } from "../app/generated/prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import prisma from "../lib/prisma";

// Types
interface GameData {
  title: string;
  link: string;
  topic: Topic;
}

async function main() {
  // Check if JSON export exists
  const jsonPath = join(process.cwd(), "games-export-2026-01-04.json");

  let games: GameData[];

  if (existsSync(jsonPath)) {
    console.log("📦 Loading games from JSON export...\n");
    const jsonData = JSON.parse(readFileSync(jsonPath, "utf-8"));
    games = jsonData.map(
      (g: { title: string; link: string; topic: string }) => ({
        title: g.title,
        link: g.link,
        topic: g.topic as Topic,
      })
    );
  } else {
    console.log("📦 Using default seed data...\n");
    games = getDefaultGames();
  }

  console.log(`🎮 Seeding ${games.length} games...\n`);

  for (const game of games) {
    await prisma.game.upsert({
      where: { link: game.link },
      update: {
        title: game.title,
        topic: game.topic,
      },
      create: game,
    });
    console.log(`  ✓ ${game.title}`);
  }

  console.log(`\n✅ Seeded ${games.length} games successfully!`);
}

function getDefaultGames(): GameData[] {
  return [
    {
      title: "Wordle",
      link: "https://www.nytimes.com/games/wordle/index.html",
      topic: "words",
    },
    {
      title: "Connections",
      link: "https://www.nytimes.com/games/connections",
      topic: "words",
    },
    {
      title: "Strands",
      link: "https://www.nytimes.com/games/strands",
      topic: "words",
    },
    {
      title: "Mini Crossword",
      link: "https://minicrossword.com/",
      topic: "words",
    },
    { title: "Angle", link: "https://angle.wtf/", topic: "puzzle" },
    { title: "Globle", link: "https://globle-game.com/", topic: "geography" },
  ];
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
