import { inspectorStyles } from '../property-inspector.styles.js'

const POSITION_OPTIONS = [
  { value: 'static', label: 'Static' },
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
]

const FLOAT_OPTIONS = [
  { value: 'none', label: 'None', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' },
  { value: 'left', label: 'Left', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>' },
  { value: 'right', label: 'Right', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>' },
]

const CLEAR_OPTIONS = [
  { value: 'none', label: 'None', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' },
  { value: 'left', label: 'Left', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h6v7H3z"/></svg>' },
  { value: 'right', label: 'Right', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M15 10h6v7h-6z"/></svg>' },
  { value: 'both', label: 'Both', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 10h6v7H3z"/><path d="M15 10h6v7h-6z"/></svg>' },
]

export class PositionPanel extends HTMLElement {
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
    this._styles = styles?.position || {}
    this.updateControls()
  }

  updateControls() {
    const positionSelect = this.shadowRoot.querySelector('#position')
    const floatSelect = this.shadowRoot.querySelector('#float')
    const clearSelect = this.shadowRoot.querySelector('#clear')
    const zIndexSlider = this.shadowRoot.querySelector('#z-index')

    if (positionSelect) positionSelect.value = this._styles.position || 'static'
    if (floatSelect) floatSelect.value = this._styles.float || 'none'
    if (clearSelect) clearSelect.value = this._styles.clear || 'none'
    if (zIndexSlider) {
      const zIndex = this._styles['z-index']
      zIndexSlider.value = zIndex === 'auto' ? 0 : (parseInt(zIndex) || 0)
    }

    const offsetControls = this.shadowRoot.querySelector('.offset-controls')
    const isPositioned = ['relative', 'absolute', 'fixed', 'sticky'].includes(this._styles.position)
    if (offsetControls) {
      offsetControls.style.display = isPositioned ? 'block' : 'none'
    }

    if (isPositioned) {
      const topSlider = this.shadowRoot.querySelector('#top')
      const rightSlider = this.shadowRoot.querySelector('#right')
      const bottomSlider = this.shadowRoot.querySelector('#bottom')
      const leftSlider = this.shadowRoot.querySelector('#left')

      if (topSlider) topSlider.value = parseInt(this._styles.top) || 0
      if (rightSlider) rightSlider.value = parseInt(this._styles.right) || 0
      if (bottomSlider) bottomSlider.value = parseInt(this._styles.bottom) || 0
      if (leftSlider) leftSlider.value = parseInt(this._styles.left) || 0
    }
  }

  setupEvents() {
    const positionSelect = this.shadowRoot.querySelector('#position')
    if (positionSelect) {
      positionSelect.addEventListener('change', (e) => {
        this.emitStyleChange('position', e.detail.value)
        this.updateControls()
      })
    }

    const floatSelect = this.shadowRoot.querySelector('#float')
    if (floatSelect) {
      floatSelect.addEventListener('change', (e) => {
        this.emitStyleChange('float', e.detail.value)
      })
    }

    const clearSelect = this.shadowRoot.querySelector('#clear')
    if (clearSelect) {
      clearSelect.addEventListener('change', (e) => {
        this.emitStyleChange('clear', e.detail.value)
      })
    }

    const zIndexSlider = this.shadowRoot.querySelector('#z-index')
    if (zIndexSlider) {
      zIndexSlider.addEventListener('change', (e) => {
        this.emitStyleChange('z-index', e.detail.value)
      })
    }

    const offsetSliders = ['top', 'right', 'bottom', 'left']
    offsetSliders.forEach(side => {
      const slider = this.shadowRoot.querySelector(`#${side}`)
      if (slider) {
        slider.addEventListener('change', (e) => {
          this.emitStyleChange(side, `${e.detail.value}px`)
        })
      }
    })
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

        .offset-controls {
          display: none;
          margin-top: var(--vb-spacing-sm);
          padding-top: var(--vb-spacing-sm);
          border-top: 1px solid var(--vb-border);
        }

        .offset-label {
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
          margin-bottom: var(--vb-spacing-xs);
          font-weight: 500;
        }
      </style>

      <vb-collapse title="Position">
        <div class="section">
          <div class="control-row">
            <span class="label">Position</span>
            <vb-select id="position"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Float</span>
            <vb-toggle-group id="float"></vb-toggle-group>
          </div>
          <div class="control-row">
            <span class="label">Clear</span>
            <vb-toggle-group id="clear"></vb-toggle-group>
          </div>
          <div class="control-row">
            <span class="label">Z-Index</span>
            <vb-number-input id="z-index" min="-9999" max="9999" step="1"></vb-number-input>
          </div>

          <div class="offset-controls">
            <div class="offset-label">Offsets</div>
            <div class="control-row">
              <span class="label">Top</span>
              <vb-number-input id="top" min="-9999" max="9999" step="1" unit="px"></vb-number-input>
            </div>
            <div class="control-row">
              <span class="label">Right</span>
              <vb-number-input id="right" min="-9999" max="9999" step="1" unit="px"></vb-number-input>
            </div>
            <div class="control-row">
              <span class="label">Bottom</span>
              <vb-number-input id="bottom" min="-9999" max="9999" step="1" unit="px"></vb-number-input>
            </div>
            <div class="control-row">
              <span class="label">Left</span>
              <vb-number-input id="left" min="-9999" max="9999" step="1" unit="px"></vb-number-input>
            </div>
          </div>
        </div>
      </vb-collapse>
    `

    const positionSelect = this.shadowRoot.querySelector('#position')
    if (positionSelect) positionSelect.options = POSITION_OPTIONS

    const floatSelect = this.shadowRoot.querySelector('#float')
    if (floatSelect) floatSelect.options = FLOAT_OPTIONS

    const clearSelect = this.shadowRoot.querySelector('#clear')
    if (clearSelect) clearSelect.options = CLEAR_OPTIONS
  }
}

customElements.define('position-panel', PositionPanel)
