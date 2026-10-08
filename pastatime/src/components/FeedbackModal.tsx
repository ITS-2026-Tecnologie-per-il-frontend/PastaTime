import type { FeedbackValue } from "../types";
import { useTranslation } from "../context/LanguageContext";

interface FeedbackModalProps {
  onSelect: (value: FeedbackValue) => void;
}

export default function FeedbackModal({ onSelect }: FeedbackModalProps) {
  const { t } = useTranslation();

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>{t("feedback.title")}</h3>
        <button onClick={() => onSelect("positive")}>👍 {t("feedback.positive")}</button>
        <button onClick={() => onSelect("negative")}>👎 {t("feedback.negative")}</button>
      </div>
    </div>
  );
}