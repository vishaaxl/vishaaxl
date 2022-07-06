import { motion } from "framer-motion";
import React from "react";

const animationConfiguration = {
  initial: {
    y: 1000,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.4, ease: [0.6, 0.01, -0.05, 0.9] },
  },
  exit: { y: 1000, opacity: 0 },
};

interface Props {
  children: React.ReactNode;
  id: string;
}

const Transitions: React.FC<Props> = ({ children, id }) => {
  return (
    <motion.div
      key={id}
      variants={animationConfiguration}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};
export default Transitions;
