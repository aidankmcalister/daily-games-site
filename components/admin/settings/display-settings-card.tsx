"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Sliders } from "lucide-react";

export function DisplaySettingsCard() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const newGameDays = watch("newGameDays");
  const defaultSort = watch("defaultSort");

  return (
    <Card className="flex flex-col border-none shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-base flex items-center gap-2 text-primary font-bold">
          <Sliders className="h-4 w-4" />
          Display Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field>
            <div className="space-y-1 mb-2">
              <FieldLabel
                htmlFor="newGameDays"
                className="text-sm font-semibold"
              >
                New Game Days
              </FieldLabel>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Duration of &quot;NEW&quot; label
              </p>
            </div>
            <Select
              value={newGameDays?.toString()}
              onValueChange={(v) =>
                setValue("newGameDays", parseInt(v), { shouldDirty: true })
              }
            >
              <SelectTrigger
                id="newGameDays"
                className="h-10 bg-muted/20 border-border/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="7">7 Days (Week)</SelectItem>
                <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                <SelectItem value="30">30 Days (Month)</SelectItem>
              </SelectContent>
            </Select>
            {errors.newGameDays && (
              <FieldError errors={[errors.newGameDays as any]} />
            )}
          </Field>

          <Field>
            <div className="space-y-1 mb-2">
              <FieldLabel
                htmlFor="defaultSort"
                className="text-sm font-semibold"
              >
                Default Sort
              </FieldLabel>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Initial grid organization
              </p>
            </div>
            <Select
              value={defaultSort}
              onValueChange={(v) =>
                setValue("defaultSort", v, { shouldDirty: true })
              }
            >
              <SelectTrigger
                id="defaultSort"
                className="h-10 bg-muted/20 border-border/50"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">A-Z</SelectItem>
                <SelectItem value="topic">Category</SelectItem>
                <SelectItem value="played">Unplayed First</SelectItem>
              </SelectContent>
            </Select>
            {errors.defaultSort && (
              <FieldError errors={[errors.defaultSort as any]} />
            )}
          </Field>
        </div>

        <Field className="pt-4 border-t border-border/50">
          <div className="space-y-1 mb-2">
            <FieldLabel
              htmlFor="minPlayStreak"
              className="text-sm font-semibold"
            >
              Min Streak Display
            </FieldLabel>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Show streak after X days played
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="minPlayStreak"
              type="number"
              {...register("minPlayStreak", { valueAsNumber: true })}
              className="w-24 h-10 bg-muted/20 border-border/50"
            />
            <span className="text-xs font-medium text-muted-foreground">
              days
            </span>
          </div>
          {errors.minPlayStreak && (
            <FieldError errors={[errors.minPlayStreak as any]} />
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
