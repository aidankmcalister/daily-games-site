"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOPICS } from "@/lib/constants";
import { Loader2, Save, RotateCcw } from "lucide-react";

interface SiteConfig {
  id: string;
  newGameDays: number;
  topicColors: Record<string, string> | null;
  maintenanceMode: boolean;
  welcomeMessage: string | null;
  featuredGameIds: string[];
  minPlayStreak: number;
  enableCommunitySubmissions: boolean;
  defaultSort: string;
  maxCustomLists: number;
  updatedAt: string;
}

const DEFAULT_CONFIG: Partial<SiteConfig> = {
  newGameDays: 7,
  maintenanceMode: false,
  welcomeMessage: null,
  minPlayStreak: 1,
  enableCommunitySubmissions: false,
  defaultSort: "title",
  maxCustomLists: 10,
};

export function SettingsTab() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof SiteConfig>(
    field: K,
    value: SiteConfig[K]
  ) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newGameDays: config.newGameDays,
          maintenanceMode: config.maintenanceMode,
          welcomeMessage: config.welcomeMessage,
          minPlayStreak: config.minPlayStreak,
          enableCommunitySubmissions: config.enableCommunitySubmissions,
          defaultSort: config.defaultSort,
          maxCustomLists: config.maxCustomLists,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!config) return;
    setConfig({
      ...config,
      ...DEFAULT_CONFIG,
    } as SiteConfig);
    setHasChanges(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Site Configuration</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {config.updatedAt && (
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(config.updatedAt).toLocaleString()}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="newGameDays">
                New Game Days
                <span className="text-xs text-muted-foreground ml-2">
                  How many days a game shows &quot;NEW&quot; ribbon
                </span>
              </FieldLabel>
              <Input
                id="newGameDays"
                type="number"
                min={1}
                max={30}
                value={config.newGameDays}
                onChange={(e) =>
                  updateField("newGameDays", parseInt(e.target.value) || 7)
                }
                className="w-24"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultSort">Default Sort</FieldLabel>
              <Select
                value={config.defaultSort}
                onValueChange={(v) => updateField("defaultSort", v)}
              >
                <SelectTrigger id="defaultSort" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">A-Z</SelectItem>
                  <SelectItem value="topic">Category</SelectItem>
                  <SelectItem value="played">Unplayed First</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="minPlayStreak">
                Min Play Streak Display
                <span className="text-xs text-muted-foreground ml-2">
                  Don&apos;t show streak until user reaches X days
                </span>
              </FieldLabel>
              <Input
                id="minPlayStreak"
                type="number"
                min={0}
                max={30}
                value={config.minPlayStreak}
                onChange={(e) =>
                  updateField("minPlayStreak", parseInt(e.target.value) || 1)
                }
                className="w-24"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Limits & Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Limits & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="maxCustomLists">
                Max Custom Lists per User
              </FieldLabel>
              <Input
                id="maxCustomLists"
                type="number"
                min={1}
                max={50}
                value={config.maxCustomLists}
                onChange={(e) =>
                  updateField("maxCustomLists", parseInt(e.target.value) || 10)
                }
                className="w-24"
              />
            </Field>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Community Submissions</p>
                <p className="text-xs text-muted-foreground">
                  Allow users to suggest new games
                </p>
              </div>
              <Switch
                checked={config.enableCommunitySubmissions}
                onCheckedChange={(v) =>
                  updateField("enableCommunitySubmissions", v)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Site Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Site Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">
                  Show maintenance banner and disable play tracking
                </p>
              </div>
              <Switch
                checked={config.maintenanceMode}
                onCheckedChange={(v) => updateField("maintenanceMode", v)}
              />
            </div>

            <Field>
              <FieldLabel htmlFor="welcomeMessage">
                Welcome Message
                <span className="text-xs text-muted-foreground ml-2">
                  Optional announcement banner text
                </span>
              </FieldLabel>
              <Input
                id="welcomeMessage"
                placeholder="Enter announcement text..."
                value={config.welcomeMessage || ""}
                onChange={(e) =>
                  updateField("welcomeMessage", e.target.value || null)
                }
              />
            </Field>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="secondary"
                onClick={() => window.open("/api/admin/export/games", "_blank")}
              >
                Export Games (JSON)
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open("/api/admin/export/users", "_blank")}
              >
                Export Users (JSON)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Downloads a JSON file containing all records. Sensitive data is
              redacted.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
