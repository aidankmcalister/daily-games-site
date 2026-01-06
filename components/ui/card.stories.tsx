import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Card container for grouping related content.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: null,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  name: "With Action",
  args: { children: null },
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card with Action</CardTitle>
        <CardDescription>Has a button in the header.</CardDescription>
        <CardAction>
          <Badge variant="secondary">New</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Content area.</p>
      </CardContent>
    </Card>
  ),
};

export const Sizes: Story = {
  name: "All Sizes",
  args: { children: null },
  render: () => (
    <div className="flex gap-4">
      <Card size="sm" className="w-64">
        <CardHeader>
          <CardTitle>Small</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs">Compact card.</p>
        </CardContent>
      </Card>
      <Card size="default" className="w-64">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Standard card.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const StatCard: Story = {
  name: "Stat Card Example",
  args: { children: null },
  render: () => (
    <Card className="w-48">
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold">42</p>
          <p className="text-xs text-muted-foreground">Games Played</p>
        </div>
      </CardContent>
    </Card>
  ),
};
