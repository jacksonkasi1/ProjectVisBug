import { inspectorStyles } from '../property-inspector.styles.js'
import { rgbToHex } from '../utils/css-parser.js'

export class BackgroundsPanel extends HTMLElement {
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
    this._styles = styles?.backgrounds || {}
    this.updateControls()
  }

  updateControls() {
    const colorPicker = this.shadowRoot.querySelector('#bg-color')
    
    if (colorPicker) {
      const bgColor = this._styles['background-color'] || 'transparent'
      const hex = rgbToHex(bgColor)
      colorPicker.value = hex || bgColor
    }
  }

  setupEvents() {
    const colorPicker = this.shadowRoot.querySelector('#bg-color')
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.emitStyleChange('background-color', e.detail.value)
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
          flex: 0 0 60px;
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
        }

        .control-row > *:not(.label) {
          flex: 1;
        }
      </style>

      <vb-collapse title="Backgrounds">
        <div class="section">
          <div class="control-row">
            <span class="label">Color</span>
            <vb-color-picker id="bg-color"></vb-color-picker>
          </div>
        </div>
      </vb-collapse>
    `
  }
}

customElements.define('backgrounds-panel', BackgroundsPanel)
