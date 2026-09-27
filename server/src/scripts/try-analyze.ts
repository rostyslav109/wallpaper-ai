import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prepareImage } from "../images";
import { analyzePhoto } from "../workflow/analyze";
import { buildPrompt } from "../workflow/prompt";
import { styles } from "../styles";

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: npx tsx src/scripts/try-analyze.ts <photo>");

  const prepared = await prepareImage(await readFile(path));
  const analysis = await analyzePhoto(prepared.data);
  const style = styles.find((s) => s.id === (process.argv[3] ?? "oil"));
  if (!style) throw new Error("Unknown style");

  console.log(analysis);
  console.log("\nPrompt:\n" + buildPrompt(style.prompt, analysis));
}

main().catch(console.error);
