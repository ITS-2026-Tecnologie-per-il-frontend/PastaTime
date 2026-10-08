import { useState } from "react";
import type { CookingTimer } from "../hooks/useCookingTimer";
import { useTranslation } from "../context/LanguageContext";
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
  /** Avvio del timer: App registra l'inizio della cottura e poi chiama timer.start. */
  onStart: () => void;
  /** Chiamata dopo la conferma: App resetta il timer e torna alla home. */
  onExit: () => void;
}

export default function TimerScreen({ product, timer, onDone, onExit, onStart }: TimerScreenProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<CookingMode>("normal");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [confirmExit, setConfirmExit] = useState<boolean>(false);
  const { remainingMs, status, isRinging, audioError, retryAlarm, stop, adjust, reset } = timer;
  const running = status === "running";

  const handleModeChange = (next: CookingMode) => {
    setMode(next);
    reset(product.cookingSeconds + MODE_OFFSET[next]);
  };

  return (
    <main className="timer-screen">
      <button className="back-btn" onClick={() => setConfirmExit(true)}>
        {t("buttons.home")}
      </button>

      <h2>{product.name}</h2>

      <TimerDisplay remainingMs={remainingMs} isRinging={isRinging} />

      {isRinging && <p role="status">{t("messages.timerFinished")} 🍝</p>}
      {audioError && (
        <p role="alert">
          {t("messages.audioUnavailable")}
          {isRinging && <button onClick={retryAlarm}>{t("buttons.enableSound")}</button>}
        </p>
      )}

      <CookingModeSelector value={mode} onChange={handleModeChange} disabled={running} />

      <div className="adjust">
        <button onClick={() => adjust(-30)}>−30s</button>
        <button onClick={() => adjust(30)}>+30s</button>
      </div>

      <div className="controls">
        {running ? (
          <button onClick={stop}>{isRinging ? t("buttons.stopAlarm") : t("buttons.stop")}</button>
        ) : (
          <button onClick={onStart}>{t("buttons.start")}</button>
        )}
        <button onClick={onDone}>{t("buttons.done")}</button>
      </div>

      <button
        className="details-btn"
        onClick={() => setShowDetails((v) => !v)}
        aria-expanded={showDetails}
        aria-controls="product-details"
      >
        {showDetails ? t("buttons.hideDetails") : t("buttons.details")}
      </button>

      <DetailsPanel id="product-details" product={product} open={showDetails} />

      {confirmExit && (
        <ConfirmDialog
          title={t("confirm.exitTitle")}
          message={t("confirm.exitMessage")}
          confirmLabel={t("buttons.backToHome")}
          cancelLabel={t("buttons.stay")}
          onConfirm={onExit}
          onCancel={() => setConfirmExit(false)}
        />
      )}
    </main>
  );
}
