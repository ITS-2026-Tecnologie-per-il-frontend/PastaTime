import { useState } from "react";
import type { CookingTimer } from "../hooks/useCookingTimer";
import type { CookingMode, Product } from "../types";
import TimerDisplay from "../components/TimerDisplay";
import CookingModeSelector from "../components/CookingModeSelector";

// Placeholder da definire (potrebbero arrivare dal prodotto)
const MODE_OFFSET: Record<CookingMode, number> = {
  al_dente: -60,
  normal: 0,
  soft: 60,
};

interface TimerScreenProps {
  product: Product;
  timer: CookingTimer;
  onDone: () => void;
  onDetails: () => void;
}

export default function TimerScreen({ product, timer, onDone, onDetails }: TimerScreenProps) {
  const [mode, setMode] = useState<CookingMode>("normal");
  const { remainingMs, status, isRinging, audioError, retryAlarm, start, stop, adjust, reset } = timer;
  const running = status === "running";

  const handleModeChange = (next: CookingMode) => {
    setMode(next);
    reset(product.cookingSeconds + MODE_OFFSET[next]);
  };

  return (
    <main className="timer-screen">
      <h2>{product.name}</h2>

      <TimerDisplay remainingMs={remainingMs} isRinging={isRinging} />

      {isRinging && <p role="status">La pasta è pronta! 🍝</p>}
      {audioError && (
        <p role="alert">
          Audio non disponibile. Controlla i permessi audio del browser.
          {isRinging && <button onClick={retryAlarm}>Attiva avviso sonoro</button>}
        </p>
      )}

      <CookingModeSelector value={mode} onChange={handleModeChange} disabled={running} />

      <div className="adjust">
        <button onClick={() => adjust(-30)}>−30s</button>
        <button onClick={() => adjust(30)}>+30s</button>
      </div>

      <div className="controls">
        {running ? (
          <button onClick={stop}>{isRinging ? "Ferma avviso" : "Stop"}</button>
        ) : (
          <button onClick={start}>Start</button>
        )}
        <button onClick={onDone}>Done</button>
      </div>

      <button className="details-btn" onClick={onDetails}>
        Details
      </button>
    </main>
  );
}
