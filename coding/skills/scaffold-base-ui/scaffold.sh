#!/bin/bash
set -e

echo "🚀 Scaffolding Base UI Project..."

# 1. Initialize the Workspace
npm create vite@latest base-ui-system -- --template react-ts
cd base-ui-system
npm install
npx storybook@latest init -y

# 2. Configure Path Aliases and Playwright Component Testing
echo "🔬 Setting up Playwright Component Testing..."
npm install -D @playwright/experimental-ct-react playwright @types/node vite-tsconfig-paths

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

# Configure Playwright CT
cat << 'EOF' > playwright-ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './src',
  snapshotDir: './__snapshots__',
  timeout: 10 * 1000,
  use: {
    trace: 'on-first-retry',
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          '@components': '/src/components',
          '@styles': '/src/styles'
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

# Create Playwright index html and ts
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
import '../src/styles/theme.css';
EOF

# 3. Clone Base UI Source
echo "📦 Cloning Base UI source..."
mkdir -p src/components/base-ui
git clone --depth 1 https://github.com/mui/base-ui .tmp-base-ui
cp -r .tmp-base-ui/packages/mui-base/src/* src/components/base-ui/
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

# 5. Create Example Component Styles, Story, and Test
echo "🏗️ Creating Example Button Story and Playwright Test..."
mkdir -p src/components/base-ui/Button
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
import { Button } from './Button';
import React from 'react';

test('renders successfully with children', async ({ mount }) => {
  const component = await mount(<Button className="base-ui-button">Test Button</Button>);
  await expect(component).toContainText('Test Button');
});
EOF

echo "✅ Base UI scaffolding complete. Run 'cd base-ui-system && npm install && npm run storybook' to view the setup."
echo "🧪 To run Playwright Component tests, use 'npx playwright test -c playwright-ct.config.ts'."