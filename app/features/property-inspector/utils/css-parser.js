export const CSS_CATEGORIES = {
  layout: [
    'display',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'align-content',
    'gap',
    'row-gap',
    'column-gap',
    'grid-template-columns',
    'grid-template-rows',
    'grid-auto-flow',
  ],
  spacing: [
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
  ],
  position: [
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'z-index',
    'float',
    'clear',
  ],
  sizing: [
    'width',
    'height',
    'min-width',
    'min-height',
    'max-width',
    'max-height',
    'box-sizing',
  ],
  typography: [
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'line-height',
    'letter-spacing',
    'text-align',
    'text-decoration',
    'text-transform',
    'color',
    'white-space',
    'word-break',
    'overflow-wrap',
  ],
  backgrounds: [
    'background-color',
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-clip',
    'background-origin',
  ],
  borders: [
    'border-width',
    'border-style',
    'border-color',
    'border-radius',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
  effects: [
    'opacity',
    'box-shadow',
    'filter',
    'backdrop-filter',
    'mix-blend-mode',
    'transform',
    'transition',
  ],
  overflow: [
    'overflow',
    'overflow-x',
    'overflow-y',
  ],
}

export const ALL_PROPERTIES = Object.values(CSS_CATEGORIES).flat()

const DEFAULT_VALUES = {
  'display': 'block',
  'position': 'static',
  'float': 'none',
  'clear': 'none',
  'top': 'auto',
  'right': 'auto',
  'bottom': 'auto',
  'left': 'auto',
  'z-index': 'auto',
  'margin': '0px',
  'margin-top': '0px',
  'margin-right': '0px',
  'margin-bottom': '0px',
  'margin-left': '0px',
  'padding': '0px',
  'padding-top': '0px',
  'padding-right': '0px',
  'padding-bottom': '0px',
  'padding-left': '0px',
  'width': 'auto',
  'height': 'auto',
  'min-width': 'auto',
  'min-height': 'auto',
  'max-width': 'none',
  'max-height': 'none',
  'border-width': '0px',
  'border-style': 'none',
  'border-radius': '0px',
  'opacity': '1',
  'transform': 'none',
  'filter': 'none',
  'box-shadow': 'none',
  'background-image': 'none',
  'background-color': 'rgba(0, 0, 0, 0)',
  'transition': 'none',
  'flex-direction': 'row',
  'flex-wrap': 'nowrap',
  'justify-content': 'normal',
  'align-items': 'normal',
  'gap': 'normal',
  'text-decoration': 'none',
  'text-transform': 'none',
  'font-style': 'normal',
}

export const getComputedStyles = (element, properties = ALL_PROPERTIES) => {
  const computed = window.getComputedStyle(element)
  const styles = {}
  
  for (const prop of properties) {
    styles[prop] = computed.getPropertyValue(prop)
  }
  
  return styles
}

export const getInlineStyles = (element) => {
  const styleAttr = element.getAttribute('style')
  if (!styleAttr) return {}
  
  const styles = {}
  styleAttr.split(';').forEach(rule => {
    const [prop, value] = rule.split(':').map(s => s.trim())
    if (prop && value) {
      styles[prop] = value
    }
  })
  
  return styles
}

export const getStylesByCategory = (element) => {
  const computed = window.getComputedStyle(element)
  const result = {}
  
  for (const [category, properties] of Object.entries(CSS_CATEGORIES)) {
    result[category] = {}
    for (const prop of properties) {
      result[category][prop] = computed.getPropertyValue(prop)
    }
  }
  
  return result
}

export const isNonDefault = (property, value) => {
  const defaultVal = DEFAULT_VALUES[property]
  if (!defaultVal) return true
  
  const normalizeValue = (v) => {
    if (!v) return ''
    return v.replace(/\s+/g, ' ').trim().toLowerCase()
  }
  
  return normalizeValue(value) !== normalizeValue(defaultVal)
}

export const parseSpacing = (element, type = 'margin') => {
  const computed = window.getComputedStyle(element)
  
  return {
    top: computed.getPropertyValue(`${type}-top`),
    right: computed.getPropertyValue(`${type}-right`),
    bottom: computed.getPropertyValue(`${type}-bottom`),
    left: computed.getPropertyValue(`${type}-left`),
  }
}

export const parseBorderRadius = (element) => {
  const computed = window.getComputedStyle(element)
  
  return {
    topLeft: computed.getPropertyValue('border-top-left-radius'),
    topRight: computed.getPropertyValue('border-top-right-radius'),
    bottomRight: computed.getPropertyValue('border-bottom-right-radius'),
    bottomLeft: computed.getPropertyValue('border-bottom-left-radius'),
  }
}

export const parseBoxShadow = (value) => {
  if (!value || value === 'none') return []
  
  const shadows = []
  const shadowRegex = /(?:inset\s+)?(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem)?)?\s*(-?\d+(?:\.\d+)?(?:px|em|rem)?)?\s*((?:rgba?|hsla?|#)[^,)]+(?:\))?)?/gi
  
  let match
  while ((match = shadowRegex.exec(value)) !== null) {
    shadows.push({
      inset: value.includes('inset'),
      offsetX: match[1] || '0px',
      offsetY: match[2] || '0px',
      blur: match[3] || '0px',
      spread: match[4] || '0px',
      color: match[5] || 'rgba(0,0,0,0.25)',
    })
  }
  
  return shadows
}

export const rgbToHex = (rgb) => {
  if (!rgb) return null
  if (rgb.startsWith('#')) return rgb
  
  const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/)
  if (!match) return rgb
  
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  const a = match[4] ? parseFloat(match[4]) : 1
  
  const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  
  if (a < 1) {
    return `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`
  }
  
  return hex
}

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)
  if (!result) return null
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  const a = result[4] ? parseInt(result[4], 16) / 255 : 1
  
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
  }
  
  return `rgb(${r}, ${g}, ${b})`
}

export const generateCSS = (selector, styles, options = {}) => {
  const { 
    includeDefaults = false,
    indent = '  ',
    minify = false 
  } = options
  
  const filteredStyles = includeDefaults 
    ? styles 
    : Object.entries(styles).filter(([prop, value]) => isNonDefault(prop, value))
  
  if (filteredStyles.length === 0) {
    return minify ? `${selector}{}` : `${selector} {\n}`
  }
  
  if (minify) {
    const rules = filteredStyles.map(([prop, value]) => `${prop}:${value}`).join(';')
    return `${selector}{${rules}}`
  }
  
  let css = `${selector} {\n`
  for (const [prop, value] of (Array.isArray(filteredStyles) ? filteredStyles : Object.entries(filteredStyles))) {
    css += `${indent}${prop}: ${value};\n`
  }
  css += '}'
  
  return css
}

export const generateInlineStyle = (styles) => {
  return Object.entries(styles)
    .filter(([prop, value]) => value !== null && value !== undefined && value !== '')
    .map(([prop, value]) => `${prop}: ${value}`)
    .join('; ')
}

export const diffStyles = (oldStyles, newStyles) => {
  const changes = {
    added: {},
    removed: {},
    changed: {},
  }
  
  for (const [prop, value] of Object.entries(newStyles)) {
    if (!(prop in oldStyles)) {
      changes.added[prop] = value
    } else if (oldStyles[prop] !== value) {
      changes.changed[prop] = { from: oldStyles[prop], to: value }
    }
  }
  
  for (const [prop, value] of Object.entries(oldStyles)) {
    if (!(prop in newStyles)) {
      changes.removed[prop] = value
    }
  }
  
  return changes
}

export default {
  CSS_CATEGORIES,
  ALL_PROPERTIES,
  getComputedStyles,
  getInlineStyles,
  getStylesByCategory,
  isNonDefault,
  parseSpacing,
  parseBorderRadius,
  parseBoxShadow,
  rgbToHex,
  hexToRgb,
  generateCSS,
  generateInlineStyle,
  diffStyles,
}
