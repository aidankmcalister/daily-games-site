import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DlesButton } from "./dles-button";
import { Home, Plus, Settings, Trash2, Swords, RotateCcw } from "lucide-react";

const meta = {
  title: "Design System/DlesButton",
  component: DlesButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The primary button component used throughout the application. Supports variants, sizes, icons, and link behavior.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Button size",
    },
    isActive: {
      control: "boolean",
      description: "Whether button shows active/selected state",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    href: {
      control: "text",
      description: "Optional href makes the button act as a link",
    },
  },
} satisfies Meta<typeof DlesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// Showcase all variants at once
export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <DlesButton>Default</DlesButton>
      <DlesButton variant="secondary">Secondary</DlesButton>
      <DlesButton variant="destructive">Destructive</DlesButton>
      <DlesButton variant="outline">Outline</DlesButton>
      <DlesButton variant="ghost">Ghost</DlesButton>
      <DlesButton variant="link">Link</DlesButton>
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <DlesButton size="sm">Small</DlesButton>
      <DlesButton size="default">Default</DlesButton>
      <DlesButton size="lg">Large</DlesButton>
      <DlesButton size="icon">
        <Home className="h-4 w-4" />
      </DlesButton>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <DlesButton>
        <Plus className="h-4 w-4" /> Create
      </DlesButton>
      <DlesButton variant="secondary">
        <Settings className="h-4 w-4" /> Settings
      </DlesButton>
      <DlesButton variant="destructive">
        <Trash2 className="h-4 w-4" /> Delete
      </DlesButton>
      <DlesButton>
        <Swords className="h-4 w-4" /> Start Race
      </DlesButton>
      <DlesButton variant="outline">
        <RotateCcw className="h-4 w-4" /> New Race
      </DlesButton>
    </div>
  ),
};

// Active states
export const ActiveStates: Story = {
  name: "Active States",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <DlesButton isActive>Active</DlesButton>
      <DlesButton>Inactive</DlesButton>
    </div>
  ),
};

// Disabled states
export const DisabledStates: Story = {
  name: "Disabled States",
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <DlesButton disabled>Disabled Default</DlesButton>
      <DlesButton variant="secondary" disabled>
        Disabled Secondary
      </DlesButton>
      <DlesButton variant="destructive" disabled>
        Disabled Destructive
      </DlesButton>
    </div>
  ),
};
