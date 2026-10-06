export interface Product {
  barcode: string;
  name: string;
  cookingSeconds: number;
  /** Dettagli opzionali: presenti quando il prodotto arriva da pasta.json */
  brand?: string;
  extendedDescription?: string;
  systemCode?: string;
}

export type CookingMode = "al_dente" | "normal" | "soft";
export type TimerStatus = "idle" | "running" | "stopped";
export type FeedbackValue = "positive" | "negative";
export type Screen = "home" | "timer";