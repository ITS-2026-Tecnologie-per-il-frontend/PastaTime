import type { CookingMode } from "../types";

interface CookingModeSelectorProps {
  value: CookingMode;
  onChange: (mode: CookingMode) => void;
  disabled?: boolean;
}

const MODES: ReadonlyArray<{ id: CookingMode; label: string }> = [
  { id: "al_dente", label: "Al dente" },
  { id: "normal", label: "Normale" },
  { id: "soft", label: "Morbida" },
];

export default function CookingModeSelector({
  value,
  onChange,
  disabled = false,
}: CookingModeSelectorProps) {
  return (
    <div className="mode-selector" role="radiogroup" aria-label="Cottura">
      {MODES.map((m) => (
        <button
          key={m.id}
          role="radio"
          aria-checked={value === m.id}
          className={value === m.id ? "active" : ""}
          disabled={disabled}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}