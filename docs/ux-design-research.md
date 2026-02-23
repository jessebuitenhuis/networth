# UX Design Research: Personal Finance Apps

_Research Date: 2026-02-23_

This document presents UX design best practices, patterns, and examples from popular personal finance apps. It concludes with a set of design decisions to set the visual direction for our app.

---

## Table of Contents

1. [Competitive Landscape](#1-competitive-landscape)
2. [Color & Visual Style](#2-color--visual-style)
3. [Typography](#3-typography)
4. [Layout Patterns](#4-layout-patterns)
5. [Charts & Data Visualization](#5-charts--data-visualization)
6. [Navigation](#6-navigation)
7. [UI Components & Patterns](#7-ui-components--patterns)
8. [Micro-Interactions & Animation](#8-micro-interactions--animation)
9. [Dark Mode](#9-dark-mode)
10. [Trust & Credibility](#10-trust--credibility)
11. [Empty States & Onboarding](#11-empty-states--onboarding)
12. [Handling Negative Values](#12-handling-negative-values)
13. [Current App Baseline](#13-current-app-baseline)
14. [Design Decisions](#14-design-decisions)

---

## 1. Competitive Landscape

### Leading Apps & Their Design Identity

| App | Design Approach | Standout Feature |
|-----|----------------|-----------------|
| **Monarch Money** | Clean, neutral palette, ad-free dashboard. 607 documented UI screens, 58 components. Collapsible panels, expandable charts. | Monthly "Recap" visual breakdowns; cash flow forecasting; couples-friendly shared dashboard |
| **Copilot Money** | Native Apple design language. Minimalist, data-dense without clutter. | AI-driven auto-categorization; "shadow budgeting" (pre-allocating upcoming bills) |
| **Empower (Personal Capital)** | Investment-heavy analytics. Institutional-grade portfolio tools on free tier. | Asset allocation visualizations, fee analysis, retirement projections |
| **YNAB** | Envelope-budgeting UX. Warm, friendly, education-focused. | Budget-first philosophy; every dollar gets a "job" |
| **Kubera** | Clean interface for diverse asset types: bank accounts, cars (VIN), real estate (Zillow), crypto, domains. | Purpose-built net worth tracker with flexible asset/liability organization |
| **Revolut** | Balance front-and-center. Vibrant accents + white space + card layout. | Key actions (Add, Send) immediately accessible |
| **PocketSmith** | Calendar-based financial approach. | "Financial calendar" as core UX metaphor |

### Notable Design Showcase Projects

| Project | Source | Notable Features |
|---------|--------|-----------------|
| UnitBank Armenia (4,124 appreciations) | Behance | Polished fintech banking design |
| AIVA AI Financial Management (1,499 appreciations) | Behance | AI-powered finance with strong branding |
| Arounda "Net Worth Manager" (113k views) | Dribbble | Dedicated net worth mobile app design |
| "Easily" by Phenomenon Studio | Dribbble | Modern web finance tracking |
| Paylio Finance Mobile App | Behance | Wallet, credit card, and trading UI |
| AI Finance Management SaaS Dashboard (1,198 appreciations) | Behance | AI dashboard with comprehensive data viz |
| TrackMyStack Redesign by Olga Kouneni | Case Study | Documented UX case study balancing simplicity with power features |

---

## 2. Color & Visual Style

### Why Colors Matter

Research shows customers form subconscious judgments about products within 90 seconds, and 62-90% of that assessment is based on color alone.

### Color Psychology in Finance

| Color | Psychology | Usage |
|-------|-----------|-------|
| **Blue** | Trust, stability, calm, reliability | Most prevalent primary in finance (Chase, Citi, Revolut, Coinbase) |
| **Green** | Growth, prosperity, positive outcomes | Universal shorthand for gains; "financial wellness" |
| **Teal** | Trust + growth combined | Bridges blue's reliability with green's positivity |
| **Purple** | Luxury, confidence, innovation | Popular with fintech startups (Nubank, Plum, Starling) |
| **Orange** | Approachability, energy, warmth | Effective for CTAs and interactive elements |
| **Red** | Urgency, danger, loss | Reserved for alerts, errors, negative values -- use sparingly |

### Current Trends (2025-2026)

- **Dark glassmorphism** is the dominant premium aesthetic -- frosted glass effects on dark backgrounds. Apple's "Liquid Glass" in iOS 26 elevated this to system-level design.
- **Warm minimalism** has replaced pure flat design -- generous whitespace, soft gradients, bold typography, minimal borders, smooth shadows.
- **Jewel tones** (deep emerald, sapphire, amethyst) are replacing neon/overly-bright palettes for a premium feel.
- **Neumorphism** has largely faded due to accessibility concerns.

### Palette Recommendations

- Use a primary blue or teal for trust and structure
- Green as semantic color for gains/positive
- Red (or muted coral) for losses/negative
- Neutral gray scale for backgrounds and secondary text
- Limit palette to 6-8 total colors
- Accent colors draw attention to key data, not for decoration

### Example Palettes from Research

- **Investment Indigo**: `#1a237e`, `#3949ab`, `#5c6bc0`, `#9fa8da`, `#e8eaf6`
- **Fiscal Forest**: `#003300`, `#006600`, `#009900`, `#66cc66`, `#ccffcc`
- **Corporate Blues**: `#003366`, `#00509e`, `#007acc`, `#66a3ff`, `#cce0ff`

---

## 3. Typography

### Key Principles

- **Sans-serif fonts dominate** fintech entirely
- **Tabular (monospaced) numerals are non-negotiable** -- all digits must have equal width so columns of numbers align at decimal points
- **Character disambiguation** between `0`/`O`, `1`/`l`/`I` is critical for financial accuracy
- Limit to 1-2 fonts; use weight/boldness to create hierarchy

### Recommended Fonts

| Font | Strengths |
|------|-----------|
| **Inter** | The strongest free choice for fintech. Designed for screens, large x-height, nine weights, variable support, excellent number disambiguation. |
| **Geist Sans** | Swiss-inspired geometric sans by Vercel. Works well for UI text and display sizes. _(Currently used in this app)_ |
| **Manrope** | Semi-geometric sans that renders numbers beautifully, ideal for dashboards |
| **DM Sans** | Geometric sans-serif optimized for small UI text (labels, menus) |
| **SF Pro** | Excels on Apple platforms with intelligent number handling (Apple-only) |
| **Satoshi** | Modernist geometric with sharp personality |

### Typography Hierarchy for Finance

| Element | Style |
|---------|-------|
| Primary value (net worth) | Large (24-32px), bold, primary color |
| Secondary values (account balances) | Medium (16-20px), semibold |
| Labels & metadata | Small (12-14px), regular, muted color |
| Transaction amounts | Medium, tabular numerals, right-aligned |
| Currency symbols | Test rendering at all sizes; ensure clean rendering |

### Number Formatting Rules

- Always include currency symbol or code
- Use thousands separators consistently
- Display two decimal places for currency (except large summarized values)
- Right-align monetary columns
- Ensure decimal points line up vertically

---

## 4. Layout Patterns

### The Inverted Pyramid (Gold Standard)

Financial dashboards follow an inverted pyramid of information:

```
┌─────────────────────────────────────────────┐
│  Layer 1: THE ANSWER (Net Worth)            │  <- 5-second rule:
│  Large, bold, front-and-center              │     user finds this instantly
├─────────────────────────────────────────────┤
│  Layer 2: SUPPORTING METRICS                │
│  3-5 cards: Assets, Liabilities,            │
│  Monthly Change, Best/Worst Account         │
├─────────────────────────────────────────────┤
│  Layer 3: TRENDS & COMPARISONS              │
│  Net worth chart over time with             │
│  period pickers (1M, 3M, 6M, 1Y, All)      │
├─────────────────────────────────────────────┤
│  Layer 4: DETAILS & DRILL-DOWN              │
│  Account list, recent transactions,         │
│  secondary charts (allocation, categories)  │
└─────────────────────────────────────────────┘
```

### Card-Based vs. List-Based

| Cards | Lists/Tables |
|-------|-------------|
| Summary KPIs & metrics | Transaction histories |
| Mixed content (value + sparkline + delta) | Comparing many same-structure items |
| Consumer-facing dashboards | Power users needing density |
| Mobile-responsive (stacks naturally) | Sorting, filtering, searching |

**Best approach: combine both.** Cards at the top for KPIs, lists/tables below for accounts and transactions.

### Card Design Rules

- Fixed card anatomy: Label -> Value -> Delta -> Timeframe (always same position)
- Limit initial viewport to 5-6 cards
- Strict visual consistency (padding, font sizes, alignment)
- Standard grid with even gutters (4 columns, 16px gutters is standard)
- F-pattern or Z-pattern matches natural eye scanning

---

## 5. Charts & Data Visualization

### Recommended Chart Types

| Data | Chart Type | Why |
|------|-----------|-----|
| Net worth over time | **Area chart** or line chart | Area fills intuitively communicate wealth magnitude; gradient fills (solid fading to transparent) are the modern treatment |
| Asset allocation | **Donut chart** or stacked bar | Intuitive proportional breakdown |
| Assets vs. liabilities | **Stacked area** or line comparison | Shows components contributing to total |
| Income vs. expenses | **Grouped bar chart** | Period-by-period comparison |
| Account balances | **Horizontal bar chart** | Easy to scan and compare |
| Spending by category | **Treemap** or ring chart | Relative proportions |
| Gain/loss per account | **Diverging bar** (centered at zero) | Clearly separates positive from negative |
| Factor contributions | **Waterfall chart** | Shows how different factors build/reduce net worth |

### The 5 C's Framework

1. **Clarity** -- Is the message obvious?
2. **Clutter** -- Is there visual noise?
3. **Context** -- Are benchmarks/timeframes included?
4. **Consistency** -- Do similar charts look similar?
5. **Contrast** -- Do important elements stand out?

### Visualization Best Practices

- **One chart, one question** -- never combine unrelated metrics
- Green for gains, red for losses -- universally recognized
- Interactive elements are expected: tooltips on hover, zoomable ranges, clickable drill-downs
- Standard date range presets: 1W, 1M, 3M, 6M, 1Y, YTD, ALL
- Progressive disclosure: summary chart on dashboard, detailed on drill-down
- Limit data series to 4-5 per chart
- Remove heavy gridlines and "chartjunk"
- Place labels directly on charts when possible
- Avoid: non-zero baselines, 3D effects, dual Y-axes

---

## 6. Navigation

### Desktop/Web

- **Left sidebar** is the dominant pattern for finance dashboards
  - Collapsible to icon-only mode for more data space
  - Grouped sections: Overview, Accounts, Transactions, Budget, Goals, Reports, Settings
  - Active state highlighting with accent color
  - Darker accent colors in sidebar reduce cognitive load
- **Top bar** reserved for: page title, global actions, notifications, profile
- **Breadcrumbs** for multi-level navigation

### Mobile

- **Bottom tab bar** with 4-5 items is the standard (Dashboard, Accounts, Transactions, Budget, More)
- Customizable tab order (Monarch allows users to choose their "Quick Five")
- Floating action button for quick "add transaction"
- Pull-to-refresh for account syncing

### Information Architecture

- Dashboard/Overview as landing page
- Critical actions 1-2 taps away maximum
- Progressive disclosure: concise summaries first, expandable details on demand
- Desktop shows full data dashboards; mobile shows simplified views with quick data entry

---

## 7. UI Components & Patterns

### Core Dashboard Components

- **Net worth summary card** -- large, prominent total with delta/change indicator
- **Account cards/tiles** -- grouped by type (checking, savings, investments, property)
- **Transaction list** -- sortable, filterable, with category icons and color coding
- **Budget progress bars** -- visual fill indicators showing spending against limits
- **Period/time range picker** -- weekly, monthly, quarterly, yearly, custom
- **Quick action buttons** -- add transaction, add account, transfer

### Data Entry

- Smart forms with auto-fill and reduced field counts
- Category pickers with icons and color coding
- Currency input with proper formatting
- Date pickers with quick presets (today, yesterday, last week)

### Feedback & Trust

- Color-coded badges and alerts for thresholds
- Progress indicators for goals and milestones
- Gamification: achievements, streaks, celebrations for milestones

---

## 8. Micro-Interactions & Animation

Micro-interactions reduce "money-interface anxiety" -- the stress users feel during financial actions.

### Where They Matter Most

| Interaction | Purpose | Timing |
|------------|---------|--------|
| Transaction confirmation | Reassure action completed (checkmark, color flash) | 100-200ms |
| Loading states | Show skeleton screens or progress; prevent fear of failure | 200-300ms |
| Value transitions | Animate number counting up/down to draw attention to change | 200-300ms |
| Chart interactions | Tooltip crosshairs, smooth date range transitions, animated line draws | 300-500ms |
| Delete/destructive | Brief "undo" toast with timer for confidence in recoverability | N/A |

### Rules

- Never exceed 500ms for any single animation
- Provide `prefers-reduced-motion` fallback
- **Purpose over polish** -- every animation must serve a function (feedback, orientation, confirmation)
- Gratuitous animation undermines professionalism

---

## 9. Dark Mode

Dark mode is now an expected standard, not a luxury feature.

### Benefits for Finance

- Reduces eye strain during evening use (when many people review finances)
- Charts and colored data pop against dark backgrounds
- Conveys luxury and prestige
- Better battery life on OLED screens

### Implementation Rules

- **Do not simply invert** -- build a dedicated dark palette
- Use dark grays (`#121212` to `#1E1E1E`), not pure black (`#000000`)
- Re-tune semantic colors (green/red) for dark backgrounds -- desaturate slightly, increase luminance
- Replace elevation shadows with lighter surface colors
- Test chart readability: gridlines, axis labels, data points all need dark-mode styling
- Default to system preference; provide manual toggle
- Less suitable for extremely text-dense layouts (long financial statements)

---

## 10. Trust & Credibility

Trust is the single most important UX outcome for a finance app.

### How Design Builds Trust

| Principle | Implementation |
|-----------|---------------|
| **Visual consistency** | Buttons, colors, spacing, interactions behave the same everywhere. Use a design system with strict tokens. |
| **Transparency** | Show data source and last-synced timestamps. Let users see calculation inputs. |
| **Professional polish** | Clean typography, aligned elements, consistent spacing, no visual bugs |
| **Security visibility** | Subtle indicators (lock icon, "Encrypted" badge) without excessive security theater |
| **Empathetic error handling** | Plain language explanations, actionable guidance, reassurance that data is safe |

---

## 11. Empty States & Onboarding

### First-Use Empty State

Instead of a blank page with "$0.00":

- **Positive headline**: "Start tracking your net worth" (not "You have no accounts")
- **Value proposition**: "Add your first account to see your complete financial picture"
- **Prominent CTA**: Large "Add Account" button
- **Optional illustration**: Show what the dashboard will look like when populated
- **Demo data option**: "See a demo" button with sample data

### Ongoing Empty States

- No transactions: "No transactions yet. Add your first to start tracking."
- No search results: "No matches. Try adjusting your filters." + clear-filters button
- Goal completed: Celebrate with positive illustration and encouragement

### Rules

- Never show a completely blank screen with no guidance
- Always provide a clear next action
- Use the empty state as an education opportunity
- Keep copy short and positive

---

## 12. Handling Negative Values

### Multi-Signal Approach (Never Color Alone)

~8% of men are red-green colorblind. Always pair at least two signals:

1. **Color**: Red text for negative, green for positive
2. **Sign prefix**: Always show `-` or `+` before the number
3. **Directional icon**: Downward arrow for losses, upward for gains
4. _(Optional)_ **Parentheses**: Accounting convention `($1,234.56)` for negative

**Recommended combination**: Color + sign prefix + directional arrow.

### Accessibility Alternative

Replace red/green with **orange/blue** or **red/teal** for colorblind safety. Maintain 4.5:1 minimum contrast ratio.

### Psychological Note

Research shows displaying losses in red (vs. black) reduces investor risk-taking by ~25%. For a personal finance app focused on empowerment, use a **muted coral** instead of bright alarm-red so negatives are visible without being alarming.

### Contextual Formatting

- Net worth changes: Show absolute + percentage together: `$-2,450 (-3.2%)`
- Credit card debt: Display clearly as liability with label ("You owe") and distinct background
- Charts: Red/pink fill below zero line, green fill above; visually prominent zero line

---

## 13. Current App Baseline

### What We Already Have

| Aspect | Current State |
|--------|--------------|
| **Color system** | OKLCH color space with teal/cyan primary (`oklch(0.55 0.15 152)`). Red destructive. Light + dark mode. |
| **Typography** | Geist Sans (Variable) + Geist Mono. Standard Tailwind scale. |
| **Components** | shadcn/ui primitives. Card, Button, Sidebar, Table, Dialog, etc. |
| **Charts** | Recharts v3.7.0. Line charts with 2px stroke, primary color, no dots. Custom tooltip. |
| **Layout** | Left sidebar (collapsible icon mode), top bar, max-w-2xl main content |
| **Chart colors** | 10-color palette (Blue, Red, Green, Amber, Violet, Pink, Cyan, Orange, Teal, Indigo) |
| **Radius** | Base 10px with scale variants |
| **Dark mode** | Supported with dedicated dark palette |

### Gaps vs. Best Practices

- Net worth is not displayed as the "hero metric" in inverted-pyramid style
- No area chart for net worth (currently line-only)
- No animated value transitions or number counting effects
- Empty states could be more inviting and action-oriented
- No delta/change indicators with directional arrows on summary cards
- Card layout could follow stricter "Label -> Value -> Delta -> Timeframe" anatomy
- Tabular numeral alignment not enforced
- No gamification or celebration moments

---

## 14. Design Decisions

The following decisions need to be made to set the design direction. Each has options informed by the research above.

### Decision 1: Primary Color Direction

Our current primary is teal (`oklch(0.55 0.15 152)`).

- **Option A: Keep Teal** -- Teal bridges blue's trust with green's growth associations. Differentiates from the sea of blue-primary finance apps (Chase, Coinbase, Revolut). Already established in the current design.
- **Option B: Shift to Blue** -- Blue is the most trusted color in finance. Communicates stability and professionalism. Risk: looks like every other finance app.
- **Option C: Shift to Deep Navy/Indigo** -- Conveys premium sophistication. Pairs well with green/red semantic colors. Trending in 2025-2026 fintech design.
- **Option D: Two-Tone (Navy sidebar + Teal accents)** -- Navy sidebar for structure, teal for interactive elements and accents. Creates depth and visual separation.

### Decision 2: Visual Style

- **Option A: Warm Minimalism** -- Clean, generous whitespace, soft shadows, subtle gradients. Friendly and approachable. (Monarch Money, YNAB style)
- **Option B: Dark Glassmorphism** -- Frosted glass effects, ambient gradients, premium dark aesthetic. Sophisticated and modern. (Trending 2025-2026, iOS 26 "Liquid Glass")
- **Option C: Clean Professional** -- Flat design with subtle depth through shadows and layering. Data-focused, no decorative effects. (Empower, traditional finance style)

### Decision 3: Typography

- **Option A: Keep Geist Sans** -- Already in use. Swiss-inspired, clean. Good screen rendering. Designed by Vercel, fits the Next.js ecosystem.
- **Option B: Switch to Inter** -- The top recommended font for fintech. Excellent number disambiguation, large x-height, 9 weights. Open source.
- **Option C: Switch to Manrope** -- Semi-geometric sans with beautiful number rendering. Ideal for dashboards. More personality than Inter.

### Decision 4: Net Worth Chart Type

Currently using a line chart with Recharts.

- **Option A: Area Chart with Gradient Fill** -- Filled area below the line communicates wealth magnitude. Gradient from solid at line to transparent at bottom. The most common pattern in finance apps.
- **Option B: Stacked Area Chart** -- Shows net worth broken down by account type (checking, savings, investments). More informative but more complex.
- **Option C: Keep Line Chart, Add Comparison Overlay** -- Keep the current clean line but add the ability to overlay comparison periods or scenario projections.
- **Option D: Area Chart + Stacked Breakdown Toggle** -- Default view is a simple area chart; users can toggle to see the stacked breakdown.

### Decision 5: Dashboard Information Hierarchy

- **Option A: Full Inverted Pyramid** -- Redesign the dashboard to follow the 4-layer model: Hero net worth -> Supporting metric cards -> Trend chart -> Account details. Research-backed as the gold standard.
- **Option B: Keep Current Structure, Polish** -- Keep the existing layout but improve card consistency, add delta indicators, and improve visual hierarchy without a major restructure.

### Decision 6: Card Design

- **Option A: Fixed-Anatomy Metric Cards** -- Strict "Label -> Value -> Delta -> Timeframe" format for all summary cards. Highly consistent. (Recommended by Baymard research)
- **Option B: Flexible Rich Cards** -- Cards with mixed content types (sparklines, progress bars, mini charts). More informative but harder to keep consistent.

### Decision 7: Negative Value Treatment

- **Option A: Color + Sign + Arrow** -- Red/green colors combined with +/- prefix and directional arrows. Triple-redundant, fully accessible.
- **Option B: Color + Sign Only** -- Red/green with +/- prefix. Simpler, still accessible. Skip arrows to reduce visual noise.
- **Option C: Muted Approach** -- Use muted coral (not bright red) for negatives and muted green for positives. Empowerment over anxiety.

### Decision 8: Micro-Interactions & Animation

- **Option A: Rich Animations** -- Number counting transitions, chart draw animations, confirmation celebrations, skeleton loading. Full micro-interaction suite.
- **Option B: Subtle Feedback Only** -- Button states, loading indicators, and toast notifications. No animated numbers or chart draws. Minimal but functional.
- **Option C: Progressive Enhancement** -- Start with subtle feedback, add richer animations incrementally. Prioritize number transitions and chart interactions first.

### Decision 9: Empty States

- **Option A: Illustrated Empty States** -- Custom illustrations showing what the feature looks like when populated, with positive copy and prominent CTA.
- **Option B: Text-Only with Demo Data** -- Simple text guidance with an option to explore with sample data. Lower effort, still effective.
- **Option C: Interactive Onboarding Flow** -- Step-by-step guided setup that walks users through adding their first accounts. Most engaging, most effort.

### Decision 10: Content Width

Current main content is constrained to `max-w-2xl`.

- **Option A: Wider Dashboard (max-w-5xl or max-w-6xl)** -- Finance dashboards benefit from horizontal space for charts and multi-column card grids. Most finance apps use wide layouts.
- **Option B: Keep max-w-2xl** -- Focused reading experience. Simpler, but limits chart and card real estate.
- **Option C: Adaptive Width** -- Dashboard pages get wide layout; detail/form pages stay narrow. Different pages, different needs.

---

## Sources

### Design Platforms
- [Dribbble - Net Worth Tag](https://dribbble.com/tags/net-worth)
- [Dribbble - Personal Finance App Tag](https://dribbble.com/tags/personal-finance-app)
- [Dribbble - Finance App Tag](https://dribbble.com/tags/finance-app)
- [Behance - Finance App Designs](https://www.behance.net/search/projects/finance%20app%20design)
- [NicelyDone - Monarch UI Screens](https://nicelydone.club/apps/monarch)
- [Figma - Monarch Money Web Pages UI](https://www.figma.com/community/file/1357227916850614236)
- [Figma - Finance App Free UI Kit (Glassmorphism)](https://www.figma.com/community/file/1171991984042117830)

### UX & Design Best Practices
- [Smashing Magazine - Choose Typefaces for Fintech Products](https://www.smashingmagazine.com/2023/10/choose-typefaces-fintech-products-guide-part1/)
- [Telerik - Font Strategies for Fintech](https://www.telerik.com/blogs/font-strategies-fintech-websites-apps)
- [Baymard - Dashboard Cards Consistency](https://baymard.com/blog/cards-dashboard-layout)
- [NN/g - Designing Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)
- [Eleken - Fintech UX Best Practices 2026](https://www.eleken.co/blog-posts/fintech-ux-best-practices)
- [Onething Design - Top 10 Fintech UX Design Practices 2026](https://www.onething.design/post/top-10-fintech-ux-design-practices-2026)

### Color & Visual Design
- [Piktochart - 15 Finance Color Palettes](https://piktochart.com/tips/finance-color-palette)
- [Windmill Digital - Psychology of Color in Financial App Design](https://windmill.digital/psychology-of-color-in-financial-app-design/)
- [Phoenix Strategy Group - Best Color Palettes for Financial Dashboards](https://www.phoenixstrategy.group/blog/best-color-palettes-for-financial-dashboards)
- [JPN Fintech - Dark Mode Dos and Don'ts](https://www.jpnfintech.com/designing-for-dark-mode-in-fintech-dos-and-donts/)

### Charts & Data Visualization
- [Julius AI - 9 Principles of Data Visualization in Finance](https://julius.ai/articles/data-visualization-finance-industry)
- [Syncfusion - 7 Essential Financial Charts](https://www.syncfusion.com/blogs/post/financial-charts-visualization)
- [Finance Alliance - 16 Best Financial Charts](https://www.financealliance.io/financial-charts-and-graphs/)
- [ChartsWatcher - Top Financial Data Visualization Techniques 2025](https://chartswatcher.com/pages/blog/top-financial-data-visualization-techniques-for-2025)

### Trends & Industry Analysis
- [Wings Design - Fintech App Design Trends 2025](https://wings.design/fintech-app-design-trends-staying-ahead-of-the-curve-in-2025/)
- [Brainhub - 6 Key Fintech UX Design Trends 2025](https://brainhub.eu/library/fintech-ux-design-trends)
- [Appinventiv - 20 FinTech Trends 2026](https://appinventiv.com/blog/fintech-trends/)
- [Medium - Dark Glassmorphism in 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)

### Trust & Credibility
- [Phenomenon Studio - Fintech UX Patterns That Build Trust](https://phenomenonstudio.com/article/fintech-ux-design-patterns-that-build-trust-and-credibility/)
- [Eleken - Fintech UI Examples to Build Trust](https://www.eleken.co/blog-posts/trusted-fintech-ui-examples)
- [Kota - How Revolut and Monzo Use UX to Build Trust](https://kota.co.uk/blog/how-fintech-brands-like-revolut-and-monzo-use-ux-to-build-trust)

### App Reviews & Comparisons
- [KnowYourDosh - Best Net Worth Trackers 2026](https://www.knowyourdosh.com/blog/best-net-worth-trackers)
- [Webvator - Copilot vs Monarch Money 2026](https://webvator.com/best-budgeting-app-in-usa-copilot-vs-monarch-money-2026-comparison/)
- [Olga Kouneni - Net Worth Tracker UX Case Study](https://www.olgakouneni.com/net-worth-tracker-app-ux-design/)
- [Almax Agency - Best App Design for Financial Apps](https://almaxagency.com/design-trends/examples-of-the-best-app-design-for-financial-apps/)
