type Drone = {
    id: string;
    location: [number, number]; // lat, lng
    status: "idle" | "en route" | "delivering aid" | "returning";
  };
  
  // Initial drones
  export const drones: Drone[] = [
    { id: "D1", location: [1.29, 36.82], status: "idle" },
    { id: "D2", location: [2.02, 37.15], status: "idle" },
  ];
  