import React, { useState } from "react";
import { EvalResult } from "../hooks/useToplevelWorker";
import { twcm } from "../misc/twcm";

interface ToplevelOutputProps {
    runSingle: (c: string) => void;
    isRunning: boolean;
    evalResults: EvalResult[];
    killWorker: () => void;
}

const ToplevelOutput: React.FunctionComponent<ToplevelOutputProps> = ({
    runSingle,
    isRunning,
    evalResults,
    killWorker,
}) => {
    const [singleCode, setSingleCode] = useState("");

    const handleSingleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleCode(e.target.value);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full h-full flex flex-col text-xs font-mono overflow-y-auto bg-background min-w-[200px] overflow-y-auto gap-2 p-2">
                {isRunning ? (
                    <p className="text-primary/80">Running...</p>
                ) : evalResults.length == 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <p className="text-primary/50">Pretty empty here</p>
                    </div>
                ) : (
                    evalResults.map((e1, i1) =>
                        e1.msg
                            .split("\n")
                            .filter((e) => e != "")
                            .map((e2, i2) => (
                                <p
                                    className={twcm(
                                        e1.type == "stderr" || e1.type == "exception"
                                            ? "text-outputError"
                                            : e1.type == "toplevel"
                                            ? "text-outputToplevel"
                                            : "text-primary",
                                        ""
                                    )}
                                    key={i1 + "" + i2}
                                >
                                    <span className="text-primary/30 pr-2">{">"}</span>
                                    {e2}
                                </p>
                            ))
                    )
                )}
            </div>

            <div className="w-full h-auto flex flex-row gap-2 items-center justify-center font-mono p-2 bg-background border-t border-border text-xs text-primary/80 bg-muted">
                {isRunning ? (
                    <div className="w-full h-auto flex flex-row items-center justify-between gap-2">
                        <div className="flex flex-row items-center gap-2">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75"></span>
                                <span className="relative inline-flex size-2 rounded-full bg-amber-400"></span>
                            </span>
                            <p>Busy Running ...</p>
                        </div>
                        <button
                            className="border border-border rounded-sm p-0.5 hover:cursor-pointer"
                            onClick={killWorker}
                        >
                            kill
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-auto flex flex-row items-center gap-2">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                        </span>
                        <p>Ready to Run</p>
                    </div>
                )}
            </div>

            <div className="w-full h-auto flex flex-row gap-2 items-center justify-center font-mono p-2 bg-background border-t border-border text-sm bg-background">
                <p>{">"}</p>
                <form
                    className="w-full h-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        runSingle(singleCode);
                        setSingleCode("");
                    }}
                >
                    <input
                        className="w-full bg-transparent border-transparent outline-none"
                        spellCheck={false}
                        value={singleCode}
                        onChange={handleSingleCodeChange}
                    />
                </form>
            </div>
        </div>
    );
};

export default ToplevelOutput;
