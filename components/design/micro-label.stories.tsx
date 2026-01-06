import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MicroLabel } from "./micro-label";

const meta = {
  title: "Design System/MicroLabel",
  component: MicroLabel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Small uppercase label used for section headers, metadata, and status indicators.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MicroLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Usage examples
export const Examples: Story = {
  name: "Examples",
  args: { children: "Label" },
  render: () => (
    <div className="space-y-4">
      <MicroLabel>You</MicroLabel>
      <MicroLabel>Opponent</MicroLabel>
      <MicroLabel>Race Time</MicroLabel>
      <MicroLabel>Completed</MicroLabel>
      <MicroLabel>Breakdown</MicroLabel>
    </div>
  ),
};

// Interactive
export const Playground: Story = {
  args: {
    children: "Label Text",
  },
};
