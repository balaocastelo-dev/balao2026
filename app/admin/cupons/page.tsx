"use client";

import CouponManager from "@/components/admin/CouponManager";
import { Settings } from "lucide-react";

export default function CouponsPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-[#E60012]" />
          Cupons
        </h2>
      </div>
      <CouponManager />
    </div>
  );
}
