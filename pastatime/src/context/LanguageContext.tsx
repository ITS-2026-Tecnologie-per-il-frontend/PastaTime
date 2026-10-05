import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from 'react';
import {
    translate,
    interpolate,
    defaultLang,
    detectBrowserLang,
    getAvailableLangs,
    supportedLangs,
    isLang,
} from '../i18n';
import type { Lang, TFunction } from '../types/i18n';

const STORAGE_KEY = 'app_lang';
const RTL_LANGS: readonly Lang[] = ['ar'] as const;

export interface LanguageContextValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: TFunction;
    availableLangs: Lang[];
    supportedLangs: Lang[];
    defaultLang: Lang;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [lang, setLangState] = useState<Lang>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && isLang(saved) && getAvailableLangs().includes(saved)) {
            return saved;
        }
        return detectBrowserLang();
    });

    const setLang = useCallback((next: Lang) => {
        if (!getAvailableLangs().includes(next)) return;
        setLangState(next);
        localStorage.setItem(STORAGE_KEY, next);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute(
            'dir',
            RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
        );
    }, [lang]);

    const t: TFunction = useCallback(
        (key, params) => interpolate(translate(key, lang), params),
        [lang]
    );

    const value = useMemo<LanguageContextValue>(
        () => ({
            lang,
            setLang,
            t,
            availableLangs: getAvailableLangs(),
            supportedLangs,
            defaultLang,
            isRTL: RTL_LANGS.includes(lang),
        }),
        [lang, setLang, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return ctx;
}