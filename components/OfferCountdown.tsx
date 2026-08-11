"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function OfferCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set end date to next midnight or fixed 24h
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999); // Ends at end of today

    const calculateTimeLeft = () => {
      const difference = end.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-red-600 font-bold bg-white/90 px-4 py-2 rounded-lg shadow-sm border border-red-100 w-fit">
      <Clock className="w-5 h-5 animate-pulse" />
      <span className="text-sm uppercase tracking-wider text-gray-600 mr-2">Oferta encerra em:</span>
      <div className="flex gap-1 text-xl font-mono">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
