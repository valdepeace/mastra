export default {
  // --no-warn-ignored: eslint.config.js ignores examples/**, and without this
  // flag ESLint's own "file ignored" notice counts against --max-warnings=0.
  '*.{ts,tsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{js,jsx}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
