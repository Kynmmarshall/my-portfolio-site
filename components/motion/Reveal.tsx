"use client";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
export function Reveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <LazyMotion features={domAnimation}><m.div initial={false} whileInView={reduced ? {} : { y: [14, 0] }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>{children}</m.div></LazyMotion>;
}