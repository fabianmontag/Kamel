import * as monaco from "monaco-editor";

export const monacoOCamlTokenizerSettings: monaco.languages.IMonarchLanguage = {
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
};

export const monacoOCamlLanguageConfig: monaco.languages.LanguageConfiguration = {
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
};

export const monacoDarkTheme: monaco.editor.IStandaloneThemeData = {
    base: "vs-dark", // or 'vs-dark' for dark theme, 'hc-black' for high contrast, etc.
    inherit: true, // inherit from the base theme
    rules: [
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
};

export const monacoLightTheme: monaco.editor.IStandaloneThemeData = {
    base: "vs", // or 'vs-dark' for dark theme, 'hc-black' for high contrast, etc.
    inherit: true, // inherit from the base theme
    rules: [
        { token: "keyword", foreground: "0000ff" },
        { token: "constant", foreground: "0000ff", fontStyle: "bold" },
        { token: "comment", foreground: "00aa00", fontStyle: "italic" },
        { token: "identifier", foreground: "000000" },
        { token: "number", foreground: "008800" },
        { token: "string", foreground: "E06C75" },
        { token: "type", foreground: "000000" },
        { token: "operator", foreground: "383A42" },
        { token: "delimiter", foreground: "383A42" },
    ],
    colors: {
        "editor.foreground": "#262626",
        "editor.background": "#ffffff",
    },
};

// keywords for OCaml
export const ocamlKeywords = [
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

// https://ocaml.org/manual/5.2/stdlib.html
export const ocamlLibs = [
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
