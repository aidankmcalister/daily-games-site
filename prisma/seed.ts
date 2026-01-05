import { Topic } from "../app/generated/prisma/client";
import prisma from "../lib/prisma";

const rawGames = [
  {
    title: "Angle",
    link: "https://angle.wtf/",
    topic: "estimation",
    description:
      "Guess the angle shown on screen. Test your geometric intuition with increasingly precise estimates.",
  },
  {
    title: "Bandle",
    link: "https://bandle.app/",
    topic: "music",
    description:
      "Identify the song from a snippet. More instruments reveal with each guess.",
  },
  {
    title: "Bracket City",
    link: "https://www.theatlantic.com/games/bracket-city/",
    topic: "words",
    description:
      "Tournament-style trivia where you pick winners between two options in various categories.",
  },
  {
    title: "COSTCODLE",
    link: "https://costcodle.com/",
    topic: "estimation",
    description:
      "Guess the price of Costco products. Test your knowledge of bulk shopping deals.",
  },
  {
    title: "Chess Puzzle",
    link: "https://www.chess.com/daily-chess-puzzle",
    topic: "board_games",
    description:
      "Solve the daily chess puzzle. Find the best move or sequence to win material or checkmate.",
  },
  {
    title: "Chronophoto",
    link: "https://www.chronophoto.app/",
    topic: "history",
    description:
      "Play the online game that tests your knowledge of pop culture and history. Try to guess the year a picture was taken.",
  },
  {
    title: "Cine2Nerdle",
    link: "https://www.cinenerdle2.app/",
    topic: "movies_tv",
    description:
      "Solve unique, grid-based puzzles designed to test your film knowledge daily, or challenge your friends in head-to-head film linking battles.",
  },
  {
    title: "Cinematrix",
    link: "https://www.vulture.com/article/daily-movie-grid-trivia-game-cinematrix.html",
    topic: "movies_tv",
    description:
      "How well do you know movies? Cinematrix is a daily trivia game where you use the clues to pick a movie for each spot on the grid.",
  },
  {
    title: "Circuits",
    link: "https://www.puzzmo.com/game/circuits/",
    topic: "words",
    description:
      "Connect words to form compound phrases in a grid. Identify the chains that link concepts together.",
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
      "Can you guess the secret word with the help of AI? At each guess it will tell you how close you are to the answer.",
  },
  {
    title: "Cryptic Crossword",
    link: "https://www.minutecryptic.com/",
    topic: "words",
    description: "Solve a clue with a hidden meaning.",
  },
  {
    title: "Daily Tens",
    link: "https://dailytens.com/",
    topic: "trivia",
    description: "Daily Tens trivia game! Can you guess all Ten today?",
  },
  {
    title: "Dodeku",
    link: "https://dodeku.com/",
    topic: "logic",
    description:
      "Dodeku is a fun daily number logic puzzle! Place the tiles on the grid so they add up to the correct sums.",
  },
  {
    title: "Feudle",
    link: "https://googlefeud.com/feudle/",
    topic: "trivia",
    description:
      "The world's most popular autocomplete game. How does Google autocomplete this search?",
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
      "Test your knowledge of geography, food, and culture. Challenge yourself to see who can guess where these world dishes are from!",
  },
  {
    title: "Framed",
    link: "https://framed.wtf/",
    topic: "movies_tv",
    description:
      "Guess the movie from 6 frames. Come back each day to see if you can guess the daily movie.",
  },
  {
    title: "Gamedle Character",
    link: "https://www.gamedle.wtf/characters#",
    topic: "video_games",
    description:
      "Character daily puzzle. Guess the game from a character image. Fresh challenge every day, reveal hints gradually.",
  },
  {
    title: "Gamedle Classic",
    link: "https://www.gamedle.wtf/classic#",
    topic: "video_games",
    description:
      "Cover Art daily puzzle. Guess the video game from its official cover. One new challenge every day with streaks and hints.",
  },
  {
    title: "Globle",
    link: "https://globle-game.com/",
    topic: "geography",
    description:
      "Use your geography knowledge to figure out the mystery country in as few guesses as possible!",
  },
  {
    title: "Guess The Game",
    link: "https://guessthe.game/",
    topic: "video_games",
    description:
      "Try to name the game shown in the screenshots in 6 guesses or less!",
  },
  {
    title: "Guess The Movie",
    link: "https://guessthemovie.name/",
    topic: "movies_tv",
    description: "Try to Guess the Movie in 6 guesses or less!",
  },
  {
    title: "Guess the Audio",
    link: "https://guesstheaudio.com/",
    topic: "music",
    description: "Try to Guess the Song in 6 guesses or less!",
  },
  {
    title: "Jumblie",
    link: "https://jumblie.com/",
    topic: "words",
    description: "A word search game with new words and themes daily.",
  },
  {
    title: "Lyricle",
    link: "https://www.lyricle.app/",
    topic: "music",
    description: "Guess the song from the Lyrics!",
  },
  {
    title: "Mathler",
    link: "https://www.mathler.com/",
    topic: "logic",
    description:
      "Play Mathler, the daily math Wordle-style puzzle. Guess the hidden equation in 6 tries.",
  },
  {
    title: "Metaflora",
    link: "https://flora.metazooa.com/",
    topic: "nature",
    description: "Become an evolutionary detective to find the Mystery Plant!",
  },
  {
    title: "Metazooa",
    link: "https://metazooa.com/",
    topic: "nature",
    description: "Become an evolutionary detective to find the Mystery Animal!",
  },
  {
    title: "Mini Crossword",
    link: "https://minicrossword.com/",
    topic: "words",
    description:
      "Our daily mini crossword puzzle is the perfect sized crossword puzzle for anyone looking for a quick brain exercise.",
  },
  {
    title: "Minigolfle",
    link: "https://minigolfle.com/",
    topic: "video_games",
    description:
      "Minigolfle - Daily Mini Golf Game. Aim, shoot, and try to get a hole in one.",
  },
  {
    title: "Move to Movie",
    link: "https://movietomovie.com/",
    topic: "movies_tv",
    description:
      "Find the shortest path to link movies through shared actors and directors.",
  },
  {
    title: "MapTap",
    link: "https://maptap.gg/",
    topic: "geography",
    description:
      "Play MapTap - the daily geography game! Find 5 world locations on a 3D globe with historical stories. Free browser-based daily game for geography lovers.",
  },
  {
    title: "Geo Warmup",
    link: "https://geowarmup.hankiou.com/",
    topic: "geography",
    description:
      "Master world geography with geowarmup! Study flags, capitals, and locations with typing challenges.",
  },
  {
    title: "Neighborle",
    link: "https://neighborle.com/",
    topic: "geography",
    description:
      "Neighborle is a daily geography game, inspired by Wordle. Can you guess the neighboring countries on the map?",
  },
  {
    title: "Nerdle",
    link: "https://nerdlegame.com/",
    topic: "logic",
    description:
      "Nerdle - guess the solution in 6 tries - try classic, mini, speed and pro modes.",
  },
  {
    title: "Padlock",
    link: "https://www.padlockgame.net/",
    topic: "logic",
    description:
      "PADLOCK - a cool 4 digit math game brainteaser. A fun number puzzle for those that like to play logic games.",
  },
  {
    title: "Pocket Puzzle",
    link: "https://playpocketpuzzles.com/foursquare/home",
    topic: "logic",
    description:
      "Home of new and original word games, including Fix The Mix, Passcodes, Four Square, String Theory, and Letterheads.",
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
      "Squaredle is a daily word building game. Swipe letters in the grid to test your vocabulary every day!",
  },
  {
    title: "Strands",
    link: "https://www.nytimes.com/games/strands",
    topic: "words",
    description: "Find hidden words and uncover the day’s theme.",
  },
  {
    title: "Sudoku",
    link: "https://sudoku.com/challenges",
    topic: "logic",
    description:
      "Visit Sudoku Archive, pick a date on the calendar and enjoy fresh sudoku puzzles in our game kingdom!",
  },
  {
    title: "Timeguessr",
    link: "https://timeguessr.com/",
    topic: "history",
    description:
      "TimeGuessr - the game that tests both your geography and history knowledge. Guess where and when historic photos were taken.",
  },
  {
    title: "Toppled",
    link: "https://bythomas.co.uk/toppled/",
    topic: "words",
    description:
      "Toppled is a daily word game! Create 4 five-letter words and the wall will be Toppled.",
  },
  {
    title: "Tradle",
    link: "https://games.oec.world/en/tradle/",
    topic: "geography",
    description:
      "Brought to you by the OEC, Tradle is a fun game to learn about the exports of countries.",
  },
  {
    title: "Travle",
    link: "https://travle.earth/?travle-lang=en",
    topic: "geography",
    description:
      "Travle: A daily game, get between countries in as few guesses as possible!",
  },
  {
    title: "UrbanStats",
    link: "https://urbanstats.org/quiz.html",
    topic: "geography",
    description:
      "Test your knowledge of geography and statistics! Compare urban areas in a new quiz every day.",
  },
  {
    title: "Verticle",
    link: "https://verticle.netlify.app/",
    topic: "words",
    description:
      "Wordle, but everything is normal. Guess the word from vertical letter positions.",
  },
  {
    title: "Waffle",
    link: "https://wafflegame.net/daily",
    topic: "words",
    description:
      "The waffle-shaped daily word game. Rearrange letters in the grid to form valid words.",
  },
  {
    title: "Wikipedia Game",
    link: "https://www.thewikipediagame.com/",
    topic: "trivia",
    description:
      "Compete to race from one Wikipedia page to another in the least number of steps/links.",
  },
  {
    title: "Word Search",
    link: "https://games.washingtonpost.com/games/daily-word-search",
    topic: "words",
    description:
      "Play Daily Word Search instantly online. A fun and engaging Online game from Washington Post.",
  },
  {
    title: "Wordle",
    link: "https://www.nytimes.com/games/wordle/index.html",
    topic: "words",
    description:
      "Guess the hidden word in 6 tries. A new puzzle is available each day.",
  },
  {
    title: "Worldle",
    link: "https://worldle.teuteuf.fr/",
    topic: "geography",
    description:
      "A daily geography game where you guess the country from its shape and get clues with every attempt.",
  },
  {
    title: "Xordle",
    link: "https://xordle.org/",
    topic: "words",
    description:
      "Two Wordles at once. Colors apply to both hidden words simultaneously.",
  },
  {
    title: "Colorfle",
    link: "https://colorfle.com/",
    topic: "colors",
    description:
      "Colorfle: the daily color mixing game! Try to match the Colorfle in six tries.",
  },
  {
    title: "Zip",
    link: "https://www.linkedin.com/games/zip/",
    topic: "logic",
    description:
      "Plot a path through the grid while passing through each number in order. Daily logic puzzle by LinkedIn.",
  },
  {
    title: "Rankle",
    link: "https://www.rankle.app/",
    topic: "trivia",
    description: "Rank 6 things in 4 guesses. There's a new puzzle every day.",
  },
  {
    title: "Shaple",
    link: "https://swag.github.io/shaple/",
    topic: "shapes",
    description:
      "A daily shape matching game. Choose the shape that matches the target from 2D projections.",
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
  const ownerEmail = process.env.OWNER_EMAIL;
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
