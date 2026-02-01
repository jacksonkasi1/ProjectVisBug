import { ChangeTracker } from '../../change-tracker'

export const applyStyle = (element, property, value) => {
  if (!element || !property) return false
  
  ChangeTracker.observe(element)
  element.style.setProperty(property, value)
  
  return true
}

export const applyStyles = (element, styles) => {
  if (!element || !styles) return false
  
  ChangeTracker.observe(element)
  
  for (const [property, value] of Object.entries(styles)) {
    if (value === null || value === undefined || value === '') {
      element.style.removeProperty(property)
    } else {
      element.style.setProperty(property, value)
    }
  }
  
  return true
}

export const removeStyle = (element, property) => {
  if (!element || !property) return false
  
  ChangeTracker.observe(element)
  element.style.removeProperty(property)
  
  return true
}

export const applyMargin = (element, values) => {
  const { top, right, bottom, left } = values
  const styles = {}
  
  if (top !== undefined) styles['margin-top'] = top
  if (right !== undefined) styles['margin-right'] = right
  if (bottom !== undefined) styles['margin-bottom'] = bottom
  if (left !== undefined) styles['margin-left'] = left
  
  return applyStyles(element, styles)
}

export const applyPadding = (element, values) => {
  const { top, right, bottom, left } = values
  const styles = {}
  
  if (top !== undefined) styles['padding-top'] = top
  if (right !== undefined) styles['padding-right'] = right
  if (bottom !== undefined) styles['padding-bottom'] = bottom
  if (left !== undefined) styles['padding-left'] = left
  
  return applyStyles(element, styles)
}

export const applyBorderRadius = (element, values) => {
  const { topLeft, topRight, bottomRight, bottomLeft, all } = values
  const styles = {}
  
  if (all !== undefined) {
    styles['border-radius'] = all
  } else {
    if (topLeft !== undefined) styles['border-top-left-radius'] = topLeft
    if (topRight !== undefined) styles['border-top-right-radius'] = topRight
    if (bottomRight !== undefined) styles['border-bottom-right-radius'] = bottomRight
    if (bottomLeft !== undefined) styles['border-bottom-left-radius'] = bottomLeft
  }
  
  return applyStyles(element, styles)
}

export const applyPosition = (element, values) => {
  const { position, top, right, bottom, left, zIndex } = values
  const styles = {}
  
  if (position !== undefined) styles['position'] = position
  if (top !== undefined) styles['top'] = top
  if (right !== undefined) styles['right'] = right
  if (bottom !== undefined) styles['bottom'] = bottom
  if (left !== undefined) styles['left'] = left
  if (zIndex !== undefined) styles['z-index'] = zIndex
  
  return applyStyles(element, styles)
}

export const applyTypography = (element, values) => {
  const { 
    fontFamily, 
    fontSize, 
    fontWeight, 
    fontStyle,
    lineHeight, 
    letterSpacing, 
    textAlign,
    textDecoration,
    textTransform,
    color 
  } = values
  
  const styles = {}
  
  if (fontFamily !== undefined) styles['font-family'] = fontFamily
  if (fontSize !== undefined) styles['font-size'] = fontSize
  if (fontWeight !== undefined) styles['font-weight'] = fontWeight
  if (fontStyle !== undefined) styles['font-style'] = fontStyle
  if (lineHeight !== undefined) styles['line-height'] = lineHeight
  if (letterSpacing !== undefined) styles['letter-spacing'] = letterSpacing
  if (textAlign !== undefined) styles['text-align'] = textAlign
  if (textDecoration !== undefined) styles['text-decoration'] = textDecoration
  if (textTransform !== undefined) styles['text-transform'] = textTransform
  if (color !== undefined) styles['color'] = color
  
  return applyStyles(element, styles)
}

export const applyBackground = (element, values) => {
  const { 
    backgroundColor, 
    backgroundImage, 
    backgroundSize, 
    backgroundPosition,
    backgroundRepeat 
  } = values
  
  const styles = {}
  
  if (backgroundColor !== undefined) styles['background-color'] = backgroundColor
  if (backgroundImage !== undefined) styles['background-image'] = backgroundImage
  if (backgroundSize !== undefined) styles['background-size'] = backgroundSize
  if (backgroundPosition !== undefined) styles['background-position'] = backgroundPosition
  if (backgroundRepeat !== undefined) styles['background-repeat'] = backgroundRepeat
  
  return applyStyles(element, styles)
}

export const applyBorder = (element, values) => {
  const { width, style, color, side } = values
  const styles = {}
  
  const prefix = side ? `border-${side}` : 'border'
  
  if (width !== undefined) styles[`${prefix}-width`] = width
  if (style !== undefined) styles[`${prefix}-style`] = style
  if (color !== undefined) styles[`${prefix}-color`] = color
  
  return applyStyles(element, styles)
}

export const applyEffects = (element, values) => {
  const { opacity, boxShadow, filter, backdropFilter, transform } = values
  const styles = {}
  
  if (opacity !== undefined) styles['opacity'] = opacity
  if (boxShadow !== undefined) styles['box-shadow'] = boxShadow
  if (filter !== undefined) styles['filter'] = filter
  if (backdropFilter !== undefined) styles['backdrop-filter'] = backdropFilter
  if (transform !== undefined) styles['transform'] = transform
  
  return applyStyles(element, styles)
}

export const applyLayout = (element, values) => {
  const { 
    display, 
    flexDirection, 
    flexWrap, 
    justifyContent, 
    alignItems, 
    alignContent,
    gap,
    gridTemplateColumns,
    gridTemplateRows,
  } = values
  
  const styles = {}
  
  if (display !== undefined) styles['display'] = display
  if (flexDirection !== undefined) styles['flex-direction'] = flexDirection
  if (flexWrap !== undefined) styles['flex-wrap'] = flexWrap
  if (justifyContent !== undefined) styles['justify-content'] = justifyContent
  if (alignItems !== undefined) styles['align-items'] = alignItems
  if (alignContent !== undefined) styles['align-content'] = alignContent
  if (gap !== undefined) styles['gap'] = gap
  if (gridTemplateColumns !== undefined) styles['grid-template-columns'] = gridTemplateColumns
  if (gridTemplateRows !== undefined) styles['grid-template-rows'] = gridTemplateRows
  
  return applyStyles(element, styles)
}

export const batchApply = (element, operations) => {
  if (!element || !operations || operations.length === 0) return false
  
  ChangeTracker.observe(element)
  
  const allStyles = {}
  
  for (const operation of operations) {
    if (typeof operation === 'function') {
      operation(element)
    } else if (typeof operation === 'object') {
      Object.assign(allStyles, operation)
    }
  }
  
  for (const [property, value] of Object.entries(allStyles)) {
    if (value === null || value === undefined || value === '') {
      element.style.removeProperty(property)
    } else {
      element.style.setProperty(property, value)
    }
  }
  
  return true
}

export const resetStyles = (element, properties) => {
  if (!element) return false
  
  ChangeTracker.observe(element)
  
  if (Array.isArray(properties)) {
    for (const prop of properties) {
      element.style.removeProperty(prop)
    }
  } else {
    element.removeAttribute('style')
  }
  
  return true
}

export default {
  applyStyle,
  applyStyles,
  removeStyle,
  applyMargin,
  applyPadding,
  applyBorderRadius,
  applyPosition,
  applyTypography,
  applyBackground,
  applyBorder,
  applyEffects,
  applyLayout,
  batchApply,
  resetStyles,
}
