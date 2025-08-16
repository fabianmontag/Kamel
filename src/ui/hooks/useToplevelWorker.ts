import { useEffect, useRef, useState } from "react";
import { ToplevelWorkerActionOutput } from "../../toplevel/toplevelWorker";
import {
    createToplevelWorker,
    postMessageToplevelWorker,
    resetToplevelWorker,
    terminateToplevelWorker,
    ToplevelWorker,
} from "../../toplevel/toplevelWorkerWrapper";

// action to be performed
type TLWorkerAction = ({ code: string } & ({ type: "run" } | { type: "runSingle" })) | { type: "kill" };

export interface EvalResult {
    type: "toplevel" | "stdout" | "stderr" | "exception";
    msg: string;
}

// custom reducer to elegantly handle worker stuff
export const useToplevelWorker = (): [boolean, EvalResult[], (action: TLWorkerAction) => void] => {
    const tlWorker = useRef<ToplevelWorker>();
    const [isRunning, setIsRunning] = useState(false);
    const [evalResults, setEvalResults] = useState<EvalResult[]>([]);

    const setupWorker = () => {
        // terminate old worker before creating new one
        if (tlWorker.current) terminateToplevelWorker(tlWorker.current);

        tlWorker.current = createToplevelWorker();
        // we need to reset at least once (in the beginning of the theard lifecyle after importing toplevel.js)
        // to properly init the JsooTop instance
        resetToplevelWorker(tlWorker.current);

        // worker callback
        tlWorker.current.worker.addEventListener("message", (d: MessageEvent<ToplevelWorkerActionOutput>) => {
            const data = d.data;

            if (data.type == "eval" && data.success) {
                const res: EvalResult[] = [];

                if (data.result.events.length > 0) {
                    data.result.events.forEach((e) => {
                        res.push({ type: e.kind, msg: e.chunk });
                    });
                }

                setEvalResults(res);
                setIsRunning(false);
            } else if (data.type == "eval" && !data.success) {
                setEvalResults([{ type: "stderr", msg: "Error: Unable to successfully run code in toplevel" }]);
                setIsRunning(false);
            } else if (data.type == "invalid") {
                setEvalResults([{ type: "stderr", msg: "Error: Invalid worker action performed" }]);
                setIsRunning(false);
            }
        });
    };

    const killWorker = () => {
        if (tlWorker.current && isRunning) {
            terminateToplevelWorker(tlWorker.current);
            // we need to create a new thread afer terminating the old one
            setupWorker();

            // reset previous state
            setIsRunning(false);
            setEvalResults([{ type: "stderr", msg: "Error: Killed thread." }]);
        }
    };

    useEffect(() => {
        setupWorker();

        return () => {
            if (tlWorker.current) terminateToplevelWorker(tlWorker.current);
        };
    }, []);

    const dispatch = (action: TLWorkerAction) => {
        if (action.type == "run") {
            if (isRunning) return;

            if (tlWorker.current) {
                setIsRunning(true);
                // reset before eval to get rid of old declarations
                resetToplevelWorker(tlWorker.current);
                postMessageToplevelWorker(tlWorker.current, { type: "eval", code: action.code });
            }
        } else if (action.type == "runSingle") {
            if (isRunning) return;

            if (tlWorker.current) {
                setIsRunning(true);
                // we do not reset here since we explicitly want to keep old declarations
                // to directly have the possibility to interact with it
                postMessageToplevelWorker(tlWorker.current, { type: "eval", code: action.code });
            }
        } else if (action.type == "kill") {
            killWorker();
        }
    };

    return [isRunning, evalResults, dispatch];
};
