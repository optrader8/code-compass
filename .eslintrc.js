{
  "env": {
    "browser": false,
    "es2021": true,
    "node": true
  },
  "extends": [
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "eol-last": ["error", "always"],
    "lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }]
  }
}