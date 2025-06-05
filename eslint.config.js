import js from "@eslint/js";
import html from "@html-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
    {
        ...html.configs["flat/recommended"],

        files: ["src/**/*.html"],
    },
    {
        files: ["src/**/*.js"],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ["src/**/*.js"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    prettier,
    {
        ignores: ["node_modules/"],
    },
    {
        rules: {
            "import/no-anonymous-default-export": "off",
            "no-control-regex": "off",
        },
    },
]);
