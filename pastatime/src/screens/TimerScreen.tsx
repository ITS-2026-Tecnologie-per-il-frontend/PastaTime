import { useState } from "react";
import type { CookingTimer } from "../hooks/useCookingTimer";
import type { CookingMode, Product } from "../types";
import TimerDisplay from "../components/TimerDisplay";
import CookingModeSelector from "../components/CookingModeSelector";
import DetailsPanel from "../components/DetailsPanel";
import ConfirmDialog from "../components/ConfirmDialog";

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
  /** Chiamata dopo la conferma: App resetta il timer e torna alla home. */
  onExit: () => void;
}

export default function TimerScreen({ product, timer, onDone, onExit }: TimerScreenProps) {
  const [mode, setMode] = useState<CookingMode>("normal");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);
  const { remainingMs, status, isRinging, audioError, retryAlarm, start, stop, adjust, reset } = timer;
  const running = status === "running";

  const handleModeChange = (next: CookingMode) => {
    setMode(next);
    reset(product.cookingSeconds + MODE_OFFSET[next]);
  };

  return (
    <main className="timer-screen">
      <button className="back-btn" onClick={() => setConfirmExit(true)}>
        ← Home
      </button>

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

      <button
        className="details-btn"
        onClick={() => setShowDetails((v) => !v)}
        aria-expanded={showDetails}
        aria-controls="product-details"
      >
        {showDetails ? "Nascondi details" : "Details"}
      </button>

      <DetailsPanel id="product-details" product={product} open={showDetails} />

      {confirmExit && (
        <ConfirmDialog
          title="Tornare alla home?"
          message="Il timer verrà azzerato e perderai il tempo trascorso."
          confirmLabel="Torna alla home"
          cancelLabel="Resta qui"
          onConfirm={onExit}
          onCancel={() => setConfirmExit(false)}
        />
      )}
    </main>
  );
}
