import { defineConfig } from "@trigger.dev/sdk";

/**
 * Trigger.dev Configuration
 */
export default defineConfig({
  project: "rafael-protocol",
  dirs: ["./tasks"],
  machine: "medium-1x",
  maxDuration: 300,
});
