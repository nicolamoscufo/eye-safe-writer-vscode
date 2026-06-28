# Eye Safe Writer for VS Code

VS Code themes based on the Eye Safe Writer Obsidian theme in this vault.

Included themes:

- `Eye Safe Writer Light`
- `Eye Safe Writer Dark`
- `Eye Safe Writer Gruvbox Light`
- `Eye Safe Writer Gruvbox Dark`

The base light/dark themes use the default Salvia palette from `.obsidian/themes/Eye Safe Writer/theme.css`. The Gruvbox variants match the currently enabled Obsidian palette snippet from `.obsidian/appearance.json`.

## Paper Grain

VS Code color themes cannot apply texture by themselves. `eye-safe-writer-grain.css` mirrors the Obsidian paper grain/fiber overlay for the active Gruvbox Dark palette and can be loaded with a custom CSS loader such as `be5invis.vscode-custom-css`.

Example user setting after installing a CSS loader:

```json
"vscode_custom_css.imports": [
  "file:///absolute/path/to/eye-safe-writer-grain.css"
]
```

To test locally, open `vscode-eye-safe-writer` in VS Code and run the extension host with `F5`, then choose one of the themes from `Preferences: Color Theme`.
