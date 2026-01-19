import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  return (
    <div className={`loading-spinner loading-spinner-${size}`} role="status" aria-label="Loading">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
