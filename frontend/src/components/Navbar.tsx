import type React from "react";
import { Menu, X } from "lucide-react";
import { useSidebar } from "../context/sidebar-context";

const Navbar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      {/* Sidebar toggle — only needed once the sidebar goes off-canvas. */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isSidebarOpen}
        className="-ml-1 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
          A
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Alertra
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">Live feed</span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-sm font-semibold text-brand-700">
          RM
        </div>
      </div>
    </header>
  );
};

export default Navbar;
