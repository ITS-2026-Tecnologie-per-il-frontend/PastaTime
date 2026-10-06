import type { Product } from "../types";
import "./DetailsPanel.css";

interface DetailsPanelProps {
  id: string;
  product: Product;
  open: boolean;
}

function formatCookingTime(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return sec === 0 ? `${min} min` : `${min} min ${sec} s`;
}

// Pannello che si apre/chiude dentro la schermata del timer.
// Resta sempre montato: l'altezza passa da 0 a auto con una transizione,
// e `inert` impedisce focus e lettura da screen reader quando è chiuso.
export default function DetailsPanel({ id, product, open }: DetailsPanelProps) {
  return (
    <section
      id={id}
      className={`details-panel${open ? " open" : ""}`}
      aria-label="Dettagli del prodotto"
      inert={!open}
    >
      <div className="details-panel-clip">
        <div className="details-panel-body">
          <dl className="details-list">
            {product.brand && (
              <>
                <dt>Marca</dt>
                <dd>{product.brand}</dd>
              </>
            )}

            <dt>Tempo di cottura</dt>
            <dd>{formatCookingTime(product.cookingSeconds)}</dd>

            <dt>Codice a barre</dt>
            <dd>{product.barcode}</dd>

            {product.systemCode && (
              <>
                <dt>Codice di sistema</dt>
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
