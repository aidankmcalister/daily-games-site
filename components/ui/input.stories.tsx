import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Text input field for forms.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  name: "All States",
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input placeholder="Default input" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Invalid" aria-invalid="true" />
    </div>
  ),
};

export const Types: Story = {
  name: "Input Types",
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    placeholder: "Enter text...",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
