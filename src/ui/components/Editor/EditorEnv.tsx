import { languages } from "monaco-editor";
import * as monaco from "monaco-editor";
import React, { useEffect, useRef } from "react";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import {
    monacoDarkTheme,
    monacoLightTheme,
    monacoOCamlLanguageConfig,
    monacoOCamlTokenizerSettings,
    ocamlKeywords,
    ocamlLibs,
} from "./MonacoSettings";
import { useSaveThemeContext } from "../../contexts/themeContext";
import { defaultLightTheme } from "../../hooks/useTheme";

self.MonacoEnvironment = {
    getWorker(_: any) {
        return new editorWorker();
    },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

interface EditorEnvProps {
    code: string;
    setCode: (c: string) => void;
    run: () => void;
}

const EditorEnv: React.FunctionComponent<EditorEnvProps> = ({ code, setCode, run }) => {
    const { theme } = useSaveThemeContext();
    const editor = useRef(null);
    const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor>();

    // we need to use ref for run since monaco would otherwise use
    // old version of run in actions
    const runRef = useRef(run);
    useEffect(() => {
        runRef.current = run;
    }, [run]);

    // change monaco theme on theme change
    useEffect(() => {
        if (editorInstance.current)
            editorInstance.current.updateOptions({
                theme: theme == defaultLightTheme ? "ocamlLightTheme" : "ocamlDarkTheme",
            });
    }, [theme]);

    useEffect(() => {
        // monaco editor language setup
        monaco.languages.register({ id: "ocaml" });
        monaco.languages.setMonarchTokensProvider("ocaml", monacoOCamlTokenizerSettings);
        monaco.languages.setLanguageConfiguration("ocaml", monacoOCamlLanguageConfig);
        monaco.editor.defineTheme("ocamlDarkTheme", monacoDarkTheme);
        monaco.editor.defineTheme("ocamlLightTheme", monacoLightTheme);

        // Add custom completions for OCaml keywords, libs, etc.
        monaco.languages.registerCompletionItemProvider("ocaml", {
            provideCompletionItems: (model, position) => {
                // Get the word currently being typed
                const word = model.getWordAtPosition(position);
                const suggestions: { label: string; kind: languages.CompletionItemKind; insertText: string }[] = [];

                // If the word starts with any of these, provide completions
                if (word) {
                    const f = (ls: string[], kind: monaco.languages.CompletionItemKind) => {
                        ls.forEach((kw) => {
                            if (kw.startsWith(word.word)) {
                                suggestions.push({
                                    label: kw,
                                    kind,
                                    insertText: kw,
                                });
                            }
                        });
                    };

                    f(ocamlKeywords, monaco.languages.CompletionItemKind.Keyword);
                    f(ocamlLibs, monaco.languages.CompletionItemKind.Module);
                }

                return { suggestions: suggestions as languages.CompletionItem[] };
            },
        });

        if (editor.current) {
            editorInstance.current = monaco.editor.create(editor.current, {
                value: code,
                language: "ocaml",
                theme: theme == defaultLightTheme ? "ocamlLightTheme" : "ocamlDarkTheme",
                scrollbar: { useShadows: false },
                minimap: { enabled: false },
                automaticLayout: true,
                selectOnLineNumbers: false,
                stickyScroll: {
                    enabled: false,
                },
                tabSize: 4,
            });

            editorInstance.current.onDidChangeModelContent(() => {
                const newValue = editorInstance.current?.getValue() ?? "";
                setCode(newValue);
            });

            // add cmd+enter shortcut for running code
            editorInstance.current.addAction({
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                run: () => {
                    runRef.current();
                },
                label: "runCode",
                id: "runCode",
            });
        }

        // cleanup
        return () => {
            if (editorInstance.current) editorInstance.current.dispose();
        };
    }, []);

    return (
        <div className="w-full h-full bg-secondary overflow-hidden">
            <div className="w-full h-full" ref={editor}></div>
        </div>
    );
};

export default EditorEnv;
