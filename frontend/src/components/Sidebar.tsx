"use client"

import type React from "react"
import { useEffect } from "react"
import { Activity, CloudRain, Flame, Globe, Mountain, Waves } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useSidebar } from "../context/sidebar-context"

export const menuItems: { name: string; icon: LucideIcon }[] = [
  { name: "Overview", icon: Globe },
  { name: "Floods", icon: CloudRain },
  { name: "Earthquakes", icon: Activity },
  { name: "Tsunamis", icon: Waves },
  { name: "Volcanoes", icon: Mountain },
  { name: "Wildfires", icon: Flame },
]

const Sidebar: React.FC = () => {
  const { activeItem, setActiveItem, isSidebarOpen, setSidebarOpen } = useSidebar()

  // The drawer is only an overlay below `md`; make sure it can never be left
  // stuck open when the layout grows into the static sidebar.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setSidebarOpen])

  const handleMenuItemClick = (itemName: string) => {
    setActiveItem(itemName)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px] md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 transition-transform duration-300 md:static md:w-20 md:translate-x-0 lg:w-64 lg:p-6 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="min-h-0 flex-1 overflow-y-auto scrollbar-slim">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeItem === item.name

              return (
                <li key={item.name}>
                  <button
                    type="button"
                    title={item.name}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => handleMenuItemClick(item.name)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition md:justify-center lg:justify-start ${
                      isActive
                        ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-brand-600" : "text-slate-400"}`}
                    />
                    <span className="inline md:hidden lg:inline">{item.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Hidden on the tablet icon rail, where there is no room for the label. */}
        <div className="mt-4 block flex-shrink-0 border-t border-slate-200 pt-4 md:hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
            <p className="text-xs leading-tight text-slate-500">
              Data from{" "}
              <a
                href="https://www.gdacs.org"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-700 hover:underline"
              >
                GDACS
              </a>
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
