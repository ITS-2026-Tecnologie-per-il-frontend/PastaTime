import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "../types";

export function useCookingTimer(alarmSrc = "/alarm.mp3") {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const endAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tick: ricalcola dal timestamp di fine, non decrementa un contatore
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      setRemainingMs(endAtRef.current - Date.now());
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  const isRinging = status === "running" && remainingMs <= 0;

  // Allarme: suona finché il timer è running e in overtime
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isRinging) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isRinging]);

  const reset = useCallback((seconds: number) => {
    setStatus("idle");
    setRemainingMs(seconds * 1000);
  }, []);

  const start = useCallback(() => {
    // Creato dentro il click così il browser consente la riproduzione
    if (!audioRef.current) {
      const audio = new Audio(alarmSrc);
      audio.loop = true;
      audioRef.current = audio;
    }
    endAtRef.current = Date.now() + remainingMs;
    setStatus("running");
  }, [remainingMs, alarmSrc]);

  const stop = useCallback(() => {
    if (status === "running") {
      setRemainingMs(endAtRef.current - Date.now());
    }
    setStatus("stopped");
  }, [status]);

  const adjust = useCallback(
    (deltaSeconds: number) => {
      if (status === "running") {
        endAtRef.current += deltaSeconds * 1000;
        setRemainingMs(endAtRef.current - Date.now());
      } else {
        setRemainingMs((ms) => ms + deltaSeconds * 1000);
      }
    },
    [status]
  );

  return { remainingMs, status, isRinging, start, stop, adjust, reset };
}

export type CookingTimer = ReturnType<typeof useCookingTimer>;