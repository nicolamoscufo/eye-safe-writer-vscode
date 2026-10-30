# Palette synchronization

This extension derives **all 16 themes** (eight light/dark palettes) from the
Obsidian theme's shared CSS color tokens. The two source color templates in
`src/templates/` preserve VS Code token/semantic scopes and their baseline
color relationships.

To regenerate, check out `nicolamoscufo/eye-safe-writer` beside this
repository and run:

```bash
npm run generate:palettes -- --css ../eye-safe-writer/theme.css
npm run check:palettes -- --css ../eye-safe-writer/theme.css
npm test
```

CI checks for palette drift against the current Obsidian `main`. A weekly
scheduled check will **detect** drift but will not silently modify or publish
the extension; regenerate and review a PR when the upstream colors change.

Only six-digit palette RGB values are remapped in the templates; alpha
channels are preserved, and deliberate fixed colors remain intact.
This is a cross-editor color-token generator, not a sync of fonts or UI layouts.
