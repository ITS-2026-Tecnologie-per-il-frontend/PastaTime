import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerStatus } from "../types";

// Applica la modifica manuale senza mai portare il timer sotto lo 0.
// Se il tempo è già scaduto (overtime), il tasto "-" non ha effetto.
function applyDelta(currentMs: number, deltaMs: number): number {
  if (deltaMs >= 0) return currentMs + deltaMs;
  if (currentMs <= 0) return currentMs;
  return Math.max(0, currentMs + deltaMs);
}

export function useCookingTimer(alarmSrc = `${import.meta.env.BASE_URL}audio/pasta-pronta.wav`) {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const endAtRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [startAudioError, setStartAudioError] = useState(false);

  useEffect(() => () => {
    audioRef.current?.pause();
    startAudioRef.current?.pause();
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
      startAudioRef.current?.pause();
      audio.volume = 1;
      audio.play().then(() => setAudioError(false)).catch(() => setAudioError(true));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isRinging]);

  const reset = useCallback((seconds: number) => {
    audioRef.current?.pause();
    startAudioRef.current?.pause();
    setAudioError(false);
    setStartAudioError(false);
    setStatus("idle");
    setRemainingMs(seconds * 1000);
  }, []);

  const start = useCallback(() => {
    // Un breve suono conferma l'avvio (o la ripresa), senza ripetersi.
    if (remainingMs > 0) {
      if (!startAudioRef.current) {
        startAudioRef.current = new Audio(`${import.meta.env.BASE_URL}audio/inizio-timer.wav`);
        startAudioRef.current.volume = 0.7;
      }
      const startAudio = startAudioRef.current;
      startAudio.currentTime = 0;
      setStartAudioError(false);
      startAudio.play().catch((error: unknown) => {
        // Stop/reset possono interrompere una riproduzione ancora in attesa.
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setStartAudioError(true);
        }
      });
    }
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
    startAudioRef.current?.pause();
    if (status === "running") {
      setRemainingMs(endAtRef.current - Date.now());
    }
    setStatus("stopped");
  }, [status]);

  const adjust = useCallback(
    (deltaSeconds: number) => {
      const deltaMs = deltaSeconds * 1000;
      if (status === "running") {
        const now = Date.now();
        const next = applyDelta(endAtRef.current - now, deltaMs);
        endAtRef.current = now + next;
        setRemainingMs(next);
      } else {
        setRemainingMs((ms) => applyDelta(ms, deltaMs));
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

  return { remainingMs, status, isRinging, audioError: audioError || startAudioError, retryAlarm, start, stop, adjust, reset };
}

export type CookingTimer = ReturnType<typeof useCookingTimer>;
