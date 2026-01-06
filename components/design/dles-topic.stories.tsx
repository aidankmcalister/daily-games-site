import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DlesTopic } from "./dles-topic";
import { Trophy, Star, Zap } from "lucide-react";

const meta = {
  title: "Design System/DlesTopic",
  component: DlesTopic,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Topic badge component with distinct colors for each game category. Used to identify game types throughout the app.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    topic: "sports", // Default arg to satisfy TypeScript
  },
  argTypes: {
    topic: {
      control: "select",
      options: [
        "all",
        "sports",
        "music",
        "movies",
        "tv",
        "geography",
        "history",
        "science",
        "food",
        "animals",
        "other",
      ],
      description: "Topic category",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Badge size",
    },
  },
} satisfies Meta<typeof DlesTopic>;

export default meta;
type Story = StoryObj<typeof meta>;

// All topics at once - the main showcase
export const AllTopics: Story = {
  name: "All Topics",
  args: { topic: "sports" },
  render: () => (
    <div className="flex flex-wrap gap-2 max-w-md">
      <DlesTopic topic="all" />
      <DlesTopic topic="sports" />
      <DlesTopic topic="music" />
      <DlesTopic topic="movies" />
      <DlesTopic topic="tv" />
      <DlesTopic topic="geography" />
      <DlesTopic topic="history" />
      <DlesTopic topic="science" />
      <DlesTopic topic="food" />
      <DlesTopic topic="animals" />
      <DlesTopic topic="other" />
    </div>
  ),
};

// All sizes
export const AllSizes: Story = {
  name: "All Sizes",
  args: { topic: "sports" },
  render: () => (
    <div className="flex items-center gap-3">
      <DlesTopic topic="sports" size="xs" />
      <DlesTopic topic="sports" size="sm" />
      <DlesTopic topic="sports" size="md" />
      <DlesTopic topic="sports" size="lg" />
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  name: "With Icons",
  args: { topic: "sports" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <DlesTopic topic="sports" icon={<Trophy className="h-3 w-3" />} />
      <DlesTopic topic="music" icon={<Star className="h-3 w-3" />} />
      <DlesTopic
        topic="science"
        icon={<Zap className="h-3 w-3" />}
        iconPos="right"
      />
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    topic: "sports",
    size: "md",
  },
};
