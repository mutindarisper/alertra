import React from "react";
import MapboxMap from "./Map";
import rain from "../assets/icons/rain.svg";
import { useSidebar } from "../context/sidebar-context";

const MainContent: React.FC = () => {

  const { activeItem } = useSidebar();
  return (
    <main className="flex-1 gap-2 flex-col p-6  ">
      <h1 className="text-3xl font-semibold mb-4">Alerts</h1>
      <p className="text-gray-400 mb-4">
        Showing all {activeItem} incidents in the last 2 hours
      </p>

      {/* Alerts Section */}
      <div className="space-y-4">
        <div className="bg-gray-800 p-2 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <img src={rain} />
            <div>
              <h2 className="font-semibold">{activeItem}</h2>
              <p className="text-gray-400 text-sm">
                2 hours ago
                <br />
                Affecting 10% of your users
              </p>
            </div>
          </div>
          <p className="text-gray-400">2 hours ago</p>
        </div>


        <div className="bg-gray-800 p-2 rounded-lg flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img src={rain} />
            <div className="mb-4">
              <h2 className="font-semibold">{activeItem}</h2>
              <p className="text-gray-400 text-sm">
                1 hour ago
                <br />
                Affecting 5% of your users
              </p>
            </div>
          </div>
          <p className="text-gray-400">1 hour ago</p>
        </div>


      </div>

      {/* Map */}
      <div className="bg-gray-800 rounded-lg overflow-hidden my-4">
        <div className="h-[50vh]">
          {/* Add Mapbox map here */}
          <MapboxMap />
        </div>
      </div>



      {/* Population Impact */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400 my-4">Population Impact</p>
        <div className="relative w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: "50%" }}
          ></div>
        </div>
        <p className=" mt-2 text-gray-300">
          240,000 people affected
        </p>
      </div>


    </main>
  );
};

export default MainContent;
