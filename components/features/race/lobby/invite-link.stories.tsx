import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InviteLink } from "./invite-link";
import { Race } from "@/app/race/[id]/page";

const meta = {
  title: "Race/Lobby/InviteLink",
  component: InviteLink,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Invite link component with copy and reveal functionality.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InviteLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRaceWaiting: Race = {
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
  raceGames: [],
};

const mockRaceReady: Race = {
  ...mockRaceWaiting,
  status: "ready",
  participants: [
    ...mockRaceWaiting.participants,
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
};

export const AllStates: Story = {
  name: "All States",
  args: { race: mockRaceWaiting },
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Waiting (1/2 Players)
        </p>
        <InviteLink race={mockRaceWaiting} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">
          Ready (2/2 Players)
        </p>
        <InviteLink race={mockRaceReady} />
      </div>
    </div>
  ),
};

export const Waiting: Story = {
  args: {
    race: mockRaceWaiting,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const Ready: Story = {
  args: {
    race: mockRaceReady,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};
