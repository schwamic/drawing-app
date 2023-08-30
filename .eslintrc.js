module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/restrict-template-expressions": "warn",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.eslint.json", "./packages/*/tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  root: true,
};
