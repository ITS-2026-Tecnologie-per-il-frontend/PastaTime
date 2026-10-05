import { useState } from "react";
import { useCookingTimer } from "./hooks/useCookingTimer";
import type { FeedbackValue, Product, Screen } from "./types";
import HomeScreen from "./screens/HomeScreen";
import TimerScreen from "./screens/TimerScreen";
import DetailsScreen from "./screens/DetailsScreen";
import FeedbackModal from "./components/FeedbackModal";

const MAX_HISTORY = 10;

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<Product[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const timer = useCookingTimer();

  const handleScanned = (scanned: Product) => {
    setProduct(scanned);
    setHistory((h) =>
      [scanned, ...h.filter((p) => p.barcode !== scanned.barcode)].slice(0, MAX_HISTORY)
    );
    timer.reset(scanned.cookingSeconds);
    setScreen("timer");
  };

  const handleDone = () => {
    timer.stop();
    setShowFeedback(true);
  };

  const handleFeedback = (value: FeedbackValue) => {
    // Salvataggio nel JSON a cura del collega
    void value;
    setShowFeedback(false);
    setScreen("home");
  };

  return (
    <>
      {screen === "home" && <HomeScreen history={history} onScanned={handleScanned} />}

      {screen === "timer" && product && (
        <TimerScreen
          product={product}
          timer={timer}
          onDone={handleDone}
          onDetails={() => setScreen("details")}
        />
      )}

      {screen === "details" && product && (
        <DetailsScreen product={product} onBack={() => setScreen("timer")} />
      )}

      {showFeedback && <FeedbackModal onSelect={handleFeedback} />}
    </>
  );
}