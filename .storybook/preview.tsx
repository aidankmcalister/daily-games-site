import type { Preview } from "@storybook/nextjs-vite";
import { ImpersonationProvider } from "../components/impersonation-provider";
import { SettingsProvider } from "../components/settings-provider";
import { ListsProvider } from "../lib/use-lists";
import { Toaster } from "../components/ui/sonner";
import "../app/globals.css";

// Load JetBrains Mono font from Google Fonts
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Set the CSS variable that globals.css expects
const style = document.createElement("style");
style.textContent = `
  :root {
    --font-jetbrains: 'JetBrains Mono', monospace;
  }
`;
document.head.appendChild(style);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#111" },
        { name: "light", value: "#ffffff" },
      ],
    },
    a11y: {
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <ImpersonationProvider>
        <SettingsProvider>
          <ListsProvider>
            <div
              className="dark min-h-screen bg-background text-foreground p-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Story />
              <Toaster />
            </div>
          </ListsProvider>
        </SettingsProvider>
      </ImpersonationProvider>
    ),
  ],
};

export default preview;
