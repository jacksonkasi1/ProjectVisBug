import { inspectorStyles } from '../property-inspector.styles.js'

export class EffectsPanel extends HTMLElement {
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
    this._styles = styles?.effects || {}
    this.updateControls()
  }

  updateControls() {
    const opacityInput = this.shadowRoot.querySelector('#opacity')
    const blurInput = this.shadowRoot.querySelector('#blur')

    if (opacityInput) {
      const opacity = parseFloat(this._styles.opacity)
      opacityInput.value = isNaN(opacity) ? 100 : Math.round(opacity * 100)
    }

    if (blurInput) {
      const filter = this._styles.filter || ''
      const blurMatch = filter.match(/blur\((\d+(?:\.\d+)?)px\)/)
      blurInput.value = blurMatch ? parseFloat(blurMatch[1]) : 0
    }
  }

  setupEvents() {
    const opacityInput = this.shadowRoot.querySelector('#opacity')
    if (opacityInput) {
      opacityInput.addEventListener('change', (e) => {
        const opacity = e.detail.value / 100
        this.emitStyleChange('opacity', opacity.toString())
      })
    }

    const blurInput = this.shadowRoot.querySelector('#blur')
    if (blurInput) {
      blurInput.addEventListener('change', (e) => {
        const blur = e.detail.value
        this.emitStyleChange('filter', blur > 0 ? `blur(${blur}px)` : 'none')
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

      <vb-collapse title="Effects">
        <div class="section">
          <div class="control-row">
            <span class="label">Opacity</span>
            <vb-number-input id="opacity" min="0" max="100" step="1" unit="%"></vb-number-input>
          </div>
          <div class="control-row">
            <span class="label">Blur</span>
            <vb-number-input id="blur" min="0" max="100" step="1" unit="px"></vb-number-input>
          </div>
        </div>
      </vb-collapse>
    `
  }
}

customElements.define('effects-panel', EffectsPanel)
