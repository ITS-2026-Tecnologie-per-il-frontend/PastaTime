import { loadActions, saveActions } from './storage';
import type {
    ActionRecord,
    ActionVote,
    CreateActionInput,
} from '../types/action';

function nextId(actions: ActionRecord[]): number {
    return actions.reduce((max, a) => Math.max(max, a.ID), 0) + 1;
}

export function createAction(input: CreateActionInput): ActionRecord {
    const actions = loadActions();
    const action: ActionRecord = {
        ID: nextId(actions),
        codebar: input.codebar,
        system_code: input.system_code,
        description: input.description,
        total_time: input.total_time,
        start_time: new Date().toISOString(),
        stop_time: null,
        vote: 0,
    };
    actions.push(action);
    saveActions(actions);
    return action;
}

export function stopAction(
    actionId: number,
    stopTime: Date = new Date()
): ActionRecord | null {
    const actions = loadActions();
    const idx = actions.findIndex((a) => a.ID === actionId);
    if (idx === -1) return null;
    actions[idx]!.stop_time = stopTime.toISOString();
    saveActions(actions);
    return actions[idx]!;
}

export function voteAction(
    actionId: number,
    vote: ActionVote
): ActionRecord | null {
    if (![0, 1, -1].includes(vote)) {
        throw new Error('INVALID_VOTE');
    }
    const actions = loadActions();
    const idx = actions.findIndex((a) => a.ID === actionId);
    if (idx === -1) return null;
    actions[idx]!.vote = vote;
    saveActions(actions);
    return actions[idx]!;
}

export  function getAllActions(): ActionRecord[] {
    return loadActions();
}

/** Ultima cottura conclusa (con Done) per un codice a barre, oppure null. */
export function getLastCompletedAction(codebar: string): ActionRecord | null {
    const done = loadActions().filter(
        (a) => a.codebar === codebar && a.stop_time !== null
    );
    if (done.length === 0) return null;
    return done.reduce((last, a) => (a.ID > last.ID ? a : last));
}

/** Durata effettiva di una cottura conclusa, in secondi (stop - start). */
export function actionDurationSeconds(action: ActionRecord): number {
    if (action.stop_time === null) return 0;
    const ms = Date.parse(action.stop_time) - Date.parse(action.start_time);
    return Math.max(0, Math.round(ms / 1000));
}
