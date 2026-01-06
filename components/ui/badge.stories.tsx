import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";
import { Check, Star, Zap } from "lucide-react";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Badge component for labels, statuses, and counts.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  name: "All Variants",
  args: { children: "Badge" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  args: { children: "Badge" },
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const WithIcons: Story = {
  name: "With Icons",
  args: { children: "Badge" },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Check className="h-3 w-3" /> Completed
      </Badge>
      <Badge variant="secondary">
        <Star className="h-3 w-3" /> Featured
      </Badge>
      <Badge variant="destructive">
        <Zap className="h-3 w-3" /> Alert
      </Badge>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};
