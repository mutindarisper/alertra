import React from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

const Dashboard: React.FC = () => {
  return (
    // min-h-0 lets MainContent scroll internally instead of pushing the page taller.
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-slate-50">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default Dashboard;
