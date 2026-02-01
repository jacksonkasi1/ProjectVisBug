import { inspectorStyles } from './property-inspector.styles.js'
import { ChangeTracker } from '../change-tracker'
import { getComputedStyles, getStylesByCategory, generateCSS, rgbToHex } from './utils/css-parser.js'
import { detectTailwind, stylesToTailwind } from './utils/tailwind-detector.js'
import { getElementLabel, getElementLabelWithReact, getCSSSelector } from '../../utilities/element-identifier.js'

import './controls/vb-collapse.js'
import './controls/vb-toggle-group.js'
import './controls/vb-slider.js'
import './controls/vb-number-input.js'
import './controls/vb-select.js'
import './controls/vb-color-picker.js'
import './controls/vb-box-editor.js'

import './panels/layout-panel.js'
import './panels/spacing-panel.js'
import './panels/position-panel.js'
import './panels/typography-panel.js'
import './panels/backgrounds-panel.js'
import './panels/borders-panel.js'
import './panels/effects-panel.js'

import * as Icons from '../../components/vis-bug/vis-bug.icons.js'

export class PropertyInspector extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.state = {
      selectedElement: null,
      activeTab: 'css',
      isCollapsed: false,
      isTailwindSite: false,
      styles: {},
    }
    this.selectorEngine = null
    this._boundOnHistoryUpdate = this.onHistoryUpdate.bind(this)
    this._boundOnSelectorUpdate = null
  }

  connectedCallback() {
    this.render()
    this.setupListeners()
    this.state.isTailwindSite = detectTailwind()
  }

  disconnectedCallback() {
    if (this.selectorEngine && this._boundOnSelectorUpdate) {
      this.selectorEngine.removeSelectedCallback(this._boundOnSelectorUpdate)
    }
    window.removeEventListener('visbug:history-update', this._boundOnHistoryUpdate)
  }

  setSelectorEngine(selectorEngine) {
    this.selectorEngine = selectorEngine
    this._boundOnSelectorUpdate = this.onSelectorUpdate.bind(this)
    this.selectorEngine.onSelectedUpdate(this._boundOnSelectorUpdate)
  }

  onSelectorUpdate(elements) {
    if (elements && elements.length > 0) {
      this.selectElement(elements[0])
    } else {
      this.onElementDeselect()
    }
  }

  setupListeners() {
    this.shadowRoot.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    window.addEventListener('visbug:history-update', this._boundOnHistoryUpdate)

    const toggle = this.shadowRoot.querySelector('.toggle-btn')
    if (toggle) {
      toggle.onclick = () => this.toggleCollapse()
    }

    const tabBtns = this.shadowRoot.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.onclick = () => this.setActiveTab(btn.dataset.tab)
    })

    const copyBtn = this.shadowRoot.querySelector('#copy-btn')
    if (copyBtn) {
      copyBtn.onclick = () => this.copyCode()
    }

    const undoBtn = this.shadowRoot.querySelector('#undo-btn')
    const redoBtn = this.shadowRoot.querySelector('#redo-btn')
    if (undoBtn) undoBtn.onclick = () => {
      const el = ChangeTracker.undo()
      if (el && this.selectorEngine) {
        this.selectorEngine.select(el)
      }
    }
    if (redoBtn) redoBtn.onclick = () => {
      const el = ChangeTracker.redo()
      if (el && this.selectorEngine) {
        this.selectorEngine.select(el)
      }
    }

    this.shadowRoot.addEventListener('style-change', (e) => {
      this.onStyleChange(e.detail)
    })
  }

  onElementDeselect() {
    this.state.selectedElement = null
    this.state.styles = {}
    this.updatePanels()
    this.updateCodePreview()
  }

  onHistoryUpdate(event) {
    if (this.state.selectedElement) {
      this.refreshStyles()
    }
    this.updateUndoRedoButtons(event.detail)
  }

  selectElement(element) {
    this.state.selectedElement = element
    ChangeTracker.observe(element)
    this.refreshStyles()
    this.updateElementLabel()
  }

  refreshStyles() {
    if (!this.state.selectedElement) return
    
    this.state.styles = getStylesByCategory(this.state.selectedElement)
    this.updatePanels()
    this.updateCodePreview()
  }

  async updateElementLabel() {
    const labelEl = this.shadowRoot.querySelector('.element-label')
    const filePathEl = this.shadowRoot.querySelector('.element-filepath')
    
    if (!this.state.selectedElement) {
      if (labelEl) labelEl.textContent = 'No element selected'
      if (filePathEl) filePathEl.textContent = ''
      return
    }

    const info = await getElementLabelWithReact(this.state.selectedElement)
    
    if (labelEl) {
      if (info.componentName) {
        labelEl.innerHTML = `<span class="component-name">${info.componentName}</span><span class="html-tag">${info.htmlLabel}</span>`
      } else {
        labelEl.textContent = info.label
      }
    }
    
    if (filePathEl) {
      filePathEl.textContent = info.filePath || ''
      filePathEl.title = info.filePath || ''
    }
  }

  updatePanels() {
    const panels = this.shadowRoot.querySelectorAll('[data-panel]')
    panels.forEach(panel => {
      if (panel.updateStyles) {
        panel.updateStyles(this.state.selectedElement, this.state.styles)
      }
    })
  }

  updateCodePreview() {
    const codeEl = this.shadowRoot.querySelector('.code-content')
    if (!codeEl) return

    if (!this.state.selectedElement) {
      codeEl.textContent = '/* Select an element to see its styles */'
      return
    }

    const selector = getCSSSelector(this.state.selectedElement)
    const inlineStyle = this.state.selectedElement.getAttribute('style')
    
    if (this.state.activeTab === 'css') {
      if (inlineStyle) {
        const styles = {}
        inlineStyle.split(';').forEach(rule => {
          const [prop, value] = rule.split(':').map(s => s.trim())
          if (prop && value) styles[prop] = value
        })
        codeEl.textContent = generateCSS(selector, styles)
      } else {
        codeEl.textContent = `${selector} {\n  /* No inline styles applied */\n}`
      }
    } else {
      const inlineStyles = {}
      if (inlineStyle) {
        inlineStyle.split(';').forEach(rule => {
          const [prop, value] = rule.split(':').map(s => s.trim())
          if (prop && value) inlineStyles[prop] = value
        })
      }
      const twClasses = stylesToTailwind(inlineStyles)
      codeEl.textContent = twClasses.length > 0 
        ? `class="${twClasses.join(' ')}"` 
        : '/* No Tailwind classes generated */';
    }
  }

  updateUndoRedoButtons(detail) {
    const undoBtn = this.shadowRoot.querySelector('#undo-btn')
    const redoBtn = this.shadowRoot.querySelector('#redo-btn')
    if (undoBtn) undoBtn.disabled = !detail?.canUndo
    if (redoBtn) redoBtn.disabled = !detail?.canRedo
  }

  onStyleChange(detail) {
    if (!this.state.selectedElement) return
    
    const { property, value } = detail
    this.state.selectedElement.style.setProperty(property, value)
    this.refreshStyles()
  }

  setActiveTab(tab) {
    this.state.activeTab = tab
    const tabBtns = this.shadowRoot.querySelectorAll('.tab-btn')
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab)
    })
    this.updateCodePreview()
  }

  toggleCollapse() {
    this.state.isCollapsed = !this.state.isCollapsed
    const sidebar = this.shadowRoot.querySelector('.inspector-sidebar')
    const toggleBtn = this.shadowRoot.querySelector('.toggle-btn')
    const toggleIcon = this.shadowRoot.querySelector('.toggle-icon')
    
    if (this.state.isCollapsed) {
      sidebar.classList.add('collapsed')
      toggleBtn.classList.add('collapsed')
      toggleIcon.innerHTML = Icons.chevron_left
    } else {
      sidebar.classList.remove('collapsed')
      toggleBtn.classList.remove('collapsed')
      toggleIcon.innerHTML = Icons.chevron_right
    }
  }

  async copyCode() {
    const codeEl = this.shadowRoot.querySelector('.code-content')
    if (!codeEl) return

    try {
      const report = await ChangeTracker.getChangesAsText()
      await navigator.clipboard.writeText(report)
      
      const copyBtn = this.shadowRoot.querySelector('#copy-btn')
      const originalText = copyBtn.textContent
      copyBtn.textContent = 'Copied!'
      setTimeout(() => copyBtn.textContent = originalText, 1500)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        
        :host {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 300px;
          z-index: 2147483647;
          pointer-events: none;
          font-family: var(--vb-font-family);
        }

        .toggle-btn {
          pointer-events: auto;
          position: absolute;
          top: 50%;
          right: 300px;
          transform: translateY(-50%);
          width: 24px;
          height: 48px;
          background: var(--vb-bg);
          border: 1px solid var(--vb-border);
          border-right: none;
          border-radius: 8px 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--vb-text-muted);
          transition: right 0.3s cubic-bezier(0.2, 0, 0.2, 1);
          z-index: -1;
        }

        .toggle-btn:hover {
          color: var(--vb-text);
          background: var(--vb-bg-hover);
        }

        .toggle-btn.collapsed {
          right: 0;
        }

        .toggle-icon {
          display: flex;
        }

        .toggle-icon svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        .inspector-sidebar {
          pointer-events: auto;
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 100%;
          background: var(--vb-bg);
          border-left: 1px solid var(--vb-border);
          display: flex;
          flex-direction: column;
          transform: translateX(0);
          transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
          box-shadow: -4px 0 24px rgba(0,0,0,0.08);
        }

        .inspector-sidebar.collapsed {
          transform: translateX(100%);
        }

        .inspector-header {
          padding: var(--vb-spacing-sm) var(--vb-spacing-md);
          border-bottom: 1px solid var(--vb-border);
          background: var(--vb-bg-secondary);
        }

        .element-label {
          font-size: var(--vb-font-size-sm);
          font-weight: 600;
          color: var(--vb-text);
          margin-bottom: 2px;
          font-family: 'Geist Mono', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .element-label .component-name {
          color: var(--vb-accent);
          font-weight: 600;
        }

        .element-label .html-tag {
          color: var(--vb-text-muted);
          font-weight: 400;
          font-size: var(--vb-font-size-xs);
        }

        .element-filepath {
          font-size: 10px;
          color: var(--vb-text-muted);
          font-family: 'Geist Mono', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: var(--vb-spacing-xs);
          opacity: 0.7;
        }

        .element-filepath:empty {
          display: none;
        }

        .tabs {
          display: flex;
          gap: 2px;
          background: var(--vb-bg);
          padding: 2px;
          border-radius: var(--vb-radius-md);
        }

        .tab-btn {
          flex: 1;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: var(--vb-text-muted);
          font-size: var(--vb-font-size-sm);
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--vb-radius-sm);
          transition: all 0.15s;
        }

        .tab-btn:hover {
          color: var(--vb-text);
          background: var(--vb-bg-hover);
        }

        .tab-btn.active {
          background: var(--vb-accent);
          color: var(--vb-accent-text);
        }

        .panels-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .code-section {
          border-top: 1px solid var(--vb-border);
          background: var(--vb-bg-secondary);
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--vb-spacing-sm) var(--vb-spacing-md);
          cursor: pointer;
        }

        .code-title {
          font-size: var(--vb-font-size-xs);
          font-weight: 600;
          color: var(--vb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .code-preview {
          max-height: 150px;
          overflow: auto;
          padding: 0 var(--vb-spacing-md) var(--vb-spacing-md);
        }

        .code-content {
          font-family: 'Geist Mono', 'SF Mono', monospace;
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text);
          white-space: pre-wrap;
          word-break: break-all;
          background: var(--vb-bg);
          padding: var(--vb-spacing-sm);
          border-radius: var(--vb-radius-md);
          border: 1px solid var(--vb-border);
        }

        .inspector-footer {
          padding: var(--vb-spacing-sm) var(--vb-spacing-md);
          border-top: 1px solid var(--vb-border);
          background: var(--vb-bg-secondary);
          display: flex;
          gap: var(--vb-spacing-sm);
        }

        .footer-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: var(--vb-radius-md);
          font-size: var(--vb-font-size-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .footer-btn.primary {
          background: var(--vb-accent);
          color: var(--vb-accent-text);
        }

        .footer-btn.primary:hover {
          background: var(--vb-accent-hover);
        }

        .footer-btn.secondary {
          background: var(--vb-bg);
          color: var(--vb-text-muted);
          border: 1px solid var(--vb-border);
        }

        .footer-btn.secondary:hover {
          background: var(--vb-bg-hover);
          color: var(--vb-text);
        }

        .footer-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .footer-btn svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
        }

        .action-btns {
          display: flex;
          gap: 4px;
        }

        .icon-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--vb-bg);
          border: 1px solid var(--vb-border);
          border-radius: var(--vb-radius-sm);
          color: var(--vb-text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .icon-btn:hover:not(:disabled) {
          background: var(--vb-bg-hover);
          color: var(--vb-text);
        }

        .icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .icon-btn svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
        }
      </style>

      <div class="toggle-btn" title="Toggle Inspector">
        <span class="toggle-icon">${Icons.chevron_right}</span>
      </div>

      <aside class="inspector-sidebar">
        <header class="inspector-header">
          <div class="element-label">No element selected</div>
          <div class="element-filepath"></div>
          <div class="tabs">
            <button class="tab-btn active" data-tab="css">CSS</button>
            <button class="tab-btn" data-tab="tailwind" ${!this.state.isTailwindSite ? 'style="display:none"' : ''}>Tailwind</button>
          </div>
        </header>

        <div class="panels-container">
          <layout-panel data-panel="layout"></layout-panel>
          <spacing-panel data-panel="spacing"></spacing-panel>
          <position-panel data-panel="position"></position-panel>
          <typography-panel data-panel="typography"></typography-panel>
          <backgrounds-panel data-panel="backgrounds"></backgrounds-panel>
          <borders-panel data-panel="borders"></borders-panel>
          <effects-panel data-panel="effects"></effects-panel>
        </div>

        <div class="code-section">
          <div class="code-header">
            <span class="code-title">Generated Code</span>
            <div class="action-btns">
              <button class="icon-btn" id="undo-btn" title="Undo" disabled>${Icons.undo}</button>
              <button class="icon-btn" id="redo-btn" title="Redo" disabled>${Icons.redo}</button>
            </div>
          </div>
          <div class="code-preview">
            <pre class="code-content">/* Select an element to see its styles */</pre>
          </div>
        </div>

        <footer class="inspector-footer">
          <button class="footer-btn primary" id="copy-btn">Copy AI Report</button>
        </footer>
      </aside>
    `
  }
}

customElements.define('property-inspector', PropertyInspector)
