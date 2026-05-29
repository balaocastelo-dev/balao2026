"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PremiumParallax() {
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 900], [0, 220]);
  const y2 = useTransform(scrollY, [0, 900], [0, -140]);
  const y3 = useTransform(scrollY, [0, 900], [0, 320]);
  const yText = useTransform(scrollY, [0, 900], [0, 120]);

  const opacity = useTransform(scrollY, [0, 600], [1, 0.2]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"
      />

      <motion.div
        style={{ y: y1, opacity }}
        className="absolute -top-48 -left-48 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20),transparent_60%)] blur-[10px]"
      />

      <motion.div
        style={{ y: y2, opacity }}
        className="absolute -top-40 -right-56 h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle_at_center,rgba(230,0,18,0.22),transparent_62%)] blur-[14px]"
      />

      <motion.div
        style={{ y: y3, opacity }}
        className="absolute -bottom-72 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.22),transparent_62%)] blur-[18px]"
      />

      <motion.div
        style={{ y: yText, opacity }}
        className="absolute left-1/2 top-24 -translate-x-1/2 text-[14vw] font-black tracking-tighter text-white/5 select-none whitespace-nowrap"
      >
        PREMIUM
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(230,0,18,0.12),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.10),transparent_45%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />
    </div>
  );
}
