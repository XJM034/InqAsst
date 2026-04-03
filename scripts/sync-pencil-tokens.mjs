import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const inputPath = path.join(repoRoot, "design.pen");
const outputPath = path.join(repoRoot, "app", "pencil-tokens.css");

function toCssName(name) {
  return name.startsWith("--") ? name : `--${name}`;
}

function formatValue(name, type, rawValue) {
  if (typeof rawValue === "string") {
    return rawValue;
  }

  if (typeof rawValue === "number") {
    if (name.includes("radius")) {
      return `${rawValue}px`;
    }

    return String(rawValue);
  }

  return String(rawValue);
}

function pushEntry(target, key, type, rawValue) {
  target.push(`  ${toCssName(key)}: ${formatValue(key, type, rawValue)};`);
}

async function main() {
  const penFile = await readFile(inputPath, "utf8");
  const pen = JSON.parse(penFile);
  const variables = pen.variables ?? {};

  const rootEntries = [];
  const darkEntries = [];

  for (const key of Object.keys(variables).sort()) {
    const variable = variables[key];
    const type = variable.type;
    const value = variable.value;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item?.theme?.Mode === "Dark") {
          pushEntry(darkEntries, key, type, item.value);
        } else {
          pushEntry(rootEntries, key, type, item.value);
        }
      }
      continue;
    }

    pushEntry(rootEntries, key, type, value);
  }

  const css = [
    "/* Auto-generated from design.pen by scripts/sync-pencil-tokens.mjs */",
    ":root {",
    ...rootEntries,
    "}",
    "",
    ".dark {",
    ...darkEntries,
    "}",
    "",
  ].join("\n");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, css, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
