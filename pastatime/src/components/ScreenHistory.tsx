import type { Product } from "../types";
import { useTranslation } from "../context/LanguageContext";
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
  const { t } = useTranslation();

  if (items.length === 0) {
    return <p className="history-empty">{t("labels.noRecentScans")}</p>;
  }

  return (
    <section className="history">
      <h2>{t("labels.recentScans")}</h2>
      <ul>
        {items.map((p) => {
          const last = getLastCompletedAction(p.barcode);
          const voteLabel = (vote: number) =>
            vote === 1 ? t("labels.feedbackPositive") : t("labels.feedbackNegative");
          return (
            <li key={p.barcode}>
              <button onClick={() => onSelect(p)}>{p.name}</button>
              {last && (
                <span className="history-meta">
                  <span title={t("labels.lastCookDuration")}>
                    ⏱ {formatDuration(actionDurationSeconds(last))}
                  </span>
                  {last.vote !== 0 && (
                    <span
                      role="img"
                      aria-label={voteLabel(last.vote)}
                      title={voteLabel(last.vote)}
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
