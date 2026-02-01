# Visual Property Inspector - Implementation Plan

> Transform VisBug's basic History sidebar into a professional Figma-style property inspector

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Component System](#component-system)
4. [Implementation Phases](#implementation-phases)
5. [Task Assignment](#task-assignment)
6. [File Structure](#file-structure)
7. [Technical Specifications](#technical-specifications)

---

## Project Overview

### Goal
Replace the current "History" sidebar with a comprehensive visual property inspector that:
- Shows **real-time CSS properties** of selected elements
- Provides **visual controls** (sliders, color pickers, toggles, box editors)
- Supports **tabbed view** for Raw CSS vs Tailwind
- Generates **AI-friendly code output** for copy/paste to coding assistants
- Maintains **undo/redo** functionality

### Target UI Reference
```
┌─────────────────────────────────────┐
│ Element: button.primary            │
│ ┌─────────┬──────────┐             │
│ │   CSS   │ Tailwind │             │
│ └─────────┴──────────┘             │
├─────────────────────────────────────┤
│ ▼ Layout                           │
│   ┌─────┬─────┬─────┬─────┬─────┐  │
│   │Block│Flex │Grid │Inlin│None │  │
│   └─────┴─────┴─────┴─────┴─────┘  │
├─────────────────────────────────────┤
│ ▼ Spacing                          │
│   ┌─────────────────────────────┐  │
│   │          [8]                │  │
│   │    ┌─────────────────┐      │  │
│   │[12]│                 │[12]  │  │
│   │    │                 │      │  │
│   │    └─────────────────┘      │  │
│   │          [8]                │  │
│   └─────────────────────────────┘  │
│   Margin (outer) / Padding (inner) │
├─────────────────────────────────────┤
│ ▼ Position                         │
│   Type: [Relative ▼]               │
│   Float: [None ▼] Clear: [None ▼]  │
├─────────────────────────────────────┤
│ ▼ Typography                       │
│   Font: [Inter          ▼]         │
│   Weight: [500 ──●─────] Size: 16  │
│   Line Height: 1.5   Letter: 0     │
│   Color: [■ #333333]               │
│   Align: [◀ ≡ ▶ ▤]                │
├─────────────────────────────────────┤
│ ▼ Backgrounds                      │
│   Color: [■ #FFFFFF]               │
│   Image: [────────────────]        │
├─────────────────────────────────────┤
│ ▼ Borders                          │
│   Radius: ┌──┐ [4] [4] [4] [4]     │
│   Width:  [1]px                    │
│   Style:  [Solid ▼]                │
│   Color:  [■ #CCCCCC]              │
├─────────────────────────────────────┤
│ ▼ Effects                          │
│   Opacity: [────●────] 100%        │
│   Shadows: + Add Shadow            │
│   Filters: + Add Filter            │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ .button {                       ││
│ │   display: flex;                ││
│ │   padding: 8px 12px;            ││
│ │ }                               ││
│ └─────────────────────────────────┘│
│ [      Copy to Clipboard      ]    │
└─────────────────────────────────────┘
```

---

## Architecture

### Component Hierarchy
```
PropertyInspector (main container)
├── InspectorHeader
│   ├── ElementLabel
│   └── TabSwitcher (CSS | Tailwind)
├── PanelContainer (scrollable)
│   ├── LayoutPanel
│   ├── SpacingPanel
│   ├── PositionPanel
│   ├── TypographyPanel
│   ├── BackgroundsPanel
│   ├── BordersPanel
│   └── EffectsPanel
├── CodePreview (collapsible)
│   ├── CodeEditor (readonly)
│   └── CopyButton
└── InspectorFooter
    ├── UndoButton
    ├── RedoButton
    └── HistoryToggle
```

### State Management
```javascript
// Global inspector state
{
  selectedElement: Element | null,
  activeTab: 'css' | 'tailwind',
  expandedPanels: Set<string>,
  computedStyles: Record<string, string>,
  appliedChanges: ChangeRecord[],
  isTailwindSite: boolean,
  tailwindClasses: string[],
}
```

### Event Flow
```
User selects element (VisBug selection system)
         ↓
PropertyInspector receives 'visbug:select' event
         ↓
Reads computedStyle + inline styles
         ↓
Updates all panel controls to reflect current values
         ↓
User modifies control (e.g., slider)
         ↓
Applies inline style to element
         ↓
ChangeTracker records mutation
         ↓
CodePreview updates generated CSS/Tailwind
```

---

## Component System

### Base Controls (Reusable)

| Control | Description | Props |
|---------|-------------|-------|
| `vb-slider` | Horizontal slider with value display | `min, max, step, value, unit, label` |
| `vb-color-picker` | Color swatch + picker popover | `value, showAlpha, presets` |
| `vb-select` | Styled dropdown | `options, value, label` |
| `vb-toggle-group` | Button group for exclusive options | `options, value, icons` |
| `vb-number-input` | Numeric input with +/- buttons | `value, min, max, step, unit` |
| `vb-box-editor` | Visual margin/padding editor | `values, mode` |
| `vb-collapse` | Collapsible panel wrapper | `title, expanded, icon` |

### Panel Components

| Panel | Primary Controls | CSS Properties |
|-------|------------------|----------------|
| `LayoutPanel` | toggle-group | `display` |
| `SpacingPanel` | box-editor, number-inputs | `margin-*`, `padding-*` |
| `PositionPanel` | select, number-inputs | `position`, `top/right/bottom/left`, `float`, `clear` |
| `TypographyPanel` | select, slider, color-picker, toggle-group | `font-*`, `text-*`, `line-height`, `letter-spacing`, `color` |
| `BackgroundsPanel` | color-picker, text-input | `background-color`, `background-image` |
| `BordersPanel` | number-inputs, select, color-picker | `border-*`, `border-radius` |
| `EffectsPanel` | slider, shadow-editor, filter-editor | `opacity`, `box-shadow`, `filter` |

---

## Implementation Phases

### Phase 0: Foundation (Pre-requisite)
**Goal**: Set up base infrastructure

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 0.1 | Create `/app/features/property-inspector/` directory structure | High | Claude |
| 0.2 | Design CSS variable system for consistent theming | High | Gemini |
| 0.3 | Create base panel component with collapse functionality | High | Claude |
| 0.4 | Create Tailwind detection utility | Medium | Claude |
| 0.5 | Wire up element selection listener | High | Claude |

**Deliverables**:
- Base component classes
- CSS variables file
- Directory structure
- Selection integration

---

### Phase 1: Layout Controls
**Goal**: Display mode toggles with visual icons

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 1.1 | Create `vb-toggle-group` base control | High | Claude |
| 1.2 | Design display mode icons (block, flex, grid, inline, none) | High | Gemini |
| 1.3 | Implement LayoutPanel with display toggle | High | Claude |
| 1.4 | Add Flexbox sub-controls (direction, wrap, justify, align) | Medium | Claude |
| 1.5 | Add Grid sub-controls (columns, rows, gap) | Medium | Claude |

**CSS Properties**:
```css
display, flex-direction, flex-wrap, justify-content, align-items, 
align-content, gap, grid-template-columns, grid-template-rows
```

---

### Phase 2: Spacing Controls
**Goal**: Visual margin/padding box editor

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 2.1 | Create `vb-box-editor` component | High | Gemini |
| 2.2 | Design interactive box model visualization | High | Gemini |
| 2.3 | Implement SpacingPanel with margin/padding modes | High | Claude |
| 2.4 | Add individual side controls (top, right, bottom, left) | High | Claude |
| 2.5 | Support linked/unlinked value editing | Medium | Claude |

**CSS Properties**:
```css
margin, margin-top, margin-right, margin-bottom, margin-left,
padding, padding-top, padding-right, padding-bottom, padding-left
```

---

### Phase 3: Position Controls
**Goal**: Position, float, clear controls

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 3.1 | Create `vb-select` dropdown component | High | Gemini |
| 3.2 | Implement PositionPanel | High | Claude |
| 3.3 | Add position offset inputs (top, right, bottom, left) | High | Claude |
| 3.4 | Add float and clear controls | Medium | Claude |
| 3.5 | Add z-index control | Medium | Claude |

**CSS Properties**:
```css
position, top, right, bottom, left, z-index, float, clear
```

---

### Phase 4: Typography Controls
**Goal**: Comprehensive font controls

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 4.1 | Create `vb-slider` component | High | Gemini |
| 4.2 | Create font family selector with preview | High | Gemini |
| 4.3 | Implement TypographyPanel | High | Claude |
| 4.4 | Add text alignment toggle group | Medium | Claude |
| 4.5 | Add text decoration/transform controls | Medium | Claude |
| 4.6 | Integrate color picker for text color | Medium | Claude |

**CSS Properties**:
```css
font-family, font-size, font-weight, font-style, line-height,
letter-spacing, text-align, text-decoration, text-transform, color
```

---

### Phase 5: Color & Backgrounds
**Goal**: Color pickers and background controls

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 5.1 | Create `vb-color-picker` component | High | Gemini |
| 5.2 | Design color picker popover with formats (HEX, RGB, HSL) | High | Gemini |
| 5.3 | Implement BackgroundsPanel | High | Claude |
| 5.4 | Add gradient builder (stretch goal) | Low | Gemini |
| 5.5 | Add background-size/position controls | Medium | Claude |

**CSS Properties**:
```css
background-color, background-image, background-size, background-position,
background-repeat, background-clip
```

---

### Phase 6: Borders
**Goal**: Border controls with radius editor

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 6.1 | Create `vb-number-input` component | High | Claude |
| 6.2 | Design corner radius visual editor | High | Gemini |
| 6.3 | Implement BordersPanel | High | Claude |
| 6.4 | Add individual corner radius controls | Medium | Claude |
| 6.5 | Add border width/style/color per side | Medium | Claude |

**CSS Properties**:
```css
border-radius, border-top-left-radius, border-top-right-radius,
border-bottom-left-radius, border-bottom-right-radius,
border-width, border-style, border-color
```

---

### Phase 7: Effects
**Goal**: Opacity, shadows, filters

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 7.1 | Implement EffectsPanel with opacity slider | High | Claude |
| 7.2 | Create shadow editor component | Medium | Gemini |
| 7.3 | Add box-shadow controls (x, y, blur, spread, color) | Medium | Claude |
| 7.4 | Add filter controls (blur, brightness, contrast, etc.) | Low | Claude |
| 7.5 | Add transition controls (stretch goal) | Low | Claude |

**CSS Properties**:
```css
opacity, box-shadow, filter, backdrop-filter, transition
```

---

### Phase 8: Code Preview & Export
**Goal**: Live code preview with copy functionality

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 8.1 | Create CodePreview component with syntax highlighting | High | Claude |
| 8.2 | Implement CSS code generation from changes | High | Claude |
| 8.3 | Implement Tailwind class generation | High | Claude |
| 8.4 | Add copy-to-clipboard with AI-friendly format | High | Claude |
| 8.5 | Add code diff view (before/after) | Low | Claude |

---

### Phase 9: Integration & Polish
**Goal**: Full integration, testing, polish

| Task | Description | Priority | Assignee |
|------|-------------|----------|----------|
| 9.1 | Replace changes-toolbar.js with new PropertyInspector | High | Claude |
| 9.2 | Ensure ChangeTracker integration works | High | Claude |
| 9.3 | Test with various websites | High | Both |
| 9.4 | Performance optimization | Medium | Claude |
| 9.5 | Add keyboard shortcuts | Medium | Claude |
| 9.6 | Final UI polish and animations | Medium | Gemini |

---

## Task Assignment

### Claude (Logic/Architecture)
- Component architecture and state management
- CSS property reading/writing logic
- ChangeTracker integration
- Tailwind detection and conversion
- Code generation (CSS/Tailwind output)
- Event handling and data flow
- Build/bundle integration

### Gemini (Design/UI)
- Visual design of controls (sliders, pickers, editors)
- CSS styling and animations
- Icon design for display modes
- Interactive elements (box editor, color picker)
- Visual feedback and micro-interactions
- Theme consistency
- Responsive sidebar behavior

---

## File Structure

```
app/
├── features/
│   ├── property-inspector/
│   │   ├── index.js                    # Main PropertyInspector component
│   │   ├── property-inspector.styles.js # CSS styles
│   │   │
│   │   ├── panels/
│   │   │   ├── layout-panel.js
│   │   │   ├── spacing-panel.js
│   │   │   ├── position-panel.js
│   │   │   ├── typography-panel.js
│   │   │   ├── backgrounds-panel.js
│   │   │   ├── borders-panel.js
│   │   │   └── effects-panel.js
│   │   │
│   │   ├── controls/
│   │   │   ├── vb-slider.js
│   │   │   ├── vb-color-picker.js
│   │   │   ├── vb-select.js
│   │   │   ├── vb-toggle-group.js
│   │   │   ├── vb-number-input.js
│   │   │   ├── vb-box-editor.js
│   │   │   └── vb-collapse.js
│   │   │
│   │   └── utils/
│   │       ├── css-parser.js           # Parse/generate CSS
│   │       ├── tailwind-detector.js    # Detect Tailwind usage
│   │       ├── tailwind-mapper.js      # CSS -> Tailwind class mapping
│   │       └── style-applier.js        # Apply styles to elements
│   │
│   ├── change-tracker.js               # Existing (keep)
│   └── changes-toolbar.js              # DEPRECATED (will be replaced)
│
├── utilities/
│   └── element-identifier.js           # Existing (keep)
│
└── components/
    └── vis-bug/
        └── vis-bug.element.js          # Update to mount PropertyInspector
```

---

## Technical Specifications

### CSS Variables (Theme)
```css
:host {
  /* Colors */
  --vb-bg-primary: #1e1e1e;
  --vb-bg-secondary: #252525;
  --vb-bg-tertiary: #2d2d2d;
  --vb-border: #3d3d3d;
  --vb-text-primary: #e0e0e0;
  --vb-text-secondary: #a0a0a0;
  --vb-accent: #0d99ff;
  --vb-accent-hover: #0077d1;
  --vb-success: #43e97b;
  --vb-warning: #f7b731;
  --vb-error: #fc5c65;
  
  /* Spacing */
  --vb-space-xs: 4px;
  --vb-space-sm: 8px;
  --vb-space-md: 12px;
  --vb-space-lg: 16px;
  --vb-space-xl: 24px;
  
  /* Typography */
  --vb-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --vb-font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', monospace;
  --vb-text-xs: 10px;
  --vb-text-sm: 11px;
  --vb-text-md: 12px;
  --vb-text-lg: 13px;
  
  /* Borders */
  --vb-radius-sm: 4px;
  --vb-radius-md: 6px;
  --vb-radius-lg: 8px;
  
  /* Shadows */
  --vb-shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --vb-shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --vb-shadow-lg: -4px 0 24px rgba(0,0,0,0.4);
  
  /* Transitions */
  --vb-transition-fast: 0.1s ease;
  --vb-transition-normal: 0.2s ease;
  --vb-transition-slow: 0.3s cubic-bezier(0.2, 0, 0.2, 1);
}
```

### Tailwind Detection
```javascript
// tailwind-detector.js
export const detectTailwind = () => {
  // Check for Tailwind's preflight styles
  const testEl = document.createElement('div')
  testEl.className = 'hidden'
  document.body.appendChild(testEl)
  const isHidden = getComputedStyle(testEl).display === 'none'
  document.body.removeChild(testEl)
  
  // Check for Tailwind config
  const hasTailwindConfig = !!document.querySelector('style[data-tailwind]')
  
  // Check for common Tailwind patterns in stylesheets
  const stylesheets = Array.from(document.styleSheets)
  const hasTailwindClasses = stylesheets.some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => 
        rule.selectorText?.match(/^\.(flex|grid|p-\d|m-\d|text-|bg-)/)
      )
    } catch { return false }
  })
  
  return isHidden || hasTailwindConfig || hasTailwindClasses
}
```

### CSS-to-Tailwind Mapping (Sample)
```javascript
// tailwind-mapper.js
const cssToTailwind = {
  'display': {
    'flex': 'flex',
    'grid': 'grid',
    'block': 'block',
    'inline': 'inline',
    'inline-block': 'inline-block',
    'none': 'hidden',
  },
  'padding': (value) => {
    const px = parseInt(value)
    const scale = { 0: '0', 4: '1', 8: '2', 12: '3', 16: '4', 20: '5', 24: '6' }
    return scale[px] ? `p-${scale[px]}` : `p-[${value}]`
  },
  // ... more mappings
}
```

### Selection Integration
```javascript
// In PropertyInspector
connectedCallback() {
  // Listen for VisBug's selection events
  window.addEventListener('visbug:select', this.onElementSelect.bind(this))
  window.addEventListener('visbug:deselect', this.onElementDeselect.bind(this))
}

onElementSelect(event) {
  const elements = event.detail.elements
  if (elements.length === 1) {
    this.inspectElement(elements[0])
  } else if (elements.length > 1) {
    this.inspectMultiple(elements)
  }
}
```

---

## Success Criteria

### MVP (Minimum Viable Product)
- [ ] Sidebar shows selected element's properties
- [ ] Layout panel with display toggle works
- [ ] Spacing panel with visual box editor works
- [ ] Typography panel with basic controls works
- [ ] Changes reflect immediately on element
- [ ] Copy button generates AI-friendly CSS output
- [ ] Undo/Redo works

### Full Release
- [ ] All 7 panels implemented
- [ ] CSS/Tailwind tab switching
- [ ] Tailwind detection and class generation
- [ ] Code preview with syntax highlighting
- [ ] Keyboard shortcuts
- [ ] Performance optimized (60fps interactions)
- [ ] Works on major websites (tested)

---

## Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Foundation | 2-3 hours | 3 hours |
| Phase 1: Layout | 2-3 hours | 6 hours |
| Phase 2: Spacing | 3-4 hours | 10 hours |
| Phase 3: Position | 2 hours | 12 hours |
| Phase 4: Typography | 3-4 hours | 16 hours |
| Phase 5: Backgrounds | 2-3 hours | 19 hours |
| Phase 6: Borders | 2-3 hours | 22 hours |
| Phase 7: Effects | 2-3 hours | 25 hours |
| Phase 8: Code Preview | 3-4 hours | 29 hours |
| Phase 9: Polish | 3-4 hours | 33 hours |

**Total Estimate: ~30-35 hours of development**

---

## Notes

### Integration Points
1. **VisBug Selection System**: Must not interfere. Use existing events.
2. **ChangeTracker**: All changes go through it for undo/redo.
3. **Shadow DOM**: Inspector appended to `document.body`, not Shadow DOM.
4. **Build System**: Updates to `app/index.js` and bundle scripts.

### Performance Considerations
- Debounce style reads during rapid changes
- Use `requestAnimationFrame` for visual updates
- Lazy-load panels not in view
- Cache computed styles until element changes

### Accessibility
- All controls keyboard accessible
- Proper ARIA labels
- Focus management in popovers
- High contrast mode support

---

*Last Updated: February 2026*
*Version: 1.0*
