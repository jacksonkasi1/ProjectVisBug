const TAILWIND_SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
}

const PX_TO_TAILWIND = Object.entries(TAILWIND_SPACING).reduce((acc, [key, value]) => {
  const px = parseFloat(value) * 16
  acc[Math.round(px)] = key
  return acc
}, {})

const TAILWIND_FONT_SIZES = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
}

const TAILWIND_FONT_WEIGHTS = {
  100: 'thin',
  200: 'extralight',
  300: 'light',
  400: 'normal',
  500: 'medium',
  600: 'semibold',
  700: 'bold',
  800: 'extrabold',
  900: 'black',
}

const TAILWIND_RADII = {
  0: 'none',
  2: 'sm',
  4: 'DEFAULT',
  6: 'md',
  8: 'lg',
  12: 'xl',
  16: '2xl',
  24: '3xl',
  9999: 'full',
}

const DISPLAY_TO_TAILWIND = {
  'block': 'block',
  'inline-block': 'inline-block',
  'inline': 'inline',
  'flex': 'flex',
  'inline-flex': 'inline-flex',
  'grid': 'grid',
  'inline-grid': 'inline-grid',
  'none': 'hidden',
  'contents': 'contents',
  'flow-root': 'flow-root',
  'list-item': 'list-item',
}

const FLEX_DIRECTION_TO_TAILWIND = {
  'row': 'flex-row',
  'row-reverse': 'flex-row-reverse',
  'column': 'flex-col',
  'column-reverse': 'flex-col-reverse',
}

const JUSTIFY_CONTENT_TO_TAILWIND = {
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  'center': 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
  'stretch': 'justify-stretch',
}

const ALIGN_ITEMS_TO_TAILWIND = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  'center': 'items-center',
  'baseline': 'items-baseline',
  'stretch': 'items-stretch',
}

const TEXT_ALIGN_TO_TAILWIND = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
  'justify': 'text-justify',
  'start': 'text-start',
  'end': 'text-end',
}

const POSITION_TO_TAILWIND = {
  'static': 'static',
  'fixed': 'fixed',
  'absolute': 'absolute',
  'relative': 'relative',
  'sticky': 'sticky',
}

export const detectTailwind = () => {
  const testEl = document.createElement('div')
  testEl.className = 'hidden'
  testEl.style.position = 'absolute'
  testEl.style.visibility = 'hidden'
  document.body.appendChild(testEl)
  const isHidden = getComputedStyle(testEl).display === 'none'
  document.body.removeChild(testEl)
  
  if (isHidden) return true
  
  if (document.querySelector('script[src*="tailwindcss"]')) return true
  if (document.querySelector('style[type="text/tailwindcss"]')) return true
  
  try {
    const stylesheets = Array.from(document.styleSheets)
    for (const sheet of stylesheets) {
      try {
        const rules = Array.from(sheet.cssRules || [])
        const hasTailwindPatterns = rules.some(rule => {
          if (rule.selectorText) {
            return /^\.(flex|grid|block|inline|hidden|p-\d|m-\d|px-|py-|mx-|my-|text-|bg-|border-|rounded|shadow|w-|h-|min-|max-)/.test(rule.selectorText)
          }
          return false
        })
        if (hasTailwindPatterns) return true
      } catch (e) {
        // CORS blocked
      }
    }
  } catch (e) {}
  
  const sampleElements = document.querySelectorAll('[class*="flex"], [class*="grid"], [class*="p-"], [class*="m-"], [class*="text-"]')
  if (sampleElements.length > 10) return true
  
  return false
}

const parseToPixels = (value) => {
  if (!value || value === 'auto' || value === 'none') return null
  
  const num = parseFloat(value)
  if (isNaN(num)) return null
  
  if (value.endsWith('px')) return num
  if (value.endsWith('rem')) return num * 16
  if (value.endsWith('em')) return num * 16
  if (value.endsWith('%')) return null
  
  return num
}

const findClosestSpacing = (px) => {
  if (px === null || px === undefined) return null
  
  const rounded = Math.round(px)
  
  if (PX_TO_TAILWIND[rounded] !== undefined) {
    return PX_TO_TAILWIND[rounded]
  }
  
  const keys = Object.keys(PX_TO_TAILWIND).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  let minDiff = Math.abs(rounded - closest)
  
  for (const key of keys) {
    const diff = Math.abs(rounded - key)
    if (diff < minDiff) {
      minDiff = diff
      closest = key
    }
  }
  
  if (minDiff > 2) {
    return `[${rounded}px]`
  }
  
  return PX_TO_TAILWIND[closest]
}

export const cssToTailwind = (property, value) => {
  if (!value || value === 'initial' || value === 'inherit' || value === 'unset') {
    return null
  }
  
  const px = parseToPixels(value)
  
  switch (property) {
    case 'display':
      return DISPLAY_TO_TAILWIND[value] || null
    
    case 'flex-direction':
      return FLEX_DIRECTION_TO_TAILWIND[value] || null
    case 'justify-content':
      return JUSTIFY_CONTENT_TO_TAILWIND[value] || null
    case 'align-items':
      return ALIGN_ITEMS_TO_TAILWIND[value] || null
    case 'flex-wrap':
      if (value === 'wrap') return 'flex-wrap'
      if (value === 'wrap-reverse') return 'flex-wrap-reverse'
      if (value === 'nowrap') return 'flex-nowrap'
      return null
    case 'gap':
      const gapVal = findClosestSpacing(px)
      return gapVal ? `gap-${gapVal}` : null
    
    case 'padding':
      const padVal = findClosestSpacing(px)
      return padVal ? `p-${padVal}` : null
    case 'padding-top':
      const ptVal = findClosestSpacing(px)
      return ptVal ? `pt-${ptVal}` : null
    case 'padding-right':
      const prVal = findClosestSpacing(px)
      return prVal ? `pr-${prVal}` : null
    case 'padding-bottom':
      const pbVal = findClosestSpacing(px)
      return pbVal ? `pb-${pbVal}` : null
    case 'padding-left':
      const plVal = findClosestSpacing(px)
      return plVal ? `pl-${plVal}` : null
    case 'margin':
      if (value === 'auto') return 'm-auto'
      const mVal = findClosestSpacing(px)
      return mVal ? `m-${mVal}` : null
    case 'margin-top':
      if (value === 'auto') return 'mt-auto'
      const mtVal = findClosestSpacing(px)
      return mtVal ? `mt-${mtVal}` : null
    case 'margin-right':
      if (value === 'auto') return 'mr-auto'
      const mrVal = findClosestSpacing(px)
      return mrVal ? `mr-${mrVal}` : null
    case 'margin-bottom':
      if (value === 'auto') return 'mb-auto'
      const mbVal = findClosestSpacing(px)
      return mbVal ? `mb-${mbVal}` : null
    case 'margin-left':
      if (value === 'auto') return 'ml-auto'
      const mlVal = findClosestSpacing(px)
      return mlVal ? `ml-${mlVal}` : null
    
    case 'width':
      if (value === 'auto') return 'w-auto'
      if (value === '100%') return 'w-full'
      if (value === '100vw') return 'w-screen'
      if (value === 'fit-content') return 'w-fit'
      if (value === 'min-content') return 'w-min'
      if (value === 'max-content') return 'w-max'
      const wVal = findClosestSpacing(px)
      return wVal ? `w-${wVal}` : (px ? `w-[${px}px]` : null)
    case 'height':
      if (value === 'auto') return 'h-auto'
      if (value === '100%') return 'h-full'
      if (value === '100vh') return 'h-screen'
      if (value === 'fit-content') return 'h-fit'
      if (value === 'min-content') return 'h-min'
      if (value === 'max-content') return 'h-max'
      const hVal = findClosestSpacing(px)
      return hVal ? `h-${hVal}` : (px ? `h-[${px}px]` : null)
    
    case 'font-size':
      for (const [key, val] of Object.entries(TAILWIND_FONT_SIZES)) {
        const valPx = parseFloat(val) * 16
        if (Math.abs(px - valPx) < 1) {
          return `text-${key}`
        }
      }
      return px ? `text-[${px}px]` : null
    case 'font-weight':
      const weight = parseInt(value)
      return TAILWIND_FONT_WEIGHTS[weight] ? `font-${TAILWIND_FONT_WEIGHTS[weight]}` : null
    case 'text-align':
      return TEXT_ALIGN_TO_TAILWIND[value] || null
    case 'line-height':
      if (value === 'normal') return 'leading-normal'
      if (value === '1') return 'leading-none'
      if (value === '1.25') return 'leading-tight'
      if (value === '1.375') return 'leading-snug'
      if (value === '1.5') return 'leading-normal'
      if (value === '1.625') return 'leading-relaxed'
      if (value === '2') return 'leading-loose'
      const lh = parseFloat(value)
      if (!isNaN(lh)) {
        if (lh < 1.3) return 'leading-tight'
        if (lh < 1.6) return 'leading-normal'
        return 'leading-relaxed'
      }
      return null
    case 'letter-spacing':
      if (px === 0) return 'tracking-normal'
      if (px < 0) return 'tracking-tighter'
      if (px < 0.5) return 'tracking-tight'
      if (px < 1) return 'tracking-normal'
      return 'tracking-wide'
    
    case 'position':
      return POSITION_TO_TAILWIND[value] || null
    case 'top':
      if (value === '0px' || value === '0') return 'top-0'
      if (value === 'auto') return 'top-auto'
      const topVal = findClosestSpacing(px)
      return topVal ? `top-${topVal}` : (px ? `top-[${px}px]` : null)
    case 'right':
      if (value === '0px' || value === '0') return 'right-0'
      if (value === 'auto') return 'right-auto'
      const rightVal = findClosestSpacing(px)
      return rightVal ? `right-${rightVal}` : (px ? `right-[${px}px]` : null)
    case 'bottom':
      if (value === '0px' || value === '0') return 'bottom-0'
      if (value === 'auto') return 'bottom-auto'
      const bottomVal = findClosestSpacing(px)
      return bottomVal ? `bottom-${bottomVal}` : (px ? `bottom-[${px}px]` : null)
    case 'left':
      if (value === '0px' || value === '0') return 'left-0'
      if (value === 'auto') return 'left-auto'
      const leftVal = findClosestSpacing(px)
      return leftVal ? `left-${leftVal}` : (px ? `left-[${px}px]` : null)
    case 'z-index':
      const z = parseInt(value)
      if ([0, 10, 20, 30, 40, 50].includes(z)) return `z-${z}`
      if (z === 'auto') return 'z-auto'
      return `z-[${z}]`
    
    case 'border-radius':
      if (value === '0px' || value === '0') return 'rounded-none'
      if (value === '9999px' || value === '50%') return 'rounded-full'
      const radPx = px
      if (radPx <= 2) return 'rounded-sm'
      if (radPx <= 4) return 'rounded'
      if (radPx <= 6) return 'rounded-md'
      if (radPx <= 8) return 'rounded-lg'
      if (radPx <= 12) return 'rounded-xl'
      if (radPx <= 16) return 'rounded-2xl'
      if (radPx <= 24) return 'rounded-3xl'
      return `rounded-[${radPx}px]`
    
    case 'opacity':
      const op = parseFloat(value)
      if (op === 0) return 'opacity-0'
      if (op === 1) return 'opacity-100'
      const opPercent = Math.round(op * 100)
      if ([5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95].includes(opPercent)) {
        return `opacity-${opPercent}`
      }
      return `opacity-[${op}]`
    
    case 'background-color':
    case 'color':
    case 'border-color':
      if (value === 'transparent') {
        return property === 'background-color' ? 'bg-transparent' : 
               property === 'color' ? 'text-transparent' : 'border-transparent'
      }
      if (value === 'currentColor') {
        return property === 'background-color' ? 'bg-current' : 
               property === 'color' ? 'text-current' : 'border-current'
      }
      const prefix = property === 'background-color' ? 'bg' : 
                     property === 'color' ? 'text' : 'border'
      return `${prefix}-[${value}]`
    
    default:
      return null
  }
}

export const stylesToTailwind = (styles) => {
  const classes = []
  
  for (const [property, value] of Object.entries(styles)) {
    const twClass = cssToTailwind(property, value)
    if (twClass) {
      classes.push(twClass)
    }
  }
  
  return classes
}

export const getElementTailwindClasses = (element) => {
  if (!element || !element.classList) return []
  
  const twPattern = /^(flex|grid|block|inline|hidden|p[xytblr]?-|m[xytblr]?-|text-|bg-|border-|rounded|shadow|w-|h-|min-|max-|gap-|space-|font-|leading-|tracking-|opacity-|z-|top-|right-|bottom-|left-|static|fixed|absolute|relative|sticky|overflow-|items-|justify-|self-|place-)/
  
  return Array.from(element.classList).filter(cls => twPattern.test(cls))
}

export default {
  detectTailwind,
  cssToTailwind,
  stylesToTailwind,
  getElementTailwindClasses,
}
