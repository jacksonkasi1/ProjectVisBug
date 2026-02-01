import { inspectorStyles } from '../property-inspector.styles.js'
import { parseBorderRadius, rgbToHex } from '../utils/css-parser.js'

const BORDER_STYLE_OPTIONS = [
  { value: 'none', label: 'None', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' },
  { value: 'solid', label: 'Solid', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>' },
  { value: 'dashed', label: 'Dashed', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h2"/><path d="M11 12h2"/><path d="M17 12h2"/></svg>' },
  { value: 'dotted', label: 'Dotted', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>' },
]

const CORNER_ICONS = {
  tl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12V4h8"/></svg>',
  tr: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4h8v8"/></svg>',
  br: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v8h-8"/></svg>',
  bl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20H4v-8"/></svg>',
  expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>'
}

export class BordersPanel extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._element = null
    this._styles = {}
    this._expandedRadius = false
  }

  connectedCallback() {
    this.render()
    this.setupEvents()
  }

  updateStyles(element, styles) {
    this._element = element
    this._styles = styles?.borders || {}
    this.updateControls()
  }

  updateControls() {
    const radiusSlider = this.shadowRoot.querySelector('#border-radius')
    const widthSlider = this.shadowRoot.querySelector('#border-width')
    const styleSelect = this.shadowRoot.querySelector('#border-style')
    const colorPicker = this.shadowRoot.querySelector('#border-color')

    const tlInput = this.shadowRoot.querySelector('#radius-tl')
    const trInput = this.shadowRoot.querySelector('#radius-tr')
    const brInput = this.shadowRoot.querySelector('#radius-br')
    const blInput = this.shadowRoot.querySelector('#radius-bl')

    const tl = parseInt(this._styles['border-top-left-radius']) || 0
    const tr = parseInt(this._styles['border-top-right-radius']) || 0
    const br = parseInt(this._styles['border-bottom-right-radius']) || 0
    const bl = parseInt(this._styles['border-bottom-left-radius']) || 0

    if (tlInput) tlInput.value = tl
    if (trInput) trInput.value = tr
    if (brInput) brInput.value = br
    if (blInput) blInput.value = bl

    if (radiusSlider) {
      if (tl === tr && tr === br && br === bl) {
        radiusSlider.value = tl
      } else {
        radiusSlider.value = '' 
      }
    }
    
    if (widthSlider) {
      widthSlider.value = parseInt(this._styles['border-width']) || 0
    }
    
    if (styleSelect) {
      styleSelect.value = this._styles['border-style'] || 'none'
    }
    
    if (colorPicker) {
      const borderColor = this._styles['border-color'] || '#000000'
      colorPicker.value = rgbToHex(borderColor) || borderColor
    }
  }

  setupEvents() {
    const radiusSlider = this.shadowRoot.querySelector('#border-radius')
    if (radiusSlider) {
      radiusSlider.addEventListener('change', (e) => {
        const val = e.detail.value
        this.emitStyleChange('border-radius', `${val}px`)
        
        const inputs = ['#radius-tl', '#radius-tr', '#radius-br', '#radius-bl']
        inputs.forEach(id => {
            const el = this.shadowRoot.querySelector(id)
            if (el) el.value = val
        })
      })
    }

    const expandBtn = this.shadowRoot.querySelector('#radius-expand-btn')
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this._expandedRadius = !this._expandedRadius
        this.render()
        this.setupEvents()
        this.updateControls()
      })
    }

    const corners = [
      { id: '#radius-tl', prop: 'border-top-left-radius' },
      { id: '#radius-tr', prop: 'border-top-right-radius' },
      { id: '#radius-br', prop: 'border-bottom-right-radius' },
      { id: '#radius-bl', prop: 'border-bottom-left-radius' },
    ]

    corners.forEach(corner => {
      const input = this.shadowRoot.querySelector(corner.id)
      if (input) {
        input.addEventListener('change', (e) => {
           this.emitStyleChange(corner.prop, `${e.detail.value}px`)
        })
      }
    })

    const widthSlider = this.shadowRoot.querySelector('#border-width')
    if (widthSlider) {
      widthSlider.addEventListener('change', (e) => {
        this.emitStyleChange('border-width', `${e.detail.value}px`)
      })
    }

    const styleSelect = this.shadowRoot.querySelector('#border-style')
    if (styleSelect) {
      styleSelect.addEventListener('change', (e) => {
        this.emitStyleChange('border-style', e.detail.value)
      })
    }

    const colorPicker = this.shadowRoot.querySelector('#border-color')
    if (colorPicker) {
      colorPicker.addEventListener('change', (e) => {
        this.emitStyleChange('border-color', e.detail.value)
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

        .radius-main {
            display: flex;
            gap: var(--vb-spacing-xs);
            align-items: center;
        }

        .icon-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: var(--vb-text-muted);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
        }
        
        .icon-btn:hover, .icon-btn.active {
            background: var(--vb-surface-hover, rgba(0,0,0,0.05));
            color: var(--vb-text-main, #000);
        }

        .radius-expanded {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--vb-spacing-xs);
            margin-bottom: var(--vb-spacing-sm);
            padding-left: 60px; /* Align with inputs */
        }

        .radius-input-group {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--vb-surface-input, #f0f0f0);
            border-radius: 4px;
            padding-left: 6px;
            border: 1px solid transparent;
        }

        .radius-input-group:focus-within {
            border-color: var(--vb-focus-color, #007bff);
            background: #fff;
        }
        
        .radius-input-group svg {
            color: var(--vb-text-muted);
            flex-shrink: 0;
            opacity: 0.7;
        }
        
        .radius-input-group vb-number-input {
            width: 100%;
            --vb-input-bg: transparent;
            --vb-input-border: none;
            --vb-input-padding: 2px;
        }
      </style>

      <vb-collapse title="Borders">
        <div class="section">
          <div class="control-row">
            <span class="label">Radius</span>
            <div class="radius-main">
                <vb-number-input id="border-radius" min="0" max="999" step="1" unit="px" style="flex:1"></vb-number-input>
                <button id="radius-expand-btn" class="icon-btn ${this._expandedRadius ? 'active' : ''}" title="Individual corners">
                    ${CORNER_ICONS.expand}
                </button>
            </div>
          </div>
          
          ${this._expandedRadius ? `
            <div class="radius-expanded">
                <div class="radius-input-group" title="Top Left">
                    ${CORNER_ICONS.tl}
                    <vb-number-input id="radius-tl" min="0" max="999" step="1" unit="px"></vb-number-input>
                </div>
                <div class="radius-input-group" title="Top Right">
                    ${CORNER_ICONS.tr}
                    <vb-number-input id="radius-tr" min="0" max="999" step="1" unit="px"></vb-number-input>
                </div>
                <div class="radius-input-group" title="Bottom Left">
                    ${CORNER_ICONS.bl}
                    <vb-number-input id="radius-bl" min="0" max="999" step="1" unit="px"></vb-number-input>
                </div>
                <div class="radius-input-group" title="Bottom Right">
                    ${CORNER_ICONS.br}
                    <vb-number-input id="radius-br" min="0" max="999" step="1" unit="px"></vb-number-input>
                </div>
            </div>
          ` : ''}

          <div class="control-row">
            <span class="label">Width</span>
            <vb-number-input id="border-width" min="0" max="100" step="1" unit="px"></vb-number-input>
          </div>
          <div class="control-row">
            <span class="label">Style</span>
            <vb-toggle-group id="border-style"></vb-toggle-group>
          </div>
          <div class="control-row">
            <span class="label">Color</span>
            <vb-color-picker id="border-color"></vb-color-picker>
          </div>
        </div>
      </vb-collapse>
    `

    const styleSelect = this.shadowRoot.querySelector('#border-style')
    if (styleSelect) styleSelect.options = BORDER_STYLE_OPTIONS
  }
}

customElements.define('borders-panel', BordersPanel)
