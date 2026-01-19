import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, viewMode, toggleTheme, toggleViewMode } = useTheme();

  return (
    <div className="theme-toggle-container">
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        {theme === 'light' ? (
          <span className="theme-icon">🌙</span>
        ) : (
          <span className="theme-icon">☀️</span>
        )}
        <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
      </button>

      <button
        className="view-toggle-btn"
        onClick={toggleViewMode}
        title={`Switch to ${viewMode === 'mobile' ? 'desktop' : 'mobile'} view`}
        aria-label={`Switch to ${viewMode === 'mobile' ? 'desktop' : 'mobile'} view`}
      >
        {viewMode === 'mobile' ? (
          <>
            <span className="view-icon">💻</span>
            <span className="view-label">Desktop</span>
          </>
        ) : (
          <>
            <span className="view-icon">📱</span>
            <span className="view-label">Mobile</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
