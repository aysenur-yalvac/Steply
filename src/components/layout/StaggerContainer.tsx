"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}

export const StaggerContainer = ({ 
  children, 
  className = "", 
  delayChildren = 0.05, 
  staggerChildren = 0.08 
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            type: "spring", 
            stiffness: 260, 
            damping: 20, 
            mass: 0.5 
          } 
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
