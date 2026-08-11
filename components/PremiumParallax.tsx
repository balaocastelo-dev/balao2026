"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PremiumParallax() {
  const { scrollYProgress } = useScroll();

  const sheetY = useTransform(scrollYProgress, [0, 1], ["-22vh", "-138vh"]);
  const sheetX = useTransform(scrollYProgress, [0, 1], ["-7vw", "7vw"]);
  const sheetRotate = useTransform(scrollYProgress, [0, 1], [-10, 12]);

  const sheetY2 = useTransform(scrollYProgress, [0, 1], ["-8vh", "-124vh"]);
  const sheetX2 = useTransform(scrollYProgress, [0, 1], ["9vw", "-9vw"]);
  const sheetRotate2 = useTransform(scrollYProgress, [0, 1], [14, -8]);

  const glowY = useTransform(scrollYProgress, [0, 1], [60, -220]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.92, 0.8, 0.66]);
  const auroraOpacity = useTransform(scrollYProgress, [0, 0.15, 1], [0.92, 0.82, 0.72]);
  const hue = useTransform(scrollYProgress, [0, 1], ["hue-rotate(0deg) saturate(1.55)", "hue-rotate(26deg) saturate(1.75)"]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-black" />

      <motion.div style={{ opacity: glowOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.22]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_0%,rgba(255,255,255,0.06),transparent_52%),radial-gradient(circle_at_15%_25%,rgba(34,211,238,0.10),transparent_58%),radial-gradient(circle_at_78%_35%,rgba(167,139,250,0.12),transparent_60%),radial-gradient(circle_at_40%_85%,rgba(16,185,129,0.10),transparent_62%)]" />
      </motion.div>

      <motion.div style={{ y: sheetY, x: sheetX, rotate: sheetRotate, opacity: auroraOpacity, filter: hue }} className="absolute left-1/2 top-0 h-[260vh] w-[170vw] -translate-x-1/2 will-change-transform">
        <motion.div
          animate={{
            backgroundPositionX: ["0%", "100%", "0%"],
            backgroundPositionY: ["0%", "-18%", "0%"],
            rotate: [0, 4, 0],
            scale: [1, 1.03, 1],
            opacity: [0.7, 0.88, 0.7],
          }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
          className="absolute inset-0 bg-[repeating-linear-gradient(112deg,rgba(16,185,129,0.00)_0%,rgba(16,185,129,0.00)_9%,rgba(16,185,129,0.44)_16%,rgba(34,211,238,0.40)_24%,rgba(167,139,250,0.30)_32%,rgba(34,211,238,0.00)_44%)] bg-[length:220%_220%] blur-[96px] mix-blend-screen [mask-image:radial-gradient(ellipse_at_50%_32%,black_0%,black_36%,transparent_70%)]"
        />
      </motion.div>

      <motion.div style={{ y: sheetY2, x: sheetX2, rotate: sheetRotate2, opacity: auroraOpacity, filter: hue }} className="absolute left-1/2 top-0 h-[260vh] w-[170vw] -translate-x-1/2 will-change-transform">
        <motion.div
          animate={{
            backgroundPositionX: ["100%", "0%", "100%"],
            backgroundPositionY: ["0%", "-24%", "0%"],
            rotate: [0, -3, 0],
            scale: [1.01, 1.04, 1.01],
            opacity: [0.55, 0.82, 0.55],
          }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
          className="absolute inset-0 bg-[repeating-linear-gradient(96deg,rgba(34,211,238,0.00)_0%,rgba(34,211,238,0.00)_10%,rgba(34,211,238,0.36)_18%,rgba(16,185,129,0.46)_28%,rgba(34,211,238,0.34)_36%,rgba(236,72,153,0.18)_44%,rgba(34,211,238,0.00)_58%)] bg-[length:240%_240%] blur-[108px] mix-blend-screen [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_86%,transparent)]"
        />
      </motion.div>

      <motion.div
        style={{ y: glowY, opacity: glowOpacity }}
        className="absolute -top-56 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_62%)] blur-[22px] mix-blend-screen"
      />

      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:3px_3px] opacity-[0.06]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.00),rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.78)_100%)]" />
    </div>
  );
}
