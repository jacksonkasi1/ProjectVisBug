
import $ from 'blingblingjs'
import { ChangeTracker } from './change-tracker'
import * as Icons from '../components/vis-bug/vis-bug.icons'

export class ChangesToolbar extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.state = {
      isCollapsed: false,
    }
  }

  connectedCallback() {
    this.render()
    this.setupListeners()
  }

  disconnectedCallback() {
    window.removeEventListener('visbug:history-update', this.onHistoryUpdate.bind(this))
  }

  setupListeners() {
    window.addEventListener('visbug:history-update', this.onHistoryUpdate.bind(this))
    
    const toggle = this.shadowRoot.querySelector('.toggle-btn')
    if (toggle) {
        toggle.onclick = () => {
            this.state.isCollapsed = !this.state.isCollapsed
            const sidebar = this.shadowRoot.querySelector('.visbug-sidebar')
            const toggleIcon = this.shadowRoot.querySelector('.toggle-icon')
            
            if (this.state.isCollapsed) {
                sidebar.classList.add('collapsed')
                toggle.classList.add('collapsed')
                toggleIcon.innerHTML = Icons.chevron_left
            } else {
                sidebar.classList.remove('collapsed')
                toggle.classList.remove('collapsed')
                toggleIcon.innerHTML = Icons.chevron_right
            }
        }
    }

    this.bindActions()
  }

  bindActions() {
    const undoBtn = this.shadowRoot.querySelector('#undo')
    const redoBtn = this.shadowRoot.querySelector('#redo')
    const copyBtn = this.shadowRoot.querySelector('#copy')
    const clearBtn = this.shadowRoot.querySelector('#clear')

    if (undoBtn) undoBtn.onclick = () => ChangeTracker.undo()
    if (redoBtn) redoBtn.onclick = () => ChangeTracker.redo()
    
    if (copyBtn) copyBtn.onclick = async () => {
      const report = await ChangeTracker.getChangesAsText()
      await navigator.clipboard.writeText(report)
      
      const btn = this.shadowRoot.querySelector('#copy')
      const originalText = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => btn.textContent = originalText, 1500)
    }

    if (clearBtn) clearBtn.onclick = () => {
      if(confirm('Clear all tracked changes?')) location.reload()
    }
  }

  onHistoryUpdate({ detail }) {
    this.updateContent(detail)
  }

  updateContent(detail) {
    const list = this.shadowRoot.querySelector('.content')
    if (list) {
      const history = ChangeTracker.getHistory()
      list.innerHTML = history.reverse().map(item => `
        <div class="history-item">
          <span class="icon-box ${item.type}">${this.getIconForType(item.type)}</span>
          <div class="meta">
              <span class="type-label">${item.type}</span>
              <span class="target">${item.elementLabel || item.element.tagName.toLowerCase()}</span>
          </div>
        </div>
      `).join('')
    }
    
    const undoBtn = this.shadowRoot.querySelector('#undo')
    const redoBtn = this.shadowRoot.querySelector('#redo')
    if (undoBtn) undoBtn.disabled = !detail.canUndo
    if (redoBtn) redoBtn.disabled = !detail.canRedo
  }

  getIconForType(type) {
      if (type === 'style') return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`
      if (type === 'text') return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`
      return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`
  }

  render() {
    const style = `
      :host {
        --vb-bg: #1e1e1e;
        --vb-border: #333333;
        --vb-text: #e0e0e0;
        --vb-text-muted: #a0a0a0;
        --vb-hover: rgba(255, 255, 255, 0.06);
        --vb-active: rgba(255, 255, 255, 0.1);
        --vb-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        --vb-blue: #0d99ff;
        
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 280px; /* Explicit width on host to prevent collapse */
        z-index: 2147483647;
        pointer-events: none;
      }

      * { box-sizing: border-box; }

      .visbug-sidebar {
        pointer-events: auto;
        position: absolute;
        top: 0;
        right: 0;
        width: 280px;
        height: 100%;
        background: var(--vb-bg);
        border-left: 1px solid var(--vb-border);
        color: var(--vb-text);
        font-family: var(--vb-font);
        display: flex;
        flex-direction: column;
        transform: translateX(0);
        transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
        will-change: transform;
        box-shadow: -4px 0 24px rgba(0,0,0,0.4);
      }

      .visbug-sidebar.collapsed {
        transform: translateX(100%);
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 48px;
        padding: 0 8px 0 16px;
        border-bottom: 1px solid var(--vb-border);
        flex-shrink: 0;
        background: #252525;
      }

      h1 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--vb-text);
        user-select: none;
      }

      .actions {
        display: flex;
        gap: 4px;
      }

      button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 6px;
        border-radius: 4px;
        color: var(--vb-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.1s ease;
      }

      button:hover:not(:disabled) {
        background: var(--vb-hover);
        color: var(--vb-text);
      }

      button:active:not(:disabled) {
        background: var(--vb-active);
      }
      
      button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      button svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
      }

      .content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .content::-webkit-scrollbar { width: 8px; }
      .content::-webkit-scrollbar-track { background: transparent; }
      .content::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; border: 2px solid var(--vb-bg); }

      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 6px;
        transition: background 0.1s;
        cursor: default;
      }
      
      .history-item:hover {
        background: var(--vb-hover);
      }

      .icon-box {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(255,255,255,0.05);
        color: #ccc;
      }
      
      .icon-box.style { color: #4facfe; background: rgba(79, 172, 254, 0.15); }
      .icon-box.text { color: #43e97b; background: rgba(67, 233, 123, 0.15); }
      
      .icon-box svg { width: 16px; height: 16px; fill: currentColor; }

      .meta {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        gap: 2px;
      }

      .type-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--vb-text-muted);
        text-transform: capitalize;
      }

      .target {
        font-size: 12px;
        color: var(--vb-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: 'Geist Mono', monospace;
      }

      .footer {
        padding: 16px;
        border-top: 1px solid var(--vb-border);
        background: #252525;
      }

      .primary-btn {
        width: 100%;
        background: var(--vb-blue);
        color: white;
        height: 36px;
        font-size: 13px;
        font-weight: 500;
        border-radius: 6px;
      }
      
      .primary-btn:hover:not(:disabled) {
        background: #0077d1;
        color: white;
      }

      .toggle-btn {
        pointer-events: auto;
        position: absolute;
        top: 50%;
        right: 280px; /* Aligned with sidebar edge */
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
        background: #2c2c2c;
      }
      
      .toggle-btn.collapsed {
        right: 0;
      }
    `

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      
      <div class="toggle-btn" title="Toggle Sidebar">
        <span class="toggle-icon">${Icons.chevron_right}</span>
      </div>

      <aside class="visbug-sidebar">
        <header>
          <h1>History</h1>
          <div class="actions">
            <button id="undo" title="Undo" aria-label="Undo">
              ${Icons.undo}
            </button>
            <button id="redo" title="Redo" aria-label="Redo">
              ${Icons.redo}
            </button>
            <button id="clear" title="Clear History" aria-label="Clear History">
              ${Icons.clear_changes}
            </button>
          </div>
        </header>
        
        <div class="content">
          <!-- History items go here -->
        </div>

        <div class="footer">
          <button id="copy" class="primary-btn">Copy Code</button>
        </div>
      </aside>
    `
  }
}

customElements.define('changes-toolbar', ChangesToolbar)
