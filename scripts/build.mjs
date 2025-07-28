import { build } from "esbuild";
import { resolve } from "path";

const CWD = process.cwd();

async function buildPreload() {
  try {
    console.log("Bundling preload script...");
    await build({
      entryPoints: [resolve(CWD, "src/main/preload.mjs")],
      outfile: resolve(CWD, "src/main/preload.js"), // Output a .js file
      bundle: true,
      platform: "node", // Target Node.js environment
      target: "node20", // Match your Electron/Node version
      external: ["electron"], // The 'electron' module is external
    });
    console.log("Preload script bundled successfully.");
  } catch (error) {
    console.error("Failed to bundle preload script:", error);
    process.exit(1);
  }
}

buildPreload();
