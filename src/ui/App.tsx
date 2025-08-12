import { useEffect, useState } from "react";
import { useCode as useLSSavedCode } from "./hooks/useCode";

import Toolbar from "./components/Toolbar";

import "./styles/windowManager.css";

import { interpreterCode } from "../example_code/interpreter";
import { WindowManager } from "./components/WindowManager";
import { useToplevelWorker } from "./hooks/useToplevelWorker";
import { ThemeContext } from "./contexts/themeContext";
import { useTheme } from "./hooks/useTheme";
import { Settings } from "./components/Settings";

const prod = import.meta.env.PROD;
const initialCode = prod ? "" : interpreterCode;

const App = () => {
    const [theme, setTheme] = useTheme();

    const [autoRun, setAutoRun] = useState(false);
    const [code, setCode] = useLSSavedCode(initialCode);
    const [isRunning, evalResults, dispatchWorker] = useToplevelWorker();

    const [openSettings, setOpenSettings] = useState(false);

    const run = () => {
        dispatchWorker({ type: "run", code });
    };

    const runSingle = (code: string) => {
        dispatchWorker({ type: "runSingle", code });
    };

    const killWorker = () => {
        dispatchWorker({ type: "kill" });
    };

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

    // TODO: fix this, currently while it runs
    // we can still change code, and after it ran
    // we do not execute anymore
    // + add timeout setting in worker reducer
    useEffect(() => {
        if (!isRunning && autoRun) {
            run();
        }
    }, [code]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
                {openSettings && <Settings closeSettings={() => setOpenSettings(false)} />}
                <Toolbar
                    code={code}
                    run={run}
                    autoRun={autoRun}
                    toggleAutoRun={() => setAutoRun(!autoRun)}
                    openSettings={() => setOpenSettings(true)}
                />
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
