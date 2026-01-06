import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ResultsList,
  ParticipantWithSplits,
  RaceGameWithGame,
} from "./results-list";

const meta = {
  title: "Race/ResultsList",
  component: ResultsList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays the race results breakdown showing each game's split times for all participants.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ResultsList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockGames: RaceGameWithGame[] = [
  {
    id: "game-1",
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
    id: "game-2",
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
    id: "game-3",
    gameId: "g3",
    order: 2,
    game: {
      id: "g3",
      title: "Pokedoku",
      link: "https://pokedoku.com",
      topic: "other",
      description: null,
    },
    completions: [],
  },
];

const mockParticipants: ParticipantWithSplits[] = [
  {
    id: "p1",
    userId: "u1",
    guestName: null,
    user: { id: "u1", name: "Player One", image: null },
    joinedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    totalTime: 245,
    completions: [],
    splits: [
      { id: "game-1", duration: 65, skipped: false, cumulative: 65 },
      { id: "game-2", duration: 90, skipped: false, cumulative: 155 },
      { id: "game-3", duration: 90, skipped: false, cumulative: 245 },
    ],
  },
  {
    id: "p2",
    userId: "u2",
    guestName: null,
    user: { id: "u2", name: "Player Two", image: null },
    joinedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    totalTime: 312,
    completions: [],
    splits: [
      { id: "game-1", duration: 85, skipped: false, cumulative: 85 },
      { id: "game-2", duration: 0, skipped: true, cumulative: 85 },
      { id: "game-3", duration: 227, skipped: false, cumulative: 312 },
    ],
  },
];

// Full results breakdown
export const Default: Story = {
  args: {
    sortedGames: mockGames,
    participantsWithSplits: mockParticipants,
    sortedParticipants: mockParticipants,
    myParticipantId: "p1",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

// With skipped games
export const WithSkippedGames: Story = {
  name: "With Skipped Games",
  args: {
    sortedGames: mockGames,
    participantsWithSplits: mockParticipants,
    sortedParticipants: mockParticipants,
    myParticipantId: "p2",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

// Single player (solo race / spectator view)
export const SingleParticipant: Story = {
  name: "Single Participant",
  args: {
    sortedGames: mockGames,
    participantsWithSplits: [mockParticipants[0]],
    sortedParticipants: [mockParticipants[0]],
    myParticipantId: "p1",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
