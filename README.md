<!-- Banner -->
![Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=TOON%20/%20JSON%20Converter%20🚀&fontSize=40&fontAlignY=35&desc=Edit,%20validate,%20and%20convert%20your%20TOON%20and%20JSON%20data%20with%20ease.&descAlignY=55&descAlign=50)

> A fast, free, and open-source studio for TOON ⇄ JSON with Monaco Editor, live validation, and keyboard-friendly controls.

[Open Studio](https://dhruvilthummar.github.io/Script-Converter-Studio/#/studio) · [Report an issue](https://github.com/DhruvilThummar/Script-Converter-Studio/issues) · [Deployment status](https://github.com/DhruvilThummar/Script-Converter-Studio/actions/workflows/pages/pages-build-deployment)

---

## Why use this

- Real-time TOON ⇄ JSON conversion with indentation checks, inline objects, JSON literal support, and comment-friendly parsing.
- Monaco-powered editors: syntax highlighting, word wrap, find/replace, caret tracking, and auto-layout.
- Upload/download for both formats, copy-to-clipboard, and autosave to localStorage.
- Light/dark themes and shortcuts: Ctrl/Cmd+Enter convert, Ctrl/Cmd+K swap, Ctrl/Cmd+U toggle auto-convert.

## Quick start (local)

1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev` (open the printed URL)
3. Build static assets: `npm run build`

## Using the studio

1. Open the [Studio](https://dhruvilthummar.github.io/Script-Converter-Studio/#/studio).
2. Paste or upload JSON on the left or TOON on the right.
3. Click **JSON ➝ TOON** or **TOON ➝ JSON**, or just type with auto-convert enabled.
4. Download or copy the converted result.

## Keyboard shortcuts

- Ctrl/Cmd+Enter: Convert the active editor
- Ctrl/Cmd+K: Swap panes
- Ctrl/Cmd+U: Toggle auto-convert
- Ctrl/Cmd+F: Browser find; in-editor find panel is available in the Studio UI

## Tech stack

- React, TypeScript, Vite
- Monaco Editor for in-browser editing
- GitHub Pages for hosting

## TOON vs JSON at a glance

| Feature | TOON | JSON |
| :-- | :-- | :-- |
| Syntax | Indentation-first, keys need no quotes | Strict, quoted keys |
| Comments | Allowed (`#` or `//`) | Not allowed |
| Inline data | Supports inline objects/arrays | Native |
| Readability | Lightweight for configs | Verbose but universal |

## Sample round-trip

Input JSON (left):

```json
{
  "title": "Hello",
  "list": [
    { "id": 1, "name": "Ada" },
    { "id": 2, "name": "Turing" }
  ],
  "meta": { "active": true }
}
```

Converted TOON (right):

```
title: "Hello"
list:
  - id: 1
    name: "Ada"
  - id: 2
    name: "Turing"
meta:
  active: true
```

## Troubleshooting

- See error messages for line-specific hints (parser now includes the line preview).
- If conversion fails, run Pretty on JSON first to normalize, or trim trailing spaces in TOON via the Tidy action.
- Files with tabs are normalized to spaces; mixed indentation can trigger indentation errors.

---

<!-- Footer -->
![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer)
