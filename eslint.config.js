import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
   {
      ignores: [
         "out/**",
         "dist/**",
         "**/*.d.ts"
      ]
   },
   {
      files: ["src/**/*.ts"],
      languageOptions: {
         parser: typescriptParser,
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
         ecmaVersion: 2020,
         sourceType: "module"
      },
      plugins: {
         "@typescript-eslint": typescriptEslint
      },
      rules: {
         ...typescriptEslint.configs.strict.rules,
         ...typescriptEslint.configs["stylistic-type-checked"]?.rules
        }
   }
];
