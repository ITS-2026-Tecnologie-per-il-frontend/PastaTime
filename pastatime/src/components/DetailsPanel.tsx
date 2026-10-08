import type { Product } from "../types";
import { useTranslation } from "../context/LanguageContext";
import "./DetailsPanel.css";

interface DetailsPanelProps {
  id: string;
  product: Product;
  open: boolean;
}

function formatCookingTime(totalSeconds: number, min_: string, sec_: string): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return sec === 0 ? `${min} ${min_}` : `${min} ${min_} ${sec} ${sec_}`;
}

// Pannello che si apre/chiude dentro la schermata del timer.
// Resta sempre montato: l'altezza passa da 0 a auto con una transizione,
// e `inert` impedisce focus e lettura da screen reader quando è chiuso.
export default function DetailsPanel({ id, product, open }: DetailsPanelProps) {
  const { t } = useTranslation();

  return (
    <section
      id={id}
      className={`details-panel${open ? " open" : ""}`}
      aria-label={t("labels.productDetails")}
      inert={!open}
    >
      <div className="details-panel-clip">
        <div className="details-panel-body">
          <dl className="details-list">
            {product.brand && (
              <>
                <dt>{t("labels.brand")}</dt>
                <dd>{product.brand}</dd>
              </>
            )}

            <dt>{t("labels.cookingTime")}</dt>
            <dd>
              {formatCookingTime(product.cookingSeconds, t("units.minutes"), t("units.seconds"))}
            </dd>

            <dt>{t("labels.barcode")}</dt>
            <dd>{product.barcode}</dd>

            {product.systemCode && (
              <>
                <dt>{t("labels.systemCode")}</dt>
                <dd>{product.systemCode}</dd>
              </>
            )}
          </dl>

          {product.extendedDescription && (
            <p className="details-description">{product.extendedDescription}</p>
          )}
        </div>
      </div>
    </section>
  );
}
