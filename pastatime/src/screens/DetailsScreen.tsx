import type { Product } from "../types";

interface DetailsScreenProps {
  product: Product;
  onBack: () => void;
}

function formatCookingTime(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return sec === 0 ? `${min} min` : `${min} min ${sec} s`;
}

export default function DetailsScreen({ product, onBack }: DetailsScreenProps) {
  return (
    <main className="details">
      <button onClick={onBack}>← Torna al timer</button>
      <h2>{product.name}</h2>

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
    </main>
  );
}
