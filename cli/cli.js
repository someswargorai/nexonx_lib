#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const registry = require("../registry/components.json");

const command = process.argv[2];
const component = process.argv[3];
const projectRoot = process.cwd();

function logTitle() {
  console.log("\n🚀 Quantum CLI\n");
}

function listComponents() {
  logTitle();
  console.log("Available templates:\n");

  Object.keys(registry).forEach((name) => {
    console.log(`  • ${name}`);
  });

  console.log("\nUsage:");
  console.log("  npx pageflow-cli add <component>\n");
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

  const file = path.join(dir, "cn.tsx");

  if (fs.existsSync(file)) return;

  const content = `import { clsx } from "clsx";
        import { twMerge } from "tailwind-merge";

        export function cn(...inputs: any[]) {
        return twMerge(clsx(inputs));
        }
    `;

  fs.writeFileSync(file, content);

  console.log("✔ Added lib/utils.ts");
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

  const hasLucide =
    pkg.dependencies?.["framer-motion"] ||
    pkg.devDependencies?.["framer-motion"];

  if (hasLucide) return;

  console.log("⚡ framer-motion not detected. Installing...\n");

  const pm = getPackageManager();

  if (pm === "npm") runInstall("npm install framer-motion");
  if (pm === "pnpm") runInstall("pnpm add framer-motion");
  if (pm === "yarn") runInstall("yarn add framer-motion");

  console.log("\n✔ framer-motion installed\n");
}
function copyFiles(files) {
  files.forEach((file) => {
    const source = path.join(__dirname, "..", file);
    const destination = path.join(projectRoot, file);

    const folder = path.dirname(destination);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    if (fs.existsSync(destination)) {
      console.log(`⚠ Skipped ${file} (already exists)`);
      return;
    }

    fs.copyFileSync(source, destination);

    console.log(`✔ Added ${file}`);
    console.log("\n✨ Done! Your component is ready.\n");
  });
}

function addComponent(name) {
  const data = registry[name];

  if (!data) {
    console.log(`❌ Component "${name}" not found\n`);
    process.exit(1);
  }

  logTitle();

  setupTailwind();
  setupLucide();
  setupFramerMotion();
  copyFiles(data.files);
}

if (command === "list") {
  listComponents();
  process.exit(0);
}

if (command === "add") {
  if (!component) {
    console.log("❌ Please specify a component\n");
    process.exit(1);
  }

  addComponent(component);
  process.exit(0);
}

console.log(`
Quantum CLI

Commands:
  npx quantum-cli list
  npx quantum-cli add <component>
`);
