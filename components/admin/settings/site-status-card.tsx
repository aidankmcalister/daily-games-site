"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { ShieldAlert, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteStatusCard() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const maintenanceMode = watch("maintenanceMode");
  const showWelcomeMessage = watch("showWelcomeMessage");

  return (
    <Card className="flex flex-col border-none shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-base flex items-center gap-2 text-primary font-bold">
          <ShieldAlert className="h-4 w-4" />
          Site Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 px-6 pb-6">
        <div className="flex items-center justify-between group">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
              Maintenance Mode
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Show banner, disable tracking
            </p>
          </div>
          <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 transition-colors hover:border-border">
            <span
              className={cn(
                "text-[10px] font-bold transition-colors w-6 text-center",
                maintenanceMode ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              {maintenanceMode ? "ON" : "OFF"}
            </span>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={(v) =>
                setValue("maintenanceMode", v, { shouldDirty: true })
              }
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">Announcement Message</p>
              <p className="text-xs text-muted-foreground">
                Site-wide announcement banner
              </p>
            </div>
            <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 transition-colors hover:border-border">
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors w-6 text-center",
                  showWelcomeMessage
                    ? "text-primary"
                    : "text-muted-foreground/40"
                )}
              >
                {showWelcomeMessage ? "ON" : "OFF"}
              </span>
              <Switch
                checked={showWelcomeMessage}
                onCheckedChange={(v) =>
                  setValue("showWelcomeMessage", v, { shouldDirty: true })
                }
              />
            </div>
          </div>

          <div className="relative group">
            <Megaphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input
              id="welcomeMessage"
              placeholder="Enter custom announcement message..."
              {...register("welcomeMessage")}
              className="pl-10 h-10 bg-muted/20 border-border/50 focus:bg-background transition-all"
            />
          </div>
          {errors.welcomeMessage && (
            <FieldError errors={[errors.welcomeMessage as any]} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
