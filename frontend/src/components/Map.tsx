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
import {drones} from "../service/drones"

import { useSidebar } from "../context/sidebar-context"

import Chatbot from "./Chatbot"
import { Bot, LoaderPinwheel, Plane } from "lucide-react"


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const MapboxMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  // Create a ref to store all markers so we can remove them later
  const markersRef = useRef<mapboxgl.Marker[]>([])
  // const countryRef = useRef<string>("")
  const [disasterData, setDisasterData] = useState<any[]>([])
  const [chatbot, setChatbot] = useState(false)
  const [droneUpdates, setDroneUpdates] = useState<string[]>([]);
  const [droneLogs, setDroneLogs] = useState(false)
  const baseLocation: [number, number] = [36.8219, -1.2921];
  const [loading, setLoading] = useState(false)

  const { activeItem } = useSidebar()

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [36.8, -1.26],
      zoom: 2,
    })

    // Initial fetch with all disaster types
    mapRef.current.on("load", () => {
      fetchAlerts("EQ;FL;DR;VO;WF;TS")
    })

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        // Clear all markers on unmount
        clearAllMarkers()
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update when activeItem changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return

    console.log("Active item changed to:", activeItem)

    let disasterType = "EQ;FL;DR;VO;WF;TS" // Default for Overview
   

    switch (activeItem) {
      case "Floods":
        disasterType = "FL"
        break
      case "Earthquakes":
        disasterType = "EQ"
        break
      case "Tsunamis":
        disasterType = "TS"
        break
      case "Wildfires":
        disasterType = "WF"
        break
      case "Volcanoes":
        disasterType = "VO"
        break
      case "Drought":
        disasterType = "DR"
        break
    }

    fetchAlerts(disasterType)
  }, [activeItem])

  // Function to clear all markers
  const clearAllMarkers = () => {
    console.log(`Clearing ${markersRef.current.length} markers`)
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
  }

  async function fetchAlerts(disasterType: string) {
    if (!mapRef.current) return

    console.log("Fetching alerts with disaster type:", disasterType)


    // Clear all existing markers BEFORE fetching new data
    clearAllMarkers()

    setLoading(true)
    try {
      const response = await axios.get(
        `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?fromDate=2023-10-06&toDate=2025-03-14&alertlevel=Green;Orange;Red&eventlist=${disasterType}&country=`,
      )

      const fetchedData = response.data.features || []
      setDisasterData(fetchedData) // Store data in state

      console.log(`Fetched ${response.data.features?.length || 0} markers for ${disasterType}`)
      setLoading(false)

      if (!response.data.features || !mapRef.current) return

      // Add new markers to the map
      response.data.features.forEach((marker: any) => {
        if (
          !Array.isArray(marker.geometry.coordinates) ||
          marker.geometry.coordinates.length !== 2 ||
          typeof marker.geometry.coordinates[0] !== "number" ||
          typeof marker.geometry.coordinates[1] !== "number"
        ) {
          console.error("Invalid coordinates:", marker.geometry.coordinates)
          return
        }

        // Create a DOM element for each marker
        const el = document.createElement("div")
        const width = 30
        const height = 30
        el.className = "marker"

        // Choose icon based on event type
        let iconUrl = alert
        switch (marker.properties.eventtype) {
          case "EQ":
            iconUrl = alert
            break
          case "FL":
            iconUrl = flood
            break
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
        el.style.backgroundColor = `#202c35`
        el.style.width = `${width}px`
        el.style.height = `${height}px`
        el.style.backgroundSize = "100%"
        el.style.display = "block"
        el.style.border = "none"
        el.style.borderRadius = "50%"
        el.style.cursor = "pointer"

        // Create a popup with the event details
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color:black; display:flex; flex-direction:column; gap-4;">
              <h3 style="font-weight:bold; margin-bottom:5px; ">${marker.properties.eventtype || "Event"}</h3>
              <p>${marker.properties.htmldescription || "No details available"}</p>
              <button id="requestDroneBtn" style="font-weight:bold; color:white; background-color:#3d81f6; padding:6px; margin-top:1em; border:none; outline:none; border-radius:5px; ">Request Drone 🚁 </button>
            </div>
          `)

          // Wait for the popup to be added to the DOM
        popup.on("open", () => {
          document.getElementById("requestDroneBtn")?.addEventListener("click", () => {
            requestDrone([marker.geometry.coordinates[0], marker.geometry.coordinates[1]]); // Pass disaster location
          });
        });

        // Create and add the marker
        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates as [number, number])
          .setPopup(popup)
          .addTo(mapRef.current!)

        // Store reference to marker for later removal
        markersRef.current.push(newMarker)
      })

      console.log(`Added ${markersRef.current.length} new markers to the map`)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const requestDrone = (disasterLocation: [number, number]) => {
    setDroneLogs(true)
   const droneBase = [0, 0]; // Set this to your actual drone base location
// Create a DOM element for each marker
const el = document.createElement("div")
const width = 50
const height = 50
el.className = "marker"

el.style.backgroundImage = `url(${droneIcon})`
el.style.backgroundColor = `transparent`
el.style.width = `${width}px`
el.style.height = `${height}px`
el.style.backgroundSize = "100%"
el.style.display = "block"
el.style.border = "none"
el.style.borderRadius = "50%"
el.style.cursor = "pointer"

  // Create the drone marker when a request is made
  const droneMarker = new mapboxgl.Marker(el) // Red marker for drone
    .setLngLat(droneBase as [number, number]) // Start from base
    .addTo(mapRef.current!);

  console.log("Drone dispatched to:", disasterLocation);
  const currentPos = droneMarker.getLngLat().toArray() as [number, number];
  // Start animation from base to disasterLocation
  animateDrone(droneMarker, currentPos, disasterLocation, 5000, () => {

    setDroneUpdates((prev) => [...prev, "🚁 Drone D1 deployed to Kinshasa, ETA 5 min 🛰️",]);

    setDroneUpdates((prev) => [...prev, "📡 Scanning disaster zone..."]);
    setDroneUpdates((prev) => [...prev, "📦 Aid drop successful ✅"]);
    setDroneUpdates((prev) => [...prev, "🚁 Returning to base..."]);
    
    setTimeout(() => {
  
      const currentPos = droneMarker.getLngLat().toArray() as [number, number];
      animateDrone(droneMarker, currentPos, baseLocation, 5000, () => {
        setDroneUpdates((prev) => [...prev, "🏠 Drone returned to base."]);
      });
  
    }, 6000);
  });
    const availableDrone = drones.find((d) => d.status === "idle");
    if (!availableDrone) {
      // alert("No available drones at the moment.");
      return;
    }
  
    // Assign drone to disaster
    availableDrone.status = "en route";
    availableDrone.location = disasterLocation;

    // handleDroneRequest()
  
    // Simulate movement (in real-world, API call here)
    setTimeout(() => {
      availableDrone.status = "delivering aid";
  
      setTimeout(() => {
        availableDrone.status = "returning";
        setTimeout(() => {
          availableDrone.status = "idle";
        }, 5000);
      }, 5000);
    }, 5000);
  };

  function animateDrone(droneMarker: mapboxgl.Marker, start: number[], end: [number, number], duration = 5000, onComplete?: () => void) {
    let startTime: number;
  
    function move(timestamp: number) {
      if (!startTime) startTime = timestamp;
      let progress = (timestamp - startTime) / duration;
  
      if (progress < 1) {
        const lng = start[0] + (end[0] - start[0]) * progress;
        const lat = start[1] + (end[1] - start[1]) * progress;
        droneMarker.setLngLat([lng, lat]);
        requestAnimationFrame(move);
      } else {
        droneMarker.setLngLat(end);
        console.log("Drone arrived!");
        onComplete?.(); // callback when done
      }
    }
  
    requestAnimationFrame(move);
  }
  
  
  // const handleDroneRequest = () => {
  //   const messages = [
  //     "🚁 Drone D1 deployed to Kinshasa, ETA 5 min 🛰️",
  //     "📡 Scanning disaster zone...",
  //     "📦 Aid drop successful ✅",
  //     "🚁 Returning to base..."
  //   ];

  //   messages.forEach((msg, i) => {
  //     setTimeout(() => {
  //       setDroneUpdates((prev) => [...prev, msg]);
  //     }, i * 3000); // stagger messages

      
  //   });
  // };
  

  

  return (
    <div className="w-full h-full relative" ref={mapContainerRef}>

{loading && 
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
    <LoaderPinwheel className="w-10 h-10 text-gray-800 animate-spin" />
  </div>
}

    {/* Icons Container (Fixed at the Top Left) */}
    <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 items-center">
      <span title="See drone updates">
        <Plane className="w-8 h-8 text-white bg-gray-800 p-2 rounded-md cursor-pointer" 
        onClick={() => setDroneLogs(!droneLogs)}/>
      </span>
  
      <span title="AI Chat Assistant">
        <Bot 
          className="w-8 h-8 text-white bg-gray-800 p-2 rounded-md cursor-pointer" 
          onClick={() => setChatbot(!chatbot)} 
        />
      </span>
    </div>
  
    
    {chatbot && (
      <div className="absolute bottom-5 left-5 z-20 w-[40%] h-[70%]  bg-white shadow-lg rounded-xl">
        <Chatbot disasterData={disasterData} />
      </div>
    )}

     
     {
      droneLogs && 
      <div className="absolute bottom-5 left-5 z-20 w-80 max-h-[50vh] overflow-y-auto bg-white rounded-lg shadow-lg p-4 space-y-2 border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 text-xl">🚨 Drone System Logs</h3>
      {droneUpdates.map((msg, i) => (
        <div key={i} className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
          {msg}
        </div>
      ))}
    </div>
     }
     
  </div>
  
  )
}

export default MapboxMap

