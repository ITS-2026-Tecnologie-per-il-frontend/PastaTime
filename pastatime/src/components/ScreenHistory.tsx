import type { Product } from "../types";

interface ScanHistoryProps {
  items: Product[];
  onSelect: (product: Product) => void;
}

export default function ScanHistory({ items, onSelect }: ScanHistoryProps) {
  if (items.length === 0) {
    return <p className="history-empty">Nessuna scansione recente</p>;
  }

  return (
    <section className="history">
      <h2>Ultime scansioni</h2>
      <ul>
        {items.map((p) => (
          <li key={p.barcode}>
            <button onClick={() => onSelect(p)}>{p.name}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}