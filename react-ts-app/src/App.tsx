import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

// --- Helper Functions for TOON Conversion ---
const jsonToToon = (obj: any, indent = ''): string => {
  let toon = '';
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      toon += `${indent}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          toon += `${indent}  - \n${jsonToToon(item, indent + '    ')}`;
        } else {
          toon += `${indent}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      toon += `${indent}${key}:\n${jsonToon(value, indent + '  ')}`;
    } else {
      toon += `${indent}${key}: ${value}\n`;
    }
  }
  return toon;
};

const toonToJason = (toon: string): any => {
  const lines = toon.trim().split('\n');
  let obj: any = {};
  const parentStack: any[] = [];

  for (const line of lines) {
    const indent = line.match(/^\s*/)?.[0].length || 0;
    const content = line.trim();

    if (!content) continue;

    let level = indent / 2;
    while (level < parentStack.length) {
      parentStack.pop();
    }

    const currentObj = parentStack.length > 0 ? parentStack[parentStack.length - 1] : obj;

    if (content.startsWith('-')) { // Array item
      const itemContent = content.substring(1).trim();
      if (!Array.isArray(currentObj)) {
        // This case needs more robust handling depending on expected TOON structure
      } else {
        currentObj.push(itemContent); // Simplified, assumes simple values
      }
    } else {
      const [key, ...valueParts] = content.split(':');
      const value = valueParts.join(':').trim();

      if (value === '') { // Likely a new object
        const newObj = {};
        if (Array.isArray(currentObj)) {
          const wrapper: any = {};
          wrapper[key.trim()] = newObj;
          currentObj.push(wrapper);
          parentStack.push(newObj);
        } else {
          currentObj[key.trim()] = newObj;
          parentStack.push(newObj);
        }
      } else {
        currentObj[key.trim()] = value;
      }
    }
  }

  return obj;
};

// --- React Components ---
const App: React.FC = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('#converter');
  const [mode, setMode] = useState('json'); // 'json' or 'toon'

  const [jsonInput, setJsonInput] = useState(
    localStorage.getItem('jsonInput') ||
      '''{\n  "title": "Project Alpha",\n  "setting": "Lab 42",\n  "characters": [\n    { "name": "Alice", "role": "Admin" },\n    { "name": "Bob", "role": "User" }\n  ]\n}'''
  );
  const [toonInput, setToonInput] = useState(
    localStorage.getItem('toonInput') ||
      '''🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n  - name: Alice\n    role: Admin\n  - name: Bob\n    role: User'''
  );
  const [output, setOutput] = useState('Waiting for input...');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jsonInput', jsonInput);
  }, [jsonInput]);

  useEffect(() => {
    localStorage.setItem('toonInput', toonInput);
  }, [toonInput]);

  const handleNavClick = (target: string) => {
    setActiveNav(target);
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setSidebarOpen(false);
  };

  const handleJsonToToon = useCallback(() => {
    try {
      const data = JSON.parse(jsonInput);
      const out = jsonToToon(data).trim();
      setToonInput(out);
      setOutput(out);
      handleNavClick('#output-section');
    } catch (e: any) {
      setOutput(`❌ Invalid JSON: ${e.message}`);
    }
  }, [jsonInput]);

  const handleToonToJson = useCallback(() => {
    try {
      const obj = toonToJason(toonInput);
      const result = JSON.stringify(obj, null, 2);
      setJsonInput(result);
      setOutput(result);
      handleNavClick('#output-section');
    } catch (e: any) {
      setOutput(`❌ Invalid TOON: ${e.message}`);
    }
  }, [toonInput]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      // You can add a visual confirmation here if you want
    });
  };

  return (
    <>
      <header className="mobile-header">
        <div className="logo-container">
          <div className="logo-img">
            <img src="/assist/logo.svg" alt="JSON ⇄ TOON" />
          </div>
          <span>JSON ⇄ TOON</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-img">
              <img src="/assist/logo.svg" alt="JSON ⇄ TOON" />
            </div>
            <span>JSON ⇄ TOON</span>
          </div>
        </div>
        <nav>
          <div
            className={`nav-item ${activeNav === '#converter' ? 'active' : ''}`}
            onClick={() => handleNavClick('#converter')}
          >
            <span>🧰</span> Converter
          </div>
          <div
            className={`nav-item ${activeNav === '#output-section' ? 'active' : ''}`}
            onClick={() => handleNavClick('#output-section')}
          >
            <span>📤</span> Output
          </div>
          <div className={`nav-item ${activeNav === '#about' ? 'active' : ''}`} onClick={() => handleNavClick('#about')}>
            <span>🧬</span> TOON Data Type
          </div>
          <div className="nav-spacer"></div>
          <button className="nav-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <span id="themeIcon">{theme === 'light' ? '🌞' : '🌙'}</span>
            <span id="themeLabel">{theme === 'light' ? 'Day Mode' : 'Night Mode'}</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <section id="converter">
          <h1>Converter Studio</h1>
          <p className="section-description">Flip between JSON and TOON formats.</p>

          <div className="mode-switcher">
            <button className={`mode-btn ${mode === 'json' ? 'active' : ''}`} onClick={() => setMode('json')}>
              <span>🧩</span> JSON ➝ TOON
            </button>
            <button className={`mode-btn ${mode === 'toon' ? 'active' : ''}`} onClick={() => setMode('toon')}>
              <span>🎬</span> TOON ➝ JSON
            </button>
          </div>

          <div className="grid">
            <div className={`card ${mode !== 'json' ? 'inactive' : ''}`}>
              <div className="card-header">
                <strong>JSON Input</strong>
                <span className="card-tag">Source</span>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='''{\n  "title": "Project Alpha",\n  "setting": "Lab 42",\n  "characters": [\n    { "name": "Alice", "role": "Admin" },\n    { "name": "Bob", "role": "User" }\n  ]\n}'''
              ></textarea>
              <div className="btn-container">
                <button className="btn btn-primary" onClick={handleJsonToToon} disabled={mode !== 'json'}>
                  Convert & Scroll
                </button>
                <button className="btn btn-ghost" onClick={() => setJsonInput('')}>
                  Clear
                </button>
              </div>
            </div>

            <div className={`card ${mode !== 'toon' ? 'inactive' : ''}`}>
              <div className="card-header">
                <strong>TOON Input</strong>
                <span className="card-tag">Target</span>
              </div>
              <textarea
                value={toonInput}
                onChange={(e) => setToonInput(e.target.value)}
                placeholder="🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n• Alice — Admin\n• Bob — User"
              ></textarea>
              <div className="btn-container">
                <button className="btn btn-primary" onClick={handleToonToJson} disabled={mode !== 'toon'}>
                  Convert & Scroll
                </button>
                <button className="btn btn-ghost" onClick={() => setToonInput('')}>
                  Clear
                </button>
                <button
                  className="btn btn-ghost sample-btn"
                  onClick={() =>
                    setToonInput(
                      `🎬 Title: Project Alpha\n📍 Setting: Lab 42\n\n👥 Characters:\n  - name: Alice\n    role: Admin\n  - name: Bob\n    role: User`
                    )
                  }
                >
                  ✨ Fill Sample TOON
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="output-section">
          <h3>Final Output</h3>
          <div className="card">
            <pre id="outputBox">{output}</pre>
          </div>
          <button className="btn btn-ghost" onClick={handleCopy}>
            📋 Copy Output
          </button>
        </section>

        <section id="about">
          <h2>🧬 What is TOON?</h2>
          <p className="section-description">
            <strong>Token-Oriented Object Notation</strong>
          </p>

          <div className="grid">
            <div className="card">
              <h3>Tabular Arrays</h3>
              <p className="card-description">TOON handles lists of objects like CSVs to save space.</p>
              <pre className="code-block">
                users[2]:\n  id,   name,   role\n  101,  Alice,  Admin\n  102,  Bob,    User
              </pre>
            </div>

            <div className="card">
              <h3>Clean Syntax</h3>
              <p className="card-description">Indentation replaces nesting braces.</p>
              <pre className="code-block">
                config:\n  debug: true\n  version: 1.0\n  tags:\n    - stable\n    - production
              </pre>
            </div>
          </div>
        </section>

        <footer>
          © 2025 JSON ⇄ TOON Studio
        </footer>
      </main>
    </>
  );
};

export default App;
