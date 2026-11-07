# DESIGN.md - Design Direction & Craft Standard

## 1. Identity & Tone
- **Profile**: Systems Engineer, Backend Builder & Competitive Programmer with a Gothic Wednesday Addams undertone.
- **Tone**: Honest, understated, rigorous, and authentic. No bloated marketing filler, fake metrics, or generic AI buzzwords.
- **Aesthetic**: Minimalist Editorial Craft inspired by Paco Coursey (`paco.me`), Rauno Freiberg (`rauno.me`), and Lee Robinson (`leerob.io`). High contrast, razor-sharp typography, generous negative space, and zero box/card spam.

## 2. Antislop Dials
- **ENERGY**: 2 (Focused, deliberate, quiet confidence).
- **RHYTHM**: 2 (Editorial variation between narrative text, chronological logs, project previews, and structured data).
- **MOTION**: 2 (Subtle spring-physics micro-interactions, tactile hover transitions, zero looping or bouncing animations).

## 3. Typography & Hierarchy
- **Primary Sans Font**: `Geist` (`wght: 300, 400, 500, 600, 700`)
  - Headings: `font-bold` or `font-semibold`, `tracking-tight`, high-contrast text (`#18181b` in light, `#f4f4f5` in dark).
  - Body: `text-[14px]` or `text-[15px]`, `leading-relaxed`, muted text (`#52525b` in light, `#a1a1aa` in dark).
- **Monospace Font**: `Geist Mono` (`wght: 400, 500, 600`)
  - Used for metadata, dates, commit tags, statistics, and inline terminal badges.
  - Tracking: `tracking-normal` (strictly avoiding oversized faux-technical letter spacing).
- **Punctuation Hygiene**: Standard hyphens (`-`) only. Zero em-dashes (`\u2014`) or en-dashes (`\u2013`).

## 4. Color Palette & Theming
- **Light Mode**:
  - Background: `#ffffff` / subtle base `#fafafa`
  - Text: `#18181b` (high contrast), `#71717a` (secondary metadata)
  - Hairlines: `rgba(0, 0, 0, 0.08)` / `#e4e4e7`
- **Dark Mode (Obsidian)**:
  - Background: `#050507` (deep nocturnal obsidian)
  - Text: `#f4f4f5` (high contrast), `#a1a1aa` (secondary metadata)
  - Hairlines: `rgba(255, 255, 255, 0.08)` / `#27272a`
- **Rules**:
  - No purple-to-blue generic AI gradients.
  - No colored left-side accent stripes.
  - No noisy card borders around every paragraph.
  - WCAG AA contrast ratio (> 4.5:1) guaranteed in both modes.

## 5. Layout Architecture
- **Max Width**: `680px` to `700px` centered editorial column.
- **Separation**: Natural whitespace rhythm + minimal 1px hairline dividers between major sections.
- **Experiences**: Chronological editorial log, not heavy accordion boxes.
- **Projects**: Four featured builds, a collapsed archive, direct website/GitHub links, and relative detail pages. Project navigation follows the homepage order.
- **Skills**: Domain-grouped text lists, not random rows of pill badges.
- **Easter Egg**: Wednesday Addams / Thing hand crawling interaction preserved as an authentic, quiet delightful surprise.
