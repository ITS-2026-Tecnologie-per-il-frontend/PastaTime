export interface Product {
  barcode: string;
  name: string;
  cookingSeconds: number;
}

export type CookingMode = "al_dente" | "normal" | "soft";
export type TimerStatus = "idle" | "running" | "stopped";
export type FeedbackValue = "positive" | "negative";
export type Screen = "home" | "timer" | "details";