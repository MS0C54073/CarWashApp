import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme and view mode from localStorage
const theme = localStorage.getItem('theme') || 'light';
const viewMode = localStorage.getItem('viewMode') || 'desktop';
document.documentElement.setAttribute('data-theme', theme);
document.documentElement.setAttribute('data-view-mode', viewMode);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
