import React from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { SidebarProvider } from './context/sidebar-context';

const App: React.FC = () => {
  return (
    <SidebarProvider>
      {/* Full-height shell: the page itself never scrolls, only the panels inside it. */}
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <Navbar />
        <Dashboard />
      </div>
    </SidebarProvider>
  );
};

export default App;
