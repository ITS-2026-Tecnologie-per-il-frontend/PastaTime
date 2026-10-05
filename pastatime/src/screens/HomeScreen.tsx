import { useState } from "react";
import type { Product } from "../types";
import ScanHistory from "../components/ScanHistory";
import BarcodeScanner from "../components/BarcodeScanner";

interface HomeScreenProps {
  history: Product[];
  onScanned: (product: Product) => void;
}

export default function HomeScreen({ history, onScanned }: HomeScreenProps) {
  const [scanning, setScanning] = useState<boolean>(false);

  return (
    <main className="home">
      <h1>Pasta Timer</h1>

      <ScanHistory items={history} onSelect={onScanned} />

      <button className="scan-btn" onClick={() => setScanning(true)}>
        Scansiona codice a barre
      </button>

      {scanning && (
        <BarcodeScanner
          onClose={() => setScanning(false)}
          onResult={(product) => {
            setScanning(false);
            onScanned(product);
          }}
        />
      )}
    </main>
  );
}