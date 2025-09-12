import React from 'react';
import './index.css'
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
// import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  return (
    <>
    <Navbar />
    {/* <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100"> */}

      <Dashboard />
      {/* <LandingPage /> */}
    {/* </div> */}
    </>
  );
};

export default App
