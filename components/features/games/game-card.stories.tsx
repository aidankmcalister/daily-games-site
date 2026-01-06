import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GameCard, GameCardProps } from "./game-card";

const meta = {
  title: "Features/Games/GameCard",
  component: GameCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Game card displayed in the games grid. Shows game info, topic, play status, and actions.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GameCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseGame: GameCardProps = {
  id: "game-1",
  title: "Worldle",
  description: "Guess the country from its shape",
  link: "https://worldle.teuteuf.fr",
  topic: "geography",
  playCount: 1234,
  isPlayed: false,
  onPlay: (id) => console.log("Play:", id),
  onHide: (id) => console.log("Hide:", id),
  createdAt: new Date(),
  index: 0,
};

// All card states
export const AllStates: Story = {
  name: "All States",
  args: baseGame,
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Unplayed</p>
        <GameCard {...baseGame} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Played</p>
        <GameCard {...baseGame} isPlayed={true} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">New (recent)</p>
        <GameCard {...baseGame} createdAt={new Date()} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Minimal mode</p>
        <GameCard {...baseGame} minimal={true} />
      </div>
    </div>
  ),
};

// Different topics
export const AllTopics: Story = {
  name: "All Topics",
  args: baseGame,
  render: () => (
    <div className="grid grid-cols-3 gap-3 max-w-3xl">
      <GameCard {...baseGame} topic="words" title="Wordle" />
      <GameCard {...baseGame} topic="geography" title="Worldle" />
      <GameCard {...baseGame} topic="music" title="Heardle" />
      <GameCard {...baseGame} topic="movies_tv" title="Framed" />
      <GameCard {...baseGame} topic="sports" title="Poeltl" />
      <GameCard {...baseGame} topic="history" title="Chronology" />
      <GameCard {...baseGame} topic="food" title="Foodle" />
      <GameCard {...baseGame} topic="trivia" title="Trivia Daily" />
      <GameCard {...baseGame} topic="video_games" title="GuessThe.Game" />
    </div>
  ),
};

// Playground
export const Playground: Story = {
  args: baseGame,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
