import { useState } from "react";
import type { Product } from "../types";
import ScreenHistory from "../components/ScreenHistory";
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

      <ScreenHistory items={history} onSelect={onScanned} />

      <button className="scan-btn" onClick={() => setScanning(true)}>
        Simula scansione codice a barre
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
