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
import { Archive, Trash2, Upload } from "lucide-react";

interface BulkActionToolbarProps {
  selectedCount: number;
  onAction: (action: "archive" | "unarchive" | "delete") => Promise<void>;
}

export function BulkActionToolbar({
  selectedCount,
  onAction,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-md p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
      <span className="text-sm font-medium px-2">{selectedCount} selected</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onAction("archive")}>
          <Archive className="h-4 w-4 mr-2" />
          Archive
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction("unarchive")}
        >
          <Upload className="h-4 w-4 mr-2" />
          Restore
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedCount} games?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onAction("delete")}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
