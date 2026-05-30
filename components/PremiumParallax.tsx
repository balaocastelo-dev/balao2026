"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PremiumParallax() {
  const { scrollYProgress } = useScroll();

  const sheetY = useTransform(scrollYProgress, [0, 1], ["-28vh", "-132vh"]);
  const sheetX = useTransform(scrollYProgress, [0, 1], ["-6vw", "6vw"]);
  const sheetRotate = useTransform(scrollYProgress, [0, 1], [-8, 10]);

  const sheetY2 = useTransform(scrollYProgress, [0, 1], ["-10vh", "-118vh"]);
  const sheetX2 = useTransform(scrollYProgress, [0, 1], ["8vw", "-8vw"]);
  const sheetRotate2 = useTransform(scrollYProgress, [0, 1], [12, -6]);

  const glowY = useTransform(scrollYProgress, [0, 1], [60, -220]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.95, 0.78, 0.62]);
  const hue = useTransform(scrollYProgress, [0, 1], ["hue-rotate(0deg) saturate(1.35)", "hue-rotate(28deg) saturate(1.55)"]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-black" />

      <motion.div style={{ opacity: glowOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.22]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_52%),radial-gradient(circle_at_20%_25%,rgba(34,211,238,0.08),transparent_55%),radial-gradient(circle_at_70%_35%,rgba(167,139,250,0.10),transparent_56%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.08),transparent_58%)]" />
      </motion.div>

      <motion.div
        style={{ y: sheetY, x: sheetX, rotate: sheetRotate, filter: hue }}
        className="absolute left-1/2 top-0 h-[240vh] w-[160vw] -translate-x-1/2 bg-[conic-gradient(from_210deg_at_45%_40%,rgba(16,185,129,0.00),rgba(16,185,129,0.46),rgba(34,211,238,0.38),rgba(167,139,250,0.42),rgba(34,211,238,0.34),rgba(16,185,129,0.44),rgba(16,185,129,0.00))] opacity-80 blur-[72px] mix-blend-screen [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
      />

      <motion.div
        style={{ y: sheetY2, x: sheetX2, rotate: sheetRotate2, filter: hue }}
        className="absolute left-1/2 top-0 h-[240vh] w-[160vw] -translate-x-1/2 bg-[radial-gradient(closest-side_at_30%_40%,rgba(34,211,238,0.34),transparent_70%),radial-gradient(closest-side_at_55%_45%,rgba(16,185,129,0.42),transparent_72%),radial-gradient(closest-side_at_70%_50%,rgba(167,139,250,0.40),transparent_74%),radial-gradient(closest-side_at_40%_65%,rgba(236,72,153,0.16),transparent_78%)] opacity-70 blur-[84px] mix-blend-screen [mask-image:radial-gradient(circle_at_50%_40%,black_0%,black_45%,transparent_78%)]"
      />

      <motion.div
        style={{ y: glowY, opacity: glowOpacity }}
        className="absolute -top-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_62%)] blur-[22px] mix-blend-screen"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.00),rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.78)_100%)]" />
    </div>
  );
}
