# Contract: Fact Card & Info Card UI Component

**Contract ID**: `CTR-FACT-CARD-004`  
**Version**: `1.0.0`  
**Location**: `frontend/src/components/ui/FactCard.tsx` and `PlanetInfoCard.tsx`  
**Scope**: Presentation, typography, and accessibility of visual information cards.

---

## 1. Overview
This contract governs the layout, styling, and behavior of the floating information HUDs rendered over the 3D canvas when triggered by voice agent tool calls or manual interaction.

---

## 2. Component Props & Schema

```typescript
export interface FactCardProps {
  title: string;
  facts: string[];
  direction?: 'rtl' | 'ltr';
  onClose: () => void;
  className?: string;
}

export interface PlanetInfoCardProps {
  planetId: string;
  name: string;
  arabicName: string;
  description: string;
  stats?: Array<{
    label: string;
    value: string;
  }>;
  onClose: () => void;
}
```

---

## 3. Visual & Layout Rules
1. **Glassmorphic Space Aesthetic**:
   - Background: `bg-slate-900/80` or `bg-slate-950/85`.
   - Backdrop filter: `backdrop-blur-md`.
   - Border: `border border-slate-700/50`.
   - Text color: high-contrast white and slate-200.
2. **Bilingual RTL / LTR Directionality**:
   - When Arabic text is detected (`direction === 'rtl'`), layout applies `dir="rtl"`, right-aligned text, and right-aligned bullet bullets.
   - When English text is rendered (`direction === 'ltr'`), layout applies `dir="ltr"`, left-aligned text, and left-aligned bullets.
3. **Responsive Positioning**:
   - Desktop: floating in top-right or bottom-right quadrant (`fixed right-6 top-20 max-w-sm z-30`).
   - Mobile: anchored at bottom sheet or top overlay (`fixed inset-x-4 bottom-24 max-h-[40vh] overflow-y-auto z-30`).
4. **Accessible Close Control**:
   - Each card displays an accessible close button (`aria-label="Close card"` with Lucide `X` icon) that triggers `onClose()`.
