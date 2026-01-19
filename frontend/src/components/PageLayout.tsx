import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import './PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const PageLayout = ({ children, showHeader = true }: PageLayoutProps) => {
  return (
    <div className="page-layout">
      {showHeader && <AppHeader />}
      <main className="page-content">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
