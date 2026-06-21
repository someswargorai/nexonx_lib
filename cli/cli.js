#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const registry = require("../registry/components.json");

const command = process.argv[2];
const args = process.argv.slice(3);
const projectRoot = process.cwd();

function logTitle() {
  console.log("\n🚀 Nexonx CLI\n");
}

function listComponents() {
  logTitle();
  console.log("Available templates:\n");

  Object.keys(registry).forEach((name) => {
    console.log(`  • ${name}`);
  });

  console.log("\nUsage:");
  console.log("npx nexonx add <component>");
  console.log("npx nexonx add <component1> <component2> ...");
  console.log("npx nexonx add all\n");
}

function getPackageJson() {
  const pkgPath = path.join(projectRoot, "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.log("❌ package.json not found");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
}

function getPackageManager() {
  if (fs.existsSync(path.join(projectRoot, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(projectRoot, "yarn.lock"))) return "yarn";
  return "npm";
}

function runInstall(cmd) {
  execSync(cmd, {
    stdio: "inherit",
    cwd: projectRoot,
  });
}

function ensurePackage(pkgName, dev = true) {
  const pkg = getPackageJson();

  const exists = pkg.dependencies?.[pkgName] || pkg.devDependencies?.[pkgName];

  if (exists) return;

  console.log(`⚡ Installing ${pkgName}...`);

  const pm = getPackageManager();

  if (pm === "npm") {
    runInstall(dev ? `npm install -D ${pkgName}` : `npm install ${pkgName}`);
  }

  if (pm === "pnpm") {
    runInstall(dev ? `pnpm add -D ${pkgName}` : `pnpm add ${pkgName}`);
  }

  if (pm === "yarn") {
    runInstall(dev ? `yarn add -D ${pkgName}` : `yarn add ${pkgName}`);
  }

  console.log(`✔ ${pkgName} installed\n`);
}

function hasTailwind() {
  const pkg = getPackageJson();

  return pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss;
}

function installTailwind() {
  console.log("⚡ TailwindCSS not detected. Installing...\n");

  const pm = getPackageManager();

  if (pm === "npm")
    runInstall("npm install -D tailwindcss  @tailwindcss/postcss postcss");

  if (pm === "pnpm")
    runInstall("pnpm add -D tailwindcss  @tailwindcss/postcss postcss");

  if (pm === "yarn")
    runInstall("yarn add -D tailwindcss @tailwindcss/postcss postcss");

  console.log("\n✔ Tailwind installed\n");
}

function ensurePostcssConfig() {
  const configPath = path.join(projectRoot, "postcss.config.mjs");

  if (fs.existsSync(configPath)) return;

  console.log("⚡ Creating postcss.config.mjs\n");

  const config = `
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
`;

  fs.writeFileSync(configPath, config.trim());

  console.log("✔ postcss.config.mjs created\n");
}

function ensureTailwindImport() {
  const cssPaths = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
  ];

  for (const p of cssPaths) {
    const full = path.join(projectRoot, p);

    if (fs.existsSync(full)) {
      let css = fs.readFileSync(full, "utf8");

      if (!css.includes('@import "tailwindcss"')) {
        css = `@import "tailwindcss";\n` + css;
        fs.writeFileSync(full, css);

        console.log(`✔ Tailwind imported in ${p}\n`);
      }

      return;
    }
  }
}

function createClsx() {
  const dir = path.join(projectRoot, "lib/utils");

  fs.mkdirSync(dir, {
    recursive: true,
  });

  const file = path.join(dir, "cn.ts");

  if (fs.existsSync(file)) return;

  const content = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
`;

  fs.writeFileSync(file, content);

  console.log("✔ Added lib/utils/cn.ts");
}

function setupTailwind() {
  ensurePackage("tailwindcss");
  ensurePackage("@tailwindcss/postcss");
  ensurePackage("postcss");

  ensurePackage("clsx");
  ensurePackage("tailwind-merge");
  ensurePackage("@radix-ui/react-slot");
  ensurePackage("class-variance-authority");

  ensurePostcssConfig();

  ensureTailwindImport();

  createClsx();
}

function setupLucide() {
  const pkg = getPackageJson();

  const hasLucide =
    pkg.dependencies?.["lucide-react"] || pkg.devDependencies?.["lucide-react"];

  if (hasLucide) return;

  console.log("⚡ lucide-react not detected. Installing...\n");

  const pm = getPackageManager();

  if (pm === "npm") runInstall("npm install lucide-react");
  if (pm === "pnpm") runInstall("pnpm add lucide-react");
  if (pm === "yarn") runInstall("yarn add lucide-react");

  console.log("\n✔ lucide-react installed\n");
}

function setupFramerMotion() {
  const pkg = getPackageJson();

  const hasFramerMotion =
    pkg.dependencies?.["framer-motion"] ||
    pkg.devDependencies?.["framer-motion"];

  if (hasFramerMotion) return;

  console.log("⚡ framer-motion not detected. Installing...\n");

  const pm = getPackageManager();

  if (pm === "npm") runInstall("npm install framer-motion");
  if (pm === "pnpm") runInstall("pnpm add framer-motion");
  if (pm === "yarn") runInstall("yarn add framer-motion");

  console.log("\n✔ framer-motion installed\n");
}

function copyFiles(files) {
  let addedCount = 0;
  let skippedCount = 0;

  files.forEach((file) => {
    const source = path.join(__dirname, "..", file);
    const destination = path.join(projectRoot, file);

    const folder = path.dirname(destination);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    if (fs.existsSync(destination)) {
      console.log(`⚠ Skipped ${file} (already exists)`);
      skippedCount++;
      return;
    }

    fs.copyFileSync(source, destination);

    console.log(`✔ Added ${file}`);
    addedCount++;
  });

  return { addedCount, skippedCount };
}

/**
 * Resolves the list of component names the user asked for.
 * Supports:
 *   nexonx add button
 *   nexonx add button card avatar
 *   nexonx add all
 * "all" can appear anywhere in the args and short-circuits to every
 * registry entry, deduped, case-insensitively matched against registry keys.
 */
function resolveRequestedComponents(rawNames) {
  if (rawNames.length === 0) {
    return { names: [], invalid: [] };
  }

  const normalized = rawNames.map((n) => n.toLowerCase());

  if (normalized.includes("all")) {
    return { names: Object.keys(registry), invalid: [] };
  }

  const registryKeys = Object.keys(registry);
  const valid = [];
  const invalid = [];
  const seen = new Set();

  normalized.forEach((name, i) => {
    const match = registryKeys.find((key) => key.toLowerCase() === name);

    if (!match) {
      invalid.push(rawNames[i]);
      return;
    }

    if (!seen.has(match)) {
      seen.add(match);
      valid.push(match);
    }
  });

  return { names: valid, invalid };
}

function addComponents(rawNames) {
  const { names, invalid } = resolveRequestedComponents(rawNames);

  if (invalid.length > 0) {
    invalid.forEach((name) => {
      console.log(`❌ Component "${name}" not found`);
    });
  }

  if (names.length === 0) {
    if (invalid.length === 0) {
      console.log("❌ Please specify a component\n");
    } else {
      console.log("");
    }
    process.exit(1);
  }

  logTitle();

  console.log(`Adding: ${names.join(", ")}\n`);

  setupTailwind();
  setupLucide();
  setupFramerMotion();

  let totalAdded = 0;
  let totalSkipped = 0;

  names.forEach((name) => {
    const data = registry[name];
    console.log(`\n— ${name} —`);

    const { addedCount, skippedCount } = copyFiles(data.files);
    totalAdded += addedCount;
    totalSkipped += skippedCount;
  });

  console.log("\n✨ Done!");
  console.log(`   ${totalAdded} file(s) added, ${totalSkipped} skipped.\n`);

  if (invalid.length > 0) {
    process.exitCode = 1;
  }
}

if (command === "list") {
  listComponents();
  process.exit(0);
}

if (command === "add") {
  addComponents(args);
  process.exit(process.exitCode || 0);
}

console.log(`
Nexonx CLI

Commands:
  npx nexonx list
  npx nexonx add <component>
  npx nexonx add <component1> <component2> ...
  npx nexonx add all
`);
