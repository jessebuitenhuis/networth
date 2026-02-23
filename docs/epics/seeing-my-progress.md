# Seeing My Progress — Detail

Design specifics and behavioral details for stories in the "Seeing my progress" epic.

## Story 16: Net Worth Chart (Partial)

The chart is the core visualization. It handles all data ranges — including negative values — in a way that's immediately readable.

| Detail | Status |
| --- | --- |
| Zero line is always visible on both dashboard and planning charts | Planned |
| When values are negative, zero line is centered — equal visual weight above and below zero | Planned |
| Y-axis tick values are rounded to even numbers (e.g. -338 becomes -350 or -400) for easy reading | Planned |

## Story 46: Planning Chart Navigation (Planned)

The planning chart connects past reality to future projections, and users can step through time to explore different windows.

| Detail | Status |
| --- | --- |
| Default view shows one period of history before today (e.g. 1W selected shows -1W to +1W centered on today) | Planned |
| Historical portion shows actual recorded transactions, not projections | Planned |
| Forward and backward arrow buttons step through time by one period increment (1W selected + next arrow = window moves one week forward) | Planned |
| Arrow buttons are adjacent to the period picker | Planned |

## Story 47: Clean Pickers (Planned)

Pickers only appear when they offer a meaningful choice, following the "Clean when irrelevant" UX principle.

| Detail | Status |
| --- | --- |
| Scenario picker is hidden when no scenarios exist | Planned |
| Account picker is hidden when fewer than 2 accounts exist | Planned |
| Applies to the planning page and any other pages with these pickers | Planned |
