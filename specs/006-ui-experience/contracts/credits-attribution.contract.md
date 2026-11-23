# Contract: Texture & Asset Attribution

**Contract ID**: `CTR-CREDITS-006`  
**Version**: `1.0.0`  
**Location**: `frontend/src/components/ui/CreditsModal.tsx`  
**Scope**: Legal compliance, open texture credits, source licensing disclosure, and modal accessibility.

---

## 1. Component Interface & Props

```typescript
export interface CreditsModalProps {
  /** Whether the modal dialog is currently visible */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}
```

---

## 2. Attributed Asset Registry

The modal displays two primary source attributions:

### 2.1 NASA / JPL-Caltech
- **Entity**: National Aeronautics and Space Administration (NASA) & Jet Propulsion Laboratory (JPL-Caltech).
- **Assets**: Planetary maps, high-resolution solar imagery, lunar elevation data, Saturn ring profile data, and astronomical parameters.
- **License**: Public Domain (Free for educational and non-commercial visualization).
- **Official URL**: `https://www.nasa.gov` / `https://photojournal.jpl.nasa.gov`

### 2.2 Solar System Scope
- **Entity**: INOVE, s.r.o. (Solar System Scope).
- **Assets**: Free Ultra-High-Resolution textures for Mercury, Venus, Earth (day/night/clouds), Moon, Mars, Jupiter, Saturn, Uranus, Neptune, and starfield skybox.
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Official URL**: `https://www.solarsystemscope.com/textures/`

---

## 3. Modal Design & Interaction Specifications

- **Trigger**: Discrete button in top navigation bar (`المصادر / Credits`) with an Info or Sparkles icon.
- **Backdrop**: `fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity duration-300`.
- **Card**: `max-w-lg w-full bg-slate-900 border border-slate-700/70 rounded-2xl p-6 shadow-2xl z-40 mx-4`.
- **Typography**: Cairo & Tajawal for Arabic descriptions, with clean LTR links for official URLs.
- **Accessibility**:
  - Focus trap inside the modal when open.
  - Pressing `Escape` key closes the modal.
  - Clicking the backdrop outside the card triggers `onClose()`.
  - Close button has `aria-label="إغلاق نافذة المصادر - Close credits modal"`.
