import React from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { SidebarProvider } from "../context/sidebar-context";

const Dashboard: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white h-screen flex">
      <SidebarProvider>

      <Sidebar />
      <MainContent />
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
