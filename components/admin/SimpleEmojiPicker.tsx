"use client";

import React from "react";

const EMOJI_LIST = [
  // Tech / Informática
  "💻", "🖥️", "⌨️", "🖱️", "📱", "🔋", "🔌", "📷", "📹", "🎮", "🎧", "🔊", "🖨️", "💾", "📀", "📡", "📺",
  // Acessórios / Componentes
  "🔧", "⚙️", "🔩", "📏", "📐", "🛠️", "🔒", "🔑",
  // Compras / Status
  "🛒", "🛍️", "🏷️", "💳", "📦", "🚚", "🎁", "💎", "📢", "🔥", "⚡", "⭐", "✅", "❌", "⚠️", "💡",
  // Geral
  "🏠", "🏢", "📅", "🕒", "📞", "📧", "📝", "📁", "📂", "📊", "📈", "📉",
  // Carinhas / Mãos
  "😀", "😎", "🤔", "👍", "👎", "👋", "🤝", "🙏", "👀", "🚀"
];

interface SimpleEmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function SimpleEmojiPicker({ onSelect, onClose }: SimpleEmojiPickerProps) {
  return (
    <div className="absolute z-50 mt-1 w-64 p-2 bg-white border border-gray-200 rounded-lg shadow-xl grid grid-cols-6 gap-1 max-h-60 overflow-y-auto">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="text-xl p-1 hover:bg-gray-100 rounded transition-colors"
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
