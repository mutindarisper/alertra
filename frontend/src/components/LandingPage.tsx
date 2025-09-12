import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedLanding() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 1000);
  }, []);

  const floatingImages = [
    "/image1.png",
    "/image2.png",
    "/image3.png",
    "/image4.png",
    "/image5.png",
    "/image6.png",
  ];

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      {/* Floating Images */}
      {floatingImages.map((src, index) => (
        <motion.img
          key={index}
          src={src}
          alt={`Floating Image ${index}`}
          className="absolute w-24 h-24 opacity-80"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: [Math.random() * 500 - 250, Math.random() * 500 - 250],
            y: [Math.random() * 500 - 250, Math.random() * 500 - 250],
            opacity: [0, 1, 1, 0],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />
      ))}
      {/* Center Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center text-white relative z-10"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-6xl font-bold"
        >
          COSMOS
        </motion.h1>
        {showContent && (
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-4 text-lg"
          >
            A Pinterest alternative for <span className="px-2 py-1 bg-gray-800 rounded">curators</span>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}


