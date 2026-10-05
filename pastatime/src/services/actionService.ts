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