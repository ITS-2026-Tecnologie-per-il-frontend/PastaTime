import { useEffect, useRef } from "react";
import type { Product } from "../types";
import "./BarcodeScanner.css";

// Dati dimostrativi: non provengono da una lettura reale del codice.
const DEMO_PRODUCT: Product = {
  barcode: "DEMO-PASTA-001",
  name: "Spaghetti (demo)",
  cookingSeconds: 600,
};

interface BarcodeScannerProps {
  onResult: (product: Product) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    const timeout = window.setTimeout(() => onResult(DEMO_PRODUCT), 2000);

    // Annulla anche la scansione in corso quando si chiude la finestra.
    return () => window.clearTimeout(timeout);
  }, [onResult]);

  return (
    <dialog
      ref={dialogRef}
      className="scanner-dialog"
      aria-labelledby="scanner-title"
      aria-describedby="scanner-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="scanner-title">Scansione demo</h2>
      <p id="scanner-description">Simulazione senza fotocamera con una pasta di esempio.</p>
      <div className="scanner-barcode" aria-hidden="true">
        <span className="scanner-line" />
      </div>
      <p role="status">Scansione del codice a barre in corso…</p>
      <button type="button" onClick={onClose} autoFocus>Annulla</button>
    </dialog>
  );
}
