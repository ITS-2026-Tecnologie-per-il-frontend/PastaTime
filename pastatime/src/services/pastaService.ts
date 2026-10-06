import { loadPasta, savePasta } from './storage';
import type { PastaRecord } from '../types/pasta';
import type { Product } from '../types';

/**
 * Simula GET /pasta_time_api/pasta/by-codebar/:codebar
 * PROVVISORIO: restituisce un record casuale ignorando il codebar.
 * Aggiorna il campo `last_used` del record restituito.
 */
export async function fetchPastaByCodebar(
    _codebar: string
): Promise<PastaRecord> {
    await new Promise<void>((r) => setTimeout(r, 300)); // latenza simulata

    const list = loadPasta();
    if (list.length === 0) throw new Error('PASTA_DB_EMPTY');

    // ── PROVVISORIO: record casuale ──
    const randomIndex = Math.floor(Math.random() * list.length);
    const record = { ...list[randomIndex]! };
    // ─────────────────────────────────

    // Quando ci sarà il backend reale:
    // const record = list.find(p => p.codebar === codebar);
    // if (!record) throw new Error('PASTA_NOT_FOUND');

    record.last_used = new Date().toISOString();
    list[randomIndex] = record;
    savePasta(list);

    return record;
}

export function getAllPasta(): PastaRecord[] {
    return loadPasta();
}

/** Converte un record del JSON nel `Product` usato dalle schermate. */
export function pastaToProduct(record: PastaRecord): Product {
    return {
        barcode: record.codebar,
        name: record.description,
        cookingSeconds: record.cooking_time,
        brand: record.brand,
        extendedDescription: record.extended_description,
        systemCode: record.system_code,
    };
}
