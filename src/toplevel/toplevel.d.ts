// toplevel.d.ts
declare global {
    interface ToplevelEvalResultEntry {
        kind: "toplevel" | "stdout" | "stderr" | "exception";
        chunk: String;
        seq: number;
    }

    interface ToplevelEvalResult {
        evalFailed: boolean;
        events: ToplevelEvalResultEntry[];
    }

    interface Toplevel {
        compiledOcamlVersion: string;
        compiledJsOfOcamlVersion: string;
        reset(): void;
        evalCode(c: String): ToplevelEvalResult;
    }

    const toplevel: Toplevel;
}

export {};
