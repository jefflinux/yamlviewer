# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YAML Viewer is an interactive YAML editor and tree viewer built with React, TypeScript, and Vite. It parses YAML into a collapsible tree with live preview, similar in architecture to the sibling `mdviewer` project.

## Commands

- `npm run dev` — Start dev server (Vite, port 5173)
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint
- `npm run preview` — Serve production build locally

## Architecture

```
src/
├── components/
│   ├── Editor/       # CodeMirror YAML editor (YamlEditor)
│   ├── Layout/       # Header (view toggle, file/export actions) + SplitPane (Allotment)
│   └── Preview/      # YamlTree (toolbar + tree container) + TreeNode (recursive renderer)
├── hooks/
│   ├── useYaml.ts        # Core state: YAML content, js-yaml parsing, TreeNodeData[]
│   ├── useFileHandler.ts # Open/save/drag-drop/paste file handling
│   ├── useExport.ts      # PDF (html2pdf.js) and HTML export via previewRef
│   └── useTreeState.ts   # Expand/collapse state: toggle, expandAll, collapseAll, expandToLevel
├── utils/
│   ├── parseYamlToTree.ts # Converts js-yaml output → TreeNodeData[] with child counts
│   ├── exportToPdf.ts     # html2pdf.js wrapper
│   └── exportToHtml.ts    # Standalone HTML snapshot export
├── types/index.ts         # ViewMode, FileInfo, TreeNodeData
└── styles/variables.css   # CSS custom properties (colors, fonts, spacing)
```

## Key Patterns

- **State flows top-down from App.tsx**: `useYaml` owns content + parsed tree, `useTreeState` owns expand/collapse, both passed as props.
- **TreeNode is recursive**: renders itself for children, uses path strings (dot-delimited) as expand/collapse keys.
- **CSS Modules** for all component styles; global tokens in `variables.css`.
- **Three view modes**: editor-only, split (Allotment resizable panes), preview-only — toggled via Header or Ctrl+1/2/3.
- **Tree toolbar**: Expand/Collapse all, level 1–5 buttons, search filter (matches keys and values recursively).
- **`__APP_VERSION__`** is defined in `vite.config.ts` from `package.json` version.

## Dependencies of Note

| Package | Purpose |
|---------|---------|
| `@uiw/react-codemirror` + `@codemirror/lang-yaml` | YAML code editor |
| `js-yaml` | YAML parsing |
| `allotment` | Resizable split pane |
| `html2pdf.js` | PDF export from DOM |
