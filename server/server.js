/**
 * Process entry for MUPHO THE CLEANER.
 * Run with: `node server.js` or `pnpm dev`
 */
import { app } from "./src/app.ts";
import { env } from "./src/config/env.ts";

app.listen(env.port, () => {
  console.log(`[mupho] Express listening on http://localhost:${env.port}`);
});
