declare module 'eslint-plugin-jsx-a11y' {
  import type { ESLint, Linter } from 'eslint';

  const plugin: ESLint.Plugin & {
    configs: {
      recommended: { rules: Linter.RulesRecord };
      strict: { rules: Linter.RulesRecord };
    };
  };

  export default plugin;
}
