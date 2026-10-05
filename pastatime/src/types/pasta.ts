/** Record del JSON "pasta" */
export interface PastaRecord {
    /** ID univoco, non riciclabile */
    ID: number;
    /** Codice a barre del prodotto */
    codebar: string;
    /** Codice interno di sistema */
    system_code: string;
    /** Descrizione breve */
    description: string;
    /** Descrizione estesa */
    extended_description: string;
    /** Marca */
    brand: string;
    /** Tempo di cottura in secondi */
    cooking_time: number;
    /** Data/ora ultimo utilizzo (ISO 8601) oppure null */
    last_used: string | null;
}