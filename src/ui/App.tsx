import { useEffect, useState } from "react";
import { useCode as useLSSavedCode } from "./hooks/useCode";

import Toolbar from "./components/Toolbar";

import { interpreterCode } from "../example_code/interpreter";
import { WindowManager } from "./components/WindowManager";
import { useToplevelWorker } from "./hooks/useToplevelWorker";
import { ThemeContext } from "./contexts/themeContext";
import { useTheme } from "./hooks/useTheme";

import "./styles/windowManager.css";

const prod = import.meta.env.PROD;
const initialCode = prod ? "" : interpreterCode;

const App = () => {
    const [theme, setTheme] = useTheme();
    const [updated, setUpdated] = useState(false);
    const [autoRun, setAutoRun] = useState(false);
    const [code, setCode] = useLSSavedCode(initialCode);
    const [isRunning, evalResults, dispatchWorker] = useToplevelWorker();

    const run = () => {
        dispatchWorker({ type: "run", code });
    };

    const runSingle = (code: string) => {
        dispatchWorker({ type: "runSingle", code });
    };

    const killWorker = () => {
        dispatchWorker({ type: "kill" });
    };

    // TODO: check if this actually works
    // + add debounce to not run instant
    // after code changed

    // code to handle auto-run
    // checks if changes were made while worker
    // was running, and if so, set updated flag
    useEffect(() => {
        if (!isRunning && autoRun) {
            run();
        } else if (autoRun) {
            setUpdated(true);
        }
    }, [code]);
    // if updated flag is set, and worker is finished, run again
    useEffect(() => {
        if (!isRunning && updated) {
            setUpdated(false);
            run();
        }
    }, [isRunning, updated]);

    // cmd+enter shortcut
    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === "Enter") {
                e.preventDefault();
                run();
            }
        };

        window.addEventListener("keydown", keydown);
        return () => {
            window.removeEventListener("keydown", keydown);
        };
    }, [code, run]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
                <Toolbar code={code} run={run} autoRun={autoRun} toggleAutoRun={() => setAutoRun(!autoRun)} />
                <div className="w-full h-full p-2 pt-0">
                    <div className="w-full h-full overflow-hidden relative">
                        <WindowManager
                            code={code}
                            setCode={setCode}
                            run={run}
                            runSingle={runSingle}
                            isRunning={isRunning}
                            evalResults={evalResults}
                            killWorker={killWorker}
                        />
                    </div>
                </div>
            </div>
        </ThemeContext.Provider>
    );
};

export default App;
