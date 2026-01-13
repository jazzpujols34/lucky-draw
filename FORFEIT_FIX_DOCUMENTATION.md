# Critical Fix: Correct Partial Forfeit & Redraw Logic

## Executive Summary

Fixed three critical bugs in the forfeit and redraw mechanism that prevented proper consolidation of winners after redraws. The app now correctly handles partial redraws where:

1. ✅ Only forfeited slots are redrawn (not all winners)
2. ✅ Original non-forfeited winners are preserved
3. ✅ Forfeited winners are hidden from final display
4. ✅ Replacement winners are clearly identified

## The Three Critical Bugs Fixed

### Bug #1: WinnerDisplay Filtering (CRITICAL DISPLAY BUG)

**Problem:**
The winner display was filtering out replacement winners, showing incomplete results.

```javascript
// BEFORE (WRONG)
const activeWinners = normalizedWinners.filter(w => w.status === 'won' && !w.isReplacement);
const displayWinners = activeWinners.length > 0 ? activeWinners : normalizedWinners;
```

**Impact:**
After redraw:
```
Winners array: [original1, original2, original3, forfeited1, forfeited2, replacement1, replacement2]
Display showed: [original1, original2, original3]  ❌ Missing replacements!
Should show:   [original1, original2, original3, replacement1, replacement2] ✓
```

**Solution:**
```javascript
// AFTER (CORRECT)
const displayWinners = normalizedWinners.filter(w => w.status === 'won');
```

**Why it works:**
- Shows ALL winners with `status === 'won'` (both original and replacement)
- Automatically hides forfeited winners (which have `status === 'forfeited'`)
- Clean separation: status field handles visibility, not position/type

---

### Bug #2: Redraw Data Source (CRITICAL LOGIC BUG)

**Problem:**
The redraw was trying to draw from `availableCandidates`, which is empty after the initial draw.

```javascript
// BEFORE (WRONG)
const eligibleCandidates = availableCandidates.filter(name => !exclude.has(name));
```

**Impact:**
Example scenario (5 candidates, draw 5, then need to redraw 2):
```
availableCandidates after draw: [] (empty - all 5 were drawn!)
Redraw attempt: "Not enough candidates (need 2, have 0)" ❌
```

**Solution:**
```javascript
// AFTER (CORRECT)
const eligibleCandidates = candidatePool.filter(name => !exclude.has(name));
```

**Why it works:**
- `candidatePool` contains the original full pool (immutable)
- `availableCandidates` tracks only people who haven't been drawn yet
- Redraw uses the FULL pool, applying exclusion rules:
  1. All current winners (original + replacements)
  2. Forfeited participants (from previous redraws)
  3. Anyone in the redraw history
- This allows new participants to be selected if needed

**Exclusion Algorithm:**
```javascript
const exclude = new Set();

// Exclude all winners from this prize (original + forfeited + previous replacements)
draw.winners.forEach(w => exclude.add(w.name));

// Exclude anyone in redraw history (prevent re-forfeiting)
draw.redrawHistory.forEach(entry => {
  exclude.add(entry.forfeitedWinner);
  exclude.add(entry.replacementWinner);
});

// Result: eligible = candidatePool - exclude
const eligibleCandidates = candidatePool.filter(name => !exclude.has(name));
```

---

### Bug #3: CurrentDraw Not Updated After Redraw

**Problem:**
After redraw, the `currentDraw` state wasn't updated, so the UI displayed stale data.

```javascript
// BEFORE (INCOMPLETE)
setHistory(prevHistory =>
  prevHistory.map(d => {
    if (d.id === drawId) {
      return { ...d, winners: [...d.winners, ...replacements], ... };
    }
    return d;
  })
);
// currentDraw NOT updated!
```

**Impact:**
- History was updated correctly (localStorage showed correct data)
- But UI displayed old data until page refresh

**Solution:**
```javascript
// AFTER (CORRECT)
const updatedDraw = { ...draw, winners: [...draw.winners, ...replacements], ... };

setHistory(prevHistory =>
  prevHistory.map(d => d.id === drawId ? updatedDraw : d)
);

if (currentDraw && currentDraw.id === drawId) {
  setCurrentDraw(updatedDraw);
}
```

**Why it works:**
- Updates BOTH history (persistence) AND currentDraw (UI)
- Replacement winners appear immediately after redraw

---

## Data Structure Flow

### Winner Object Evolution

```javascript
// INITIAL DRAW
{
  name: "KR-HyunWoo",
  status: "won",           // Valid winner
  isReplacement: false,    // Original, not a replacement
  forfeitedAt: null,
  replacedBy: null,
  originalWinner: null
}

        ↓ Mark as forfeited ↓

{
  name: "KR-HyunWoo",
  status: "forfeited",     // Now forfeited
  isReplacement: false,
  forfeitedAt: 1704067200000,
  replacedBy: "CN-Zhiyuan",
  originalWinner: null
}

// NEW REPLACEMENT WINNER
{
  name: "CN-Zhiyuan",
  status: "won",           // Valid winner
  isReplacement: true,     // This is a replacement
  forfeitedAt: null,
  replacedBy: null,
  originalWinner: "KR-HyunWoo"  // Replaces this person
}
```

### Draw Record After Redraw

```javascript
{
  id: "uuid-123",
  drawNumber: 1,
  winners: [
    // Original winners (2 remaining valid)
    {name: "TW-Michael", status: "won", isReplacement: false},
    {name: "MY-Afiq", status: "won", isReplacement: false},

    // Forfeited (hidden from display)
    {name: "KR-HyunWoo", status: "forfeited", replacedBy: "CN-Zhiyuan"},
    {name: "US-Xavier", status: "forfeited", replacedBy: "JP-Haruki"},

    // Replacements (shown with blue badge)
    {name: "CN-Zhiyuan", status: "won", isReplacement: true, originalWinner: "KR-HyunWoo"},
    {name: "JP-Haruki", status: "won", isReplacement: true, originalWinner: "US-Xavier"}
  ],
  redrawHistory: [
    {forfeitedWinner: "KR-HyunWoo", replacementWinner: "CN-Zhiyuan", reason: "Absent", timestamp: ...},
    {forfeitedWinner: "US-Xavier", replacementWinner: "JP-Haruki", reason: "Absent", timestamp: ...}
  ]
}
```

### Display Logic

```javascript
// Step 1: Filter to show only 'won' status (hides forfeited automatically)
const displayWinners = normalizedWinners.filter(w => w.status === 'won');

// Result: [TW-Michael, MY-Afiq, CN-Zhiyuan, JP-Haruki]
// NOT shown: [KR-HyunWoo (forfeited), US-Xavier (forfeited)]

// Step 2: Render with appropriate styling
displayWinners.map((winner, index) => {
  if (winner.isReplacement) {
    // Blue card with "Replacement" badge
    // Shows: "Replaced: KR-HyunWoo"
  } else {
    // Green card with "Valid" badge
  }
});
```

---

## Complete Example Walkthrough

### Scenario
- Prize: $2000 × 5 winners
- Candidates: 7 people (5 for draw + 2 extra for potential redraw)
- Initial draw: 5 winners
- Forfeits: 2 winners
- Redraw: Fill 2 forfeited slots

### Step-by-Step

**Step 1: Load Candidates**
```
Candidates loaded: [KR-MinJoon, TW-Michael, KR-HyunWoo, US-Xavier, MY-Afiq, CN-Zhiyuan, JP-Haruki]
candidatePool: [all 7]
availableCandidates: [all 7]
```

**Step 2: Initial Draw (5 winners)**
```
Fisher-Yates shuffle from [all 7]
Draw 5 winners: [KR-MinJoon, TW-Michael, KR-HyunWoo, US-Xavier, MY-Afiq]

candidatePool: [all 7] (unchanged)
availableCandidates: [CN-Zhiyuan, JP-Haruki] (2 remaining)

winners: [
  {name: "KR-MinJoon", status: "won", isReplacement: false},
  {name: "TW-Michael", status: "won", isReplacement: false},
  {name: "KR-HyunWoo", status: "won", isReplacement: false},
  {name: "US-Xavier", status: "won", isReplacement: false},
  {name: "MY-Afiq", status: "won", isReplacement: false}
]
```

**Step 3: Mark 2 as Forfeited**
```
User selects: [KR-HyunWoo, US-Xavier]

winners: [
  {name: "KR-MinJoon", status: "won", isReplacement: false},
  {name: "TW-Michael", status: "won", isReplacement: false},
  {name: "KR-HyunWoo", status: "forfeited"},  ← Changed
  {name: "US-Xavier", status: "forfeited"},   ← Changed
  {name: "MY-Afiq", status: "won", isReplacement: false}
]
```

**Step 4: Redraw 2 Forfeited Slots**

Exclusion set:
```javascript
exclude = {
  "KR-MinJoon",      // original winner
  "TW-Michael",      // original winner
  "KR-HyunWoo",      // forfeited
  "US-Xavier",       // forfeited
  "MY-Afiq"          // original winner
}

eligibleCandidates = candidatePool.filter(name => !exclude.has(name))
                   = [CN-Zhiyuan, JP-Haruki]  // Only these 2 available
```

Draw 2 from [CN-Zhiyuan, JP-Haruki]:
```
newWinners = [CN-Zhiyuan, JP-Haruki]
```

**Step 5: Final Consolidation**
```
winners: [
  {name: "KR-MinJoon", status: "won", isReplacement: false},        // #1 Valid
  {name: "TW-Michael", status: "won", isReplacement: false},        // #2 Valid
  {name: "KR-HyunWoo", status: "forfeited"},                        // Hidden
  {name: "US-Xavier", status: "forfeited"},                         // Hidden
  {name: "MY-Afiq", status: "won", isReplacement: false},           // #3 Valid
  {name: "CN-Zhiyuan", status: "won", isReplacement: true},         // #4 Replacement (Replaced: KR-HyunWoo)
  {name: "JP-Haruki", status: "won", isReplacement: true}           // #5 Replacement (Replaced: US-Xavier)
]

displayWinners = [KR-MinJoon, TW-Michael, MY-Afiq, CN-Zhiyuan, JP-Haruki]
FINAL DISPLAY: 5 winners (3 original + 2 replacement) ✓
```

---

## Visual Design

### Winner Cards

**Original Valid Winner (Green)**
```
┌─────────────────────┐
│ Valid  (badge)      │
├─────────────────────┤
│                     │
│     #1              │
│  KR-MinJoon        │
│                     │
└─────────────────────┘
```

**Replacement Winner (Blue)**
```
┌─────────────────────┐
│ Replacement (badge) │
├─────────────────────┤
│                     │
│     #4              │
│  CN-Zhiyuan        │
│ Replaced: KR-HyunWoo│
│                     │
└─────────────────────┘
```

**Forfeited Winner (NOT SHOWN)**
```
User never sees this card
(status === 'forfeited' filtered out)
```

---

## Testing

### Test Case: Critical Fix Verification

**Setup:**
- 7 candidates (5 for draw + 2 for potential redraw)
- Draw 5 winners
- Mark 2 as forfeited
- Redraw 2 replacements

**Expected Results:**
```
✓ 3 original winners preserved
✓ 2 replacement winners redrawn
✓ 0 forfeited winners in display
✓ 5 total displayed (3 + 2)
```

**Test File:** `test_forfeit_fix.py`
```bash
python3 test_forfeit_fix.py
# Expected output: CRITICAL FIX TEST PASSED ✓✓✓
```

---

## Backward Compatibility

The fix maintains full backward compatibility:

1. **Old draw format** (string[] winners): Automatically normalized to {name, status: 'won'} objects
2. **Existing history**: Preserved and works with new display logic
3. **No migration needed**: New format coexists with old data

---

## Key Takeaways

| Aspect | Before | After |
|--------|--------|-------|
| **Display** | Showed only original winners | Shows original + replacement |
| **Forfeited display** | Visible or unclear | Properly hidden |
| **Redraw source** | `availableCandidates` (empty) | `candidatePool` (full) |
| **CurrentDraw sync** | Stale after redraw | Updated immediately |
| **Final count** | Incomplete (3/5) | Complete (5/5) ✓ |

---

## Commit Reference

**Commit:** `96646ae`
**Message:** "CRITICAL FIX: Correct Partial Forfeit & Redraw Logic"
**Files changed:** 2
**Lines added:** 56
**Lines removed:** 50
