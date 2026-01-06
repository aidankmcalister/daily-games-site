import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RaceLobby } from "./race-lobby";
import { Race } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Full Sections/RaceLobby",
  component: RaceLobby,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The lobby screen where players wait for opponents and configure the race before starting.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RaceLobby>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGames = [
  {
    id: "rg1",
    gameId: "g1",
    order: 0,
    game: {
      id: "g1",
      title: "Worldle",
      link: "https://worldle.teuteuf.fr",
      topic: "geography",
      description: "Guess the country from its shape",
    },
    completions: [],
  },
  {
    id: "rg2",
    gameId: "g2",
    order: 1,
    game: {
      id: "g2",
      title: "Heardle",
      link: "https://heardle.io",
      topic: "music",
      description: "Guess the song from the intro",
    },
    completions: [],
  },
  {
    id: "rg3",
    gameId: "g3",
    order: 2,
    game: {
      id: "g3",
      title: "Framed",
      link: "https://framed.wtf",
      topic: "movies",
      description: "Guess the movie from frames",
    },
    completions: [],
  },
];

// Waiting for opponent
const waitingRace: Race = {
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "waiting",
  startedAt: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "Player One", image: null },
      joinedAt: new Date().toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [],
    },
  ],
  raceGames: mockGames,
};

// Ready to start (2 players joined)
const readyRace: Race = {
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "ready",
  startedAt: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "Player One", image: null },
      joinedAt: new Date().toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [],
    },
    {
      id: "p2",
      userId: null,
      guestName: "Guest Player",
      user: null,
      joinedAt: new Date().toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [],
    },
  ],
  raceGames: mockGames,
};

// Owner waiting for opponent
export const WaitingForOpponent: Story = {
  name: "Waiting for Opponent",
  args: {
    race: waitingRace,
    currentUser: { id: "user-1", name: "Player One" },
    onRefresh: () => console.log("Refresh called"),
  },
};

// Ready to start
export const ReadyToStart: Story = {
  name: "Ready to Start",
  args: {
    race: readyRace,
    currentUser: { id: "user-1", name: "Player One" },
    onRefresh: () => console.log("Refresh called"),
  },
};

// Guest joining view (can join)
export const GuestCanJoin: Story = {
  name: "Guest Can Join",
  args: {
    race: waitingRace,
    currentUser: null,
    onRefresh: () => console.log("Refresh called"),
  },
};

// Race is full (spectator view)
export const RaceFull: Story = {
  name: "Race Full (Spectator)",
  args: {
    race: readyRace,
    currentUser: { id: "other-user", name: "Spectator" },
    onRefresh: () => console.log("Refresh called"),
  },
};
