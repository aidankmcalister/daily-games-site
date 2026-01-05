"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserLimitsCard() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const enableCommunitySubmissions = watch("enableCommunitySubmissions");

  return (
    <Card className="flex flex-col border-none shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-base flex items-center gap-2 text-primary font-bold">
          <Users2 className="h-4 w-4" />
          User Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 px-6 pb-6">
        <Field>
          <div className="space-y-1 mb-2">
            <FieldLabel
              htmlFor="maxCustomLists"
              className="text-sm font-semibold"
            >
              Max Custom Lists
            </FieldLabel>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Limit per registered user
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="maxCustomLists"
              type="number"
              {...register("maxCustomLists", { valueAsNumber: true })}
              className="w-24 h-10 bg-muted/20 border-border/50"
            />
            <span className="text-xs font-medium text-muted-foreground">
              lists per user
            </span>
          </div>
          {errors.maxCustomLists && (
            <FieldError errors={[errors.maxCustomLists as any]} />
          )}
        </Field>

        <div className="flex items-center justify-between pt-6 border-t border-border/50 group">
          <div className="space-y-1">
            <p className="text-sm font-semibold group-hover:text-primary transition-colors">
              Community Submissions
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Allow game suggestions
            </p>
          </div>
          <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50 transition-colors hover:border-border">
            <span
              className={cn(
                "text-[10px] font-bold transition-colors w-6 text-center",
                enableCommunitySubmissions
                  ? "text-primary"
                  : "text-muted-foreground/40"
              )}
            >
              {enableCommunitySubmissions ? "ON" : "OFF"}
            </span>
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
      </CardContent>
    </Card>
  );
}
