import { inspectorStyles } from '../property-inspector.styles.js';

export class VbBoxEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this._padding = { top: 0, right: 0, bottom: 0, left: 0 };
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  get margin() { return this._margin; }
  set margin(val) { 
    this._margin = { ...this._margin, ...val };
    this.updateValues();
  }

  get padding() { return this._padding; }
  set padding(val) {
    this._padding = { ...this._padding, ...val };
    this.updateValues();
  }

  setupEvents() {
    this.shadowRoot.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (e) => {
        const type = input.dataset.type;
        const side = input.dataset.side;
        const value = e.target.value;

        if (type === 'margin') {
          this._margin[side] = value;
          this.dispatchEvent(new CustomEvent('margin-change', {
            detail: { side, value },
            bubbles: true,
            composed: true
          }));
        } else {
          this._padding[side] = value;
          this.dispatchEvent(new CustomEvent('padding-change', {
            detail: { side, value },
            bubbles: true,
            composed: true
          }));
        }
      });
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        }
      });
    });
  }

  updateValues() {
    const inputs = this.shadowRoot.querySelectorAll('input');
    inputs.forEach(input => {
      const type = input.dataset.type;
      const side = input.dataset.side;
      if (type === 'margin') {
        input.value = this._margin[side] || 0;
      } else {
        input.value = this._padding[side] || 0;
      }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        :host {
          display: block;
          font-family: var(--vb-font-family-mono);
          font-size: 10px;
        }

        .box-model {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 4px;
          user-select: none;
        }

        .layer {
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid var(--vb-border);
          border-radius: 2px;
          position: relative;
          width: 100%;
          transition: border-color 0.2s;
        }
        
        .layer:hover {
          border-color: var(--vb-border-hover);
        }

        .margin-layer {
          background: var(--vb-bg-panel);
          padding: 24px;
        }

        .padding-layer {
          background: var(--vb-bg-secondary);
          padding: 24px;
          width: 100%;
        }

        .content-layer {
          background: var(--vb-bg-active);
          border: 1px solid var(--vb-border);
          width: 100%;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vb-text-muted);
        }

        .label {
          position: absolute;
          top: 2px;
          left: 4px;
          font-size: 8px;
          color: var(--vb-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        input {
          background: transparent;
          border: none;
          color: var(--vb-accent);
          font-family: inherit;
          font-size: 11px;
          text-align: center;
          width: 30px;
          padding: 0;
          margin: 0;
          position: absolute;
          cursor: text;
        }

        input:focus {
          outline: none;
          background: var(--vb-bg-panel);
          color: var(--vb-text);
          box-shadow: 0 0 0 1px var(--vb-accent);
          border-radius: 2px;
          z-index: 10;
        }
        
        input:hover {
          background: rgba(0,0,0,0.05);
          border-radius: 2px;
        }

        /* Positioning */
        .top { top: 6px; left: 50%; transform: translateX(-50%); }
        .bottom { bottom: 6px; left: 50%; transform: translateX(-50%); }
        .left { left: 2px; top: 50%; transform: translateY(-50%); }
        .right { right: 2px; top: 50%; transform: translateY(-50%); }

      </style>

      <div class="box-model">
        <div class="layer margin-layer">
          <span class="label">margin</span>
          <input type="text" class="top" data-type="margin" data-side="top" value="${this._margin.top || 0}">
          <input type="text" class="bottom" data-type="margin" data-side="bottom" value="${this._margin.bottom || 0}">
          <input type="text" class="left" data-type="margin" data-side="left" value="${this._margin.left || 0}">
          <input type="text" class="right" data-type="margin" data-side="right" value="${this._margin.right || 0}">
          
          <div class="layer padding-layer">
            <span class="label">padding</span>
            <input type="text" class="top" data-type="padding" data-side="top" value="${this._padding.top || 0}">
            <input type="text" class="bottom" data-type="padding" data-side="bottom" value="${this._padding.bottom || 0}">
            <input type="text" class="left" data-type="padding" data-side="left" value="${this._padding.left || 0}">
            <input type="text" class="right" data-type="padding" data-side="right" value="${this._padding.right || 0}">
            
            <div class="content-layer"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('vb-box-editor', VbBoxEditor);
