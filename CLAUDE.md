# Lucky Draw Web App

## 項目目標 (Project Goals)

Build a modern, fast, and intuitive web application for conducting live lottery draws at company events. The app enables:

- **Bulk Winner Selection**: Draw multiple winners (1-50+) in a single click
- **Fair Randomization**: Uses Fisher-Yates shuffle algorithm for unbiased selection
- **Flexible Input**: Support manual text entry or file uploads (CSV/Excel)
- **Real-time Results**: Instant winner display with smooth animations
- **Event Tracking**: Complete history of all draws with export capability
- **Stage-Ready UI**: High-contrast, large fonts optimized for projection

## 架構概覽 (Architecture Overview)

### Tech Stack
- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v3
- **File Parsing**: PapaParse (CSV), XLSX (Excel)
- **Icons**: Lucide React
- **State Management**: React Hooks + Context (custom)

### Component Hierarchy
```
App (root state provider)
├── CandidateInput/
│   ├── ManualInput (textarea entry)
│   ├── FileUpload (drag-drop file parser)
│   └── CandidateList (pool stats & controls)
├── DrawConfig/
│   ├── DrawSettings (number of winners, prize label)
│   └── DrawButton (main draw trigger)
├── Results/
│   ├── WinnerDisplay (grid of winners with animations)
│   └── ResultActions (copy, download, share)
└── History/
    └── DrawHistory (event log with undo/export)
```

### Data Flow
1. **Load Candidates** → Parse file/manual input → `setCandidates()`
2. **Configure Draw** → Set winner count + prize label
3. **Perform Draw** → `performDraw()` → Fisher-Yates shuffle → Update state
4. **Display Results** → Show winners + actions (copy/export/share)
5. **Track History** → Persist draw record + enable undo

### State Management
```javascript
{
  candidatePool: string[],        // All candidates (immutable)
  availableCandidates: string[],  // Remaining candidates
  currentDraw: {
    winners: string[],
    timestamp: Date,
    prizeLabel: string
  },
  history: Draw[]                 // All past draws
}
```

## 設計規範 (Design Guidelines)

### Color Palette
- **Background**: Gray-900 (#111827)
- **Cards**: Gray-800 (#1f2937)
- **Primary Action**: Emerald-500 (#10b981)
- **Secondary Action**: Gray-700 (#374151)
- **Text**: Gray-100 (#f3f4f6)
- **Accents**: Cyan-400, Blue-500, Yellow-400

### Typography
- **Headings**: Bold, System UI font
- **Body**: Regular weight, 1rem base
- **Large fonts**: Text-4xl+ for stage visibility
- **High contrast**: 5:1 minimum ratio for accessibility

### Layout
- **Responsive**: Desktop-first, mobile-friendly
- **Grid System**: 3-column layout on desktop, 1-column on mobile
- **Spacing**: Generous padding (p-6, p-8) for large screens
- **Cards**: Rounded corners (rounded-xl), subtle shadows

### Animations
- **Winner Cards**: Fade-in with stagger effect (0.5s duration)
- **Buttons**: Color transitions (0.2s)
- **Subtle**: No distracting effects (suitable for stage use)

## 約束條件 (Constraints)

### Technical
- **Frontend-Only**: No backend required; all processing client-side
- **Client-Side Parsing**: CSV and Excel files parsed in browser
- **State in Memory**: Data cleared on page refresh
- **No Database**: All data ephemeral during event
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+

### Functional
- **No Duplicates**: Winners cannot appear twice in same draw
- **Pool Management**: Winners removed from pool after each draw
- **Reset Capability**: Pool can be reset to original candidates
- **Max 50 Winners**: Single draw limited to 50 winners
- **100+ Candidates**: Tested with large pools (100-1000 names)

### UI/UX
- **Large Fonts**: Minimum 16px for readability from distance
- **High Contrast**: Dark theme with bright accents
- **No Flashing**: Animations smooth and safe
- **Keyboard Accessible**: Full keyboard navigation support
- **Touch-Friendly**: Large buttons (48px+ height)

## Quick Links
- [Architecture Details](./architecture.md) - Component structure & data flow
- [Development Changelog](./changelog.md) - Feature history
- [Project Status](./project-status.md) - Progress & roadmap
