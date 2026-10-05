import type { FeedbackValue } from "../types";

interface FeedbackModalProps {
  onSelect: (value: FeedbackValue) => void;
}

export default function FeedbackModal({ onSelect }: FeedbackModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Com'è venuta la pasta?</h3>
        <button onClick={() => onSelect("positive")}>👍 Perfetta</button>
        <button onClick={() => onSelect("negative")}>👎 Non ci siamo</button>
      </div>
    </div>
  );
}