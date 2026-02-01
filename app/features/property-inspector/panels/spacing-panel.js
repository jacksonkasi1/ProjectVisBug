import { inspectorStyles } from '../property-inspector.styles.js'
import { parseSpacing } from '../utils/css-parser.js'

export class SpacingPanel extends HTMLElement {
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
    this._styles = styles?.spacing || {}
    this.updateControls()
  }

  updateControls() {
    const boxEditor = this.shadowRoot.querySelector('vb-box-editor')
    if (boxEditor && this._element) {
      const margin = parseSpacing(this._element, 'margin')
      const padding = parseSpacing(this._element, 'padding')
      
      boxEditor.margin = {
        top: parseInt(margin.top) || 0,
        right: parseInt(margin.right) || 0,
        bottom: parseInt(margin.bottom) || 0,
        left: parseInt(margin.left) || 0,
      }
      
      boxEditor.padding = {
        top: parseInt(padding.top) || 0,
        right: parseInt(padding.right) || 0,
        bottom: parseInt(padding.bottom) || 0,
        left: parseInt(padding.left) || 0,
      }
    }
  }

  setupEvents() {
    const boxEditor = this.shadowRoot.querySelector('vb-box-editor')
    if (boxEditor) {
      boxEditor.addEventListener('margin-change', (e) => {
        const { side, value } = e.detail
        this.emitStyleChange(`margin-${side}`, `${value}px`)
      })

      boxEditor.addEventListener('padding-change', (e) => {
        const { side, value } = e.detail
        this.emitStyleChange(`padding-${side}`, `${value}px`)
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
      </style>

      <vb-collapse title="Spacing" expanded>
        <div class="section">
          <vb-box-editor></vb-box-editor>
        </div>
      </vb-collapse>
    `
  }
}

customElements.define('spacing-panel', SpacingPanel)
