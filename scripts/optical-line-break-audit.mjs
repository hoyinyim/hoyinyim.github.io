// Canonical entry point for the rendered-text audit.  The test module writes
// inspectable records under docs/qa/line-break-audit/ and returns non-zero on
// a typography regression.
await import('../tests/typography/check.mjs');
