import { useState } from "react";
import type { Product } from "../types";
import { useTranslation } from "../context/LanguageContext";
import ScreenHistory from "../components/ScreenHistory";
import BarcodeScanner from "../components/BarcodeScanner";

interface HomeScreenProps {
  history: Product[];
  onScanned: (product: Product) => void;
}

export default function HomeScreen({ history, onScanned }: HomeScreenProps) {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState<boolean>(false);

  return (
    <main className="home">
      <h1>{t("app.title")}</h1>

      <ScreenHistory items={history} onSelect={onScanned} />

      <button className="scan-btn" onClick={() => setScanning(true)}>
        {t("buttons.scanDemo")}
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
