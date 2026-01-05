"use client";

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
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ResetDefaultsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  diff: Array<{ label: string; current: string; default: string }>;
}

export function ResetDefaultsDialog({
  isOpen,
  onOpenChange,
  onReset,
  diff,
}: ResetDefaultsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Defaults
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset all settings to their default values. The following
            changes will be applied:
            <div className="mt-4 border rounded-md overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2">Setting</th>
                    <th className="px-3 py-2">Current</th>
                    <th className="px-3 py-2">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {diff.length > 0 ? (
                    diff.map((d) => (
                      <tr key={d.label}>
                        <td className="px-3 py-2 font-medium">{d.label}</td>
                        <td className="px-3 py-2 text-destructive">
                          {d.current}
                        </td>
                        <td className="px-3 py-2 text-green-600">
                          {d.default}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-4 text-center text-muted-foreground italic"
                      >
                        All settings are already at default values.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onReset}
            className="bg-destructive hover:bg-destructive/90"
          >
            Reset Settings
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
