export default {
  // --no-warn-ignored: eslint.config.js ignores examples/**, and without this
  // flag ESLint's own "file ignored" notice counts against --max-warnings=0.
  '*.{ts,tsx}': [
    'oxlint --fix --deny-warnings',
    'eslint --fix --max-warnings=0 --no-warn-ignored',
    'oxfmt --no-error-on-unmatched-pattern',
  ],
  '*.{js,jsx}': ['oxlint --fix', 'eslint --fix --no-warn-ignored', 'oxfmt --no-error-on-unmatched-pattern'],
  '*.{json,md,yml,yaml}': ['oxfmt --no-error-on-unmatched-pattern'],
};
