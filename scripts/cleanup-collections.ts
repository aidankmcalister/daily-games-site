import prisma from "../lib/prisma";

async function main() {
  try {
    console.log("Starting cleanup of preset lists...");

    // Fetch all preset lists with their games
    const presetLists = await prisma.presetList.findMany({
      include: {
        games: true,
      },
    });

    console.log(`Found ${presetLists.length} preset lists.`);

    for (const list of presetLists) {
      // Skip the 'OG' collection (preset-gauntlet)
      if (list.id === "preset-gauntlet") {
        console.log(`Skipping OG collection: ${list.name} (${list.id})`);
        continue;
      }

      const originalGameCount = list.games.length;

      // Filter out games that do not support embedding
      const validGames = list.games.filter(
        (game) => game.embedSupported !== false
      );
      const validGameIds = validGames.map((g) => ({ id: g.id }));

      if (validGames.length < originalGameCount) {
        const removedCount = originalGameCount - validGames.length;
        console.log(
          `Updating list "${list.name}": Removing ${removedCount} non-embeddable games (New count: ${validGames.length})`
        );

        // Update the list with the filtered games
        await prisma.presetList.update({
          where: { id: list.id },
          data: {
            games: {
              set: validGameIds, // Replace the existing games with the filtered list
            },
          },
        });
      } else {
        console.log(`List "${list.name}" is already clean.`);
      }
    }

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
