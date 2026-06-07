"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function PainelLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      await fetch("/api/painel/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/painel";
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <LogOut size={16} />
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
