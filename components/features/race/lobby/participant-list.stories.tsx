import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ParticipantList } from "./participant-list";
import { Race } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Lobby/ParticipantList",
  component: ParticipantList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Shows the list of participants in a race lobby.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ParticipantList>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseParticipant = {
  joinedAt: new Date().toISOString(),
  finishedAt: null,
  totalTime: null,
  completions: [],
};

const mockRaceOnePlayer: Race = {
  id: "race-123",
  name: "Test Race",
  createdBy: "user-1",
  status: "waiting",
  startedAt: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
  participants: [
    {
      ...baseParticipant,
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: { id: "user-1", name: "Player One", image: null },
    },
  ],
  raceGames: [],
};

const mockRaceTwoPlayers: Race = {
  ...mockRaceOnePlayer,
  status: "ready",
  participants: [
    ...mockRaceOnePlayer.participants,
    {
      ...baseParticipant,
      id: "p2",
      userId: null,
      guestName: "Guest Player",
      user: null,
    },
  ],
};

const mockRaceWithImages: Race = {
  ...mockRaceOnePlayer,
  status: "ready",
  participants: [
    {
      ...baseParticipant,
      id: "p1",
      userId: "user-1",
      guestName: null,
      user: {
        id: "user-1",
        name: "John Doe",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      },
    },
    {
      ...baseParticipant,
      id: "p2",
      userId: "user-2",
      guestName: null,
      user: {
        id: "user-2",
        name: "Jane Smith",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
    },
  ],
};

export const AllStates: Story = {
  name: "All States",
  args: { race: mockRaceOnePlayer },
  render: () => (
    <div className="space-y-8 max-w-md">
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          Waiting for opponent
        </p>
        <ParticipantList race={mockRaceOnePlayer} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          Both players joined
        </p>
        <ParticipantList race={mockRaceTwoPlayers} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          With profile images
        </p>
        <ParticipantList race={mockRaceWithImages} />
      </div>
    </div>
  ),
};

export const OnePlayer: Story = {
  name: "One Player (Waiting)",
  args: { race: mockRaceOnePlayer },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const TwoPlayers: Story = {
  name: "Two Players (Ready)",
  args: { race: mockRaceTwoPlayers },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const WithImages: Story = {
  name: "With Profile Images",
  args: { race: mockRaceWithImages },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
