/** Valori ammessi per il voto */
export type ActionVote = 0 | 1 | -1;

/** Record del JSON "actions" */
export interface ActionRecord {
    /** ID univoco, non riciclabile */
    ID: number;
    /** Codice a barre */
    codebar: string;
    /** Codice interno di sistema */
    system_code: string;
    /** Descrizione */
    description: string;
    /** Tempo totale in secondi */
    total_time: number;
    /** Data/ora di inizio (ISO 8601) */
    start_time: string;
    /** Data/ora di fine (ISO 8601) oppure null se ancora in corso */
    stop_time: string | null;
    /** Voto: 0 (nessuno), +1 (positivo), -1 (negativo) */
    vote: ActionVote;
}

/** Payload per la creazione di una nuova azione */
export interface CreateActionInput {
    codebar: string;
    system_code: string;
    description: string;
    total_time: number;
}