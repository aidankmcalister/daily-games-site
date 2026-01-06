import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RaceActive } from "./race-active";
import { Race } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Full Sections/RaceActive",
  component: RaceActive,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The active race screen where players complete games against each other. Shows progress, timer, and game cards.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RaceActive>;

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
];

// Just started - no completions
const justStartedRace: Race = {
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "active",
  startedAt: new Date(Date.now() - 30000).toISOString(), // 30 seconds ago
  completedAt: null,
  createdAt: new Date(Date.now() - 120000).toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "You", image: null },
      joinedAt: new Date(Date.now() - 120000).toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [],
    },
    {
      id: "p2",
      userId: "user-2",
      guestName: null,
      user: { id: "user-2", name: "Opponent", image: null },
      joinedAt: new Date(Date.now() - 110000).toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [],
    },
  ],
  raceGames: mockGames,
};

// Mid race - 1 game completed by each
const midRaceRace: Race = {
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "active",
  startedAt: new Date(Date.now() - 120000).toISOString(), // 2 mins ago
  completedAt: null,
  createdAt: new Date(Date.now() - 180000).toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "You", image: null },
      joinedAt: new Date(Date.now() - 180000).toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [
        {
          id: "c1",
          raceGameId: "rg1",
          participantId: "p1",
          completedAt: new Date().toISOString(),
          timeToComplete: 65,
          skipped: false,
        },
      ],
    },
    {
      id: "p2",
      userId: "user-2",
      guestName: null,
      user: { id: "user-2", name: "Opponent", image: null },
      joinedAt: new Date(Date.now() - 170000).toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [
        {
          id: "c2",
          raceGameId: "rg1",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 85,
          skipped: false,
        },
      ],
    },
  ],
  raceGames: mockGames,
};

// Nearly done - 2 games completed
const nearlyDoneRace: Race = {
  id: "race-123",
  name: "Daily Challenge",
  createdBy: "user-1",
  status: "active",
  startedAt: new Date(Date.now() - 180000).toISOString(), // 3 mins ago
  completedAt: null,
  createdAt: new Date(Date.now() - 240000).toISOString(),
  participants: [
    {
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "You", image: null },
      joinedAt: new Date(Date.now() - 240000).toISOString(),
      finishedAt: null,
      totalTime: null,
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
      ],
    },
    {
      id: "p2",
      userId: "user-2",
      guestName: null,
      user: { id: "user-2", name: "Opponent", image: null },
      joinedAt: new Date(Date.now() - 230000).toISOString(),
      finishedAt: null,
      totalTime: null,
      completions: [
        {
          id: "c3",
          raceGameId: "rg1",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 85,
          skipped: false,
        },
        {
          id: "c4",
          raceGameId: "rg2",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 0,
          skipped: true,
        },
        {
          id: "c5",
          raceGameId: "rg3",
          participantId: "p2",
          completedAt: new Date().toISOString(),
          timeToComplete: 145,
          skipped: false,
        },
      ],
    },
  ],
  raceGames: mockGames,
};

// Just started
export const JustStarted: Story = {
  name: "Just Started",
  args: {
    race: justStartedRace,
    currentUser: { id: "user-1", name: "You" },
    onRefresh: () => console.log("Refresh called"),
  },
};

// Mid race
export const MidRace: Story = {
  name: "Mid Race (1 Game Done)",
  args: {
    race: midRaceRace,
    currentUser: { id: "user-1", name: "You" },
    onRefresh: () => console.log("Refresh called"),
  },
};

// Nearly done - shows compressed completed cards
export const NearlyDone: Story = {
  name: "Nearly Done (2 Games Done)",
  args: {
    race: nearlyDoneRace,
    currentUser: { id: "user-1", name: "You" },
    onRefresh: () => console.log("Refresh called"),
  },
};

// Opponent ahead
export const OpponentAhead: Story = {
  name: "Opponent Ahead",
  args: {
    race: nearlyDoneRace,
    currentUser: { id: "user-1", name: "You" },
    onRefresh: () => console.log("Refresh called"),
  },
};
