module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    // Temporarily disable noisy rules to triage other build-critical issues
    'react/no-unescaped-entities': 'off'
  }
};
