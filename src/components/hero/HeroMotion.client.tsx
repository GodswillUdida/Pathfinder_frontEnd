"use client";

import { motion } from "framer-motion";

export default function HeroMotion() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
