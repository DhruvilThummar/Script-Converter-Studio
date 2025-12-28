import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="hero-text">
          <p className="eyebrow">About the Studio</p>
          <h1>TOON / JSON Converter</h1>
          <p className="lede">
            Live, keyboard-friendly conversions with Monaco, autosave, and line-aware error hints for both TOON and JSON.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="https://dhruvilthummar.github.io/Script-Converter-Studio/#/studio" target="_blank" rel="noreferrer">
              Open Studio
            </a>
            <a className="btn ghost" href="https://github.com/DhruvilThummar/Script-Converter-Studio" target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>
          <div className="pill-row">
            <span className="pill">Live conversion</span>
            <span className="pill">Comment-friendly TOON parser</span>
            <span className="pill">Autosave</span>
          </div>
        </div>
      </div>

      <div className="about-grid">
        <section className="about-section card">
          <h2>Why use this</h2>
          <ul>
            <li>Indentation-aware TOON parsing with inline objects, JSON literal support, and comment skipping.</li>
            <li>Monaco editors with word wrap, find/replace, caret tracking, and auto layout.</li>
            <li>Upload/download both formats, copy to clipboard, and persistent localStorage.</li>
            <li>Light/dark themes and shortcuts: Ctrl/Cmd+Enter convert, Ctrl/Cmd+K swap, Ctrl/Cmd+U auto-toggle.</li>
          </ul>
        </section>

        <section className="about-section card">
          <h2>Keyboard shortcuts</h2>
          <ul className="shortcut-list">
            <li><span className="kbd">Ctrl/Cmd</span> + <span className="kbd">Enter</span> — Convert active editor</li>
            <li><span className="kbd">Ctrl/Cmd</span> + <span className="kbd">K</span> — Swap panes</li>
            <li><span className="kbd">Ctrl/Cmd</span> + <span className="kbd">U</span> — Toggle auto-convert</li>
            <li><span className="kbd">Ctrl/Cmd</span> + <span className="kbd">F</span> — Browser find (in-editor find panel is built-in)</li>
          </ul>
        </section>
      </div>

      <section className="about-section card">
        <h2>Sample round-trip</h2>
        <div className="code-blocks">
          <div>
            <div className="code-label">JSON →</div>
            <pre>
{`{
  "title": "Hello",
  "list": [
    { "id": 1, "name": "Ada" },
    { "id": 2, "name": "Turing" }
  ],
  "meta": { "active": true }
}`}
            </pre>
          </div>
          <div>
            <div className="code-label">→ TOON</div>
            <pre>
{`title: "Hello"
list:
  - id: 1
    name: "Ada"
  - id: 2
    name: "Turing"
meta:
  active: true`}
            </pre>
          </div>
        </div>
      </section>

      <section className="about-section card">
        <h2>TOON vs JSON</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>TOON</th>
              <th>JSON</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Syntax</strong></td>
              <td>Indentation-first, keys need no quotes</td>
              <td>Strict, quoted keys</td>
            </tr>
            <tr>
              <td><strong>Comments</strong></td>
              <td>Allowed (# or //)</td>
              <td>Not allowed</td>
            </tr>
            <tr>
              <td><strong>Inline data</strong></td>
              <td>Supports inline objects/arrays</td>
              <td>Native</td>
            </tr>
            <tr>
              <td><strong>Readability</strong></td>
              <td>Lightweight for configs</td>
              <td>Verbose but universal</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="about-grid">
        <section className="about-section card">
          <h2>Tech stack</h2>
          <div className="badge-row">
            <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
            <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
            <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
            <img src="https://img.shields.io/badge/Monaco%20Editor-007ACC.svg?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
            <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
          </div>
        </section>

        <section className="about-section card">
          <h2>Troubleshooting</h2>
          <ul>
            <li>Error messages now include the line preview; check indentation when TOON fails.</li>
            <li>Use Pretty on JSON or Tidy on TOON to normalize spacing before converting.</li>
            <li>Tabs are normalized to spaces; mixed indentation can still trigger errors.</li>
            <li>If uploads seem off, try reloading; localStorage remembers your last inputs.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
