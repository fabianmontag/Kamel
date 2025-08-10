import { IJsonModel, Layout, Model, TabNode } from "flexlayout-react";
import EditorEnv from "./Editor/EditorEnv";
import ToplevelOutput from "./ToplevelOutput";
import React from "react";
import { EvalResult } from "../hooks/useToplevelWorker";

const modelJSON: IJsonModel = {
    global: {
        splitterEnableHandle: true,
        splitterSize: 10,
        rootOrientationVertical: false,
        tabEnableRename: false,
        tabMinWidth: 100,
    },
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Editor",
                        component: "Editor",
                        enableClose: false,
                        enableRename: false,
                    },
                ],
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Output",
                        component: "Output",
                        enableClose: false,
                        enableRename: false,
                    },
                ],
            },
        ],
    },
};
const model = Model.fromJson(modelJSON);

interface WindowManagerProps {
    code: string;
    setCode: (c: string) => void;
    run: () => void;
    runSingle: (c: string) => void;
    isRunning: boolean;
    evalResults: EvalResult[];
    killWorker: () => void;
}

export const WindowManager: React.FunctionComponent<WindowManagerProps> = ({
    code,
    setCode,
    run,
    runSingle,
    isRunning,
    evalResults,
    killWorker,
}) => {
    const layoutFactory = (node: TabNode) => {
        const component = node.getComponent();

        if (component === "Editor") {
            return <EditorEnv code={code} setCode={setCode} run={run} />;
        } else if (component === "Output") {
            return (
                <ToplevelOutput
                    runSingle={runSingle}
                    isRunning={isRunning}
                    evalResults={evalResults}
                    killWorker={killWorker}
                />
            );
        }
    };

    return <Layout factory={layoutFactory} model={model} />;
};
