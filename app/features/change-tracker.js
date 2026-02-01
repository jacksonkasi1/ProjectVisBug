import $ from 'blingblingjs'
import hotkeys from 'hotkeys-js'
import { identifyElement, getViewportInfo, getCSSSelector, getXPath, getElementLabel } from '../utilities/element-identifier'
import { isOffBounds } from '../utilities/common'

const history = []
let historyIndex = -1
const MAX_HISTORY = 50

const observers = new Map()
const originalStates = new WeakMap()
const elementIdentifiers = new WeakMap()

const IMPORTANT_STYLES = new Set([
  "color", "backgroundColor", "background", "fontSize", "fontWeight", "fontFamily",
  "fontStyle", "textAlign", "textDecoration", "lineHeight", "letterSpacing",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "border", "borderWidth", "borderColor", "borderStyle", "borderRadius",
  "boxShadow", "width", "height", "maxWidth", "maxHeight", "minWidth", "minHeight",
  "display", "flex", "flexDirection", "justifyContent", "alignItems", "gap",
  "opacity", "visibility", "overflow", "position", "top", "right", "bottom", "left",
  "zIndex", "transform", "cursor", "fill", "stroke"
])

const captureState = (element) => {
  const styles = {}
  const computed = window.getComputedStyle(element)
  
  for (const prop of IMPORTANT_STYLES) {
    styles[prop] = computed.getPropertyValue(prop)
  }

  const inlineStyle = element.getAttribute("style")
  const inlineStyles = {}
  if (inlineStyle) {
    inlineStyle.split(";").forEach((rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim())
      if (prop && value) {
        inlineStyles[prop] = value
      }
    })
  }

  return {
    styles,
    inlineStyles,
    attributes: Array.from(element.attributes).reduce((acc, attr) => {
      acc[attr.name] = attr.value
      return acc
    }, {}),
    innerHTML: element.innerHTML,
    textContent: element.textContent
  }
}

const cacheElementIdentifier = async (element) => {
  if (!elementIdentifiers.has(element)) {
    const identifier = await identifyElement(element)
    elementIdentifiers.set(element, identifier)
  }
  return elementIdentifiers.get(element)
}

const pushHistory = async (record) => {
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1)
  }
  
  await cacheElementIdentifier(record.element)
  
  history.push({
    ...record,
    viewport: getViewportInfo()
  })
  historyIndex++
  
  if (history.length > MAX_HISTORY) {
    history.shift()
    historyIndex--
  }

  notifyChange()
}

const handleMutation = (mutationsList) => {
  for (const mutation of mutationsList) {
    const { target, type, attributeName, oldValue } = mutation

    if (type === 'attributes' && attributeName === 'style') {
      const newStyle = target.getAttribute('style')
      if (oldValue === newStyle) continue

      pushHistory({
        type: 'style',
        element: target,
        attributeName: 'style',
        oldValue: oldValue,
        newValue: newStyle,
        timestamp: Date.now()
      })
    }
    else if (type === 'attributes' && attributeName !== 'style' && !attributeName.startsWith('data-')) {
       pushHistory({
        type: 'attribute',
        element: target,
        attributeName: attributeName,
        oldValue: oldValue,
        newValue: target.getAttribute(attributeName),
        timestamp: Date.now()
      })
    }
    else if (type === 'characterData' || type === 'childList') {
       if (target.nodeName === '#text' && target.parentElement) {
          pushHistory({
            type: 'text',
            element: target.parentElement,
            oldValue: oldValue,
            newValue: target.textContent,
            timestamp: Date.now()
          })
       }
    }
  }
}

export const observe = (elements) => {
  if (!Array.isArray(elements)) elements = [elements]

  elements.forEach(el => {
    if (observers.has(el)) return
    if (isOffBounds(el)) return

    if (!originalStates.has(el)) {
      originalStates.set(el, captureState(el))
    }
    
    cacheElementIdentifier(el)

    const observer = new MutationObserver(handleMutation)
    observer.observe(el, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: false,
      subtree: true
    })
    
    observers.set(el, observer)
  })
}

export const unobserve = (elements) => {
  if (!Array.isArray(elements)) elements = [elements]

  elements.forEach(el => {
    const observer = observers.get(el)
    if (observer) {
      observer.disconnect()
      observers.delete(el)
    }
  })
}

export const undo = () => {
  if (historyIndex < 0) return null

  const record = history[historyIndex]
  const { element, type, attributeName, oldValue } = record

  const observer = observers.get(element)
  if (observer) observer.disconnect()

  try {
    if (type === 'style' || type === 'attribute') {
      if (oldValue === null) {
        element.removeAttribute(attributeName)
      } else {
        element.setAttribute(attributeName, oldValue)
      }
    } else if (type === 'text') {
       if (oldValue) element.textContent = oldValue
    }
  } catch (e) {
    console.error('Undo failed', e)
  }

  if (observer) {
    observer.observe(element, {
      attributes: true, attributeOldValue: true,
      characterData: true, characterDataOldValue: true,
      subtree: true
    })
  }

  historyIndex--
  notifyChange()
  
  if (isOffBounds(element)) return null
  return element
}

export const redo = () => {
  if (historyIndex >= history.length - 1) return null

  historyIndex++
  const record = history[historyIndex]
  const { element, type, attributeName, newValue } = record

  const observer = observers.get(element)
  if (observer) observer.disconnect()

  try {
    if (type === 'style' || type === 'attribute') {
      if (newValue === null) {
        element.removeAttribute(attributeName)
      } else {
        element.setAttribute(attributeName, newValue)
      }
    } else if (type === 'text') {
      if (newValue) element.textContent = newValue
    }
  } catch (e) {
    console.error('Redo failed', e)
  }

  if (observer) {
     observer.observe(element, {
      attributes: true, attributeOldValue: true,
      characterData: true, characterDataOldValue: true,
      subtree: true
    })
  }
  
  notifyChange()
  
  if (isOffBounds(element)) return null
  return element
}

const parseStyleString = (styleStr) => {
  if (!styleStr) return {}
  const styles = {}
  styleStr.split(';').forEach(rule => {
    const [prop, value] = rule.split(':').map(s => s.trim())
    if (prop && value) {
      styles[prop] = value
    }
  })
  return styles
}

const formatStyleChanges = (oldStyle, newStyle) => {
  const oldStyles = parseStyleString(oldStyle)
  const newStyles = parseStyleString(newStyle)
  const allProps = new Set([...Object.keys(oldStyles), ...Object.keys(newStyles)])
  
  const changes = []
  for (const prop of allProps) {
    const oldVal = oldStyles[prop]
    const newVal = newStyles[prop]
    if (oldVal !== newVal) {
      changes.push({ property: prop, from: oldVal || 'unset', to: newVal || 'unset' })
    }
  }
  return changes
}

export const getChanges = async () => {
  const changesByElement = new Map()
  const viewport = getViewportInfo()

  for (let idx = 0; idx <= historyIndex; idx++) {
    const record = history[idx]
    if (!changesByElement.has(record.element)) {
      changesByElement.set(record.element, [])
    }
    changesByElement.get(record.element).push(record)
  }

  const elements = []
  
  for (const [element, records] of changesByElement) {
    const identifier = elementIdentifiers.get(element) || {
      source: null,
      cssSelector: getCSSSelector(element),
      xpath: getXPath(element),
      label: getElementLabel(element),
      tagName: element.tagName.toLowerCase()
    }
    
    const styleChanges = []
    const textChanges = []
    const attrChanges = []
    
    for (const record of records) {
      if (record.type === 'style') {
        const parsed = formatStyleChanges(record.oldValue, record.newValue)
        styleChanges.push(...parsed)
      } else if (record.type === 'text') {
        textChanges.push({ from: record.oldValue, to: record.newValue })
      } else if (record.type === 'attribute') {
        attrChanges.push({ 
          attribute: record.attributeName, 
          from: record.oldValue, 
          to: record.newValue 
        })
      }
    }
    
    const finalStyle = element.getAttribute('style')
    
    elements.push({
      identifier,
      changes: {
        styles: styleChanges,
        text: textChanges,
        attributes: attrChanges
      },
      finalStyle,
      finalHTML: element.outerHTML
    })
  }

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    viewport,
    elements
  }
}

export const getChangesAsText = async () => {
  const data = await getChanges()
  
  if (data.elements.length === 0) {
    return '# No Changes Tracked\n\nSelect elements and make changes to track them.'
  }

  let output = `# VisBug Visual Changes\n\n`
  output += `**Viewport:** ${data.viewport.width}x${data.viewport.height} (${data.viewport.breakpoint})\n`
  output += `**Generated:** ${data.timestamp}\n\n`
  output += `---\n\n`

  for (let i = 0; i < data.elements.length; i++) {
    const el = data.elements[i]
    const id = el.identifier
    
    output += `## Element ${i + 1}: \`${id.label}\`\n\n`
    
    output += `### Location\n\n`
    
    if (id.source && id.source.filePath) {
      output += `**React Component:** \`${id.source.componentName || 'Unknown'}\`\n`
      output += `**File:** \`${id.source.filePath}${id.source.lineNumber ? `:${id.source.lineNumber}` : ''}\`\n`
    }
    
    output += `**CSS Selector:** \`${id.cssSelector}\`\n`
    output += `**XPath:** \`${id.xpath}\`\n\n`
    
    if (el.changes.styles.length > 0) {
      output += `### Style Changes\n\n`
      output += `| Property | From | To |\n`
      output += `|----------|------|----|\n`
      for (const change of el.changes.styles) {
        output += `| \`${change.property}\` | \`${change.from}\` | \`${change.to}\` |\n`
      }
      output += `\n`
    }
    
    if (el.changes.text.length > 0) {
      output += `### Text Changes\n\n`
      for (const change of el.changes.text) {
        output += `- From: "${change.from?.slice(0, 100)}${change.from?.length > 100 ? '...' : ''}"\n`
        output += `- To: "${change.to?.slice(0, 100)}${change.to?.length > 100 ? '...' : ''}"\n\n`
      }
    }
    
    if (el.changes.attributes.length > 0) {
      output += `### Attribute Changes\n\n`
      for (const change of el.changes.attributes) {
        output += `- \`${change.attribute}\`: \`${change.from || 'unset'}\` → \`${change.to || 'unset'}\`\n`
      }
      output += `\n`
    }
    
    if (el.finalStyle) {
      output += `### Final Inline Style\n\n`
      output += `\`\`\`css\n${el.finalStyle}\n\`\`\`\n\n`
    }
    
    output += `### Final HTML\n\n`
    output += `\`\`\`html\n${el.finalHTML}\n\`\`\`\n\n`
    
    output += `---\n\n`
  }

  output += `*Copy this to your AI coding assistant to apply these visual changes to your codebase.*\n`

  return output
}

export const getChangesAsJSON = async () => {
  const data = await getChanges()
  return JSON.stringify(data, null, 2)
}

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent('visbug:history-update', {
    detail: {
      canUndo: historyIndex >= 0,
      canRedo: historyIndex < history.length - 1,
      count: historyIndex + 1
    }
  }))
}

export const getHistory = () => {
  return history.slice(0, historyIndex + 1).map(record => ({
    ...record,
    elementLabel: getElementLabel(record.element)
  }))
}

export const ChangeTracker = {
  observe,
  unobserve,
  undo,
  redo,
  getChanges,
  getChangesAsText,
  getChangesAsJSON,
  getHistory
}
