// Satori reads `process.env` at module init. Cloudflare Workers has no `process`,
// so define a minimal global shim. Imported FIRST so it runs before satori loads.
if (typeof globalThis.process === "undefined") {
  globalThis.process = { env: {} };
}
