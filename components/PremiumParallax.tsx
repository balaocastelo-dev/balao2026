"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PremiumParallax() {
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 900], [0, 220]);
  const y2 = useTransform(scrollY, [0, 900], [0, -160]);
  const y3 = useTransform(scrollY, [0, 900], [0, 340]);
  const yText = useTransform(scrollY, [0, 900], [0, 140]);
  const ySweep = useTransform(scrollY, [0, 900], [120, -80]);

  const opacity = useTransform(scrollY, [0, 700], [1, 0.12]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div style={{ opacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_40%),radial-gradient(circle_at_80%_35%,rgba(230,0,18,0.14),transparent_44%),radial-gradient(circle_at_50%_95%,rgba(167,139,250,0.14),transparent_48%)]" />
      </motion.div>

      <motion.div
        style={{ y: y1, opacity }}
        className="absolute -top-56 -left-56 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22),transparent_62%)] blur-[14px] mix-blend-screen"
      />

      <motion.div
        style={{ y: y2, opacity }}
        className="absolute -top-52 -right-72 h-[860px] w-[860px] rounded-full bg-[radial-gradient(circle_at_center,rgba(230,0,18,0.24),transparent_64%)] blur-[16px] mix-blend-screen"
      />

      <motion.div
        style={{ y: y3, opacity }}
        className="absolute -bottom-80 left-1/2 -translate-x-1/2 h-[980px] w-[980px] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.24),transparent_64%)] blur-[22px] mix-blend-screen"
      />

      <motion.div
        style={{ y: yText, opacity }}
        className="absolute left-1/2 top-20 -translate-x-1/2 text-[14vw] font-black tracking-tighter text-white/5 select-none whitespace-nowrap"
      >
        PREMIUM
      </motion.div>

      <motion.div
        style={{ y: ySweep, opacity }}
        className="absolute left-1/2 top-0 -translate-x-1/2 h-[520px] w-[120vw] -skew-y-6 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)] blur-[2px]"
      />

      <div className="absolute inset-0 opacity-55 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black" />
    </div>
  );
}
