import type { CookingMode } from "../types";
import { useTranslation } from "../context/LanguageContext";

interface CookingModeSelectorProps {
  value: CookingMode;
  onChange: (mode: CookingMode) => void;
  disabled?: boolean;
}

const MODES: ReadonlyArray<{ id: CookingMode; labelKey: string }> = [
  { id: "al_dente", labelKey: "modes.alDente" },
  { id: "normal", labelKey: "modes.normal" },
  { id: "soft", labelKey: "modes.soft" },
];

export default function CookingModeSelector({
  value,
  onChange,
  disabled = false,
}: CookingModeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="mode-selector" role="radiogroup" aria-label={t("labels.cooking")}>
      {MODES.map((m) => (
        <button
          key={m.id}
          role="radio"
          aria-checked={value === m.id}
          className={value === m.id ? "active" : ""}
          disabled={disabled}
          onClick={() => onChange(m.id)}
        >
          {t(m.labelKey)}
        </button>
      ))}
    </div>
  );
}