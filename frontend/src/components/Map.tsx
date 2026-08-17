"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css" // Import Mapbox styles
import axios from "axios"
import alert from "../assets/icons/alert.png"
import fire from "../assets/icons/wildfire.png"
import flood from "../assets/icons/flood.png"

import volcano from "../assets/icons/volcano.png"
import drought from "../assets/icons/drought.png"
import droneIcon from "../assets/icons/drone2.png"
import { drones } from "../service/drones"

import { useSidebar } from "../context/sidebar-context"
import { eventKey, eventTitle } from "../service/events"

import Chatbot from "./Chatbot"
import {
  Bot,
  LoaderPinwheel,
  PackageCheck,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radar,
  RotateCcw,
  Siren,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/** One line in the drone activity log. */
interface DroneUpdate {
  icon: LucideIcon
  text: string
  tone?: "success"
}

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const DISASTER_TYPES: Record<string, string> = {
  Floods: "FL",
  Earthquakes: "EQ",
  Tsunamis: "TS",
  Wildfires: "WF",
  Volcanoes: "VO",
  Drought: "DR",
}

const ALL_TYPES = "EQ;FL;DR;VO;WF;TS"

/** Home base the relief drones fly from and return to (Nairobi). */
const BASE_LOCATION: [number, number] = [36.8219, -1.2921]

/**
 * Inline copy of lucide's `plane-takeoff` glyph (lucide-react, ISC) — matching
 * the icon the drone log uses for dispatch. Mapbox popups are built as an HTML
 * string, so the React icon components are not available here.
 */
const PLANE_TAKEOFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="flex-shrink:0;"><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/></svg>`

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string,
  )

const MapboxMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  // Create a ref to store all markers so we can remove them later
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // Markers indexed by event so the alert list can open the matching popup.
  const markersByKeyRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const [chatbot, setChatbot] = useState(false)
  const [droneUpdates, setDroneUpdates] = useState<DroneUpdate[]>([])
  const [droneLogs, setDroneLogs] = useState(false)

  const { activeItem, disasters, setDisasters, isLoading, setLoading, focusRequest, focusEvent } =
    useSidebar()

  // Keep the latest fetch callbacks reachable from the map's `load` handler
  // without re-initialising the map.
  const fetchRef = useRef<(type: string) => void>(() => {})

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [36.8, -1.26],
      zoom: 2,
    })
    mapRef.current = map

    // Initial fetch with all disaster types
    map.on("load", () => {
      fetchRef.current(ALL_TYPES)
    })

    // Keep the canvas sized to its container as the layout responds.
    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(mapContainerRef.current)

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect()
      clearAllMarkers()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update when activeItem changes
  useEffect(() => {
    fetchRef.current = fetchAlerts

    if (!mapRef.current || !mapRef.current.loaded()) return
    fetchAlerts(DISASTER_TYPES[activeItem] ?? ALL_TYPES)
  }, [activeItem])

  // Fly to an event picked from the alert list and open its popup.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusRequest) return

    map.flyTo({
      center: focusRequest.coordinates,
      zoom: Math.max(map.getZoom(), 5),
      duration: 2000,
      essential: true,
    })

    const marker = markersByKeyRef.current.get(focusRequest.key)
    if (marker && !marker.getPopup()?.isOpen()) marker.togglePopup()
  }, [focusRequest])

  // Function to clear all markers
  const clearAllMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    markersByKeyRef.current.clear()
  }

  async function fetchAlerts(disasterType: string) {
    if (!mapRef.current) return

    // Clear all existing markers BEFORE fetching new data
    clearAllMarkers()
    setDisasters([])
    setLoading(true)

    try {
      const response = await axios.get(
        `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?fromDate=2023-10-06&toDate=2025-03-14&alertlevel=Green;Orange;Red&eventlist=${disasterType}&country=`,
      )

      const fetchedData = response.data.features || []
      setDisasters(fetchedData) // Share data with the alert list

      if (!mapRef.current) return

      // Add new markers to the map
      fetchedData.forEach((marker: any) => {
        if (
          !Array.isArray(marker.geometry?.coordinates) ||
          marker.geometry.coordinates.length !== 2 ||
          typeof marker.geometry.coordinates[0] !== "number" ||
          typeof marker.geometry.coordinates[1] !== "number"
        ) {
          console.error("Invalid coordinates:", marker.geometry?.coordinates)
          return
        }

        // Create a DOM element for each marker
        const el = document.createElement("div")
        el.className = "marker"

        // Choose icon based on event type
        let iconUrl = alert
        switch (marker.properties.eventtype) {
          case "EQ":
            iconUrl = alert
            break
          case "FL":
          case "TS":
            iconUrl = flood
            break
          case "DR":
            iconUrl = drought
            break
          case "VO":
            iconUrl = volcano
            break
          case "WF":
            iconUrl = fire
            break
        }

        el.style.backgroundImage = `url(${iconUrl})`
        el.style.backgroundColor = "#ffffff"
        el.style.width = "30px"
        el.style.height = "30px"
        el.style.backgroundSize = "80%"
        el.style.backgroundPosition = "center"
        el.style.backgroundRepeat = "no-repeat"
        el.style.display = "block"
        el.style.border = "2px solid #26d3d6"
        el.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.2)"
        el.style.borderRadius = "50%"
        el.style.cursor = "pointer"

        const label = eventTitle(marker.properties)
        const description = marker.properties.htmldescription || "No details available"

        // Create a popup with the event details
        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "260px" }).setHTML(`
            <div style="display:flex; flex-direction:column; gap:8px; color:#0f172a; font-family:inherit;">
              <h3 style="font-weight:600; font-size:14px; margin:0;">${escapeHtml(label)}</h3>
              <p style="margin:0; font-size:13px; line-height:1.45; color:#475569;">${description}</p>
              <button data-request-drone style="display:flex; align-items:center; justify-content:center; gap:6px; font-weight:600; font-size:13px; color:#ffffff; background-color:#26d3d6; padding:8px 12px; margin-top:4px; border:none; outline:none; border-radius:8px; cursor:pointer;">${PLANE_TAKEOFF_SVG}<span>Request drone</span></button>
            </div>
          `)

        // Wait for the popup to be added to the DOM, then wire up its own button.
        popup.on("open", () => {
          popup
            .getElement()
            ?.querySelector("[data-request-drone]")
            ?.addEventListener("click", () => {
              requestDrone(
                [marker.geometry.coordinates[0], marker.geometry.coordinates[1]],
                marker.properties.country?.trim() || "the incident site",
              )
            })
        })

        // Create and add the marker
        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates as [number, number])
          .setPopup(popup)
          .addTo(mapRef.current!)

        // Clicking the pin behaves like picking the event from the list: fly to
        // it and highlight its card. Deferred so Mapbox's own popup toggle runs
        // first — that way clicking an open pin closes it instead of re-focusing.
        el.addEventListener("click", () => {
          setTimeout(() => {
            if (popup.isOpen()) focusEvent(marker)
          }, 0)
        })

        // Store reference to marker for later removal and for fly-to lookups
        markersRef.current.push(newMarker)
        markersByKeyRef.current.set(eventKey(marker), newMarker)
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const requestDrone = (disasterLocation: [number, number], destination: string) => {
    if (!mapRef.current) return

    setDroneLogs(true)
    setChatbot(false)

    const el = document.createElement("div")
    el.className = "marker"
    el.style.backgroundImage = `url(${droneIcon})`
    el.style.backgroundColor = "transparent"
    el.style.width = "50px"
    el.style.height = "50px"
    el.style.backgroundSize = "100%"
    el.style.display = "block"
    el.style.border = "none"
    el.style.cursor = "pointer"

    // The drone always launches from — and returns to — its home base.
    const droneMarker = new mapboxgl.Marker(el).setLngLat(BASE_LOCATION).addTo(mapRef.current)

    setDroneUpdates((prev) => [
      ...prev,
      { icon: PlaneTakeoff, text: `Drone dispatched to ${destination}, ETA 5 min` },
    ])

    animateDrone(droneMarker, BASE_LOCATION, disasterLocation, 5000, () => {
      setDroneUpdates((prev) => [
        ...prev,
        { icon: Radar, text: "Scanning disaster zone..." },
        { icon: PackageCheck, text: "Aid drop successful", tone: "success" },
        { icon: RotateCcw, text: "Returning to base..." },
      ])

      setTimeout(() => {
        const currentPos = droneMarker.getLngLat().toArray() as [number, number]
        animateDrone(droneMarker, currentPos, BASE_LOCATION, 5000, () => {
          setDroneUpdates((prev) => [
            ...prev,
            { icon: PlaneLanding, text: "Drone returned to base.", tone: "success" },
          ])
        })
      }, 6000)
    })

    const availableDrone = drones.find((d) => d.status === "idle")
    if (!availableDrone) return

    // Assign drone to disaster
    availableDrone.status = "en route"
    availableDrone.location = disasterLocation

    // Simulate movement (in real-world, API call here)
    setTimeout(() => {
      availableDrone.status = "delivering aid"

      setTimeout(() => {
        availableDrone.status = "returning"
        setTimeout(() => {
          availableDrone.status = "idle"
        }, 5000)
      }, 5000)
    }, 5000)
  }

  function animateDrone(
    droneMarker: mapboxgl.Marker,
    start: number[],
    end: [number, number],
    duration = 5000,
    onComplete?: () => void,
  ) {
    let startTime: number

    function move(timestamp: number) {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration

      if (progress < 1) {
        const lng = start[0] + (end[0] - start[0]) * progress
        const lat = start[1] + (end[1] - start[1]) * progress
        droneMarker.setLngLat([lng, lat])
        requestAnimationFrame(move)
      } else {
        droneMarker.setLngLat(end)
        onComplete?.()
      }
    }

    requestAnimationFrame(move)
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full" ref={mapContainerRef} />

      {isLoading && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-panel">
          <LoaderPinwheel className="h-4 w-4 animate-spin text-brand-500" />
          <span className="text-sm text-slate-600">Loading events…</span>
        </div>
      )}

      {/* Map tools */}
      <div className="absolute left-3 top-3 z-20 flex flex-col gap-2 sm:left-4 sm:top-4">
        <button
          type="button"
          title="Drone activity log"
          aria-label="Drone activity log"
          aria-pressed={droneLogs}
          onClick={() => {
            setDroneLogs((prev) => !prev)
            setChatbot(false)
          }}
          className={`rounded-lg border p-2 shadow-card transition ${
            droneLogs
              ? "border-brand-300 bg-brand-500 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:text-brand-600"
          }`}
        >
          <Plane className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="AI chat assistant"
          aria-label="AI chat assistant"
          aria-pressed={chatbot}
          onClick={() => {
            setChatbot((prev) => !prev)
            setDroneLogs(false)
          }}
          className={`rounded-lg border p-2 shadow-card transition ${
            chatbot
              ? "border-brand-300 bg-brand-500 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:text-brand-600"
          }`}
        >
          <Bot className="h-4 w-4" />
        </button>
      </div>

      {chatbot && (
        <div className="absolute inset-x-3 bottom-3 z-20 h-[75%] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:h-[80%] sm:w-80 lg:w-96">
          <Chatbot disasterData={disasters} onClose={() => setChatbot(false)} />
        </div>
      )}

      {droneLogs && (
        <div className="absolute inset-x-3 bottom-3 z-20 flex max-h-[60%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-80">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Siren className="h-4 w-4 text-rose-500" />
              Drone system logs
            </h3>
            <button
              type="button"
              onClick={() => setDroneLogs(false)}
              aria-label="Close drone logs"
              className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-slim p-3">
            {droneUpdates.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">
                No drone activity yet. Open an event on the map and request a drone.
              </p>
            ) : (
              droneUpdates.map((update, i) => {
                const Icon = update.icon

                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700"
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        update.tone === "success" ? "text-emerald-500" : "text-brand-600"
                      }`}
                    />
                    <span>{update.text}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapboxMap
