"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function SectionCard({ title, children, delay = 0, className = "" }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-xl border border-white/5 bg-white/[0.02] ${className}`}
    >
      {title && (
        <h3 className="text-sm font-mono text-slate-400 mb-4">{title}</h3>
      )}
      {children}
    </motion.div>
  );
}
