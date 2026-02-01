
const ReactGrab = window.__REACT_GRAB_MODULE__

const elementStates = new WeakMap()
const trackedElements = new Map()

const IMPORTANT_STYLES = new Set([
  "color", "backgroundColor", "background", "fontSize", "fontWeight", "fontFamily",
  "fontStyle", "textAlign", "textDecoration", "lineHeight", "letterSpacing",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "border", "borderWidth", "borderColor", "borderStyle", "borderRadius",
  "boxShadow", "width", "height", "maxWidth", "maxHeight", "minWidth", "minHeight",
  "display", "flex", "flexDirection", "justifyContent", "alignItems", "gap",
  "opacity", "visibility", "overflow", "position", "top", "right", "bottom", "left",
  "zIndex", "transform", "cursor",
])

const getStyles = (element) => {
  const styles = {}
  if (!(element instanceof HTMLElement)) return styles

  const computedStyle = window.getComputedStyle(element)
  for (const prop of IMPORTANT_STYLES) {
    const value = computedStyle.getPropertyValue(prop)
    if (value && value !== "" && value !== "0px" && value !== "none") {
      styles[prop] = value
    }
  }

  const inlineStyle = element.getAttribute("style")
  if (inlineStyle) {
    inlineStyle.split(";").forEach((rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim())
      if (prop && value && IMPORTANT_STYLES.has(prop)) {
        styles[prop] = value
      }
    })
  }

  return styles
}

const getAttributes = (element) => {
  const attrs = {}
  for (const attr of element.attributes) {
    if (attr.name.startsWith("data-") || attr.name.startsWith("aria-")) {
      attrs[attr.name] = attr.value
    }
  }
  return attrs
}

export const captureElementState = (element) => {
  const state = {
    element,
    outerHTML: element.outerHTML,
    innerHTML: element.innerHTML,
    textContent: element.textContent || "",
    styles: getStyles(element),
    attributes: getAttributes(element),
    timestamp: Date.now(),
  }
  elementStates.set(element, state)
  return state
}

const generateElementId = (element) => {
  const tagName = element.tagName.toLowerCase()
  const id = element.id ? `#${element.id}` : ""
  const classes = element.className ? `.${element.className.split(" ").slice(0, 3).join(".")}` : ""
  return `${tagName}${id}${classes}`
}

export const trackElement = (element, sourceInfo = null) => {
  const id = generateElementId(element)
  const existing = trackedElements.get(id)

  if (existing) {
    return existing
  }

  const state = captureElementState(element)
  const tracked = {
    element,
    state,
    changes: [],
    sourceInfo: sourceInfo || { filePath: null, lineNumber: null, componentName: null },
  }
  trackedElements.set(id, tracked)
  return tracked
}

export const getTrackedElement = (element) => {
  const id = generateElementId(element)
  return trackedElements.get(id)
}

export const compareStyles = (oldStyles, newStyles) => {
  const changes = []
  const allProps = new Set([...Object.keys(oldStyles), ...Object.keys(newStyles)])

  for (const prop of allProps) {
    const oldValue = oldStyles[prop] || null
    const newValue = newStyles[prop] || null

    if (oldValue !== newValue) {
      changes.push({ property: prop, oldValue, newValue })
    }
  }

  return changes
}

export const compareAttributes = (oldAttrs, newAttrs) => {
  const changes = []
  const allAttrs = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)])

  for (const name of allAttrs) {
    const oldValue = oldAttrs[name] || null
    const newValue = newAttrs[name] || null

    if (oldValue !== newValue) {
      changes.push({ name, oldValue, newValue })
    }
  }

  return changes
}

export const detectChanges = (element) => {
  const tracked = getTrackedElement(element)
  if (!tracked) return []

  const newState = captureElementState(element)
  const changes = []

  if (tracked.state.textContent !== newState.textContent) {
    changes.push({
      type: "text",
      oldValue: tracked.state.textContent,
      newValue: newState.textContent,
    })
  }

  const styleChanges = compareStyles(tracked.state.styles, newState.styles)
  for (const change of styleChanges) {
    changes.push({
      type: "style",
      oldValue: change.oldValue || "",
      newValue: change.newValue || "",
      details: change,
    })
  }

  const attrChanges = compareAttributes(tracked.state.attributes, newState.attributes)
  for (const change of attrChanges) {
    changes.push({
      type: "attribute",
      oldValue: change.oldValue || "",
      newValue: change.newValue || "",
      details: change,
    })
  }
  
  tracked.changes = changes
  return changes
}

export const getAllTrackedElements = () => {
  return Array.from(trackedElements.values())
}

export const clearTrackedElements = () => {
  trackedElements.clear()
}

const formatChange = (change) => {
  switch (change.type) {
    case "style":
      const styleChange = change.details
      if (styleChange) {
        return `  • ${styleChange.property}: ${styleChange.oldValue || "unset"} → ${styleChange.newValue || "unset"}`
      }
      return `  • style: ${change.oldValue} → ${change.newValue}`

    case "attribute":
      const attrChange = change.details
      if (attrChange) {
        return `  • @${attrChange.name}: ${attrChange.oldValue || "unset"} → ${attrChange.newValue || "unset"}`
      }
      return `  • attribute: ${change.oldValue} → ${change.newValue}`

    case "text":
      return `  • text: "${change.oldValue.slice(0, 50)}${change.oldValue.length > 50 ? "..." : ""}" → "${change.newValue.slice(0, 50)}${change.newValue.length > 50 ? "..." : ""}"`

    case "html":
      return `  • html structure changed`

    default:
      return `  • ${change.oldValue} → ${change.newValue}`
  }
}

export const buildMultipleDiffOutput = async (trackedElementsList) => {
  if (trackedElementsList.length === 0) {
    return "# No visual changes tracked\n\nStart editing elements to track their changes."
  }

  const sections = trackedElementsList.map((diff, index) => {
    detectChanges(diff.element)
    
    const header = diff.sourceInfo?.filePath
      ? `### Element ${index + 1}: ${diff.sourceInfo.componentName || "Unknown"} at ${diff.sourceInfo.filePath}${diff.sourceInfo.lineNumber ? `:${diff.sourceInfo.lineNumber}` : ""}`
      : `### Element ${index + 1}`

    const changeCount = diff.changes.length
    const summary = changeCount > 0
      ? `${changeCount} change${changeCount > 1 ? "s" : ""}`
      : "no tracked changes"

    const changesSection = diff.changes.length > 0
      ? diff.changes.map(formatChange).join("\n")
      : "  (changes will appear here after editing)"

    return `${header}

**${summary}**

#### Changes
${changesSection}

#### HTML
\`\`\`html
${diff.element.outerHTML}
\`\`\`
`
  })

  return `# Visual Changes Report

Generated: ${new Date().toISOString()}

${sections.join("\n---\n\n")}

---
*Tracked with VisBug*
`
}

export const copyDiffToClipboard = async (trackedElementsList) => {
  const diffOutput = await buildMultipleDiffOutput(trackedElementsList)
  try {
    await navigator.clipboard.writeText(diffOutput)
    return true
  } catch {
    return false
  }
}

export default function VisBugCopy(selectorEngine) {
  let isTracking = false
  
  const track = (element) => {
    trackElement(element, {
      filePath: null,
      lineNumber: null,
      componentName: null,
    })
    
    const label = selectorEngine.createLabel(element)
    label.update('Tracked', 'rect')
  }

  const copyChanges = async () => {
    const tracked = getAllTrackedElements()
    tracked.forEach(t => detectChanges(t.element))
    
    const success = await copyDiffToClipboard(tracked)
    if (success) {
      console.log('VisBug: Changes copied to clipboard')
    }
  }

  const onKeydown = (e) => {
    if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
      const selected = selectorEngine.selection()
      if (selected.length) {
        selected.forEach(track)
      }
    }
    if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
      copyChanges()
    }
    if (e.key === 'x' && !e.metaKey && !e.ctrlKey) {
        clearTrackedElements()
        console.log('VisBug: Tracked elements cleared')
    }
  }

  window.addEventListener('keydown', onKeydown)

  return () => {
    window.removeEventListener('keydown', onKeydown)
  }
}
