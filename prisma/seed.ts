import { Topic } from "../app/generated/prisma/client";
import prisma from "../lib/prisma";

const rawGames = [
  {
    title: "Angle",
    link: "https://angle.wtf/",
    topic: "puzzle",
    description:
      "Guess the angle shown on screen. Test your geometric intuition with increasingly precise estimates.",
  },
  {
    title: "Bandle",
    link: "https://bandle.app/",
    topic: "entertainment",
    description:
      "Identify the song from a snippet. More instruments reveal with each guess.",
  },
  {
    title: "Bracket City",
    link: "https://www.theatlantic.com/games/bracket-city/",
    topic: "trivia",
    description:
      "Tournament-style trivia where you pick winners between two options in various categories.",
  },
  {
    title: "COSTCODLE",
    link: "https://costcodle.com/",
    topic: "trivia",
    description:
      "Guess the price of Costco products. Test your knowledge of bulk shopping deals.",
  },
  {
    title: "Chess Puzzle",
    link: "https://www.chess.com/daily-chess-puzzle",
    topic: "puzzle",
    description:
      "Solve the daily chess puzzle. Find the best move or sequence to win material or checkmate.",
  },
  {
    title: "Chronophoto",
    link: "https://www.chronophoto.app/",
    topic: "trivia",
    description:
      "Guess when a historical photo was taken. Navigate through time with visual clues.",
  },
  {
    title: "Cine2Nerdle",
    link: "https://www.cinenerdle2.app/",
    topic: "entertainment",
    description:
      "Connect movies through shared actors, directors, or other film connections.",
  },
  {
    title: "Cinematrix",
    link: "https://www.vulture.com/article/daily-movie-grid-trivia-game-cinematrix.html",
    topic: "entertainment",
    description:
      "Fill the grid with movies matching row and column categories.",
  },
  {
    title: "Circuits",
    link: "https://www.puzzmo.com/game/circuits/",
    topic: "puzzle",
    description:
      "Connect electronic components to complete circuits. Logic meets electrical engineering.",
  },
  {
    title: "Connections",
    link: "https://www.nytimes.com/games/connections",
    topic: "words",
    description:
      "Group 16 words into 4 categories of 4. Find the hidden connections between words.",
  },
  {
    title: "Contexto",
    link: "https://contexto.me/en/",
    topic: "words",
    description:
      "Guess the secret word using AI context clues. Words are ranked by semantic similarity.",
  },
  {
    title: "Cryptic Crossword",
    link: "https://www.minutecryptic.com/",
    topic: "words",
    description:
      "Solve quick cryptic crossword clues. Each clue contains wordplay and a definition.",
  },
  {
    title: "Daily Tens",
    link: "https://dailytens.com/",
    topic: "trivia",
    description:
      "Name 10 things in a category before time runs out. Quick-fire list challenges.",
  },
  {
    title: "Dodeku",
    link: "https://dodeku.com/",
    topic: "puzzle",
    description:
      "Sudoku variant with 12x12 grid. Fill cells with numbers 1-12 following Sudoku rules.",
  },
  {
    title: "Feudle",
    link: "https://googlefeud.com/feudle/",
    topic: "words",
    description:
      "Complete the Google autocomplete. Guess what people search for most.",
  },
  {
    title: "Flagle",
    link: "https://www.flagle.io/",
    topic: "geography",
    description: "Identify the country from its flag revealed piece by piece.",
  },
  {
    title: "Food Guessr",
    link: "https://www.foodguessr.com/",
    topic: "food",
    description:
      "Identify dishes from around the world. Test your culinary knowledge.",
  },
  {
    title: "Framed",
    link: "https://framed.wtf/",
    topic: "entertainment",
    description:
      "Guess the movie from still frames. More frames reveal with each wrong guess.",
  },
  {
    title: "Gamedle Character",
    link: "https://www.gamedle.wtf/characters#",
    topic: "gaming",
    description:
      "Identify the video game character from their pixelated image.",
  },
  {
    title: "Gamedle Classic",
    link: "https://www.gamedle.wtf/classic#",
    topic: "gaming",
    description: "Guess the video game from cover art that slowly unblurs.",
  },
  {
    title: "Globle",
    link: "https://globle-game.com/",
    topic: "geography",
    description:
      "Find the mystery country on a globe. Colors show how close your guesses are.",
  },
  {
    title: "Guess The Game",
    link: "https://guessthe.game/",
    topic: "gaming",
    description:
      "Identify the video game from screenshots revealed one at a time.",
  },
  {
    title: "Guess The Movie",
    link: "https://guessthemovie.name/",
    topic: "entertainment",
    description:
      "Name the film from a single screenshot. Classic movie identification challenge.",
  },
  {
    title: "Guess the Audio",
    link: "https://guesstheaudio.com/",
    topic: "entertainment",
    description:
      "Identify songs, sounds, or audio clips. Audio recognition challenge.",
  },
  {
    title: "Jumblie",
    link: "https://jumblie.com/",
    topic: "words",
    description: "Unscramble letters to find related words that share a theme.",
  },
  {
    title: "Lyricle",
    link: "https://www.lyricle.app/",
    topic: "entertainment",
    description: "Guess the song from its lyrics revealed line by line.",
  },
  {
    title: "Mathler",
    link: "https://www.mathler.com/",
    topic: "puzzle",
    description:
      "Create a math equation that equals the target number using given digits and operators.",
  },
  {
    title: "Metaflora",
    link: "https://flora.metazooa.com/",
    topic: "nature",
    description:
      "Guess the plant species. Clues reveal taxonomy with each guess.",
  },
  {
    title: "Metazooa",
    link: "https://metazooa.com/",
    topic: "nature",
    description:
      "Identify the animal. Taxonomic hints guide you through the animal kingdom.",
  },
  {
    title: "Mini Crossword",
    link: "https://minicrossword.com/",
    topic: "words",
    description:
      "Quick 5x5 crossword puzzle. Perfect for a fast word challenge.",
  },
  {
    title: "Minigolfle",
    link: "https://minigolfle.com/",
    topic: "sports",
    description:
      "Play mini golf in your browser. Aim, shoot, and try to get a hole in one.",
  },
  {
    title: "Move to Movie",
    link: "https://movietomovie.com/",
    topic: "entertainment",
    description:
      "Connect two movies through shared actors. Find the shortest path between films.",
  },
  {
    title: "Neighborle",
    link: "https://neighborle.com/",
    topic: "geography",
    description:
      "Guess the country from its neighbors. Geography puzzle with border clues.",
  },
  {
    title: "Nerdle",
    link: "https://nerdlegame.com/",
    topic: "puzzle",
    description:
      "Wordle for math. Guess the equation with numbers, operators, and equals sign.",
  },
  {
    title: "Padlock",
    link: "https://www.padlockgame.net/",
    topic: "puzzle",
    description:
      "Crack the combination lock. Use logic to find the correct sequence.",
  },
  {
    title: "Pocket Puzzle",
    link: "https://playpocketpuzzles.com/foursquare/home",
    topic: "puzzle",
    description:
      "Daily logic puzzles in compact format. Various puzzle types to solve.",
  },
  {
    title: "SpellCheck",
    link: "https://spellcheck.xyz/mode_select",
    topic: "words",
    description: "Test your spelling skills. Identify correctly spelled words.",
  },
  {
    title: "Squaredle",
    link: "https://squaredle.app/?level=xp",
    topic: "words",
    description:
      "Find words in a letter grid. Connect adjacent letters to form words.",
  },
  {
    title: "Strands",
    link: "https://www.nytimes.com/games/strands",
    topic: "words",
    description:
      "Find themed words in a letter grid. Discover the spangram that touches both sides.",
  },
  {
    title: "Sudoku",
    link: "https://sudoku.com/challenges",
    topic: "puzzle",
    description:
      "Classic number puzzle. Fill the 9x9 grid so each row, column, and box has 1-9.",
  },
  {
    title: "Timeguessr",
    link: "https://timeguessr.com/",
    topic: "trivia",
    description:
      "Guess when and where photos were taken. Geography meets history.",
  },
  {
    title: "Toppled",
    link: "https://bythomas.co.uk/toppled/",
    topic: "puzzle",
    description:
      "Stack blocks without toppling. Physics-based puzzle challenge.",
  },
  {
    title: "Tradle",
    link: "https://games.oec.world/en/tradle/",
    topic: "geography",
    description:
      "Guess the country from its exports. Learn about global trade patterns.",
  },
  {
    title: "Travle",
    link: "https://travle.earth/?travle-lang=en",
    topic: "geography",
    description:
      "Find the shortest route between two countries by naming countries along the path.",
  },
  {
    title: "UrbanStats",
    link: "https://urbanstats.org/quiz.html",
    topic: "geography",
    description:
      "Compare urban areas. Guess which city has more population, area, or other stats.",
  },
  {
    title: "Verticle",
    link: "https://verticle.netlify.app/",
    topic: "words",
    description:
      "Guess the word from vertical letter positions. Unique word deduction game.",
  },
  {
    title: "Waffle",
    link: "https://wafflegame.net/daily",
    topic: "words",
    description:
      "Rearrange letters in a waffle-shaped grid to form valid words.",
  },
  {
    title: "Wikipedia Game",
    link: "https://www.thewikipediagame.com/",
    topic: "trivia",
    description:
      "Navigate from one Wikipedia article to another using only links.",
  },
  {
    title: "Word Search",
    link: "https://games.washingtonpost.com/games/daily-word-search",
    topic: "words",
    description:
      "Find hidden words in a grid of letters. Classic word search puzzle.",
  },
  {
    title: "Wordle",
    link: "https://www.nytimes.com/games/wordle/index.html",
    topic: "words",
    description:
      "Guess the 5-letter word in 6 tries. Colors show correct letters and positions.",
  },
  {
    title: "Worldle",
    link: "https://worldle.teuteuf.fr/",
    topic: "geography",
    description:
      "Identify the country from its silhouette. Distance and direction hints guide you.",
  },
  {
    title: "Xordle",
    link: "https://xordle.org/",
    topic: "words",
    description:
      "Two Wordles at once. Colors apply to both hidden words simultaneously.",
  },
];

async function main() {
  console.log(`🎮 Seeding ${rawGames.length} games...\n`);
  await prisma.game.deleteMany();
  await prisma.game.createMany({
    data: rawGames.map((g) => ({
      title: g.title,
      link: g.link,
      topic: g.topic as Topic,
      description: g.description,
      playCount: 0,
    })),
    skipDuplicates: true,
  });

  console.log(`\n✅ Seeded ${rawGames.length} games successfully!`);

  // Auto-promote owner
  const ownerEmail = "aidankmcalister@gmail.com";
  const ownerUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (ownerUser) {
    await prisma.user.update({
      where: { email: ownerEmail },
      data: { role: "owner" },
    });
    console.log(`\n👑 Promoted ${ownerEmail} to owner`);
  } else {
    console.log(
      `\n⏳ Owner user not found yet (${ownerEmail}) - will be promoted on next seed after sign-in`
    );
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
