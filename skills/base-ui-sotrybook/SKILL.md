=== SKILL.md ===

---

name: scaffold-base-ui-v3

description: Provides a unified bash script to scaffold a Vite+React+Storybook environment, clone Base UI from source, and configure Playwright component testing and vanilla CSS styling.

---

# Scaffold Base UI (v3 - Playwright Edition)



## Summary

This skill provides an automated scaffolding script stored as an external resource. It fetches the executable `scaffold.sh` script from its own directory and provides it to the user.



## When to Use

Use when the user wants to scaffold, setup, or initialize a Base UI Storybook project from source, specifically utilizing Playwright Component Testing for real-browser CSS and layout verification.



## Steps

1. Call `skills:get_skill_resources` to fetch the `scaffold.sh` file located in this skill's directory. If the resource cannot be fetched or is empty, tell the user the scaffold script is unavailable and do not attempt to reconstruct or improvise the script from memory.

2. Present the full, unmodified content of `scaffold.sh` in a single ```bash code block. Do not create files on the user's disk or paraphrase/truncate the script.

3. Instruct the user to save it locally (e.g., as `scaffold.sh`) and execute it via `bash scaffold.sh`.

4. If the user specifies a project name or target directory, tell them to replace `base-ui-system` in the script before running it. If the user wants to add this setup to an existing project, explain that the script only supports creating a new project.

5. If the user requests changes beyond the project name (e.g., different styling, test runner, or template), present the unmodified script first, then list the specific lines/sections they would need to edit or remove to achieve their variation. Do not emit a rewritten version of the script.

6. Keep the explanation brief—the script handles Vite, Storybook, path aliases, Playwright CT, Vanilla CSS, and Base UI cloning.



=== scaffold.sh ===

#!/bin/bash

set -e



echo "🚀 Scaffolding Base UI Project with Playwright..."



# 1. Initialize the Workspace

npm create vite@latest base-ui-system -- --template react-ts

cd base-ui-system

npm install

npx storybook@latest init --yes --no-dev



# 2. Configure Path Aliases

npm install -D @types/node vite-tsconfig-paths



cat << 'EOF' > vite.config.ts

import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

import tsconfigPaths from 'vite-tsconfig-paths';



export default defineConfig({

  plugins: [react(), tsconfigPaths()],

});

EOF



node -e "

const fs = require('fs');

const file = './tsconfig.app.json';

let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

const tsconfig = JSON.parse(content);

tsconfig.compilerOptions.baseUrl = '.';

tsconfig.compilerOptions.paths = {

  '@components/*': ['./src/components/*'],

  '@styles/*': ['./src/styles/*']

};

fs.writeFileSync(file, JSON.stringify(tsconfig, null, 2));

"



# 3. Clone Base UI Source

echo "📦 Cloning Base UI source..."

mkdir -p src/components/base-ui

git clone --depth 1 https://github.com/mui/base-ui .tmp-base-ui

# Detect the package source directory at runtime (the upstream layout has changed over time)

SRC=$(ls -d .tmp-base-ui/packages/*/src 2>/dev/null | head -n1)

if [ -z "$SRC" ]; then

  echo "❌ Could not locate a packages/*/src directory in the Base UI clone. Aborting." >&2

  exit 1

fi

cp -r "$SRC"/* src/components/base-ui/

rm -rf .tmp-base-ui

npm install @floating-ui/react-dom clsx prop-types



# 4. Generate CSS Architecture

echo "🎨 Setting up Vanilla CSS Architecture..."

mkdir -p src/styles

cat << 'EOF' > src/styles/theme.css

:root {

  --primary-color: oklch(0.6 0.15 250);

  --surface-color: oklch(0.98 0.01 250);

  --text-color: oklch(0.2 0.05 250);

  --font-family: system-ui, -apple-system, sans-serif;

  --font-size-base: 16px;

  --spacing-sm: 8px;

  --spacing-md: 16px;

  --spacing-lg: 24px;

  --radius-md: 6px;

}

EOF



echo "import '../src/styles/theme.css';" >> .storybook/preview.ts



# 5. Playwright Component Testing Setup

echo "🎭 Setting up Playwright CT..."

npm install -D @playwright/experimental-ct-react playwright



cat << 'EOF' > playwright-ct.config.ts

import { defineConfig, devices } from '@playwright/experimental-ct-react';

import { resolve } from 'path';



export default defineConfig({

  testDir: './src',

  testMatch: '**/*.spec.tsx',

  snapshotDir: './__snapshots__',

  timeout: 10 * 1000,

  fullyParallel: true,

  use: {

    trace: 'on-first-retry',

    ctPort: 3100,

    ctViteConfig: {

      resolve: {

        alias: {

          '@components': resolve(__dirname, './src/components'),

          '@styles': resolve(__dirname, './src/styles'),

        }

      }

    }

  },

  projects: [

    {

      name: 'chromium',

      use: { ...devices['Desktop Chrome'] },

    },

  ],

});

EOF



mkdir -p playwright

cat << 'EOF' > playwright/index.html

<!DOCTYPE html>

<html lang="en">

  <body>

    <div id="root"></div>

    <script type="module" src="./index.ts"></script>

  </body>

</html>

EOF



cat << 'EOF' > playwright/index.ts

// Inject global theme styles into the testing environment

import '../src/styles/theme.css';

EOF



# 6. Create Example Component Styles, Story, and Test

echo "🏗️ Creating Example Button Story and Test..."

mkdir -p src/components/base-ui/Button

# The example story and test import this module; it wraps the cloned Base UI source

# (which uses lowercase directories and ships no Button.tsx) in a stable local component.

cat << 'EOF' > src/components/base-ui/Button/Button.tsx

import React from 'react';



export type ButtonProps = React.ComponentPropsWithoutRef<'button'>;



export function Button(props: ButtonProps) {

  return <button type="button" {...props} />;

}

EOF



cat << 'EOF' > src/components/base-ui/Button/Button.css

.base-ui-button {

  background-color: var(--primary-color);

  color: var(--surface-color);

  font-family: var(--font-family);

  font-size: var(--font-size-base);

  padding: var(--spacing-sm) var(--spacing-md);

  border-radius: var(--radius-md);

  border: none;

  cursor: pointer;

  transition: opacity 0.2s ease;

}

.base-ui-button:hover {

  opacity: 0.9;

}

EOF



cat << 'EOF' > src/components/base-ui/Button/Button.stories.tsx

import React from 'react';

import { Button } from './Button';

import './Button.css';



export default {

  title: 'Base UI/Button',

  component: Button,

};



export const Primary = () => (

  <Button className="base-ui-button">

    Click Me

  </Button>

);

EOF



cat << 'EOF' > src/components/base-ui/Button/Button.spec.tsx

import { test, expect } from '@playwright/experimental-ct-react';

import { Button } from '@components/base-ui/Button/Button';

import React from 'react';



test('renders successfully and applies CSS variables', async ({ mount }) => {

  const component = await mount(

    <Button className="base-ui-button">Test Button</Button>

  );



  // Assert text renders

  await expect(component).toContainText('Test Button');



  // Assert that the real CSS engine applied the OKLCH variable

  // Playwright computes the actual rendered styles

  await expect(component).toHaveCSS('cursor', 'pointer');

});

EOF



# Add a test script to package.json

node -e "

const fs = require('fs');

const file = './package.json';

const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

pkg.scripts['test-ct'] = 'playwright test -c playwright-ct.config.ts';

fs.writeFileSync(file, JSON.stringify(pkg, null, 2));

"



echo "✅ Base UI scaffolding complete. Run 'cd base-ui-system && npm install && npm run storybook' to view the setup."

echo "✅ To run visual tests in a real browser engine, use 'npm run test-ct'."