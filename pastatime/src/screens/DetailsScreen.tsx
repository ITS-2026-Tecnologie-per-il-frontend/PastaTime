import type { Product } from "../types";

interface DetailsScreenProps {
  product: Product;
  onBack: () => void;
}

export default function DetailsScreen({ product, onBack }: DetailsScreenProps) {
  return (
    <main className="details">
      <button onClick={onBack}>← Torna al timer</button>
      <h2>{product.name}</h2>
      {/* Contenuto da definire */}
    </main>
  );
}