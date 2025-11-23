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
        {/* Re-added footer with links (desktop). Hidden on small screens via CSS. */}
        <footer className="app-footer">
          <div className="footer-inner">
            <div className="footer-left">© 2025 TOON/JSON Converter</div>
            <div className="footer-right">
              <a className="footer-link" href="/assist/manifest.json" target="_blank" rel="noreferrer">Manifest</a>
              <span className="sep">·</span>
              <a className="footer-link" href="https://github.com/DhruvilThummar/Script-Converter-Studio" target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

const Navbar: React.FC<{
  toggleTheme: () => void;
  theme: string;
}> = ({
  toggleTheme,
  theme,
}) => {
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
      </div>
    </nav>
  );
};

interface EditorStats {
  lines: number;
  chars: number;
}

const Studio: React.FC<{ theme: string; themePreset?: string }> = ({ theme, themePreset = '' }) => {
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
  const [autoConvert, setAutoConvert] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('autoConvert');
      return v === null ? true : JSON.parse(v);
    } catch (e) {
      return true;
    }
  });
  const [isConverting, setIsConverting] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const lastConvertedJsonRef = useRef<string>('');
  const lastConvertedToonRef = useRef<string>('');

  // Find/Replace + caret tracking
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const matchesRef = useRef<any[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [caretPos, setCaretPos] = useState({ line: 1, column: 1 });

  const [jsonStats, setJsonStats] = useState<EditorStats>({
    lines: 0,
    chars: 0,
  });
  const [toonStats, setToonStats] = useState<EditorStats>({
    lines: 0,
    chars: 0,
  });
  const [showMoreJson, setShowMoreJson] = useState(false);
  const [showMoreToon, setShowMoreToon] = useState(false);

  const jsonEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const toonEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Helper: monaco theme mapping influenced by themePreset
  const monacoTheme = themePreset === 'high-contrast' ? 'hc-black' : theme === 'dark' ? 'vs-dark' : 'light';

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

  // Find/replace helpers (simple, works on the active editor)
  const computeMatches = (editorInst: any, search: string) => {
    if (!editorInst || !search) {
      matchesRef.current = [];
      setCurrentMatchIndex(0);
      return;
    }
    const model = editorInst.getModel();
    if (!model) return;
    const ms = model.findMatches(search, false, false, true, null, true) || [];
    matchesRef.current = ms;
    setCurrentMatchIndex(0);
    if (ms.length) {
      const r = ms[0].range;
      try {
        editorInst.setSelection(r);
        editorInst.revealRangeInCenter(r);
      } catch (e) {}
    }
  };

  const findNext = (editorInst: any) => {
    const ms = matchesRef.current || [];
    if (!ms.length || !editorInst) return;
    const next = (currentMatchIndex + 1) % ms.length;
    setCurrentMatchIndex(next);
    const r = ms[next].range;
    try {
      editorInst.setSelection(r);
      editorInst.revealRangeInCenter(r);
    } catch (e) {}
  };

  const replaceOne = (editorInst: any) => {
    const ms = matchesRef.current || [];
    if (!ms.length || !editorInst) return;
    const idx = currentMatchIndex;
    const r = ms[idx].range;
    try {
      editorInst.executeEdits('find-replace', [{ range: r, text: replaceText }]);
    } catch (e) {}
    // recompute
    computeMatches(editorInst, findText);
  };

  const replaceAll = (editorInst: any) => {
    const ms = matchesRef.current || [];
    if (!ms.length || !editorInst) return;
    // apply edits from bottom to top to preserve ranges
    for (let i = ms.length - 1; i >= 0; i--) {
      const r = ms[i].range;
      try {
        editorInst.executeEdits('find-replace', [{ range: r, text: replaceText }]);
      } catch (e) {}
    }
    computeMatches(editorInst, findText);
  };

  // Recompute matches whenever search text or active editor changes
  useEffect(() => {
    const inst = activeEditor === 'json' ? jsonEditorRef.current : toonEditorRef.current;
    if (!findText) {
      matchesRef.current = [];
      setCurrentMatchIndex(0);
      return;
    }
    computeMatches(inst, findText);
  }, [findText, activeEditor]);

  // Resizer handlers for draggable divider
  const isDraggingRef = useRef(false);
  const isTouchDraggingRef = useRef(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchDraggingRef.current) return;
      const touch = e.touches[0];
      const container = document.querySelector('.layout') as HTMLElement | null;
      if (!container || !touch) return;
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const ratio = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setLeftRatio(ratio);
      e.preventDefault();
    };
    const onUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    const onTouchEnd = () => {
      isTouchDraggingRef.current = false;
      document.body.style.touchAction = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onTouchEnd);
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
    setActiveEditor('json');
    // Smart detection: prefer JSON.parse, fallback to TOON parser
    try {
      const maybeJson = JSON.parse(content);
      setJsonInput(JSON.stringify(maybeJson, null, 2));
      setStatus(`Loaded ${filename ?? 'file'} as JSON`);
      return;
    } catch (jsonErr) {
      // not JSON — try TOON
    }

    try {
      const lines = content.replace(/\r\n/g, '\n').split('\n');
      const value = parseToon(lines);
      setJsonInput(JSON.stringify(value, null, 2));
      setStatus(`Loaded ${filename ?? 'file'} and converted TOON ➝ JSON`);
      return;
    } catch (toonErr: any) {
      // fallback: store raw content but notify user
      setJsonInput(content);
      setStatus(`Loaded ${filename ?? 'file'}; not valid JSON or TOON (${toonErr?.message ?? 'parse error'})`);
    }
  };

  const handleUploadForToon = (content: string, filename?: string) => {
    setActiveEditor('toon');
    // Smart detection: if content is valid JSON, convert to TOON. Otherwise assume TOON format.
    try {
      const parsed = JSON.parse(content);
      try {
        const toon = jsonToToon(parsed);
        setToonInput(toon);
        setStatus(`Loaded ${filename ?? 'file'} and converted JSON ➝ TOON`);
        return;
      } catch (convErr: any) {
        setToonInput(content);
        setStatus(`Loaded JSON but conversion to TOON failed: ${convErr?.message ?? String(convErr)}`);
        return;
      }
    } catch (jsonErr) {
      // not JSON — assume TOON text
    }

    // plain TOON content: try to validate by parsing
    try {
      const lines = content.replace(/\r\n/g, '\n').split('\n');
      parseToon(lines); // validation only
      setToonInput(content);
      setStatus(`Loaded ${filename ?? 'file'} as TOON`);
    } catch (err: any) {
      setToonInput(content);
      setStatus(`Loaded ${filename ?? 'file'}; not valid JSON or TOON (${err?.message ?? 'parse error'})`);
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

    const shouldRun = () => {
      if (activeEditor === 'json') return !!jsonInput.trim() && jsonInput !== lastConvertedJsonRef.current;
      return !!toonInput.trim() && toonInput !== lastConvertedToonRef.current;
    };

    if (!shouldRun()) return;

    // debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setStatus('⏳ Auto waiting...');
    debounceRef.current = window.setTimeout(async () => {
      setIsConverting(true);
      try {
        if (activeEditor === 'json') {
          // validate JSON first to avoid repeated failing conversions
          const parsed = JSON.parse(jsonInput);
          const toon = jsonToToon(parsed);
          setToonInput(toon);
          lastConvertedJsonRef.current = jsonInput;
          setStatus('✅ Auto converted JSON ➝ TOON');
        } else {
          const lines = toonInput.replace(/\r\n/g, '\n').split('\n');
          const value = parseToon(lines);
          setJsonInput(JSON.stringify(value, null, 2));
          lastConvertedToonRef.current = toonInput;
          setStatus('✅ Auto converted TOON ➝ JSON');
        }
      } catch (err: any) {
        setStatus(`❌ Auto convert error: ${err?.message ?? String(err)}`);
      } finally {
        setIsConverting(false);
        if (debounceRef.current) {
          window.clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [autoConvert, activeEditor, jsonInput, toonInput]);

  // persist autoConvert preference
  useEffect(() => {
    try {
      localStorage.setItem('autoConvert', JSON.stringify(autoConvert));
    } catch (e) {}
  }, [autoConvert]);

  const handleSwap = useCallback(() => {
    const tempJson = jsonInput;
    setJsonInput(toonInput);
    setToonInput(tempJson);
    setStatus('🔁 Inputs swapped');
  }, [jsonInput, toonInput]);

  // Keyboard shortcuts: Cmd/Ctrl+Enter = convert, Cmd/Ctrl+K = swap, Cmd/Ctrl+U = toggle auto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      try {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        // Enter -> convert (use active editor)
        if (e.key === 'Enter') {
          e.preventDefault();
          try {
            handleAutoConvertOnce();
          } catch (err: any) {
            setStatus(`Shortcut error: ${err?.message ?? String(err)}`);
          }
        }
        // k -> swap
        if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          try {
            handleSwap();
          } catch (err: any) {
            setStatus(`Swap failed: ${err?.message ?? String(err)}`);
          }
        }
        // u -> toggle autoConvert
        if (e.key.toLowerCase() === 'u') {
          e.preventDefault();
          setAutoConvert(v => !v);
          setStatus(prev => `${prev} • Auto ${(autoConvert ? 'off' : 'on')}`);
        }
      } catch (outerErr: any) {
        // guard against unexpected errors in shortcut handler
        setStatus(`Keyboard handler error: ${outerErr?.message ?? String(outerErr)}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAutoConvertOnce, handleSwap, autoConvert]);

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
      {/* Assistant popup removed per user request; mobile controls still available via the condensed controls button */}
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
            <button type="button" onClick={() => { setFindOpen(f => !f); }} aria-pressed={findOpen}>Find</button>
            {findOpen && activeEditor === 'toon' && (
              <div className="find-panel">
                <input
                  aria-label="Find text"
                  placeholder="Find"
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                />
                <input
                  aria-label="Replace text"
                  placeholder="Replace"
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                />
                <button onClick={() => computeMatches(toonEditorRef.current, findText)}>Find</button>
                <button onClick={() => findNext(toonEditorRef.current)}>Next</button>
                <button onClick={() => replaceOne(toonEditorRef.current)}>Replace</button>
                <button onClick={() => replaceAll(toonEditorRef.current)}>Replace All</button>
                <button onClick={() => setFindOpen(false)}>Close</button>
              </div>
            )}
            {findOpen && activeEditor === 'json' && (
              <div className="find-panel">
                <input
                  aria-label="Find text"
                  placeholder="Find"
                  value={findText}
                  onChange={e => setFindText(e.target.value)}
                />
                <input
                  aria-label="Replace text"
                  placeholder="Replace"
                  value={replaceText}
                  onChange={e => setReplaceText(e.target.value)}
                />
                <button onClick={() => computeMatches(jsonEditorRef.current, findText)}>Find</button>
                <button onClick={() => findNext(jsonEditorRef.current)}>Next</button>
                <button onClick={() => replaceOne(jsonEditorRef.current)}>Replace</button>
                <button onClick={() => replaceAll(jsonEditorRef.current)}>Replace All</button>
                <button onClick={() => setFindOpen(false)}>Close</button>
              </div>
            )}
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
            <div className="more-menu">
              <button className="more-button" onClick={() => setShowMoreJson(s => !s)}>
                More
              </button>
              {showMoreJson && (
                <div className="more-dropdown">
                  <button type="button" onClick={() => { loadSampleJson(); setShowMoreJson(false); }}>
                    Sample
                  </button>
                  <button type="button" onClick={() => { prettyPrintJson(); setShowMoreJson(false); }}>
                    Pretty
                  </button>
                </div>
              )}
            </div>
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
              editorInstance.onDidFocusEditorWidget(() => setActiveEditor('json'));
              editorInstance.onDidChangeCursorPosition((e) => setCaretPos({ line: e.position.lineNumber, column: e.position.column }));
              // keep cursor visible and focus if active
              if (activeEditor === 'json') {
                try { editorInstance.focus(); } catch (e) {}
              }
            }}
            onChange={value => setJsonInput(value || '')}
            theme={monacoTheme}
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
          onTouchStart={e => {
            // enable touch dragging on the divider
            isTouchDraggingRef.current = true;
            document.body.style.touchAction = 'none';
            e.preventDefault();
          }}
          onTouchMove={e => {
            if (!isTouchDraggingRef.current) return;
            const touch = e.touches[0];
            const container = document.querySelector('.layout') as HTMLElement | null;
            if (!container || !touch) return;
            const rect = container.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const ratio = Math.max(20, Math.min(80, (x / rect.width) * 100));
            setLeftRatio(ratio);
            e.preventDefault();
          }}
          onTouchEnd={() => {
            isTouchDraggingRef.current = false;
            document.body.style.touchAction = '';
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
            <button type="button" onClick={() => { setFindOpen(f => !f); }} aria-pressed={findOpen}>Find</button>
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
            <div className="more-menu">
              <button className="more-button" onClick={() => setShowMoreToon(s => !s)}>
                More
              </button>
              {showMoreToon && (
                <div className="more-dropdown">
                  <button type="button" onClick={() => { trimToonLines(); setShowMoreToon(false); }}>
                    Tidy
                  </button>
                </div>
              )}
            </div>
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
              editorInstance.onDidFocusEditorWidget(() => setActiveEditor('toon'));
              editorInstance.onDidChangeCursorPosition((e) => setCaretPos({ line: e.position.lineNumber, column: e.position.column }));
              if (activeEditor === 'toon') {
                try { editorInstance.focus(); } catch (e) {}
              }
            }}
            onChange={value => setToonInput(value || '')}
            theme={monacoTheme}
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
            onChange={e => { setAutoConvert(e.target.checked); setStatus(`Auto ${e.target.checked ? 'on' : 'off'}`); }}
          />
          <span>Auto on typing</span>
          {isConverting && <span className="toggle-spinner" aria-hidden="true" />}
        </label>

        <button type="button" onClick={() => setShowResetConfirm(true)}>
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
                onChange={e => { setAutoConvert(e.target.checked); setStatus(`Auto ${e.target.checked ? 'on' : 'off'}`); }}
              />
              <span>Auto</span>
              {isConverting && <span className="toggle-spinner" aria-hidden="true" />}
            </label>
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(true);
                setMobileControlsOpen(false);
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div id="status-bar">{status}</div>

      <div className="status-caret">Ln {caretPos.line}:Col {caretPos.column}</div>

      {/* Mobile footer actions: keep primary buttons visible on phones */}
      {isMobile && (
        <div className="mobile-footer-actions" role="navigation" aria-label="Mobile actions">
          <button className="mfa-btn" onClick={() => handleJsonToToon()} aria-label="JSON to TOON">
            <span className="icon">⇄</span>
            <span className="label">JSON</span>
          </button>

          <button className="mfa-btn" onClick={() => { handleAutoConvertOnce(); }} aria-label="Auto once">
            <span className="icon">⚡</span>
            <span className="label">Auto</span>
          </button>

          <button className="mfa-btn" onClick={() => handleSwap()} aria-label="Swap">
            <span className="icon">🔁</span>
            <span className="label">Swap</span>
          </button>

          <button className="mfa-btn" onClick={() => handleToonToJson()} aria-label="TOON to JSON">
            <span className="icon">⇄</span>
            <span className="label">TOON</span>
          </button>

          <button className="mfa-btn mfa-toggle" onClick={() => setAutoConvert(v => !v)} aria-pressed={autoConvert} aria-label="Toggle auto">
            <span className="icon">⚙️</span>
            <span className="label">{autoConvert ? 'On' : 'Off'}</span>
          </button>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <h3>Confirm reset</h3>
            <p>Are you sure you want to clear both editors and local storage?</p>
            <div className="modal-actions">
              <button onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button onClick={() => { handleReset(); setShowResetConfirm(false); }}>Yes, reset</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
