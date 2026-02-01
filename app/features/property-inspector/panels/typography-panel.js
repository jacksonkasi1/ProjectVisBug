import { inspectorStyles } from '../property-inspector.styles.js'
import { rgbToHex } from '../utils/css-parser.js'

const FONT_WEIGHT_OPTIONS = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
]

const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>' },
  { value: 'center', label: 'Center', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>' },
  { value: 'right', label: 'Right', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>' },
  { value: 'justify', label: 'Justify', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>' },
]

const TEXT_DECORATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'underline', label: 'Underline' },
  { value: 'line-through', label: 'Strikethrough' },
  { value: 'overline', label: 'Overline' },
]

const TEXT_TRANSFORM_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'uppercase', label: 'UPPER' },
  { value: 'lowercase', label: 'lower' },
  { value: 'capitalize', label: 'Capital' },
]

export class TypographyPanel extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._element = null
    this._styles = {}
  }

  connectedCallback() {
    this.render()
    this.setupEvents()
  }

  updateStyles(element, styles) {
    this._element = element
    this._styles = styles?.typography || {}
    this.updateControls()
  }

  updateControls() {
    const fontSizeSlider = this.shadowRoot.querySelector('#font-size')
    const fontWeightSelect = this.shadowRoot.querySelector('#font-weight')
    const lineHeightSlider = this.shadowRoot.querySelector('#line-height')
    const letterSpacingSlider = this.shadowRoot.querySelector('#letter-spacing')
    const textAlignGroup = this.shadowRoot.querySelector('#text-align')
    const textDecorationSelect = this.shadowRoot.querySelector('#text-decoration')
    const textTransformSelect = this.shadowRoot.querySelector('#text-transform')
    const colorPicker = this.shadowRoot.querySelector('#color')

    if (fontSizeSlider) fontSizeSlider.value = parseInt(this._styles['font-size']) || 16
    if (fontWeightSelect) fontWeightSelect.value = this._styles['font-weight'] || '400'
    if (lineHeightSlider) lineHeightSlider.value = parseFloat(this._styles['line-height']) || 1.5
    if (letterSpacingSlider) letterSpacingSlider.value = parseFloat(this._styles['letter-spacing']) || 0
    if (textAlignGroup) textAlignGroup.value = this._styles['text-align'] || 'left'
    if (textDecorationSelect) {
      const decoration = this._styles['text-decoration'] || 'none'
      textDecorationSelect.value = decoration.split(' ')[0]
    }
    if (textTransformSelect) textTransformSelect.value = this._styles['text-transform'] || 'none'
    if (colorPicker) {
      const color = this._styles.color || '#000000'
      colorPicker.value = rgbToHex(color) || color
    }
  }

  setupEvents() {
    const fontSizeSlider = this.shadowRoot.querySelector('#font-size')
    if (fontSizeSlider) {
      fontSizeSlider.addEventListener('change', (e) => {
        this.emitStyleChange('font-size', `${e.detail.value}px`)
      })
    }

    const fontWeightSelect = this.shadowRoot.querySelector('#font-weight')
    if (fontWeightSelect) {
      fontWeightSelect.addEventListener('change', (e) => {
        this.emitStyleChange('font-weight', e.detail.value)
      })
    }

    const lineHeightSlider = this.shadowRoot.querySelector('#line-height')
    if (lineHeightSlider) {
      lineHeightSlider.addEventListener('change', (e) => {
        this.emitStyleChange('line-height', e.detail.value)
      })
    }

    const letterSpacingSlider = this.shadowRoot.querySelector('#letter-spacing')
    if (letterSpacingSlider) {
      letterSpacingSlider.addEventListener('change', (e) => {
        this.emitStyleChange('letter-spacing', `${e.detail.value}px`)
      })
    }

    const textAlignGroup = this.shadowRoot.querySelector('#text-align')
    if (textAlignGroup) {
      textAlignGroup.addEventListener('change', (e) => {
        this.emitStyleChange('text-align', e.detail.value)
      })
    }

    const textDecorationSelect = this.shadowRoot.querySelector('#text-decoration')
    if (textDecorationSelect) {
      textDecorationSelect.addEventListener('change', (e) => {
        this.emitStyleChange('text-decoration', e.detail.value)
      })
    }

    const textTransformSelect = this.shadowRoot.querySelector('#text-transform')
    if (textTransformSelect) {
      textTransformSelect.addEventListener('change', (e) => {
        this.emitStyleChange('text-transform', e.detail.value)
      })
    }

    const colorPicker = this.shadowRoot.querySelector('#color')
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.emitStyleChange('color', e.detail.value)
      })
    }
  }

  emitStyleChange(property, value) {
    this.dispatchEvent(new CustomEvent('style-change', {
      detail: { property, value },
      bubbles: true,
      composed: true
    }))
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        
        :host {
          display: block;
        }

        .section {
          padding: var(--vb-spacing-sm);
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: var(--vb-spacing-sm);
          margin-bottom: var(--vb-spacing-sm);
        }

        .control-row .label {
          flex: 0 0 70px;
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
        }

        .control-row > *:not(.label) {
          flex: 1;
        }

        .section-label {
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
          margin-bottom: var(--vb-spacing-xs);
          font-weight: 500;
        }

        .align-row {
          margin-bottom: var(--vb-spacing-sm);
        }
      </style>

      <vb-collapse title="Typography" expanded>
        <div class="section">
          <div class="control-row">
            <span class="label">Size</span>
            <vb-number-input id="font-size" min="0" max="999" step="1" unit="px"></vb-number-input>
          </div>
          <div class="control-row">
            <span class="label">Weight</span>
            <vb-select id="font-weight"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Line Height</span>
            <vb-number-input id="line-height" min="0" max="10" step="0.1"></vb-number-input>
          </div>
          <div class="control-row">
            <span class="label">Letter Space</span>
            <vb-number-input id="letter-spacing" min="-50" max="50" step="0.1" unit="px"></vb-number-input>
          </div>
          <div class="control-row">
            <span class="label">Color</span>
            <vb-color-picker id="color"></vb-color-picker>
          </div>
          
          <div class="section-label">Alignment</div>
          <div class="align-row">
            <vb-toggle-group id="text-align"></vb-toggle-group>
          </div>

          <div class="control-row">
            <span class="label">Decoration</span>
            <vb-select id="text-decoration"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Transform</span>
            <vb-select id="text-transform"></vb-select>
          </div>
        </div>
      </vb-collapse>
    `

    const fontWeightSelect = this.shadowRoot.querySelector('#font-weight')
    if (fontWeightSelect) fontWeightSelect.options = FONT_WEIGHT_OPTIONS

    const textAlignGroup = this.shadowRoot.querySelector('#text-align')
    if (textAlignGroup) textAlignGroup.options = TEXT_ALIGN_OPTIONS

    const textDecorationSelect = this.shadowRoot.querySelector('#text-decoration')
    if (textDecorationSelect) textDecorationSelect.options = TEXT_DECORATION_OPTIONS

    const textTransformSelect = this.shadowRoot.querySelector('#text-transform')
    if (textTransformSelect) textTransformSelect.options = TEXT_TRANSFORM_OPTIONS
  }
}

customElements.define('typography-panel', TypographyPanel)
