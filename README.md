# JSON ⇄ TOON Studio

A minimal, single-page **JSON ⇄ TOON converter** built in vanilla HTML, CSS, and JavaScript.

It lets you:

- Convert **JSON ➝ TOON** (Token-Oriented Object Notation) using a clean, indentation-based format
- Convert **TOON ➝ JSON** for the cinematic-style TOON preset
- Switch between **dark / light** themes
- Work on **desktop and mobile** with a responsive layout
- Auto-save your inputs using `localStorage`

---

## 🧩 What is TOON?

**TOON (Token-Oriented Object Notation)** is a human-friendly way to represent structured data using:

- **Indentation instead of braces**  
- **Bullets and labels** for lists and objects  
- **Tabular-style arrays** for compact representation

Example:

```toon
users[2]:
id,   name,   role
101,  Alice,  Admin
102,  Bob,    User
```

- And a config-style object:
```
config:
  debug: true
  version: 1.0
  tags:
    - stable
    - production
```

- The app also ships with a cinematic TOON preset for stories:

```
🎬 Title: Project Alpha
📍 Setting: Lab 42

👥 Characters:
• Alice — Admin
• Bob — User
```

## 🚀 Features
1. JSON ➝ TOON (Generic)
- Paste any valid JSON in the JSON Input panel.
- Click “Convert & Scroll”.
- The app uses a recursive jsonToToonGeneric() function to:
-- Handle nested objects
-- Handle arrays (with **-** bullets and **item1**, **item2**, …)
-- Indent child properties for readability
The generated TOON is shown in:
-- The TOON Input panel
-- The Final Output box (with a “Copy Output” button)
2. TOON ➝ JSON (Cinematic Preset)
The TOON ➝ JSON converter works with the cinematic-style format:
```
🎬 Title: Project Alpha
📍 Setting: Lab 42

👥 Characters:
• Alice — Admin
• Bob — User
```

** The parser: **

- Extracts title and setting
- Parses bullet lines (• Name — Role)
- Produces JSON like:

```
{
  "title": "Project Alpha",
  "setting": "Lab 42",
  "characters": [
    { "name": "Alice", "role": "Admin" },
    { "name": "Bob",  "role": "User" }
  ]
}
```

- **Note:** TOON ➝ JSON currently supports this specific preset format. The generic reverse parser is planned for a future version.

## 🧱 UI & UX

- Two modes: JSON ➝ TOON and TOON ➝ JSON
-Side navigation:
-- Converter
-- Output
-- TOON Data Type (docs section)
-Dark / Light theme toggle with emoji:
-- 🌙 Night Mode
-- 🌞 Day Mode
- Mobile-friendly:
-- Fixed top bar
-- Drawer-style sidebar for small screens
-Output tools:
-- “📋 Copy Output” button
-- Clear buttons for both inputs
-- “✨ Fill Sample TOON” button to quickly load an example TOON

## 💾 Persistence

The app uses localStorage to remember:
- Last JSON Input
- Last TOON Input
- Last selected theme (dark or light)
So when you refresh the page, your work and theme preference remain.

## 🛠️ Tech Stack

- HTML5 – single page app
- CSS3 – custom glassmorphism-style UI with responsive layout
- Vanilla JavaScript – for:
-- Mode switching
-- Parsing and conversion
-- Clipboard copy
-- Theme toggling
-- LocalStorage persistence
No frameworks, no build tools.

## 🧪 How to Run Locally

1.Clone or download the project:
```
git clone https://github.com/<your-username>/json-toon-studio.git
cd json-toon-studio
```

2.Make sure the main file is named:
```
index.html
```

3.Open **index.html** in your browser:
- Double-click it, or
- Right-click → “Open with” → your browser
That’s it. No server or build step required.

## 🌍 Deploy (GitHub Pages)

1.Push your code to a GitHub repository.
2.In your repo, go to Settings → Pages.
3.Under Source, choose:
-- Branch: main (or master)
-- Folder: / (root)
4.Save.
GitHub will give you a URL like:
```
https://<your-username>.github.io/json-toon-studio/
```
Share that link to let others use the JSON ⇄ TOON Studio online.

## 🔮 Future Ideas

- More robust TOON ➝ JSON parser for generic TOON syntax
- Multiple TOON presets (config-style, CSV-style, narrative-style)
- Export / Import as files (.json, .toon)
-Validation and linting for TOON syntax
-Keyboard shortcuts (Ctrl+Enter to convert, etc.)
