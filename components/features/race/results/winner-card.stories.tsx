import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WinnerCard } from "./winner-card";

const meta = {
  title: "Race/WinnerCard",
  component: WinnerCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays victory or defeat status after a race completes. Shows confetti animation on victory.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof WinnerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockWinner = {
  id: "participant-1",
  userId: "user-1",
  guestName: null,
  user: {
    id: "user-1",
    name: "Player One",
    image: null,
  },
  joinedAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
  totalTime: 245,
  completions: [],
};

const mockOpponent = {
  id: "participant-2",
  userId: "user-2",
  guestName: null,
  user: {
    id: "user-2",
    name: "Opponent Player",
    image: null,
  },
  joinedAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
  totalTime: 312,
  completions: [],
};

// Both states side by side
export const BothStates: Story = {
  name: "Victory vs Defeat",
  args: { winner: mockWinner, isWinner: true },
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      <WinnerCard winner={mockWinner} isWinner={true} />
      <WinnerCard winner={mockOpponent} isWinner={false} />
    </div>
  ),
};

// Victory
export const Victory: Story = {
  args: {
    winner: mockWinner,
    isWinner: true,
  },
};

// Defeat
export const Defeat: Story = {
  args: {
    winner: mockOpponent,
    isWinner: false,
  },
};

// Guest player
export const GuestWinner: Story = {
  name: "Guest Player Winner",
  args: {
    winner: {
      ...mockWinner,
      userId: null,
      user: null,
      guestName: "Guest Player",
    },
    isWinner: false,
  },
};
