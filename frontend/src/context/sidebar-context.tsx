"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarContextType {
  activeItem: string
  setActiveItem: (item: string) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [activeItem, setActiveItem] = useState("Overview")

  return <SidebarContext.Provider value={{ activeItem, setActiveItem }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

