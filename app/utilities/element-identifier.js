export const getReactGrabSource = async (element) => {
  try {
    const ReactGrab = window.__REACT_GRAB__ || window.__REACT_GRAB_MODULE__
    if (!ReactGrab) return null

    if (typeof ReactGrab.getSource === 'function') {
      const source = await ReactGrab.getSource(element)
      if (source && source.filePath) {
        return {
          filePath: source.filePath,
          lineNumber: source.lineNumber || null,
          columnNumber: source.columnNumber || null,
          componentName: source.componentName || source.displayName || null,
        }
      }
    }

    const sourceAttr = element.getAttribute('data-source') || 
                       element.closest('[data-source]')?.getAttribute('data-source')
    if (sourceAttr) {
      try {
        return JSON.parse(sourceAttr)
      } catch {}
    }

    return null
  } catch (e) {
    return null
  }
}

export const getCSSSelector = (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return null

  const path = []
  let current = element

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector = `#${CSS.escape(current.id)}`
      path.unshift(selector)
      break
    }

    if (current.classList.length > 0) {
      const classes = Array.from(current.classList)
        .filter(c => !c.startsWith('visbug') && !c.startsWith('__'))
        .slice(0, 3)
        .map(c => `.${CSS.escape(c)}`)
        .join('')
      if (classes) {
        selector += classes
      }
    }

    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-of-type(${index})`
      }
    }

    path.unshift(selector)
    current = current.parentElement

    if (current && current.tagName === 'BODY') {
      path.unshift('body')
      break
    }
  }

  const fullSelector = path.join(' > ')
  
  try {
    const matches = document.querySelectorAll(fullSelector)
    if (matches.length === 1) {
      return fullSelector
    }
    return getOptimizedSelector(element)
  } catch {
    return fullSelector
  }
}

const getOptimizedSelector = (element) => {
  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  if (element.classList.length > 0) {
    for (let i = 1; i <= element.classList.length; i++) {
      const classes = Array.from(element.classList).slice(0, i)
      const selector = element.tagName.toLowerCase() + classes.map(c => `.${CSS.escape(c)}`).join('')
      try {
        if (document.querySelectorAll(selector).length === 1) {
          return selector
        }
      } catch {}
    }
  }

  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-') && attr.value) {
      const selector = `${element.tagName.toLowerCase()}[${attr.name}="${CSS.escape(attr.value)}"]`
      try {
        if (document.querySelectorAll(selector).length === 1) {
          return selector
        }
      } catch {}
    }
  }

  return getCSSSelector(element)
}

export const getXPath = (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return null

  const parts = []
  let current = element

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let part = current.tagName.toLowerCase()

    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        part += `[${index}]`
      }
    }

    parts.unshift(part)
    current = current.parentElement

    if (!current || current.tagName === 'HTML') {
      parts.unshift('html')
      break
    }
  }

  return '/' + parts.join('/')
}

export const getElementLabel = (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return 'unknown'

  let label = element.tagName.toLowerCase()
  
  if (element.id) {
    label += `#${element.id}`
  }
  
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList)
      .filter(c => !c.startsWith('visbug') && !c.startsWith('__'))
      .slice(0, 2)
    if (classes.length > 0) {
      label += '.' + classes.join('.')
    }
  }

  return label
}

export const getElementLabelWithReact = async (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return { label: 'unknown', componentName: null, filePath: null }
  }

  const htmlLabel = getElementLabel(element)
  const source = await getReactGrabSource(element)

  if (source && source.componentName) {
    const lineInfo = source.lineNumber ? `:${source.lineNumber}` : ''
    const columnInfo = source.columnNumber ? `:${source.columnNumber}` : ''
    
    return {
      label: source.componentName,
      htmlLabel,
      componentName: source.componentName,
      filePath: source.filePath ? `${source.filePath}${lineInfo}${columnInfo}` : null,
    }
  }

  return {
    label: htmlLabel,
    htmlLabel,
    componentName: null,
    filePath: null,
  }
}

export const identifyElement = async (element) => {
  const [reactGrabSource, cssSelector, xpath] = await Promise.all([
    getReactGrabSource(element),
    Promise.resolve(getCSSSelector(element)),
    Promise.resolve(getXPath(element)),
  ])

  return {
    source: reactGrabSource,
    cssSelector,
    xpath,
    label: getElementLabel(element),
    tagName: element.tagName.toLowerCase(),
  }
}

export const getViewportInfo = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  
  let breakpoint = 'desktop'
  if (width < 640) breakpoint = 'mobile'
  else if (width < 768) breakpoint = 'mobile-landscape'
  else if (width < 1024) breakpoint = 'tablet'
  else if (width < 1280) breakpoint = 'laptop'
  
  return {
    width,
    height,
    breakpoint,
    devicePixelRatio: window.devicePixelRatio || 1,
  }
}

export default {
  getReactGrabSource,
  getCSSSelector,
  getXPath,
  getElementLabel,
  getElementLabelWithReact,
  identifyElement,
  getViewportInfo,
}
