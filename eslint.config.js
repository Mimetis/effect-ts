import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import neverthrow from "eslint-plugin-neverthrow";
import tseslint from "typescript-eslint";

export default defineConfig(
    globalIgnores(["**/node_modules/", "**/dist/"]),

    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    {
        files: ["**/*.ts"],
        // eslint-plugin-neverthrow still uses pre-ESLint 9 rule APIs
        plugins: { neverthrow: fixupPluginRules(neverthrow) },
        rules: {
            "neverthrow/must-use-result": "off",
            "@typescript-eslint/no-unused-vars": "off",
        },
    },

    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);
