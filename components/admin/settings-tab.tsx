"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { SiteStatusCard } from "./settings/site-status-card";
import { DisplaySettingsCard } from "./settings/display-settings-card";
import { UserLimitsCard } from "./settings/user-limits-card";
import { SystemUtilitiesCard } from "./settings/system-utilities-card";
import { ResetDefaultsDialog } from "./settings/reset-defaults-dialog";
import { DlesButton } from "@/components/design/dles-button";

interface SiteConfig {
  id: string;
  newGameDays: number;
  topicColors: Record<string, string> | null;
  maintenanceMode: boolean;
  welcomeMessage: string | null;
  showWelcomeMessage: boolean;
  featuredGameIds: string[];
  minPlayStreak: number;
  enableCommunitySubmissions: boolean;
  defaultSort: string;
  maxCustomLists: number;
  updatedAt: string;
}

const DEFAULT_CONFIG: Omit<
  SiteConfig,
  "id" | "updatedAt" | "topicColors" | "featuredGameIds"
> = {
  newGameDays: 7,
  maintenanceMode: false,
  welcomeMessage: null,
  showWelcomeMessage: false,
  minPlayStreak: 1,
  enableCommunitySubmissions: false,
  defaultSort: "title",
  maxCustomLists: 10,
};

const settingsSchema = z.object({
  newGameDays: z.number().min(1).max(30),
  maintenanceMode: z.boolean(),
  welcomeMessage: z.string().nullable(),
  showWelcomeMessage: z.boolean(),
  minPlayStreak: z.number().min(0),
  enableCommunitySubmissions: z.boolean(),
  defaultSort: z.string(),
  maxCustomLists: z.number().min(1).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const methods = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        reset({
          newGameDays: data.newGameDays,
          maintenanceMode: data.maintenanceMode,
          welcomeMessage: data.welcomeMessage,
          showWelcomeMessage: data.showWelcomeMessage,
          minPlayStreak: data.minPlayStreak,
          enableCommunitySubmissions: data.enableCommunitySubmissions,
          defaultSort: data.defaultSort,
          maxCustomLists: data.maxCustomLists,
        });
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        reset(data);
        toast.success("Settings saved successfully");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const resetValues = {
      ...DEFAULT_CONFIG,
    } as SettingsFormValues;
    setIsResetDialogOpen(false);

    // Save to server
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetValues),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        reset(resetValues);
        toast.success("Settings reset to defaults");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Failed to reset");
      }
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getDiff = () => {
    if (!config) return [];
    const diff = [];
    for (const key in DEFAULT_CONFIG) {
      const k = key as keyof typeof DEFAULT_CONFIG;
      if (config[k] !== DEFAULT_CONFIG[k]) {
        diff.push({
          label: k
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          current: String(config[k]),
          default: String(DEFAULT_CONFIG[k]),
        });
      }
    }
    return diff;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load settings.
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Site Configuration</h2>
          <div className="flex items-center gap-2">
            <ResetDefaultsDialog
              isOpen={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
              onReset={handleReset}
              diff={getDiff()}
            />
            <DlesButton type="submit" disabled={!isDirty || isSaving}>
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </DlesButton>
          </div>
        </div>

        {config.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <SiteStatusCard />
          <DisplaySettingsCard />
          <UserLimitsCard />
          <SystemUtilitiesCard />
        </div>
      </form>
    </FormProvider>
  );
}
