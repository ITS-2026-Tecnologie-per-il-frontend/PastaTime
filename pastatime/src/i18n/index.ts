import raw from './translations.json';
import type {
    Lang,
    TranslationEntry,
    TranslationMap,
    TranslationMeta,
    InterpolationParams,
} from '../types/i18n';

interface RawTranslations {
    _meta: TranslationMeta;
    [key: string]: TranslationEntry | TranslationMeta;
}

const data = raw as unknown as RawTranslations;
const META: TranslationMeta = data._meta;

const STRINGS: TranslationMap = Object.fromEntries(
    Object.entries(data).filter(([k]) => k !== '_meta')
) as TranslationMap;

export const defaultLang: Lang = META.defaultLang;
export const fallbackLang: Lang = META.fallbackLang;
export const supportedLangs: Lang[] = META.supportedLangs;

/**
 * Ritorna la stringa tradotta per chiave e lingua.
 * Fallback: lingua richiesta → fallbackLang → defaultLang → chiave stessa.
 */
export function translate(key: string, lang: Lang): string {
    const entry = STRINGS[key];
    if (!entry) return key;
    return (
        entry[lang] ??
        entry[fallbackLang] ??
        entry[defaultLang] ??
        key
    );
}

/**
 * Interpolazione placeholder: "Ciao {name}" + {name:'Mario'} → "Ciao Mario".
 */
export function interpolate(
    text: string,
    params?: InterpolationParams
): string {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, k: string) =>
        Object.prototype.hasOwnProperty.call(params, k)
            ? String(params[k])
            : `{${k}}`
    );
}

/**
 * Lingue effettivamente presenti nel JSON.
 */
export function getAvailableLangs(): Lang[] {
    const set = new Set<Lang>();
    for (const entry of Object.values(STRINGS)) {
        for (const lang of Object.keys(entry) as Lang[]) {
            set.add(lang);
        }
    }
    return Array.from(set).sort() as Lang[];
}

/**
 * Rileva la lingua del browser se supportata.
 */
export function detectBrowserLang(): Lang {
    const candidates: string[] = [
        ...(navigator.languages ?? []),
        navigator.language,
    ].filter(Boolean);

    for (const c of candidates) {
        const short = c.split('-')[0]?.toLowerCase() ?? '';
        if (supportedLangs.includes(short as Lang)) return short as Lang;
        if (supportedLangs.includes(c as Lang)) return c as Lang;
    }
    return defaultLang;
}

/**
 * Type guard per verificare se una stringa è una Lang valida.
 */
export function isLang(value: string): value is Lang {
    return supportedLangs.includes(value as Lang);
}