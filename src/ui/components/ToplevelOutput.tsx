import React, { useState } from "react";

interface ToplevelOutputProps {
    runSingle: (c: string) => void;
}

const ToplevelOutput = React.forwardRef<HTMLDivElement, ToplevelOutputProps>(({ runSingle }, ref) => {
    const [singleCode, setSingleCode] = useState("");

    const handleSingleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleCode(e.target.value);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full h-full flex flex-col text-xs font-mono overflow-y-auto bg-background min-w-[200px] overflow-y-auto p-2 gap-0.5">
                <div ref={ref}></div>
            </div>
            <div className="w-full h-auto flex flex-row gap-2 items-center justify-center font-mono p-2 bg-background border-t border-border text-sm">
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
                        className="w-full bg-transparent border-transparent outline-0"
                        spellCheck={false}
                        value={singleCode}
                        onChange={handleSingleCodeChange}
                    />
                </form>
            </div>
        </div>
    );
});

export default ToplevelOutput;
