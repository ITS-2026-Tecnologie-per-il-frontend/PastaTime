import { useEffect, useRef } from "react";
import type { Product } from "../types";
import { useTranslation } from "../context/LanguageContext";
import { fetchPastaByCodebar, pastaToProduct } from "../services/pastaService";
import "./BarcodeScanner.css";

// Fallback dimostrativo, usato solo se pasta.json non è disponibile.
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
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    let cancelled = false;

    // Simula la scansione: dopo 2s prende un record casuale da pasta.json.
    const timeout = window.setTimeout(async () => {
      try {
        const record = await fetchPastaByCodebar("simulated");
        if (!cancelled) onResult(pastaToProduct(record));
      } catch {
        if (!cancelled) onResult(DEMO_PRODUCT);
      }
    }, 2000);

    // Annulla anche la scansione in corso quando si chiude la finestra.
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
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
      <h2 id="scanner-title">{t("scanner.demoTitle")}</h2>
      <p id="scanner-description">{t("scanner.demoDescription")}</p>
      <div className="scanner-barcode" aria-hidden="true">
        <span className="scanner-line" />
      </div>
      <p role="status">{t("messages.scanning")}</p>
      <button type="button" onClick={onClose} autoFocus>{t("buttons.cancel")}</button>
    </dialog>
  );
}
