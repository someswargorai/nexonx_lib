# Nexonx

<img
  src="https://res.cloudinary.com/dpacclyw4/image/upload/v1781975840/banner_in7wjs.png"
  alt="Nexonx component library banner"
  width="100%"
/>

Nexonx is a small, source-first React component CLI for Tailwind projects. Instead of locking UI behind a package API, it copies clean `.tsx` components into your app so you can use them immediately, customize them freely, and keep complete control over your design system.

Current package version: `1.0.5`

## What Makes It Useful

- **Copy-and-own workflow**: add components directly into your project source.
- **Tailwind-native styling**: simple utility classes that are easy to change.
- **TypeScript components**: typed props and variant support out of the box.
- **CLI-powered setup**: installs missing component dependencies when needed.
- **Small registry**: only install the components you actually want.

## Components

| Component | Add command | Best for |
| --- | --- | --- |
| `button` | `npx nexonx add button` | Actions, links, icon buttons, variant-based UI controls. |
| `card` | `npx nexonx add card` | Product cards, content previews, dashboard panels, image cards, feature blocks. |

## Quick Start

Run this inside your React, Vite, or Next.js project:

```bash
npx nexonx list
```

Then add a component:

```bash
npx nexonx add button
```

Or:

```bash
npx nexonx add card
```

Nexonx copies the selected component into your project and prepares common dependencies such as Tailwind CSS, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react`, and `framer-motion` when they are missing.

## Button Usage

Add it:

```bash
npx nexonx add button
```

Use it:

```tsx
import { Button } from "@/components/button";

export function Actions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Get started</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="outline" size="sm">
        Learn more
      </Button>
    </div>
  );
}
```

Available variants:

```tsx
<Button variant="default" />
<Button variant="secondary" />
<Button variant="outline" />
<Button variant="ghost" />
<Button variant="destructive" />
```

Available sizes:

```tsx
<Button size="sm" />
<Button size="md" />
<Button size="lg" />
<Button size="icon" />
```

Use `asChild` when you want button styling on another component:

```tsx
import Link from "next/link";
import { Button } from "@/components/button";

export function DashboardLink() {
  return (
    <Button asChild>
      <Link href="/dashboard">Open dashboard</Link>
    </Button>
  );
}
```

## Card Usage

Add it:

```bash
npx nexonx add card
```

Use it:

```tsx
import { Card } from "@/components/card";

export function ProductCard() {
  return (
    <Card
      title="Nexonx UI Kit"
      description="A clean component copied straight into your app, ready to customize."
      imageSrc="/preview.png"
      imageAlt="Nexonx preview"
      variant="elevated"
    />
  );
}
```

Add custom content inside the card:

```tsx
import { Card } from "@/components/card";
import { Button } from "@/components/button";

export function UpgradeCard() {
  return (
    <Card
      title="Build faster"
      description="Start with a polished base and make it yours."
      variant="default"
      size="md"
    >
      <div className="mt-4">
        <Button size="sm">Upgrade</Button>
      </div>
    </Card>
  );
}
```

Available card variants:

```tsx
<Card variant="default" />
<Card variant="secondary" />
<Card variant="destructive" />
<Card variant="outline" />
<Card variant="ghost" />
<Card variant="elevated" />
```

Available card sizes:

```tsx
<Card size="sm" />
<Card size="md" />
<Card size="lg" />
```

## CLI Commands

List available components:

```bash
npx nexonx list
```

Add a component:

```bash
npx nexonx add <component>
```

Global binary:

```bash
nexonx_cli list
nexonx_cli add button
nexonx_cli add card
```

## What Gets Copied

For `button`:

```txt
components/button.tsx
```

For `card`:

```txt
components/card.tsx
```

Nexonx also creates this utility when it is missing:

```txt
lib/utils/cn.tsx
```

Depending on the target app, the CLI may also create:

```txt
postcss.config.mjs
```

And it can add a Tailwind import to one of these files:

```txt
app/globals.css
src/app/globals.css
styles/globals.css
```

## Project Structure

```txt
component_lib/
|-- assets/
|   |-- banner.png
|   `-- nexonx-banner.svg
|-- cli/
|   `-- cli.js
|-- components/
|   |-- button.tsx
|   `-- card.tsx
|-- lib/
|   `-- utils/
|       `-- cn.tsx
|-- registry/
|   `-- components.json
|-- package.json
|-- package-lock.json
`-- README.md
```

## Adding More Components

1. Create the component inside `components/`.
2. Register it in `registry/components.json`.
3. Add every file the component needs to its `files` array.
4. Test it from another app with the local CLI.

Example:

```json
{
  "badge": {
    "files": ["components/badge.tsx"]
  }
}
```

## Local Development

Install dependencies:

```bash
npm install
```

List registered components:

```bash
node cli/cli.js list
```

Test adding a component from another project:

```bash
node path/to/component_lib/cli/cli.js add card
```

## Requirements

- React
- TypeScript
- Tailwind CSS
- npm, pnpm, or yarn

The CLI detects `pnpm-lock.yaml` and `yarn.lock`; otherwise, it uses npm.

## License

ISC
