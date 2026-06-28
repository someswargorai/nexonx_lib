#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const registry = require("../registry/components.json");
const jsregistry = require("../registry/jscomponents.json");

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

function ensureTailwindV4() {
  const pkg = getPackageJson();
  const twVersion = pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss;
  
  let needsInstall = false;
  
  if (!twVersion) {
    needsInstall = true;
  } else {
  
    const isV4 = twVersion.includes('4.') || twVersion.includes('latest') || twVersion.includes('next');
    if (!isV4) {
      console.log(`⚡ Detected older Tailwind CSS version (${twVersion}). Upgrading to v4...`);
      needsInstall = true;
    }
  }

  const postcssExists = pkg.dependencies?.["@tailwindcss/postcss"] || pkg.devDependencies?.["@tailwindcss/postcss"];
  if (!postcssExists) {
    needsInstall = true;
  }

  if (needsInstall) {
    console.log("⚡ Installing Tailwind CSS v4...");
    const pm = getPackageManager();
    if (pm === "npm") {
      runInstall("npm install -D tailwindcss@latest @tailwindcss/postcss@latest postcss@latest");
    } else if (pm === "pnpm") {
      runInstall("pnpm add -D tailwindcss@latest @tailwindcss/postcss@latest postcss@latest");
    } else if (pm === "yarn") {
      runInstall("yarn add -D tailwindcss@latest @tailwindcss/postcss@latest postcss@latest");
    }
    console.log("✔ Tailwind CSS v4 installed\n");
  }
}

function ensurePostcssConfig() {
  const configPaths = [
    path.join(projectRoot, "postcss.config.js"),
    path.join(projectRoot, "postcss.config.cjs"),
    path.join(projectRoot, "postcss.config.mjs"),
    path.join(projectRoot, "postcss.config.json")
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      let content = fs.readFileSync(configPath, "utf8");
      
      if (content.includes("tailwindcss") || content.includes("autoprefixer")) {
        console.log(`⚡ Updating ${path.basename(configPath)} for Tailwind v4...`);
        // Replace old v3 plugins with v4 plugin (object format, handles quotes)
        content = content.replace(/['"]?tailwindcss['"]?:\s*\{[\s\S]*?\}(,?)/g, '"@tailwindcss/postcss": {}$1');
        content = content.replace(/['"]?autoprefixer['"]?:\s*\{[\s\S]*?\}(,?)/g, '');
        // Remove v3 plugins that clash with v4 (object format)
        content = content.replace(/['"]?postcss-import['"]?:\s*\{[\s\S]*?\}(,?)/g, '');
        content = content.replace(/['"]?tailwindcss\/nesting['"]?:\s*\{[\s\S]*?\}(,?)/g, '');
        
        // Replace old v3 plugins with v4 plugin (array format)
        content = content.replace(/['"]tailwindcss['"](,?)/g, '"@tailwindcss/postcss"$1');
        content = content.replace(/['"]autoprefixer['"](,?)/g, '');
        // Remove v3 plugins that clash with v4 (array format)
        content = content.replace(/['"]postcss-import['"](,?)/g, '');
        content = content.replace(/['"]tailwindcss\/nesting['"](,?)/g, '');
        
        fs.writeFileSync(configPath, content);
        console.log(`✔ ${path.basename(configPath)} updated\n`);
      }
      return;
    }
  }

  console.log("⚡ Creating postcss.config.mjs\n");
  const configPath = path.join(projectRoot, "postcss.config.mjs");
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
    "src/index.css",
    "index.css"
  ];

  for (const p of cssPaths) {
    const full = path.join(projectRoot, p);

    if (fs.existsSync(full)) {
      let css = fs.readFileSync(full, "utf8");
      let changed = false;

      if (css.includes("@tailwind base") || css.includes("@tailwind components") || css.includes("@tailwind utilities")) {
        css = css.replace(/@tailwind base;?\n?/g, "");
        css = css.replace(/@tailwind components;?\n?/g, "");
        css = css.replace(/@tailwind utilities;?\n?/g, "");
        changed = true;
      }

      if (!css.includes('@import "tailwindcss"')) {
        css = `@import "tailwindcss";\n` + css;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(full, css);
        console.log(`✔ Tailwind updated in ${p}\n`);
      }

      return;
    }
  }
}

function createClsx(language) {
  const dir = path.join(projectRoot, "lib/utils");

  fs.mkdirSync(dir, {
    recursive: true,
  });

  const ext = language === "typescript" ? "ts" : "js";
  const file = path.join(dir, `cn.${ext}`);

  if (fs.existsSync(file)) return;

  let content;

  if (language === "typescript") {
    content = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
  } else {
    content = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`;
  }

  fs.writeFileSync(file, content);

  console.log(`✔ Added lib/utils/cn.${ext}`);
}

function setupTailwind() {
  ensureTailwindV4();

  ensurePackage("clsx");
  ensurePackage("tailwind-merge");
  ensurePackage("@radix-ui/react-slot");
  ensurePackage("class-variance-authority");

  ensurePostcssConfig();

  ensureTailwindImport();
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

function addComponents(rawNames, language) {
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

  console.log(`Adding: ${names.join(", ")}  (${language})\n`);

  setupTailwind();
  createClsx(language);
  setupLucide();
  setupFramerMotion();

  const activeRegistry = language === "typescript" ? registry : jsregistry;

  let totalAdded = 0;
  let totalSkipped = 0;

  names.forEach((name) => {
    const data = activeRegistry[name];
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
function removeComponents(rawNames) {
  const { names, invalid } = resolveRequestedComponents(rawNames);
  
  if (invalid.length > 0) {
    invalid.forEach((name) => {
      console.log(`❌ Component "${name}" not found`);
    })
  }
  

  if (names.length === 0) {
    if (invalid.length === 0) {
      console.log("❌ Please specify a component\n");
    }
    process.exit(1);
  }

  logTitle();

  console.log(`Removing: ${names.join(", ")}\n`);
  
  let totalRemoved = 0;
  let totalSkipped = 0;

  names.forEach((name) => {
    const data = registry[name];
    console.log(`\n— ${name} —`);

    data.files.forEach((file) => {
      const destination = path.join(projectRoot, file);

      if (fs.existsSync(destination)) {
        fs.unlinkSync(destination);
        console.log(`✔ Removed ${file}`);
        totalRemoved++;
      } else {
        console.log(`⚠ Skipped ${file} (does not exist)`);
        totalSkipped++;
      }
    });
  });

  console.log("\n✨ Done!");
  console.log(`   ${totalRemoved} file(s) removed, ${totalSkipped} skipped.\n`);

  if (invalid.length > 0) {
    process.exitCode = 1;
  }
}

function askLanguage() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Do you want TypeScript or JavaScript? (ts/js): ",
      (answer) => {
        rl.close();
        const normalized = answer.trim().toLowerCase();

        if (
          normalized === "js" ||
          normalized === "javascript" ||
          normalized === "jsx"
        ) {
          resolve("javascript");
        } else {
          resolve("typescript");
        }
      }
    );
  });
}

if (command === "list") {
  listComponents();
  process.exit(0);
}

if (command === "add") {
  askLanguage().then((language) => {
    addComponents(args, language);
    process.exit(process.exitCode || 0);
  });
} else if (command === "remove") {
  removeComponents(args);
  process.exit(process.exitCode || 0);
} else {
  console.log(`
Nexonx CLI

Commands:
  npx nexonx list
  npx nexonx add <component>
  npx nexonx add <component1> <component2> ...
  npx nexonx add all
`);
}
