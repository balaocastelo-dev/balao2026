# Design System Specification: Balão Impeccable (Dark Mode First)

## 1. Surface & Elevation Tokens
- **Background Canvas (L0)**: `#090d16` (Deep space tinted carbon)
- **Panel Containers (L1)**: `#111827` (Rich slate panel) with `border: 1px solid rgba(51, 65, 85, 0.8)`
- **Card Interactive Surfaces (L2)**: `#161f32` with hover `border-color: #E60012` and subtle shadow `0 20px 25px -5px rgba(0, 0, 0, 0.5)`
- **Product Photo Wells**: `#FFFFFF` with `rounded-2xl`, `p-4`, `shadow-inner` to naturally host transparent & white e-commerce catalog photos with 0 artifacts.

## 2. Typography & Scale
- **H1 (Hero)**: `text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight`
- **H2 (Category Sections)**: `text-2xl sm:text-3xl font-black tracking-tight text-white`
- **Product Titles**: `text-base font-extrabold text-white leading-snug line-clamp-2 min-h-[48px]`
- **Prices**: `text-2xl sm:text-3xl font-black text-white tracking-tight`
- **PIX Discount Label**: `text-xs font-black uppercase tracking-wider text-[#E60012]`

## 3. Spacing & Rhythm ("Folgado")
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Section Vertical Gap**: `space-y-12 sm:space-y-16`
- **Grid Gaps**: `gap-6 sm:gap-8`
- **Card Padding**: `p-6 sm:p-7`

## 4. Button & Interaction System
- **Primary CTA**: Full width solid Vermelho Balão `#E60012`, `hover:bg-red-700`, `text-white font-black`, `py-4 px-6`, `rounded-2xl`, `shadow-lg shadow-red-950/50`, `active:scale-95`, `transition-all`.
- **Secondary CTA (WhatsApp)**: `text-slate-300 hover:text-[#E60012] font-bold text-xs sm:text-sm py-2 flex items-center justify-center gap-2`.

## 5. Anti-Patterns Flagged by Impeccable
- ❌ No text overflow / cut-off buttons.
- ❌ No yellow or green accents.
- ❌ No low-contrast text (e.g. gray on gray, white on light gray).
- ❌ No cramped 4-card grids inside narrow side-by-side columns.
