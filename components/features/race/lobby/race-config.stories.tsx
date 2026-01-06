import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RaceConfig } from "./race-config";
import { Race, RaceGame } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Lobby/RaceConfig",
  component: RaceConfig,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Draggable game list for configuring the order of games in a race.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RaceConfig>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockGames: RaceGame[] = [
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
      topic: "movies_tv",
      description: "Guess the movie from frames",
    },
    completions: [],
  },
  {
    id: "rg4",
    gameId: "g4",
    order: 3,
    game: {
      id: "g4",
      title: "Poeltl",
      link: "https://poeltl.dunk.town",
      topic: "sports",
      description: null,
    },
    completions: [],
  },
];

const mockRace: Race = {
  id: "race-123",
  name: "Test Race",
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

export const AllStates: Story = {
  name: "All States",
  args: {
    race: mockRace,
    orderedGames: mockGames,
    isCreator: true,
    onReorder: (result) => console.log("Reorder:", result),
  },
  render: () => (
    <div className="space-y-8 max-w-md">
      <div>
        <p className="text-xs text-muted-foreground mb-3">As Host (can drag)</p>
        <RaceConfig
          race={mockRace}
          orderedGames={mockGames}
          isCreator={true}
          onReorder={(result) => console.log("Reorder:", result)}
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          As Participant (no drag)
        </p>
        <RaceConfig
          race={mockRace}
          orderedGames={mockGames}
          isCreator={false}
          onReorder={(result) => console.log("Reorder:", result)}
        />
      </div>
    </div>
  ),
};

export const HostView: Story = {
  name: "Host View (Draggable)",
  args: {
    race: mockRace,
    orderedGames: mockGames,
    isCreator: true,
    onReorder: (result) => console.log("Reorder:", result),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const ParticipantView: Story = {
  name: "Participant View (Read-only)",
  args: {
    race: mockRace,
    orderedGames: mockGames,
    isCreator: false,
    onReorder: (result) => console.log("Reorder:", result),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
