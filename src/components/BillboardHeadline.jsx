import React from 'react';
import { motion } from 'framer-motion';

export default function BillboardHeadline({ text, color = "teal" }) {
  const colorClass = color === "teal" ? "billboard-teal" : "billboard-yellow";

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      padding: '10px 0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      <motion.h1 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`billboard-display ${colorClass}`}
      >
        {text}
      </motion.h1>
    </div>
  );
}
