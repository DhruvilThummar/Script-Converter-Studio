// src/App.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import './App.css';
import AboutPage from './AboutPage';
import LandingPage from './LandingPage';
import DownloadButton from './DownloadButton';
import FileInput from './FileInput';
import Editor from '@monaco-editor/react';
import { jsonToToon, parseToon } from './utils/toonUtils';
import type { editor } from 'monaco-editor';

const SAMPLE_JSON = `{
  "title": "Sample TOON / JSON",
  "version": 1,
  "tags": ["demo", "sample"],
  "characters": [
    { "id": 1, "name": "Ada", "role": "engineer", "active": true },
    { "id": 2, "name": "Turing", "role": "researcher", "active": false }
  ],
  "meta": {
    "createdAt": "2025-11-22T10:00:00Z",
    "editable": true
  }
}`;

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ✅ IMPORTANT: basename for GitHub Pages
  const basename =
    process.env.NODE_ENV === 'production'
      ? '/Script-Converter-Studio'
      : '/';

  return (
    <BrowserRouter basename={basename}>
      <div className={`app-container ${theme}`}>
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        <Routes>
          {/* Landing is the default home page; studio is explicit */}
          <Route path="/" element={<LandingPage theme={theme} />} />
          <Route path="/studio" element={<Studio theme={theme} />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Unknown paths -> landing */}
          <Route path="*" element={<LandingPage theme={theme} />} />
        </Routes>
        <footer className="app-footer">
          <div className="footer-inner">
            <div className="footer-left">© 2025 TOON/JSON Converter</div>
            <div className="footer-right">
              <Link to="/about">About</Link>
              <span className="sep">·</span>
              <a href="https://github.com/DhruvilThummar/Script-Converter-Studio" target="_blank" rel="noreferrer">GitHub</a>
              <span className="sep">·</span>
              <a href="/assist/manifest.json" target="_blank" rel="noreferrer">Manifest</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

const Navbar: React.FC<{ toggleTheme: () => void; theme: string }> = ({
  toggleTheme,
  theme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-button">
          Home
        </Link>
        <Link to="/studio" className="nav-button">
          Studio
        </Link>
        <Link to="/about" className="nav-button">
          About
        </Link>
      </div>
      <div className="navbar-right">
        <button
          onClick={toggleTheme}
          className={`theme-toggle ${theme}`}
          aria-pressed={theme === 'light'}
          aria-label="Toggle theme"
        >
          <span className="tt-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className="tt-text">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          <span className="tt-switch" aria-hidden="true" />
        </button>
        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(open => !open)}
        >
          &#9776;
        </button>
      </div>
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/studio" onClick={() => setIsMenuOpen(false)}>
            Studio
          </Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
        </div>
      )}
    </nav>
  );
};

interface EditorStats {
  lines: number;
  chars: number;
}

const Studio: React.FC<{ theme: string }> = ({ theme }) => {
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState(
    localStorage.getItem('jsonInput') || ''
  );
  const [toonInput, setToonInput] = useState(
    localStorage.getItem('toonInput') || ''
  );
  const [leftRatio, setLeftRatio] = useState(50); // percentage of layout for left editor
  const [status, setStatus] = useState('Ready');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<'json' | 'toon'>('json');
  const [autoConvert, setAutoConvert] = useState(true);

  const [jsonStats, setJsonStats] = useState<EditorStats>({
    lines: 0,
    chars: 0,
  });
  const [toonStats, setToonStats] = useState<EditorStats>({
    lines: 0,
    chars: 0,
  });

  const jsonEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const toonEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Focus the active editor when studio mounts or when active editor changes
  useEffect(() => {
    const t = setTimeout(() => {
      if (activeEditor === 'json' && jsonEditorRef.current) {
        try { jsonEditorRef.current.focus(); } catch (e) {}
      }
      if (activeEditor === 'toon' && toonEditorRef.current) {
        try { toonEditorRef.current.focus(); } catch (e) {}
      }
    }, 120);
    return () => clearTimeout(t);
  }, [activeEditor]);

  // window resize watcher for mobile layout
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Resizer handlers for draggable divider
  const isDraggingRef = useRef(false);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const container = document.querySelector('.layout') as HTMLElement | null;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setLeftRatio(ratio);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('jsonInput', jsonInput);
  }, [jsonInput]);

  useEffect(() => {
    localStorage.setItem('toonInput', toonInput);
  }, [toonInput]);

  // Stats
  useEffect(() => {
    const lines = jsonInput ? jsonInput.split(/\r\n|\r|\n/).length : 0;
    setJsonStats({ lines, chars: jsonInput.length });
  }, [jsonInput]);

  useEffect(() => {
    const lines = toonInput ? toonInput.split(/\r\n|\r|\n/).length : 0;
    setToonStats({ lines, chars: toonInput.length });
  }, [toonInput]);

  const handleJsonToToon = useCallback(() => {
    if (!jsonInput.trim()) {
      setStatus('JSON input is empty');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const toon = jsonToToon(parsed);
      setToonInput(toon);
      setStatus('✅ Converted JSON ➝ TOON successfully');
    } catch (err: any) {
      setStatus(`❌ JSON error: ${err.message}`);
    }
  }, [jsonInput]);

  // When a file is uploaded, decide whether it's JSON or TOON by filename
  const handleUploadForJson = (content: string, filename?: string) => {
    setJsonInput(content);
    setActiveEditor('json');
    setStatus(`Loaded ${filename ?? 'file'} into JSON editor`);
    // auto-convert if file is .toon
    if (filename && filename.toLowerCase().endsWith('.toon')) {
      // if uploaded a .toon into json slot, try to parse it
      try {
        const lines = content.replace(/\r\n/g, '\n').split('\n');
        const value = parseToon(lines);
        setJsonInput(JSON.stringify(value, null, 2));
        setStatus(`Converted uploaded .toon to JSON`);
      } catch (err: any) {
        setStatus(`Uploaded .toon parsed with errors: ${err.message}`);
      }
    }
  };

  const handleUploadForToon = (content: string, filename?: string) => {
    setToonInput(content);
    setActiveEditor('toon');
    setStatus(`Loaded ${filename ?? 'file'} into TOON editor`);
    if (filename && filename.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        setToonInput(jsonToToon(parsed));
        setStatus(`Converted uploaded JSON to TOON`);
      } catch (err: any) {
        setStatus(`Uploaded JSON parse error: ${err.message}`);
      }
    }
  };

  const handleToonToJson = useCallback(() => {
    if (!toonInput.trim()) {
      setStatus('TOON input is empty');
      return;
    }
    try {
      const lines = toonInput.replace(/\r\n/g, '\n').split('\n');
      const value = parseToon(lines);
      setJsonInput(JSON.stringify(value, null, 2));
      setStatus('✅ Converted TOON ➝ JSON successfully');
    } catch (err: any) {
      setStatus(`❌ TOON error: ${err.message}`);
    }
  }, [toonInput]);

  const handleAutoConvertOnce = useCallback(() => {
    if (activeEditor === 'json') {
      handleJsonToToon();
    } else {
      handleToonToJson();
    }
  }, [activeEditor, handleJsonToToon, handleToonToJson]);

  // Auto-convert on typing (debounced)
  useEffect(() => {
    if (!autoConvert) return;

    if (activeEditor === 'json') {
      if (!jsonInput.trim()) return;
      const t = setTimeout(() => {
        handleJsonToToon();
      }, 400);
      return () => clearTimeout(t);
    }

    if (activeEditor === 'toon') {
      if (!toonInput.trim()) return;
      const t = setTimeout(() => {
        handleToonToJson();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [
    autoConvert,
    activeEditor,
    jsonInput,
    toonInput,
    handleJsonToToon,
    handleToonToJson,
  ]);

  const handleSwap = () => {
    const tempJson = jsonInput;
    setJsonInput(toonInput);
    setToonInput(tempJson);
    setStatus('🔁 Inputs swapped');
  };

  const handleReset = () => {
    setJsonInput('');
    setToonInput('');
    localStorage.removeItem('jsonInput');
    localStorage.removeItem('toonInput');
    setStatus('🧹 Cleared editors & local storage');
  };

  const loadSampleJson = () => {
    setJsonInput(SAMPLE_JSON);
    setActiveEditor('json');
    setStatus('Loaded sample JSON');
  };

  const prettyPrintJson = () => {
    try {
      if (!jsonInput.trim()) {
        setStatus('Nothing to format');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setStatus('✨ JSON formatted');
    } catch (err: any) {
      setStatus(`Cannot format: ${err.message}`);
    }
  };

  const trimToonLines = () => {
    if (!toonInput.trim()) {
      setStatus('Nothing to trim');
      return;
    }
    setToonInput(prev =>
      prev
        .split('\n')
        .map(line => line.replace(/\s+$/, ''))
        .join('\n')
    );
    setStatus('✨ TOON trailing spaces trimmed');
  };

  const isMobile = windowWidth <= 768;

  return (
    <main
      className={`layout ${isFullScreen ? 'studio-fullscreen' : ''}`}
      style={{
        gridTemplateColumns: isMobile
          ? '1fr'
          : `${leftRatio}% 8px ${100 - leftRatio}%`,
      }}
    >
      {isMobile && (
        <div className="mobile-tabbar">
          <div className="mobile-tab-left">
            <button
              className={`tab ${activeEditor === 'json' ? 'active' : ''}`}
              onClick={() => setActiveEditor('json')}
            >
              JSON
            </button>
            <button
              className={`tab ${activeEditor === 'toon' ? 'active' : ''}`}
              onClick={() => setActiveEditor('toon')}
            >
              TOON
            </button>
          </div>
          <div className="mobile-tab-right">
            <button
              className="tab action"
              onClick={() => setIsFullScreen(f => !f)}
              aria-pressed={isFullScreen}
              aria-label="Toggle fullscreen"
            >
              {isFullScreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>
      )}
      {/* Mobile floating convert FAB */}
      {isMobile && (
        <div className="mobile-actionbar" aria-hidden="true">
          {/* kept for backward compatibility but hidden by CSS on mobile */}
        </div>
      )}

      {/* Mobile persistent footer actions: visible and prominent on phones */}
      {isMobile && (
        <div className="mobile-footer-actions" role="navigation" aria-label="Studio actions">
          <button className="mfa-btn" onClick={handleJsonToToon}>
            JSON ➝ TOON
          </button>

          <button className="mfa-btn" onClick={handleAutoConvertOnce}>
            Auto (once)
          </button>

          <button className="mfa-btn" onClick={handleSwap}>
            Swap
          </button>

          <button className="mfa-btn" onClick={handleToonToJson}>
            TOON ➝ JSON
          </button>

          <label className="mfa-toggle">
            <input type="checkbox" checked={autoConvert} onChange={e => setAutoConvert(e.target.checked)} />
            <span>Auto on typing</span>
          </label>

          <button className="mfa-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      )}
      {/* JSON Panel */}
      <section
        className="panel"
        style={isMobile ? { display: activeEditor === 'json' ? 'flex' : 'none' } : {}}
      >
          <div className="panel-header">
          <div className="panel-title">
            <h2>JSON</h2>
            <div className="panel-meta">
              {jsonStats.lines} lines • {jsonStats.chars} chars
            </div>
              {!jsonInput && (
                <div className="panel-hint">Start typing JSON here or upload a file</div>
              )}
          </div>
          <div className="panel-actions">
            <button type="button" onClick={loadSampleJson}>
              Sample
            </button>
            <button type="button" onClick={prettyPrintJson}>
              Pretty
            </button>
            <button type="button" onClick={() => setJsonInput('')}>
              Clear
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(jsonInput)}
              disabled={!jsonInput}
            >
              Copy
            </button>
            <DownloadButton
              content={jsonInput}
              filename="data.json"
              label="Download"
            />
            <FileInput onFileContent={handleUploadForJson} label="Upload" />
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            flex: '1 1 auto',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Editor
            height="100%"
            language="json"
            value={jsonInput}
            onMount={editorInstance => {
              jsonEditorRef.current = editorInstance;
              editorInstance.onDidFocusEditorWidget(() =>
                setActiveEditor('json')
              );
              // keep cursor visible and focus if active
              if (activeEditor === 'json') {
                try { editorInstance.focus(); } catch (e) {}
              }
            }}
            onChange={value => setJsonInput(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: 'on',
              wrappingIndent: 'same',
              tabSize: 2,
              detectIndentation: false,
              fontSize: 14,
              lineHeight: 20,
              renderWhitespace: 'boundary',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              folding: true,
            }}
          />
        </div>
      </section>

      {/* Divider */}
      {!isMobile && (
        <div
          className="divider"
          onMouseDown={e => {
            isDraggingRef.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
          }}
        />
      )}

      {/* TOON Panel */}
      <section
        className="panel"
        style={isMobile ? { display: activeEditor === 'toon' ? 'flex' : 'none' } : {}}
      >
        <div className="panel-header">
          <div className="panel-title">
            <h2>TOON</h2>
            <div className="panel-meta">
              {toonStats.lines} lines • {toonStats.chars} chars
            </div>
            {!toonInput && (
              <div className="panel-hint">Start typing TOON here or upload a file</div>
            )}
          </div>
          <div className="panel-actions">
            <button type="button" onClick={trimToonLines}>
              Tidy
            </button>
            <button type="button" onClick={() => setToonInput('')}>
              Clear
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(toonInput)}
              disabled={!toonInput}
            >
              Copy
            </button>
            <DownloadButton
              content={toonInput}
              filename="data.toon"
              label="Download"
            />
            <FileInput onFileContent={handleUploadForToon} label="Upload" />
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            flex: '1 1 auto',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Editor
            height="100%"
            language="yaml"
            value={toonInput}
            onMount={editorInstance => {
              toonEditorRef.current = editorInstance;
              editorInstance.onDidFocusEditorWidget(() =>
                setActiveEditor('toon')
              );
              if (activeEditor === 'toon') {
                try { editorInstance.focus(); } catch (e) {}
              }
            }}
            onChange={value => setToonInput(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              wordWrap: 'on',
              wrappingIndent: 'same',
              tabSize: 2,
              detectIndentation: false,
              fontSize: 14,
              lineHeight: 20,
              renderWhitespace: 'boundary',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              folding: true,
            }}
          />
        </div>
      </section>

      {/* Floating Controls (desktop) */}
      <div className="controls">
        <button type="button" onClick={handleJsonToToon}>
          JSON ➝ TOON
        </button>
        <button
          type="button"
          onClick={handleAutoConvertOnce}
          className="auto-convert-button"
        >
          Auto (once)
        </button>
        <button type="button" onClick={handleSwap}>
          Swap
        </button>
        <button type="button" onClick={handleToonToJson}>
          TOON ➝ JSON
        </button>

        <label className="toggle-label">
          <input
            type="checkbox"
            checked={autoConvert}
            onChange={e => setAutoConvert(e.target.checked)}
          />
          <span>Auto on typing</span>
        </label>

        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Mobile controls: condensed into a popup menu button */}
      <div className="controls-mobile">
        <button
          className="controls-mobile-toggle"
          onClick={() => setMobileControlsOpen(v => !v)}
          aria-expanded={mobileControlsOpen}
          aria-label="Open controls"
        >
          ☰
        </button>
        {mobileControlsOpen && (
          <div className="controls-mobile-menu">
            <button type="button" onClick={handleJsonToToon}>
              JSON ➝ TOON
            </button>
            <button
              type="button"
              onClick={() => {
                handleAutoConvertOnce();
                setMobileControlsOpen(false);
              }}
              className="auto-convert-button"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => {
                handleSwap();
                setMobileControlsOpen(false);
              }}
            >
              Swap
            </button>
            <button
              type="button"
              onClick={() => {
                handleToonToJson();
                setMobileControlsOpen(false);
              }}
            >
              TOON ➝ JSON
            </button>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={e => setAutoConvert(e.target.checked)}
              />
              <span>Auto</span>
            </label>
            <button
              type="button"
              onClick={() => {
                handleReset();
                setMobileControlsOpen(false);
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div id="status-bar">{status}</div>
    </main>
  );
};

export default App;
