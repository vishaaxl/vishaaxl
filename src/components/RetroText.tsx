"use client";

import { motion } from "framer-motion";

interface MovingTextProps {
  text: string;
}

const RetroText: React.FC<MovingTextProps> = ({ text }) => {
  return (
    <div className="relative">
      {/* Orange text with animation */}
      <motion.h1
        className="retro text-white z-20 text-6xl lg:text-8xl text-center"
        initial={{ x: 0, y: 0 }}
        animate={{
          x: [0, -5, 0, 5, 0], // Moves left and right
          y: [0, -5, 0, 5, 0], // Moves up and down
        }}
        transition={{
          duration: 5, // Duration of one complete cycle
          repeat: Infinity, // Repeats the animation infinitely
        }}
      >
        {text}
      </motion.h1>

      {/* Shadow text */}
      <h1 className="retro absolute top-0 left-3 text-6xl lg:text-8xl text-center">
        {text}
      </h1>
    </div>
  );
};

export default RetroText;
