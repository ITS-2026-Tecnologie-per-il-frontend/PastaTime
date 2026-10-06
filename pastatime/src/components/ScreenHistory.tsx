import type { Product } from "../types";
import {
  actionDurationSeconds,
  getLastCompletedAction,
} from "../services/actionService";
import "./ScanHistory.css";

interface ScanHistoryProps {
  items: Product[];
  onSelect: (product: Product) => void;
}

function formatDuration(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function ScanHistory({ items, onSelect }: ScanHistoryProps) {
  if (items.length === 0) {
    return <p className="history-empty">Nessuna scansione recente</p>;
  }

  return (
    <section className="history">
      <h2>Ultime scansioni</h2>
      <ul>
        {items.map((p) => {
          const last = getLastCompletedAction(p.barcode);
          return (
            <li key={p.barcode}>
              <button onClick={() => onSelect(p)}>{p.name}</button>
              {last && (
                <span className="history-meta">
                  <span title="Durata dell'ultima cottura">
                    ⏱ {formatDuration(actionDurationSeconds(last))}
                  </span>
                  {last.vote !== 0 && (
                    <span
                      role="img"
                      aria-label={
                        last.vote === 1 ? "Feedback positivo" : "Feedback negativo"
                      }
                      title={last.vote === 1 ? "Feedback positivo" : "Feedback negativo"}
                    >
                      {last.vote === 1 ? "👍" : "👎"}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
