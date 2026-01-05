"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileJson, Users2, Download } from "lucide-react";

export function SystemUtilitiesCard() {
  return (
    <Card className="flex flex-col border-none shadow-none lg:border lg:shadow-sm bg-transparent lg:bg-card">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-base flex items-center gap-2 text-primary font-bold">
          <Database className="h-4 w-4" />
          System Utilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1.5 border-dashed border-border/50 hover:bg-muted/50 hover:border-primary/30 group transition-all"
            onClick={() => window.open("/api/admin/export/games", "_blank")}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <FileJson className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              Export Games
            </div>
            <span className="text-[10px] text-muted-foreground">
              Full JSON dataset
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1.5 border-dashed border-border/50 hover:bg-muted/50 hover:border-primary/30 group transition-all"
            onClick={() => window.open("/api/admin/export/users", "_blank")}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Users2 className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              Export Users
            </div>
            <span className="text-[10px] text-muted-foreground">
              User stats data
            </span>
          </Button>
        </div>

        <div className="bg-muted/10 p-4 rounded-xl border border-border/30 mt-auto">
          <div className="flex items-start gap-3">
            <Download className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              Downloads live JSON data from the database.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
