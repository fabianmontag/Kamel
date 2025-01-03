import { useEffect, useRef, useState } from "react";
import EditorEnv from "./components/EditorEnv";
import { IJsonModel, Layout, Model, TabNode } from "flexlayout-react";
import ToplevelOutput from "./components/ToplevelOutput";
import Toolbar from "./components/Toolbar";
import "./styles/windowManager.css";

const modelJSON: IJsonModel = {
    global: { splitterEnableHandle: true, splitterSize: 10 },
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
                        name: "Toplevel",
                        component: "Toplevel",
                        enableClose: false,
                        enableRename: false,
                    },
                ],
            },
        ],
    },
};
const model = Model.fromJson(modelJSON);

const prod = import.meta.env.PROD;
const initialCode = prod
    ? ""
    : `(*\n block comment\n *) (* line comment *) \nlet s = "hello world" \nlet (x: int) = 19+5*5;; \nlet x = 10;; \nlet y = 20;; \nlet rec f x = f x;; \nlet rec iter f k = if f k then k else iter f (k+1);; \nlet sqrt x = iter (fun k -> (k+1)*(k+1) > x) 0;; \nsqrt 26;; \nList.map (fun k -> k) [1;2;3;4;5];; \ntype tree = T of tree list;;`;

const App = () => {
    const [code, setCode] = useState(initialCode);

    const outputRef = useRef<HTMLDivElement>(null);
    const toplevelInstance = useRef<((c: string, o: HTMLElement) => boolean) | null>(null);

    useEffect(() => {
        toplevelInstance.current = toplevel.setup((e) => {
            if (outputRef.current) outputRef.current.appendChild(e);
        });
    }, []);

    const run = () => {
        if (toplevelInstance.current && outputRef.current) {
            outputRef.current.innerHTML = "";
            toplevel.reset();
            toplevelInstance.current(code, outputRef.current);
        }
    };

    const runSingle = (code: string) => {
        if (toplevelInstance.current && outputRef.current) {
            toplevelInstance.current(code, outputRef.current);
        }
    };

    const factory = (node: TabNode) => {
        const component = node.getComponent();

        if (component === "Editor") {
            return <EditorEnv code={code} setCode={setCode} />;
        } else if (component === "Toplevel") {
            return <ToplevelOutput ref={outputRef} runSingle={runSingle} />;
        }
    };

    useEffect(() => {
        const keydown = (e: KeyboardEvent) => {
            if (e.metaKey && e.key === "Enter") {
                e.preventDefault();
                run();
            }
        }

        window.addEventListener("keydown", keydown);
        return () => {
            window.removeEventListener("keydown", keydown);
        }
    }, [])

    return (
        <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
            <Toolbar run={run} />
            <div className="w-full h-full p-2 pt-0">
                <div className="w-full h-full overflow-hidden relative">
                    <Layout factory={factory} model={model} />
                </div>
            </div>
        </div>
    );
};

export default App;
