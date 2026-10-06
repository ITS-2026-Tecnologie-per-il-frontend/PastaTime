import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Popup di conferma generico, riutilizzabile per altre azioni distruttive.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Conferma",
  cancelLabel = "Annulla",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Apre il dialog al montaggio. Il controllo `open` evita errori
  // quando StrictMode esegue l'effect due volte in sviluppo.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      // Il tasto Esc genera `cancel`: lo trattiamo come "Annulla".
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h3 id="confirm-title">{title}</h3>
      <p id="confirm-message">{message}</p>

      <div className="confirm-actions">
        <button type="button" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
        <button type="button" className="confirm-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
