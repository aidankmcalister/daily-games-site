"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { DlesButton } from "@/components/design/dles-button";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ImportJsonDialogProps {
  onImportComplete: () => void;
}

export function ImportJsonDialog({ onImportComplete }: ImportJsonDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        toast.error("JSON must be an array of game objects");
        return;
      }

      if (parsed.length === 0) {
        toast.error("JSON array is empty");
        return;
      }

      setIsImporting(true);
      setProgress(0);
      setStats({ total: parsed.length, success: 0, failed: 0 });

      let successCount = 0;
      let failedCount = 0;

      // Process in chunks to avoid overwhelming the server, but keep UI responsive
      // Actually, standard sequential loop is fine for client-initiated flow unless huge.
      // 600 items is manageable but visual feedback is key.

      for (let i = 0; i < parsed.length; i++) {
        const game = parsed[i];

        // Basic validation before send
        if (!game.title || !game.topic) {
          failedCount++;
          continue;
        }

        try {
          const res = await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: game.title,
              topic: game.topic,
              link: game.link || "",
              description: game.description || "",
            }),
          });

          if (res.ok) successCount++;
          else failedCount++;
        } catch (e) {
          failedCount++;
        }

        setStats({
          total: parsed.length,
          success: successCount,
          failed: failedCount,
        });
        setProgress(Math.round(((i + 1) / parsed.length) * 100));
      }

      toast.success(
        `Import complete: ${successCount} imported, ${failedCount} failed`
      );
      onImportComplete();

      // Don't close immediately if there are errors, effectively let user see stats
      if (failedCount === 0) {
        setTimeout(() => {
          setIsOpen(false);
          resetState();
        }, 1000);
      } else {
        setIsImporting(false);
      }
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const resetState = () => {
    setJsonContent("");
    setIsImporting(false);
    setProgress(0);
    setStats(null);
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isImporting) {
          setIsOpen(open);
          if (!open) resetState();
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <DlesButton>
          <FileUp className="h-3.5 w-3.5" />
          Import JSON
        </DlesButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full sm:w-[800px] max-w-none max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Import Games from JSON</AlertDialogTitle>
          <AlertDialogDescription>
            Paste the contents of your <code>games.json</code> file below. Any
            invalid entries will be skipped.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {!isImporting && !stats ? (
            <Textarea
              placeholder='[{"title": "Game Name", "topic": "words", ...}]'
              className="h-[50vh] max-h-[500px] font-mono text-xs resize-none whitespace-pre-wrap break-all"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
            />
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-2xl font-mono font-bold">
                      {stats.total}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total
                    </div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                    <div className="text-2xl font-mono font-bold text-green-500">
                      {stats.success}
                    </div>
                    <div className="text-xs text-green-600/80 uppercase tracking-wider">
                      Success
                    </div>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <div className="text-2xl font-mono font-bold text-destructive">
                      {stats.failed}
                    </div>
                    <div className="text-xs text-destructive/80 uppercase tracking-wider">
                      Failed
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!isImporting && (
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              {stats ? "Close" : "Cancel"}
            </AlertDialogCancel>
          )}

          {!stats && (
            <DlesButton
              onClick={handleImport}
              disabled={jsonContent.trim().length === 0}
            >
              Start Import
            </DlesButton>
          )}

          {stats && !isImporting && (
            <DlesButton
              onClick={() => {
                setIsOpen(false);
                resetState();
              }}
            >
              Done
            </DlesButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
