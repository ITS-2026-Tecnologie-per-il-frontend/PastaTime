/**
 * Lingua supportata. Se aggiungi una lingua in translations.json
 * e la includi in _meta.supportedLangs, aggiorna qui il tipo.
 */
export type Lang =
    | 'it'
    | 'en'
    | 'es'
    | 'fr'
    | 'de'
    | 'pt'
    | 'ja'
    | 'zh'
    | 'ar'
    | 'ru';

/** Mappa chiave → { lingua: testo } */
export type TranslationEntry = Partial<Record<Lang, string>>;

/** Intera struttura del JSON (senza _meta) */
export type TranslationMap = Record<string, TranslationEntry>;

/** Meta del file translations.json */
export interface TranslationMeta {
    defaultLang: Lang;
    fallbackLang: Lang;
    supportedLangs: Lang[];
}

/** Parametri per l'interpolazione dei placeholder */
export type InterpolationParams = Record<string, string | number>;

/** Firma della funzione di traduzione */
export type TFunction = (key: string, params?: InterpolationParams) => string;