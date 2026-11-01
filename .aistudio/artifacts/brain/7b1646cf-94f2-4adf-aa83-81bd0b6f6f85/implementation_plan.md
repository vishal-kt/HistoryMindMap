# Bharatiya Itihas – Interactive 3D & 2D Hindi Knowledge Graph

Transform the 135-page authentic Indian History PDF (*भारतीय इतिहास - प्रागैतिहासिक काल से स्वतंत्रता तक*) into a high-performance, interactive 3D and 2D Hindi mind map tailored for competitive exam aspirants (RRB NTPC, SSC CGL/CHSL, UPSC, State PCS).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from User Clarification**:
> 1. **Initial Scope**: Build Chapter 1 sample (*प्रागैतिहासिक काल, मध्यपाषाण काल एवं ताम्रपाषाणिक संस्कृति*, Pages 1–3) with full architectural framework for review and verification before extending through all 135 pages.
> 2. **Primary Visualization Mode**: **3D Knowledge Universe** using Three.js with deep celestial/cosmic radial graph rendering as default, with a seamless 1-click toggle to a high-density **2D Hierarchical Mind Map**.
> 3. **Exam-Oriented Features**: Priority implementation of **Exam Revision Mode** featuring quick one-liners (*परीक्षापयोगी वन-लाइनर*), quick recall cards, key dates, historical personalities, and authentic PDF page references.

---

## 1. Overview & Core Concept

- **What It Does**: Reads and visualizes structured historical content directly from the verified 135-page PDF (*भारतीय इतिहास*). It places the root node **"भारतीय इतिहास"** at the core, branching into the 3 historical eras:
  1. **प्राचीन भारतीय इतिहास** (*Ancient India* - Pages 1–43)
  2. **मध्यकालीन भारतीय इतिहास** (*Medieval India* - Pages 44–72)
  3. **आधुनिक भारतीय इतिहास** (*Modern India* - Pages 73–135)
- **Target Audience**: Aspirants of RRB NTPC, RRB JE, SSC CGL/CHSL, UPSC, State PSCs, and students seeking structured visual revision in pure Hindi (Devanagari script).
- **Core Value**: Transforms dense, static notes into an engaging visual graph where every dynasty, battle, ruler, inscription, and administrative term is traceable to its original PDF page without factual deviation.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Explore the 3D Universe**: The student lands in a deep space/dark navy knowledge galaxy. Glowing nodes represent eras and historical periods. Clicking a node expands sub-branches with spring animations; double-clicking focuses and glides the camera directly to that era.
2. **Toggle to 2D Tree View**: At any instant, switching to 2D view shows a crisp, expandable tree diagram ideal for dense syllabus overview and printing.
3. **Inspect Topic Details Panel**: Selecting any node (e.g., *सिंधु घाटी सभ्यता*, *मध्यपाषाण काल*, *लहुरादेव*, *भीमबेटका*) opens a responsive right sidebar displaying:
   - Full Hindi explanation (*विस्तृत विवरण*)
   - Exam One-Liners (*परीक्षापयोगी वन-लाइनर*)
   - Key dates, personalities, and archaeological sites (*प्रमुख स्थल एवं खोजकर्ता*)
   - Source PDF Page badge (*मूल PDF पृष्ठ संख्या*)
4. **Instant Hindi Search**: Searching for terms like `भीमबेटका`, `लहुरादेव`, `पहिया`, `माइक्रोलिथ` highlights the target node, expands parent branches, centers the camera, and opens the topic panel.
5. **Exam Study Hub & Flashcards**: Quick filter for bookmarked topics, "Mark as Important", "To Revise", and "Mastered".

### Visual Identity & Theme Tokens
- **Atmosphere**: Deep obsidian / navy background (`#090D16`), subtle ambient star particles, soft connecting lines with glowing energy gradients.
- **Color Hierarchy by Historical Category**:
  - **Ancient History (प्राचीन भारत)**: Rich Teal (`#0D9488` / `#14B8A6`)
  - **Medieval History (मध्यकालीन भारत)**: Deep Royal Blue (`#2563EB` / `#3B82F6`)
  - **Modern History (आधुनिक भारत)**: Radiant Amber/Orange (`#D97706` / `#F59E0B`)
  - **Archaeological Sites & Inscriptions (स्थल एवं अभिलेख)**: Emerald (`#059669`)
  - **Wars & Invasions (युद्ध एवं संघर्ष)**: Crimson Red (`#DC2626`)
  - **Literature & Culture (साहित्य एवं संस्कृति)**: Purple (`#7C3AED`)
- **Typography**: Google Font **Noto Sans Devanagari** paired with **Plus Jakarta Sans** for UI metrics and tabular figures. Strict zero-pill metadata discipline with quiet typographic separators.
- **Bottom Control Dock**: Compact, collapsible floating dock (Zoom in/out, Fit-to-Screen, Reset Camera, 2D/3D Toggle, Focus Era, Fullscreen).

---

## 3. Key Product Decisions & Trade-Offs

- **Rendering Engine**: Native **Three.js (r160+)** inside an isolated React container (`useRef`) with custom `OrbitControls`, studio PBR lighting (`RoomEnvironment`), and procedural shaders rather than heavy external asset packs.
  - *Why*: Ensures 60fps performance on mobile and desktop, zero 404 dependencies, and complete control over camera damping, raycasting, and Hindi HTML label projection.
- **Two-Tier Visualization (3D + 2D)**:
  - *3D Mode*: Immersive exploration with orbital tiers, glowing connections, and spatial depth.
  - *2D Mode*: High-density radial or tree layout for systematic revision, printable views, and low-power devices.
- **Data Integrity**: JSON schema strictly mirrors the 135 pages of the uploaded PDF with `sourcePage` tracking. No AI-generated fictional history or external syllabus substitutions.
- **Verification Gate**: Chapter 1 (*Prehistory - प्रागैतिहासिक काल*, Pages 1–3) is fully wired and verified first, establishing the validated JSON schema before generating the subsequent chapters.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Header                           │
│   [Logo: भारतीय इतिहास]  ·  [Hindi Search Bar]  ·  [View Toggle 3D/2D]  │
├────────────────────────────────┬───────────────────────────────────────┤
│                                │                                       │
│    Primary Viewport Canvas     │         Topic Details Sidebar         │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────────┐ │
│  │  Three.js 3D Universe    │  │  │ • Heading & Era Category         │ │
│  │  - OrbitControls         │  │  │ • Source Page Reference (p. 1-3) │ │
│  │  - Radial 3D Nodes       │  │  │ • Detailed Hindi Explanation     │ │
│  │  - Dynamic Link Lines    │  │  │ • Exam One-Liners (वन-लाइनर)     │ │
│  │  - HTML Label Sprites    │  │  │ • Key Personalities & Sites      │ │
│  │                          │  │  │ • Flashcard / Bookmark Controls  │ │
│  │  [OR] 2D SVG Mind Map    │  │  └──────────────────────────────────┘ │
│  └──────────────────────────┘  │                                       │
│  ┌──────────────────────────┐  │                                       │
│  │ Collapsible Bottom Dock  │  │                                       │
│  │ [Fit] [Reset] [Exam Mode]│  │                                       │
│  └──────────────────────────┘  │                                       │
├────────────────────────────────┴───────────────────────────────────────┤
│                        State & Data Layer                              │
│   • indianHistoryData.ts (Hierarchical JSON from verified PDF pages)   │
│   • MindMapContext (Selected node, expanded set, search query, mode)   │
│   • ExamTracker (Bookmarks, revision status in localStorage)           │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Structure Schema

```typescript
export interface HistoryNode {
  id: string;
  title: string;          // e.g. "पुरापाषाणकाल (Paleolithic Period)"
  period: "ancient" | "medieval" | "modern";
  type: "era" | "period" | "culture" | "dynasty" | "ruler" | "event" | "fact";
  dates?: string;         // e.g. "2 Million BC to 10,000 BC"
  description: string;   // Authentic content extracted from PDF
  keyPoints: string[];    // Bullet points from PDF
  examFacts?: string[];   // परीक्षापयोगी तथ्य
  sites?: string[];       // प्रमुख स्थल (e.g. सोहन घाटी, भीमबेटका)
  discoverers?: string[]; // खोजकर्ता (e.g. रॉबर्ट ब्रूस फुट, 1863)
  sourcePages: number[];  // Original PDF pages (e.g. [1, 2])
  children?: HistoryNode[];
}
```

### Proposed Execution Steps
1. **Package Installation**: Install `three` and `@types/three` (and `canvas-confetti` for exam milestones).
2. **Structured Historical Data**: Create `/src/data/historyData.ts` containing the verified Chapter 1 extraction (Pages 1–3: Prehistory, Paleolithic, Mesolithic, Neolithic, Chalcolithic, Malwa, Jorwe, Kayatha, Ahar, and key discoveries like Bhimbetka, Mehergarh, Lahuradeva) plus skeleton nodes for Medieval and Modern eras.
3. **3D Knowledge Universe Engine**: Implement `/src/components/MindMap3D/MindMap3DCanvas.tsx` with:
   - Full-bleed WebGL canvas with `RoomEnvironment` and `PCFSoftShadowMap`.
   - Procedural node spheres with glowing halos, category-based materials, and connecting lines.
   - Smooth camera navigation with `OrbitControls` and double-click focus lerping.
   - Floating HTML/2D billboard labels using CSS2D-style projected positioning.
4. **2D Hierarchical Mind Map**: Implement `/src/components/MindMap2D/MindMap2DCanvas.tsx` for high-density tree navigation with click-to-expand.
5. **Interactive UI & Exam Hub**:
   - Header with Hindi search & auto-expansion.
   - Right sidebar for deep topic inspection with original PDF page badge.
   - Exam Revision Flashcard modal for quick recall testing.
   - Collapsible bottom floating control dock.
6. **Verification & Linting**: Test compilation, responsiveness, and interaction flow.
