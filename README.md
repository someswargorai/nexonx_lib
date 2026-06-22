# Nexonx
📦 npm: https://www.npmjs.com/package/nexonx

<img
  src="https://res.cloudinary.com/dpacclyw4/image/upload/v1781975840/banner_in7wjs.png"
  alt="Nexonx component library banner"
  width="100%"
/>

Nexonx is a small, source-first React component CLI for Tailwind projects. Instead of locking UI behind a package API, it copies clean `.tsx` or `.jsx` components into your app so you can use them immediately, customize them freely, and keep complete control over your design system.

**Supports both TypeScript and JavaScript** — the CLI asks which you prefer and copies the right files.

Current package version: `1.0.9`

## What Makes It Useful

- **Copy-and-own workflow**: add components directly into your project source.
- **TypeScript & JavaScript**: choose your language at install time — get `.tsx` or `.jsx` files.
- **Tailwind-native styling**: simple utility classes that are easy to change.
- **Typed props and variants**: variant support via `class-variance-authority` out of the box.
- **CLI-powered setup**: installs missing component dependencies when needed.
- **Small registry**: only install the components you actually want.
- **Batch install**: add multiple components at once, or use `all` to grab everything.

## Components

| Component | Add command | Best for |
| --- | --- | --- |
| `avatar` | `npx nexonx add avatar` | User profile pictures, initials fallback, online status indicators. |
| `badge` | `npx nexonx add badge` | Status labels, tags, notification counts, category chips. |
| `button` | `npx nexonx add button` | Actions, links, icon buttons, variant-based UI controls. |
| `card` | `npx nexonx add card` | Product cards, content previews, dashboard panels, image cards, feature blocks. |
| `icon` | `npx nexonx add icon` | Consistent Lucide icon rendering with size and color variants. |
| `loader` | `npx nexonx add loader` | Spinning loading indicators for async states and skeleton screens. |
| `separator` | `npx nexonx add separator` | Horizontal or vertical dividers between UI sections. |
| `typography` | `npx nexonx add typography` | Semantic headings, body text, labels, and blockquotes with consistent styling. |

## Quick Start

Run this inside your React, Vite, or Next.js project:

```bash
npx nexonx list
```

Then add a component:

```bash
npx nexonx add button
```

The CLI will prompt:

```
Do you want TypeScript or JavaScript? (ts/js):
```

Type `ts` for TypeScript (`.tsx`) or `js` for JavaScript (`.jsx`).

### Add multiple components at once

```bash
npx nexonx add button card avatar
```

### Add all components

```bash
npx nexonx add all
```

Nexonx copies the selected component(s) into your project and prepares common dependencies such as Tailwind CSS, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react`, and `framer-motion` when they are missing.

## Avatar Usage

Add it:

```bash
npx nexonx add avatar
```

Use it:

```tsx
import { Avatar } from "@/components/avatar";

export function UserProfile() {
  return (
    <div className="flex items-center gap-3">
      {/* With image */}
      <Avatar src="/user.png" alt="Jane Doe" name="Jane Doe" status="online" />

      {/* Initials fallback */}
      <Avatar name="John Smith" size="lg" shape="square" />

      {/* Icon fallback */}
      <Avatar size="sm" />
    </div>
  );
}
```

Available shapes:

```tsx
<Avatar shape="circle" />   {/* default */}
<Avatar shape="square" />
```

Available sizes:

```tsx
<Avatar size="xs" />
<Avatar size="sm" />
<Avatar size="md" />   {/* default */}
<Avatar size="lg" />
<Avatar size="xl" />
```

Available status values:

```tsx
<Avatar status="online" />
<Avatar status="offline" />
<Avatar status="away" />
<Avatar status="busy" />
```

Pass `showStatus={false}` to hide the status dot even when a `status` value is set.

## Badge Usage

Add it:

```bash
npx nexonx add badge
```

Use it:

```tsx
import { Badge } from "@/components/badge";

export function Labels() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success" dot>Live</Badge>
      <Badge variant="danger" size="sm">Error</Badge>
    </div>
  );
}
```

Available variants:

```tsx
<Badge variant="default" />
<Badge variant="primary" />
<Badge variant="success" />
<Badge variant="warning" />
<Badge variant="danger" />
<Badge variant="outline" />
```

Available sizes:

```tsx
<Badge size="sm" />
<Badge size="md" />   {/* default */}
<Badge size="lg" />
```

Pass `dot` to render a small colored dot before the label:

```tsx
<Badge variant="success" dot>Active</Badge>
```

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

## Icon Usage

Add it:

```bash
npx nexonx add icon
```

Use it:

```tsx
import { Icon } from "@/components/icon";
import { Star, AlertCircle } from "lucide-react";

export function IconExamples() {
  return (
    <div className="flex items-center gap-3">
      <Icon icon={Star} size="md" color="primary" />
      <Icon icon={AlertCircle} size="lg" color="danger" label="Error" />
      <Icon icon={Star} size="sm" color="muted" />
    </div>
  );
}
```

Available sizes:

```tsx
<Icon icon={Star} size="xs" />
<Icon icon={Star} size="sm" />   {/* default */}
<Icon icon={Star} size="md" />
<Icon icon={Star} size="lg" />
<Icon icon={Star} size="xl" />
```

Available colors:

```tsx
<Icon icon={Star} color="default" />
<Icon icon={Star} color="muted" />
<Icon icon={Star} color="primary" />
<Icon icon={Star} color="success" />
<Icon icon={Star} color="warning" />
<Icon icon={Star} color="danger" />
<Icon icon={Star} color="current" />
```

Pass a `label` to make the icon accessible to screen readers:

```tsx
<Icon icon={AlertCircle} label="Warning" />
```

## Loader Usage

Add it:

```bash
npx nexonx add loader
```

Use it:

```tsx
import { Loader } from "@/components/loader";

export function SaveButton({ saving }) {
  return (
    <button disabled={saving}>
      {saving ? <Loader size="sm" /> : "Save"}
    </button>
  );
}
```

Available variants:

```tsx
<Loader variant="default" />
<Loader variant="muted" />
<Loader variant="destructive" />
<Loader variant="outline" />
```

Available sizes:

```tsx
<Loader size="xs" />
<Loader size="sm" />   {/* default */}
<Loader size="md" />
<Loader size="lg" />
<Loader size="xl" />
```

Pass a custom `label` for accessibility (defaults to `"Loading"`):

```tsx
<Loader label="Saving changes…" />
```

## Separator Usage

Add it:

```bash
npx nexonx add separator
```

Use it:

```tsx
import { Separator } from "@/components/separator";

export function SectionDivider() {
  return (
    <div>
      <p>Above</p>
      <Separator />
      <p>Below</p>
    </div>
  );
}
```

Available orientations:

```tsx
<Separator orientation="horizontal" />   {/* default */}
<Separator orientation="vertical" />
```

By default the separator is decorative (`role="none"`). Pass `decorative={false}` to expose it as a semantic landmark:

```tsx
<Separator decorative={false} />
```

## Typography Usage

Add it:

```bash
npx nexonx add typography
```

Use it:

```tsx
import { Typography } from "@/components/typography";

export function Article() {
  return (
    <div>
      <Typography as="h1">Getting started</Typography>
      <Typography as="p">
        Nexonx copies components directly into your source code.
      </Typography>
      <Typography as="blockquote">
        Design is not just what it looks like — it's how it works.
      </Typography>
      <Typography as="label">Field label</Typography>
    </div>
  );
}
```

Available `as` values:

```tsx
<Typography as="h1" />
<Typography as="h2" />
<Typography as="h3" />
<Typography as="h4" />
<Typography as="h5" />
<Typography as="h6" />
<Typography as="p" />       {/* default */}
<Typography as="span" />
<Typography as="div" />
<Typography as="label" />
<Typography as="blockquote" />
```

Clamp long text with the `lines` prop:

```tsx
<Typography as="p" lines={2}>
  This long paragraph will be truncated after two lines…
</Typography>
```

Supported `lines` values: `1`, `2`, `3`, `4`.

## CLI Commands

List available components:

```bash
npx nexonx list
```

Add a single component:

```bash
npx nexonx add button
```

Add multiple components at once:

```bash
npx nexonx add button card avatar
```

Add every component:

```bash
npx nexonx add all
```

Global binary:

```bash
nexonx_cli list
nexonx_cli add button
nexonx_cli add card
```

After running an `add` command, the CLI will prompt:

```
Do you want TypeScript or JavaScript? (ts/js):
```

- **`ts`** → copies `.tsx` files from `components/`
- **`js`** → copies `.jsx` files from `jscomponents/`

## What Gets Copied

Each component copies a single file into your project.

**TypeScript (`.tsx`):**

```txt
components/avatar.tsx
components/badge.tsx
components/button.tsx
components/card.tsx
components/icon.tsx
components/loader.tsx
components/separator.tsx
components/typography.tsx
```

**JavaScript (`.jsx`):**

```txt
jscomponents/avatar.jsx
jscomponents/badge.jsx
jscomponents/button.jsx
jscomponents/card.jsx
jscomponents/icon.jsx
jscomponents/loader.jsx
jscomponents/separator.jsx
jscomponents/typography.jsx
```

Nexonx also creates the `cn` utility when it is missing:

```txt
lib/utils/cn.ts   (TypeScript)
lib/utils/cn.js   (JavaScript)
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
|-- components/          (TypeScript sources)
|   |-- avatar.tsx
|   |-- badge.tsx
|   |-- button.tsx
|   |-- card.tsx
|   |-- icon.tsx
|   |-- loader.tsx
|   |-- separator.tsx
|   `-- typography.tsx
|-- jscomponents/        (JavaScript sources)
|   |-- avatar.jsx
|   |-- badge.jsx
|   |-- button.jsx
|   |-- card.jsx
|   |-- icon.jsx
|   |-- loader.jsx
|   |-- separator.jsx
|   `-- typography.jsx
|-- lib/
|   `-- utils/
|       `-- cn.tsx
|-- registry/
|   |-- components.json
|   `-- jscomponents.json
|-- package.json
|-- package-lock.json
`-- README.md
```

## Adding More Components

1. Create the component inside `components/` (`.tsx`) **and** `jscomponents/` (`.jsx`).
2. Register it in both `registry/components.json` and `registry/jscomponents.json`.
3. Add every file the component needs to its `files` array.
4. Test it from another app with the local CLI.

Example (`registry/components.json`):

```json
{
  "tooltip": {
    "files": ["components/tooltip.tsx"]
  }
}
```

Example (`registry/jscomponents.json`):

```json
{
  "tooltip": {
    "files": ["jscomponents/tooltip.jsx"]
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
- Tailwind CSS
- npm, pnpm, or yarn
- TypeScript (optional — JavaScript is fully supported)

The CLI detects `pnpm-lock.yaml` and `yarn.lock`; otherwise, it uses npm.

## License

ISC
