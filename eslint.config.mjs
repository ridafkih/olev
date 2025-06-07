import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    files: ["src/**/*", "scripts/**/*"],
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
    ),
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },

    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          printWidth: 90
        },
      ],
    },
  },
]);
