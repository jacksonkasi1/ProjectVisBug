import { inspectorStyles } from '../property-inspector.styles.js'
import { applyLayout } from '../utils/style-applier.js'

const DISPLAY_OPTIONS = [
  { value: 'block', label: 'Block', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>' },
  { value: 'flex', label: 'Flex', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>' },
  { value: 'grid', label: 'Grid', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>' },
  { value: 'inline', label: 'Inline', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H7"/><path d="M17 12v3"/><path d="M7 12v3"/><path d="M7 12V9"/><path d="M17 12V9"/></svg>' },
  { value: 'none', label: 'None', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>' },
]

const FLEX_DIRECTION_OPTIONS = [
  { value: 'row', label: 'Row' },
  { value: 'row-reverse', label: 'Row Rev' },
  { value: 'column', label: 'Column' },
  { value: 'column-reverse', label: 'Col Rev' },
]

const JUSTIFY_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Between' },
  { value: 'space-around', label: 'Around' },
  { value: 'space-evenly', label: 'Evenly' },
]

const ALIGN_OPTIONS = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
]

export class LayoutPanel extends HTMLElement {
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
    this._styles = styles?.layout || {}
    this.updateControls()
  }

  updateControls() {
    const displayGroup = this.shadowRoot.querySelector('#display-toggle')
    if (displayGroup) {
      displayGroup.value = this._styles.display || 'block'
    }

    const flexControls = this.shadowRoot.querySelector('.flex-controls')
    const isFlexOrGrid = ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(this._styles.display)
    if (flexControls) {
      flexControls.style.display = isFlexOrGrid ? 'block' : 'none'
    }

    if (isFlexOrGrid) {
      const directionSelect = this.shadowRoot.querySelector('#flex-direction')
      const justifySelect = this.shadowRoot.querySelector('#justify-content')
      const alignSelect = this.shadowRoot.querySelector('#align-items')
      const gapSlider = this.shadowRoot.querySelector('#gap')

      if (directionSelect) directionSelect.value = this._styles['flex-direction'] || 'row'
      if (justifySelect) justifySelect.value = this._styles['justify-content'] || 'flex-start'
      if (alignSelect) alignSelect.value = this._styles['align-items'] || 'stretch'
      if (gapSlider) gapSlider.value = parseInt(this._styles.gap) || 0
    }
  }

  setupEvents() {
    const displayGroup = this.shadowRoot.querySelector('#display-toggle')
    if (displayGroup) {
      displayGroup.addEventListener('change', (e) => {
        this.emitStyleChange('display', e.detail.value)
        this.updateControls()
      })
    }

    const directionSelect = this.shadowRoot.querySelector('#flex-direction')
    if (directionSelect) {
      directionSelect.addEventListener('change', (e) => {
        this.emitStyleChange('flex-direction', e.detail.value)
      })
    }

    const justifySelect = this.shadowRoot.querySelector('#justify-content')
    if (justifySelect) {
      justifySelect.addEventListener('change', (e) => {
        this.emitStyleChange('justify-content', e.detail.value)
      })
    }

    const alignSelect = this.shadowRoot.querySelector('#align-items')
    if (alignSelect) {
      alignSelect.addEventListener('change', (e) => {
        this.emitStyleChange('align-items', e.detail.value)
      })
    }

    const gapSlider = this.shadowRoot.querySelector('#gap')
    if (gapSlider) {
      gapSlider.addEventListener('change', (e) => {
        this.emitStyleChange('gap', `${e.detail.value}px`)
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

        .section-label {
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
          margin-bottom: var(--vb-spacing-xs);
          font-weight: 500;
        }

        .flex-controls {
          display: none;
          margin-top: var(--vb-spacing-sm);
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

      <vb-collapse title="Layout" expanded>
        <div class="section">
          <div class="section-label">Display</div>
          <vb-toggle-group id="display-toggle"></vb-toggle-group>
        </div>

        <div class="flex-controls">
          <div class="control-row">
            <span class="label">Direction</span>
            <vb-select id="flex-direction"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Justify</span>
            <vb-select id="justify-content"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Align</span>
            <vb-select id="align-items"></vb-select>
          </div>
          <div class="control-row">
            <span class="label">Gap</span>
            <vb-number-input id="gap" min="0" max="999" step="1" unit="px"></vb-number-input>
          </div>
        </div>
      </vb-collapse>
    `

    const displayGroup = this.shadowRoot.querySelector('#display-toggle')
    if (displayGroup) {
      displayGroup.options = DISPLAY_OPTIONS
    }

    const directionSelect = this.shadowRoot.querySelector('#flex-direction')
    if (directionSelect) {
      directionSelect.options = FLEX_DIRECTION_OPTIONS
    }

    const justifySelect = this.shadowRoot.querySelector('#justify-content')
    if (justifySelect) {
      justifySelect.options = JUSTIFY_OPTIONS
    }

    const alignSelect = this.shadowRoot.querySelector('#align-items')
    if (alignSelect) {
      alignSelect.options = ALIGN_OPTIONS
    }
  }
}

customElements.define('layout-panel', LayoutPanel)
