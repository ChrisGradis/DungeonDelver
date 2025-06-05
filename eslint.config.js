import javascript from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
    javascript.configs.recommended,
    prettier,
    {
        ignores: ["external/", "node_modules/"],
    },
    {
        rules: {
            "import/no-anonymous-default-export": "off",
            "no-console": "warn",
            "no-control-regex": "off",
        },
    },
];
