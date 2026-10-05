import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PastaRecord } from '../src/types/pasta';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const brands = [
    'Barilla', 'De Cecco', 'Garofalo', 'Voiello', 'Rummo',
    'La Molisana', 'Buitoni', 'Divella', 'Agnesi', 'Granoro',
] as const;

const shapes = [
    'Spaghetti', 'Penne', 'Fusilli', 'Rigatoni', 'Farfalle',
    'Tagliatelle', 'Linguine', 'Conchiglie', 'Orecchiette',
    'Tortiglioni', 'Fettuccine', 'Bucatini', 'Cannelloni',
    'Ditalini', 'Gemelli', 'Cavatappi', 'Ziti', 'Ravioli',
    'Tortellini', 'Lasagne',
] as const;

const weights = [250, 500, 1000] as const;

const pad = (n: number, len = 4): string => String(n).padStart(len, '0');
const randomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const records: PastaRecord[] = [];
const usedBarCodes = new Set<string>();

for (let i = 1; i <= 100; i++) {
    let codebar: string;
    do {
        codebar = '80' + pad(randomInt(0, 9999999999), 11);
    } while (usedBarCodes.has(codebar));
    usedBarCodes.add(codebar);

    const brand = brands[randomInt(0, brands.length - 1)]!;
    const shape = shapes[randomInt(0, shapes.length - 1)]!;
    const weight = weights[randomInt(0, weights.length - 1)]!;
    const cookingTime = randomInt(180, 660); // 3–11 minuti in secondi

    records.push({
        ID: i,
        codebar,
        system_code: 'PST-' + pad(i, 6),
        description: `${shape} ${weight}g`,
        extended_description:
            `${shape} di semola di grano duro, formato ${weight}g, marca ${brand}. ` +
            `Tempo di cottura consigliato: ${Math.floor(cookingTime / 60)} minuti.`,
        brand,
        cooking_time: cookingTime,
        last_used: null,
    });
}

const outPath = path.resolve(__dirname, '../src/data/pasta.json');
fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
console.log(`pasta.json generato: ${records.length} record → ${outPath}`);