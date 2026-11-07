---
name: scaffold-base-ui
description: Provides a unified bash script to scaffold a Vite+React+Storybook environment, clone Base UI from source, and configure Playwright Component Testing and vanilla CSS styling.
---
# Scaffold Base UI

## Summary
This skill uses the bundled `scaffold.sh` script to scaffold a Base UI project in the user's chosen destination.

## When to Use
Use when the user wants to scaffold, setup, or initialize a Base UI Storybook project from source with Playwright component testing.

## Steps
1. Resolve [the bundled script](./scaffold.sh) relative to this skill's directory to an absolute path. Confirm the destination working directory with the user if it was not specified. If the script is missing or cannot be read, tell the user and stop; do not attempt to write or reconstruct the script yourself.
2. Check whether `base-ui-system` already exists inside the confirmed destination. If it does, tell the user the script may fail or overwrite files and ask them to remove or rename the existing folder; do not run the script until they confirm it is safe to proceed. Do not remove or rename files yourself.
3. If the destination is clear, run the script from that directory using the local agent environment: `cd "/confirmed/destination" && bash "/absolute/path/to/skill/scaffold.sh"`. The script creates `base-ui-system` inside the destination; no local copy of the script is required. If you cannot run commands in the local environment, provide this command with the confirmed destination and resolved script paths so the user can run it as a fallback.
4. Report whether scaffolding succeeded. If the command fails, surface the error and do not claim success. Keep the explanation brief—the script handles Vite, Storybook, path aliases, Playwright Component Testing, Vanilla CSS, and Base UI cloning.