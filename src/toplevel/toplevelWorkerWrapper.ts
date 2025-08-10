import tlWorkerURL from "./toplevelWorker.js?worker&url";
import { ToplevelWorkerAction } from "./toplevelWorker";

// most of this is just proxy to have type-safety when using the worker
// since workers are not generic

export interface ToplevelWorker {
    worker: Worker;
}

export const createToplevelWorker = (): ToplevelWorker => {
    return {
        worker: new Worker(new URL(tlWorkerURL, import.meta.url), { type: "module" }),
    };
};

export const resetToplevelWorker = (tlw: ToplevelWorker) => {
    const resetAction: ToplevelWorkerAction = { type: "reset" };
    return tlw.worker.postMessage(resetAction);
};

export const postMessageToplevelWorker = (tlw: ToplevelWorker, action: ToplevelWorkerAction) => {
    return tlw.worker.postMessage(action);
};

export const terminateToplevelWorker = (tlw: ToplevelWorker) => {
    tlw.worker.terminate();
};
