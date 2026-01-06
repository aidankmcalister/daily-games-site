import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RaceResults } from "./race-results";
import { Race } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Full Sections/RaceResults",
  component: RaceResults,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The complete race results screen shown after a race finishes. Includes winner card, split breakdown, and action buttons.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RaceResults>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock completed race data
const createMockRace = (isWinner: boolean): Race => ({
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "completed",
  startedAt: new Date(Date.now() - 300000).toISOString(),
  completedAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 360000).toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "You", image: null },
      joinedAt: new Date(Date.now() - 360000).toISOString(),
      finishedAt: new Date().toISOString(),
      totalTime: isWinner ? 185 : 245,
      completions: [
        {
          id: "c1",
          raceGameId: "rg1",
          participantId: "p1",
          completedAt: new Date().toISOString(),
          timeToComplete: 65,
          skipped: false,
        },
        {
          id: "c2",
          raceGameId: "rg2",
          participantId: "p1",
          completedAt: new Date().toISOString(),
          timeToComplete: 125,
          skipped: false,
        },
        {
          id: "c3",
          raceGameId: "rg3",
          participantId: "p1",
          completedAt: new Date().toISOString(),
          timeToComplete: isWinner ? 185 : 245,
          skipped: false,
        },
      ],
    },
    {
      id: "p2",
      userId: "user-2",
      guestName: null,
      user: { id: "user-2", name: "Opponent", image: null },
      joinedAt: new Date(Date.now() - 350000).toISOString(),
      finishedAt: new Date().toISOString(),
      totalTime: isWinner ? 245 : 185,
      completions: [
        {
          id: "c4",
          raceGameId: "rg1",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 85,
          skipped: false,
        },
        {
          id: "c5",
          raceGameId: "rg2",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 150,
          skipped: true,
        },
        {
          id: "c6",
          raceGameId: "rg3",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: isWinner ? 245 : 185,
          skipped: false,
        },
      ],
    },
  ],
  raceGames: [
    {
      id: "rg1",
      gameId: "g1",
      order: 0,
      game: {
        id: "g1",
        title: "Worldle",
        link: "https://worldle.teuteuf.fr",
        topic: "geography",
        description: null,
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
        description: null,
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
        description: null,
      },
      completions: [],
    },
  ],
});

// Victory screen
export const Victory: Story = {
  args: {
    race: createMockRace(true),
    currentUser: { id: "user-1", name: "You" },
  },
};

// Defeat screen
export const Defeat: Story = {
  args: {
    race: createMockRace(false),
    currentUser: { id: "user-1", name: "You" },
  },
};

// Guest player view
export const GuestView: Story = {
  name: "Guest Player View",
  args: {
    race: createMockRace(true),
    currentUser: null,
  },
};
