import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "../types";

export function useCookingTimer(alarmSrc = `${import.meta.env.BASE_URL}audio/pasta-pronta.wav`) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const endAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => () => {
    audioRef.current?.pause();
  }, []);

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
      audio.volume = 1;
      audio.play().then(() => setAudioError(false)).catch(() => setAudioError(true));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isRinging]);

  const reset = useCallback((seconds: number) => {
    audioRef.current?.pause();
    setAudioError(false);
    setStatus("idle");
    setRemainingMs(seconds * 1000);
  }, []);

  const start = useCallback(() => {
    // Avvia una riproduzione silenziosa nel click per abilitare l'audio.
    if (!audioRef.current) {
      const audio = new Audio(alarmSrc);
      audio.loop = true;
      audio.preload = "auto";
      audioRef.current = audio;
    }
    endAtRef.current = Date.now() + remainingMs;
    const audio = audioRef.current;
    audio.volume = 0;
    audio.play().then(() => {
      if (endAtRef.current > Date.now()) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.volume = 1;
      setAudioError(false);
    }).catch(() => setAudioError(true));
    setStatus("running");
  }, [remainingMs, alarmSrc]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
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

  const retryAlarm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isRinging) return;
    audio.volume = 1;
    audio.play().then(() => setAudioError(false)).catch(() => setAudioError(true));
  }, [isRinging]);

  return { remainingMs, status, isRinging, audioError, retryAlarm, start, stop, adjust, reset };
}

export type CookingTimer = ReturnType<typeof useCookingTimer>;
