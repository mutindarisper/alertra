"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSidebar } from "../context/sidebar-context"
import world from "../assets/icons/world.svg"
import floods from "../assets/icons/flood.svg"
import earthquakes from "../assets/icons/earthquake.svg"
import tsunamis from "../assets/icons/tsunami.svg"
import volcanoes from "../assets/icons/volcano.svg"
import wildfires from "../assets/icons/fire.svg"

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeItem, setActiveItem } = useSidebar()

  // Detect the screen size to automatically collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true) // Collapse sidebar on small screens
      } else {
        setIsCollapsed(false) // Expand sidebar on larger screens
      }
    }

    window.addEventListener("resize", handleResize)

    // Initial check on load
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menuItems = [
    { name: "Overview", icon: world, isCollapsed: true },
    { name: "Floods", icon: floods, isCollapsed: true },
    { name: "Earthquakes", icon: earthquakes, isCollapsed: true },
    { name: "Tsunamis", icon: tsunamis, isCollapsed: true },
    { name: "Volcanoes", icon: volcanoes },
    { name: "Wildfires", icon: wildfires },
  ]

  const handleMenuItemClick = (itemName: string) => {
    setActiveItem(itemName)
    console.log(itemName)
  }

  const footerItems = [
    { name: "Help", icon: "fas fa-question-circle", link: "#" },
    { name: "Feedback", icon: "fas fa-comment-dots", link: "#" },
    {
      name: "Signout",
      icon: "",
      link: "#",
      profileImg: "https://via.placeholder.com/36",
    },
  ]

  return (
    <aside
      className={`bg-gray-900 flex flex-col justify-between p-6 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } md:w-64`}
    >
      {/* Sidebar Menu */}
      <div>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-white flex flex-col space-y-1 md:hidden"
        >
          <div className="w-6 h-1 bg-white"></div>
          <div className="w-6 h-1 bg-white"></div>
          <div className="w-6 h-1 bg-white"></div>
        </button>

        <ul className="space-y-8">
          {menuItems.map((item, index) => (
            <li
              key={index}
              onClick={() => handleMenuItemClick(item.name)}
              className={`flex items-center space-x-2 cursor-pointer ${
                activeItem === item.name
                  ? "text-white bg-slate-700 rounded-lg p-2"
                  : "text-gray-400 hover:text-white transition"
              }`}
            >
              <img
                src={item.icon || "/placeholder.svg"}
                className={`w-6 h-6 ${isCollapsed ? "hidden" : ""}`}
                alt={item.name}
              />
              <span className={`${isCollapsed ? "hidden" : ""}`}>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Menu */}
      <div className="space-y-4">
        {footerItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            {item.profileImg ? (
              <div className="flex items-center justify-center w-9 h-9 rounded-full border font-semibold">RM</div>
            ) : (
              <i className={item.icon}></i>
            )}
            <span className={`${isCollapsed ? "hidden" : ""}`}>{item.name}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar

