import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AboutPage from './AboutPage';
import DownloadButton from './DownloadButton';
import Editor from '@monaco-editor/react';
import FileInput from './FileInput';
import { jsonToToon, parseToon } from './utils/toonUtils';

const App: React.FC = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Navbar toggleTheme={toggleTheme} theme={theme} />
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
};

const Navbar: React.FC<{ toggleTheme: () => void; theme: string }> = ({ toggleTheme, theme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Studio</Link>
        <Link to="/about">About</Link>
      </div>
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
        <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          &#9776;
        </button>
      </div>
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Studio</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
        </div>
      )}
    </nav>
  );
};

const Studio: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(localStorage.getItem('jsonInput') || '');
  const [toonInput, setToonInput] = useState(localStorage.getItem('toonInput') || '');
  const [status, setStatus] = useState('Ready');
  const [activeEditor, setActiveEditor] = useState('json');

  useEffect(() => {
    localStorage.setItem('jsonInput', jsonInput);
  }, [jsonInput]);

  useEffect(() => {
    localStorage.setItem('toonInput', toonInput);
  }, [toonInput]);

  const handleJsonToToon = useCallback(() => {
    if (!jsonInput) {
      setStatus('JSON input is empty');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const toon = jsonToToon(parsed);
      setToonInput(toon);
      setStatus('Converted JSON ➝ TOON successfully');
    } catch (err: any) {
      setStatus(`JSON error: ${err.message}`);
    }
  }, [jsonInput]);

  const handleToonToJson = useCallback(() => {
    if (!toonInput) {
      setStatus('TOON input is empty');
      return;
    }
    try {
      const lines = toonInput.replace(/\r\n/g, '\n').split('\n');
      const value = parseToon(lines);
      setJsonInput(JSON.stringify(value, null, 2));
      setStatus('Converted TOON ➝ JSON successfully');
    } catch (err: any) {
      setStatus(`TOON error: ${err.message}`);
    }
  }, [toonInput]);

  const handleAutoConvert = useCallback(() => {
    if (activeEditor === 'json') {
      handleJsonToToon();
    } else {
      handleToonToJson();
    }
  }, [activeEditor, handleJsonToToon, handleToonToJson]);

  const handleSwap = () => {
    const tempJson = jsonInput;
    setJsonInput(toonInput);
    setToonInput(tempJson);
    setStatus('Inputs swapped');
  };

  return (
    <main className="layout">
      <section className="panel">
        <div className="panel-header">
          <h2>JSON</h2>
          <div className="panel-actions">
            <button onClick={() => {
              try {
                const parsed = JSON.parse(jsonInput);
                setJsonInput(JSON.stringify(parsed, null, 2));
                setStatus('JSON formatted');
              } catch (err: any) {
                setStatus(`Cannot format: ${err.message}`);
              }
            }}>Pretty</button>
            <button onClick={() => setJsonInput('')}>Clear</button>
            <button onClick={() => navigator.clipboard.writeText(jsonInput)}>Copy</button>
            <DownloadButton content={jsonInput} filename="data.json" label="Download" />
            <FileInput onFileContent={setJsonInput} label="Upload" />
          </div>
        </div>
        <Editor
          height="100%"
          language="json"
          value={jsonInput}
          onMount={() => setActiveEditor('json')}
          onChange={(value) => setJsonInput(value || '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, automaticLayout: true }}
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>TOON</h2>
          <div className="panel-actions">
            <button onClick={() => setToonInput('')}>Clear</button>
            <button onClick={() => navigator.clipboard.writeText(toonInput)}>Copy</button>
            <DownloadButton content={toonInput} filename="data.toon" label="Download" />
            <FileInput onFileContent={setToonInput} label="Upload" />
          </div>
        </div>
        <Editor
          height="100%"
          language="yaml"
          value={toonInput}
          onMount={() => setActiveEditor('toon')}
          onChange={(value) => setToonInput(value || '')}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, automaticLayout: true }}
        />
      </section>
      <div className="controls">
            <button onClick={handleJsonToToon}>JSON ➝ TOON</button>
            <button onClick={handleAutoConvert} className="auto-convert">Auto</button>
            <button onClick={handleSwap}>Swap</button>
            <button onClick={handleToonToJson}>TOON ➝ JSON</button>
      </div>
      <div id="status-bar">
        {status}
      </div>
    </main>
  );
};

export default App;
