import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

interface LandingPageProps {
  theme: 'dark' | 'light';
}

const LandingPage: React.FC<LandingPageProps> = ({ theme }) => {
  return (
    <main className={`landing ${theme}`}>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            TOON ⇄ JSON Studio
          </div>

          <h1>
            Convert <span>TOON</span> & <span>JSON</span>  
            <br />
            with confidence.
          </h1>

          <p className="hero-subtitle">
            A fast, open-source playground for switching between TOON and JSON.
            Live conversion, error feedback, file upload/download, and theme
            support — in one minimal studio.
          </p>

          <div className="hero-buttons">
            <Link to="/studio" className="btn btn-primary">
              Start Converting
            </Link>
            <Link to="/about" className="btn btn-ghost">
              Learn More
            </Link>
          </div>

          <div className="hero-meta">
            <div className="pill">
              ⚡ Live JSON ⇄ TOON
            </div>
            <div className="pill">
              🧪 Built with React + TS + Monaco
            </div>
            <div className="pill">
              💾 Works in your browser only
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-card">
            <header className="preview-header">
              <span className="status-dot" />
              Live Studio Preview
            </header>
            <div className="preview-body">
              <div className="preview-column">
                <div className="preview-label">JSON</div>
                <pre className="preview-code">
{`{
  "title": "Scene 1",
  "actors": [
    { "name": "Ada", "active": true },
    { "name": "Turing", "active": false }
  ]
}`}
                </pre>
              </div>
              <div className="preview-arrow">⇄</div>
              <div className="preview-column">
                <div className="preview-label">TOON</div>
                <pre className="preview-code">
{`title: "Scene 1"
actors:
  - name: "Ada"
    active: true
  - name: "Turing"
    active: false`}
                </pre>
              </div>
            </div>
            <footer className="preview-footer">
              Auto-convert on typing · Clipboard · File upload & download
            </footer>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Live Conversion</h3>
          <p>
            Type in either JSON or TOON and see the other side update instantly.
            Toggle auto-convert or trigger it manually when you’re ready.
          </p>
        </article>

        <article className="feature-card">
          <h3>Error Feedback</h3>
          <p>
            Clear status messages help you find malformed JSON or invalid TOON
            indentation quickly — no more guessing what went wrong.
          </p>
        </article>

        <article className="feature-card">
          <h3>File Friendly</h3>
          <p>
            Upload existing files, tweak them in the editor, then download the
            converted result. All processing happens in your browser.
          </p>
        </article>
      </section>
    </main>
  );
};

export default LandingPage;
