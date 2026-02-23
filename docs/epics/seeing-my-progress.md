# Seeing My Progress — Detail

Design specifics and behavioral details for stories in the "Seeing my progress" epic.

## Story 16: Net Worth Chart (Partial)

The chart is the core visualization. It should handle all data ranges — including negative values — in a way that's immediately readable.

| Detail | Status |
| --- | --- |
| Always show the zero line on both dashboard and planning charts | Planned |
| When all values are negative, center the zero line instead of placing it at the top — give equal visual weight above and below zero | Planned |
| Round Y-axis tick values to even numbers (e.g. -338 rounds to -350 or -400) so the scale is easy to read at a glance | Planned |

## Story 46: Planning Chart Navigation (Planned)

The planning chart should connect past reality to future projections, and let users step through time to explore different windows.

| Detail | Status |
| --- | --- |
| Show one period of actual history before today as default (e.g. when 1W is selected, show -1W to +1W centered on today) | Planned |
| The historical portion shows real recorded transactions (actuals), not projections | Planned |
| Add forward and backward arrow buttons to step through time by one period increment (e.g. pressing next with 1W selected moves the window one week forward) | Planned |
| Arrow buttons sit adjacent to the period picker | Planned |

## Story 47: Clean Pickers (Planned)

Pickers should only appear when they offer a meaningful choice, following the "Clean when irrelevant" UX principle.

| Detail | Status |
| --- | --- |
| Hide the scenario picker(s) when no scenarios exist in the database | Planned |
| Hide the account picker when fewer than 2 accounts exist | Planned |
| Apply to both the planning page and any other pages where these pickers appear | Planned |
