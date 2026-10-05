import type { Product } from "../types";

interface BarcodeScannerProps {
  onResult: (product: Product) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  // TODO: collegare la libreria di scansione.
  // Quando legge un codice valido: onResult({ barcode, name, cookingSeconds })
  void onResult;

  return (
    <div className="scanner-overlay">
      <video className="scanner-video" /* ref + stream dalla libreria */ />
      <button onClick={onClose}>Annulla</button>
    </div>
  );
}