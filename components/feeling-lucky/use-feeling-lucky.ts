"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Game } from "@/app/generated/prisma/client";
import canvasConfetti from "canvas-confetti";
import { TOPIC_CONFETTI_COLORS } from "./themes";

export function useFeelingLucky(
  games: Game[],
  playedIds: Set<string>,
  open: boolean
) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Game | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const fireConfetti = useCallback((topic?: string) => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = (topic && TOPIC_CONFETTI_COLORS[topic]) || [
      "#22c55e",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
    ];

    const frame = () => {
      canvasConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      canvasConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const spin = useCallback(() => {
    if (games.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setCurrentGame(null);

    const unplayedGames = games.filter((g) => !playedIds.has(g.id));
    const pool = unplayedGames.length > 0 ? unplayedGames : games;
    const winningGame = pool[Math.floor(Math.random() * pool.length)];

    let speed = 50;
    let elapsed = 0;
    const totalDuration = 3000 + Math.random() * 1000;

    const tick = () => {
      const randomShow = games[Math.floor(Math.random() * games.length)];
      setCurrentGame(randomShow);

      elapsed += speed;
      speed = speed * 1.1;

      if (elapsed < totalDuration) {
        timeoutRef.current = setTimeout(tick, speed);
      } else {
        setCurrentGame(winningGame);
        setWinner(winningGame);
        setIsSpinning(false);
        fireConfetti(winningGame.topic);
      }
    };

    tick();
  }, [games, playedIds, fireConfetti]);

  useEffect(() => {
    if (open) {
      spin();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsSpinning(false);
      setWinner(null);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, spin]);

  return {
    currentGame,
    isSpinning,
    winner,
    spin,
  };
}
