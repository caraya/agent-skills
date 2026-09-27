---
<!-- class="title-slide" data-plugins="presenter" -->
# Inspire.js Agent Syntax Guide
Authoring offline-ready presentations directly in Markdown.

> Note: Welcome! This slide deck is written entirely in our custom Markdown syntax. When the agent parses this, it will automatically download Inspire.js, create the HTML, and wire up the presenter plugins.

---
<!-- class="basic-slide" -->
## Standard Content and Animations

You can write standard Markdown for text, links, and lists. To utilize Inspire's native step-by-step animations, append the `.delayed` class syntax to the end of the line.

* This bullet appears immediately.
* This bullet appears on the next click/arrow press. {.delayed}
* This bullet appears on the final click. {.delayed}

---
<!-- class="layout-slide" -->
## Symmetrical Grid Layouts

Use the `|||` marker to automatically split content into evenly distributed columns. The header remains perfectly centered above the grid.

### Column One
This is standard text in the first column. The agent will wrap this in a `.col` div and apply the automatic `auto-fit` grid template.

|||

### Column Two
This is the second column. The framework will automatically balance the width so both columns take up 50% of the horizontal space.

---
<!-- class="layout-slide" data-grid="2fr 1fr" -->
## Asymmetrical Grid Layouts

By adding the `data-grid` attribute to the slide's HTML comment, you can control the exact fractional ratio of the columns.

This main column is set to take up exactly two-thirds (`2fr`) of the available slide width. This is highly effective for detailed explanations, bulleted lists, or large code snippets that require more breathing room.

> Note: Remind the audience that they can use any valid CSS Grid template syntax in the data-grid attribute, such as `1fr 3fr 1fr`.

|||

This sidebar takes up one-third (`1fr`) of the width.
Perfect for a supportive image or brief summary.

---
<!-- class="code-slide" -->
## Auto-loading Plugins

The agent analyzes your Markdown and automatically attaches the necessary Inspire.js plugins. For example, rendering a fenced code block automatically triggers the `prism` syntax highlighting plugin.

```javascript
// The agent will detect this block and load PrismJS
async function parseMarkdown(text) {
  const slides = text.split('---');
  return compileToHtml(slides);
}
```
> Note: The agent also detects this note block and ensures the Presenter View plugin is loaded and available for the speaker.

---
<!-- class="basic-slide" -->

When you pass this file to the agent, it will validate all five of your parsing rules: applying slide attributes, mapping the `{.delayed}` class, converting `> Note:` blocks, dividing grids (both symmetrical and asymmetrical), and auto-detecting plugin requirements.
