import initialPasta from '../data/pasta.json';
import initialActions from '../data/actions.json';
import type { PastaRecord } from '../types/pasta';
import type { ActionRecord } from '../types/action';

const PASTA_KEY = 'pasta_data';
const ACTIONS_KEY = 'actions_data';

export function loadPasta(): PastaRecord[] {
    const raw = localStorage.getItem(PASTA_KEY);
    if (!raw) {
        const seed = initialPasta as PastaRecord[];
        localStorage.setItem(PASTA_KEY, JSON.stringify(seed));
        return [...seed];
    }
    return JSON.parse(raw) as PastaRecord[];
}

export function savePasta(list: PastaRecord[]): void {
    localStorage.setItem(PASTA_KEY, JSON.stringify(list));
}

export function loadActions(): ActionRecord[] {
    const raw = localStorage.getItem(ACTIONS_KEY);
    if (!raw) {
        const seed = initialActions as ActionRecord[];
        localStorage.setItem(ACTIONS_KEY, JSON.stringify(seed));
        return [...seed];
    }
    return JSON.parse(raw) as ActionRecord[];
}

export function saveActions(list: ActionRecord[]): void {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(list));
}