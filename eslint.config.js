import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ["./tsconfig.node.json", "./tsconfig.app.json"],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            // custom rules
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/strict-boolean-expressions": [
                "error",
                {
                    allowNumber: false,
                    allowString: false,
                },
            ],
            "@typescript-eslint/restrict-plus-operands": "error",
            "@typescript-eslint/adjacent-overload-signatures": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/ban-tslint-comment": "error",
            // enforce code consistency
            "@typescript-eslint/consistent-type-assertions": "error",
            "@typescript-eslint/consistent-type-definitions": "error",
            "@typescript-eslint/consistent-type-exports": "error",
            "@typescript-eslint/consistent-type-imports": "error",
            // enforce default params at end
            "default-param-last": "off",
            "@typescript-eslint/default-param-last": "error",
            // "@typescript-eslint/explicit-function-return-type": "error",
            // prevent annoying shadowing of variabels in outer scope, bad style
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "error",
            eqeqeq: "error",
            // prevent console logs in prod
            "no-console": "warn",
            "react/prop-types": "off",
        },
    }
);
