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
          {/* Direct home page = Studio */}
          <Route path="/" element={<Studio theme={theme} />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Optional: redirect unknown paths to home */}
          <Route path="*" element={<Studio theme={theme} />} />
        </Routes>
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
          Studio
        </Link>
        <Link to="/about" className="nav-button">
          About
        </Link>
      </div>
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? 'Light' : 'Dark'} Mode
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
  const [jsonInput, setJsonInput] = useState(
    localStorage.getItem('jsonInput') || ''
  );
  const [toonInput, setToonInput] = useState(
    localStorage.getItem('toonInput') || ''
  );
  const [status, setStatus] = useState('Ready');
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

  return (
    <main className="layout">
      {/* JSON Panel */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <h2>JSON</h2>
            <div className="panel-meta">
              {jsonStats.lines} lines • {jsonStats.chars} chars
            </div>
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
            <FileInput onFileContent={setJsonInput} label="Upload" />
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
            }}
            onChange={value => setJsonInput(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      </section>

      {/* TOON Panel */}
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <h2>TOON</h2>
            <div className="panel-meta">
              {toonStats.lines} lines • {toonStats.chars} chars
            </div>
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
            <FileInput onFileContent={setToonInput} label="Upload" />
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
            }}
            onChange={value => setToonInput(value || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
            }}
          />
        </div>
      </section>

      {/* Floating Controls */}
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

      <div id="status-bar">{status}</div>
    </main>
  );
};

export default App;
