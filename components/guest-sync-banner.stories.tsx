import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GuestSyncBanner } from "./guest-sync-banner";

const meta = {
  title: "Components/GuestSyncBanner",
  component: GuestSyncBanner,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Banner shown to guest users prompting them to sign in to save race history.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GuestSyncBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};
