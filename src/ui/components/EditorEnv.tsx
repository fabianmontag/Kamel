import { languages } from "monaco-editor";
import * as monaco from "monaco-editor";
import React, { useEffect, useRef } from "react";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
        if (label === "json") {
            return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

interface EditorEnvProps {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string>>;
    run: (c: string) => void
}

const EditorEnv: React.FunctionComponent<EditorEnvProps> = ({ code, setCode, run }) => {
    const editor = useRef(null);

    useEffect(() => {
        let editorC: monaco.editor.IStandaloneCodeEditor;

        monaco.languages.register({ id: "ocaml" });
        monaco.languages.setMonarchTokensProvider("ocaml", {
            tokenizer: {
                root: [
                    // single line commands
                    [/\(\*.*\*\)/, "comment"],

                    // start of block comment
                    [/\(\*/, "comment", "@comment"],

                    // keywords
                    [
                        /\b(and|as|assert|asr|begin|class|constraint|do|done|downto|else|end|exception|external|false|for|fun|function|functor|if|in|include|inherit|initializer|land|lazy|let|lor|lsl|lsr|lxor|match|method|mod|module|mutable|new|nonrec|object|of|open|open!|or|private|rec|sig|struct|then|to|try|true|type|val|virtual|when|while|with)\b/,
                        "keyword",
                    ],

                    // types
                    [/\b(int|float|string|bool|char|unit|list|array|option|result|tuple|exn|fun|record|ref|type)\b/, "type"],

                    // Constants and literals (e.g., true, false, etc.)
                    [/\b(true|false|None|Some)\b/, "constant"],

                    // Operators and symbols
                    [/[+\-*/%=<>!^&|~?.]/, "operator"],

                    // Numbers (integer and floating-point)
                    [/\b(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?\b/, "number"],

                    // Strings
                    [/"/, "string", "@string"], // Start of a string literal

                    // Identifiers (variables, functions, etc.)
                    [/\b[a-zA-Z_][a-zA-Z0-9_]*\b/, "identifier"],

                    // Other symbols
                    [/[{}()[\];,]/, "delimiter"],
                ],

                // Tokenizer state for strings (handles escaped characters and closing quotes)
                string: [
                    [/[^\\"]+/, "string"],
                    [/\\./, "string.escape"],
                    [/"/, "string", "@pop"], // End of string
                ],

                // Block comment definition
                comment: [
                    [/\*\)/, "comment", "@pop"],
                    [/./, "comment.content"],
                ],
            },
        });

        monaco.languages.setLanguageConfiguration("ocaml", {
            wordPattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            comments: {
                lineComment: "//",
                blockComment: ["(*", "*)"],
            },
            brackets: [
                ["(", ")"],
                ["{", "}"],
                ["[", "]"],
            ],
            autoClosingPairs: [
                { open: "(", close: ")" },
                { open: "{", close: "}" },
                { open: "[", close: "]" },
                { open: '"', close: '"' },
            ],
            indentationRules: {
                increaseIndentPattern: /^\s*(let|in|match|with|fun|if|then|else|try|external|module)\b/,
                decreaseIndentPattern: /^\s*(end|else|done|raise)\b/,
            },
        });

        monaco.editor.defineTheme("ocamlTheme", {
            base: "vs-dark", // or 'vs-dark' for dark theme, 'hc-black' for high contrast, etc.
            inherit: true, // inherit from the base theme
            rules: [
                // light theme
                // { token: "keyword", foreground: "0000ff" },
                // { token: "constant", foreground: "0000ff", fontStyle: "bold" },
                // { token: "comment", foreground: "00aa00", fontStyle: "italic" },
                // { token: "identifier", foreground: "000000" },
                // { token: "number", foreground: "008800" },
                // { token: "string", foreground: "E06C75" },
                // { token: "type", foreground: "000000" },
                // { token: "operator", foreground: "383A42" },
                // { token: "delimiter", foreground: "383A42" },

                // dark theme
                { token: "keyword", foreground: "569cd6" },
                { token: "constant", foreground: "569cd6" },
                { token: "comment", foreground: "6A9955" },
                { token: "identifier", foreground: "c5c5c5" },
                { token: "number", foreground: "b5cea8" },
                { token: "string", foreground: "ce9178" },
                { token: "type", foreground: "26c0a6" },
                { token: "operator", foreground: "d4d4d4" },
                { token: "delimiter", foreground: "569cd6" },
            ],
            colors: {
                "editor.foreground": "#c5c5c5",
                "editor.background": "#262626",
            },
        });

        monaco.languages.registerCompletionItemProvider("ocaml", {
            provideCompletionItems: (model, position) => {
                // Get the word currently being typed
                const word = model.getWordAtPosition(position);
                const suggestions: { label: string; kind: languages.CompletionItemKind; insertText: string }[] = [];

                // Add custom completions for OCaml keywords and functions
                const ocamlKeywords = [
                    "and",
                    "as",
                    "assert",
                    "asr",
                    "begin",
                    "class",
                    "constraint",
                    "do",
                    "done",
                    "downto",
                    "else",
                    "end",
                    "exception",
                    "external",
                    "false",
                    "for",
                    "fun",
                    "function",
                    "functor",
                    "if",
                    "in",
                    "include",
                    "inherit",
                    "initializer",
                    "land",
                    "lazy",
                    "let",
                    "lor",
                    "lsl",
                    "lsr",
                    "lxor",
                    "match",
                    "method",
                    "mod",
                    "module",
                    "mutable",
                    "new",
                    "nonrec",
                    "object",
                    "of",
                    "open",
                    "open!",
                    "or",
                    "private",
                    "rec",
                    "sig",
                    "struct",
                    "then",
                    "to",
                    "try",
                    "true",
                    "type",
                    "val",
                    "virtual",
                    "when",
                    "while",
                    "with",
                ];

                // const ocamlFunctions = [];

                // // https://ocaml.org/manual/5.2/stdlib.html
                const libs = [
                    "Arg",
                    "Array",
                    "ArrayLabels",
                    "Atomic",
                    "Bigarray",
                    "Bool",
                    "Buffer",
                    "Bytes",
                    "BytesLabels",
                    "Callback",
                    "Char",
                    "Complex",
                    "Condition",
                    "Domain",
                    "Digest",
                    "Dynarray",
                    "Effect",
                    "Either",
                    "Ephemeron",
                    "Filename",
                    "Float",
                    "Format",
                    "Fun",
                    "Gc",
                    "Hashtbl",
                    "In_channel",
                    "Int",
                    "Int32",
                    "Int64",
                    "Lazy",
                    "Lexing",
                    "List",
                    "ListLabels",
                    "Map",
                    "Marshal",
                    "MoreLabels",
                    "Mutex",
                    "Nativeint",
                    "Oo",
                    "Option",
                    "Out_channel",
                    "Parsing",
                    "Printexc",
                    "Printf",
                    "Queue",
                    "Random",
                    "Result",
                    "Scanf",
                    "Seq",
                    "Set",
                    "Semaphore",
                    "Stack",
                    "StdLabels",
                    "String",
                    "StringLabels",
                    "Sys",
                    "Type",
                    "Uchar",
                    "Unit",
                    "Weak",
                ];

                // If the word starts with any of these, provide completions
                if (word) {
                    ocamlKeywords.forEach((keyword) => {
                        if (keyword.startsWith(word.word)) {
                            suggestions.push({
                                label: keyword,
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: keyword,
                            });
                        }
                    });

                    libs.forEach((lib) => {
                        if (lib.startsWith(word.word)) {
                            suggestions.push({
                                label: lib,
                                kind: monaco.languages.CompletionItemKind.Module,
                                insertText: lib,
                            });
                        }
                    });

                    // ocamlFunctions.forEach((func) => {
                    //     if (func.startsWith(word.word)) {
                    //         suggestions.push({
                    //             label: func,
                    //             kind: monaco.languages.CompletionItemKind.Function,
                    //             insertText: func,
                    //         });
                    //     }
                    // });
                }

                return { suggestions: suggestions as languages.CompletionItem[] };
            },
        });

        if (editor.current) {
            editorC = monaco.editor.create(editor.current, {
                value: code,
                language: "ocaml",
                theme: "ocamlTheme",
                scrollbar: { useShadows: false },
                minimap: { enabled: false },
                automaticLayout: true,
                selectOnLineNumbers: false,
                stickyScroll: {
                    enabled: false
                },

            });

            editorC.onDidChangeModelContent(() => {
                const newValue = editorC.getValue();
                setCode(newValue);
            });

            editorC.addAction({
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                run: () => { run(editorC.getValue()) },
                label: "runCode",
                id: "runCode",
            });
        }

        return () => {
            editorC.dispose();
        }
    }, []);

    return (
        <div className="w-full h-full bg-secondary overflow-hidden">
            <div className="w-full h-full" ref={editor}></div>
        </div>
    );
};

export default EditorEnv;
