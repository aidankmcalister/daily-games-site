"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DlesButton } from "@/components/design/dles-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface SiteConfig {
  id: string;
  newGameMinutes: number;
  topicColors: Record<string, string> | null;
  maintenanceMode: boolean;
  welcomeMessage: string | null;
  showWelcomeMessage: boolean;
  featuredGameIds: string[];
  minPlayStreak: number;
  enableCommunitySubmissions: boolean;
  defaultSort: string;
  showPresetLists: boolean;
  maxSubmissionsPerDay: number;
  enableLeaderboards: boolean;
  updatedAt: string;
}

const DEFAULT_CONFIG = {
  newGameMinutes: 10080,
  maintenanceMode: false,
  welcomeMessage: null,
  showWelcomeMessage: false,
  minPlayStreak: 1,
  enableCommunitySubmissions: false,
  defaultSort: "title",
  maxCustomLists: 10,
  showPresetLists: true,
  maxSubmissionsPerDay: 5,
  enableLeaderboards: false,
};

const settingsSchema = z.object({
  newGameMinutes: z.number().min(-1).max(525600),
  maintenanceMode: z.boolean(),
  welcomeMessage: z.string().nullable(),
  showWelcomeMessage: z.boolean(),
  minPlayStreak: z.number().min(0),
  enableCommunitySubmissions: z.boolean(),
  defaultSort: z.string(),
  maxCustomLists: z.number().min(1).max(100),
  showPresetLists: z.boolean(),
  maxSubmissionsPerDay: z.number().min(0).max(100),
  enableLeaderboards: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = methods;

  const maintenanceMode = watch("maintenanceMode");
  const showWelcomeMessage = watch("showWelcomeMessage");
  const enableCommunitySubmissions = watch("enableCommunitySubmissions");
  const showPresetLists = watch("showPresetLists");
  const enableLeaderboards = watch("enableLeaderboards");
  const newGameMinutes = watch("newGameMinutes");
  const defaultSort = watch("defaultSort");

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
          newGameMinutes: data.newGameMinutes,
          maintenanceMode: data.maintenanceMode,
          welcomeMessage: data.welcomeMessage,
          showWelcomeMessage: data.showWelcomeMessage,
          minPlayStreak: data.minPlayStreak,
          enableCommunitySubmissions: data.enableCommunitySubmissions,
          defaultSort: data.defaultSort,
          maxCustomLists: data.maxCustomLists,
          showPresetLists: data.showPresetLists ?? true,
          maxSubmissionsPerDay: data.maxSubmissionsPerDay ?? 5,
          enableLeaderboards: data.enableLeaderboards ?? false,
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
        toast.success("Settings saved");
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
    const resetValues = { ...DEFAULT_CONFIG } as SettingsFormValues;
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/50 py-16 text-center">
        <p className="text-body text-muted-foreground">
          Failed to load settings.
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-heading-section">Settings</h2>
            {config.updatedAt && (
              <p className="text-micro text-muted-foreground/60 mt-1">
                Last updated {new Date(config.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DlesButton variant="ghost" size="sm">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </DlesButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all settings to their default values.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DlesButton type="submit" disabled={!isDirty || isSaving} size="sm">
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Changes
            </DlesButton>
          </div>
        </div>

        {/* Maintenance Warning */}
        {maintenanceMode && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-body-small text-destructive">
              Site is in maintenance mode. Only admins can access.
            </p>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Site Status */}
          <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
            <h3 className="text-heading-card">Site Status</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-body">Maintenance Mode</Label>
                <p className="text-micro text-muted-foreground/60 mt-0.5">
                  Lock site for admin-only access
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={(v) =>
                  setValue("maintenanceMode", v, { shouldDirty: true })
                }
              />
            </div>

            <div className="border-t border-border/20 pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-body">Site Announcement</Label>
                <Switch
                  checked={showWelcomeMessage}
                  onCheckedChange={(v) =>
                    setValue("showWelcomeMessage", v, { shouldDirty: true })
                  }
                />
              </div>
              <Input
                disabled={!showWelcomeMessage}
                placeholder="Enter announcement message..."
                {...register("welcomeMessage")}
                className="h-9 text-sm bg-muted/30 border-border/30"
              />
            </div>

            <div className="border-t border-border/20 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-body">Enable Leaderboards</Label>
                  <p className="text-micro text-muted-foreground/60 mt-0.5">
                    Show global player rankings
                  </p>
                </div>
                <Switch
                  checked={enableLeaderboards}
                  onCheckedChange={(v) =>
                    setValue("enableLeaderboards", v, { shouldDirty: true })
                  }
                />
              </div>
            </div>
          </div>

          {/* User Limits */}
          <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
            <h3 className="text-heading-card">Feature & Limits</h3>

            <Field>
              <div className="flex items-center justify-between">
                <Label className="text-body">Max Lists Per User</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("maxCustomLists", { valueAsNumber: true })}
                    className="w-20 h-9 text-sm bg-muted/30 border-border/30 text-center"
                  />
                </div>
              </div>
              {errors.maxCustomLists && (
                <FieldError errors={[errors.maxCustomLists]} />
              )}
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <Label className="text-body">Max Submissions / Day</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("maxSubmissionsPerDay", {
                      valueAsNumber: true,
                    })}
                    className="w-20 h-9 text-sm bg-muted/30 border-border/30 text-center"
                  />
                </div>
              </div>
              {errors.maxSubmissionsPerDay && (
                <FieldError errors={[errors.maxSubmissionsPerDay]} />
              )}
            </Field>

            <div className="flex items-center justify-between border-t border-border/20 pt-4">
              <div>
                <Label className="text-body">Show Preset Lists</Label>
                <p className="text-micro text-muted-foreground/60 mt-0.5">
                  Display curated collections on lists page
                </p>
              </div>
              <Switch
                checked={showPresetLists}
                onCheckedChange={(v) =>
                  setValue("showPresetLists", v, {
                    shouldDirty: true,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/20 pt-4">
              <div>
                <Label className="text-body">Community Submissions</Label>
                <p className="text-micro text-muted-foreground/60 mt-0.5">
                  Allow users to suggest games
                </p>
              </div>
              <Switch
                checked={enableCommunitySubmissions}
                onCheckedChange={(v) =>
                  setValue("enableCommunitySubmissions", v, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4 md:col-span-2">
            <h3 className="text-heading-card">Display Settings</h3>

            <div className="grid gap-6 md:grid-cols-3">
              <Field>
                <Label className="text-body mb-2 block">
                  NEW Badge Duration
                </Label>
                <Select
                  value={newGameMinutes?.toString()}
                  onValueChange={(v) =>
                    setValue("newGameMinutes", parseInt(v), {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="h-9 bg-muted/30 border-border/30 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="1440">1 Day</SelectItem>
                    <SelectItem value="4320">3 Days</SelectItem>
                    <SelectItem value="10080">1 Week</SelectItem>
                    <SelectItem value="43200">1 Month</SelectItem>
                    <SelectItem value="-1">Never</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label className="text-body mb-2 block">
                  Default Sort Order
                </Label>
                <Select
                  value={defaultSort}
                  onValueChange={(v) =>
                    setValue("defaultSort", v, { shouldDirty: true })
                  }
                >
                  <SelectTrigger className="h-9 bg-muted/30 border-border/30 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">A-Z</SelectItem>
                    <SelectItem value="topic">By Category</SelectItem>
                    <SelectItem value="played">Unplayed First</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label className="text-body mb-2 block">Streak Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("minPlayStreak", { valueAsNumber: true })}
                    className="w-20 h-9 text-sm bg-muted/30 border-border/30 text-center"
                  />
                  <span className="text-micro text-muted-foreground">days</span>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
