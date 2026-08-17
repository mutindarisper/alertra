"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { eventKey, type DisasterFeature } from "../service/events"

export type { DisasterFeature } from "../service/events"

/** A request from the alert list for the map to fly to one event. */
export interface FocusRequest {
  key: string
  coordinates: [number, number]
  /** Bumped on every request so re-selecting the same event flies again. */
  nonce: number
}

interface SidebarContextType {
  activeItem: string
  setActiveItem: (item: string) => void
  /** Off-canvas sidebar visibility — only used below the `md` breakpoint. */
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  /** Events currently plotted on the map, shared so the alert list stays in sync. */
  disasters: DisasterFeature[]
  setDisasters: (events: DisasterFeature[]) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  focusRequest: FocusRequest | null
  focusEvent: (event: DisasterFeature) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [activeItem, setActiveItem] = useState("Overview")
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [disasters, setDisasters] = useState<DisasterFeature[]>([])
  const [isLoading, setLoading] = useState(false)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)

  const focusEvent = useCallback((event: DisasterFeature) => {
    const coordinates = event.geometry?.coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return

    setFocusRequest({
      key: eventKey(event),
      coordinates: [coordinates[0], coordinates[1]],
      nonce: Date.now(),
    })
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        activeItem,
        setActiveItem,
        isSidebarOpen,
        setSidebarOpen,
        disasters,
        setDisasters,
        isLoading,
        setLoading,
        focusRequest,
        focusEvent,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
