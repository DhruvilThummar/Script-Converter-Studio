// ---------------------- Imports ---------------------- //
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

if (typeof window !== "undefined" && (window as any).ResizeObserver) {
  const OriginalResizeObserver = window.ResizeObserver;

  class PatchedResizeObserver extends OriginalResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      // Wrap callback in requestAnimationFrame so layout changes are deferred
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  }

  (window as any).ResizeObserver = PatchedResizeObserver as any;
}


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
