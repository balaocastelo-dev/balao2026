"use client";

import React from "react";

export default function HomeHeroFullWidth() {
  return (
    <section className="w-full relative overflow-hidden rounded-[2.5rem] border border-slate-700/80 bg-black shadow-2xl">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-auto block"
        poster="/banner-home-poster.jpg"
      >
        <source src="/banner-home.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
