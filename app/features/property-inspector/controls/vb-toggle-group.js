import { inspectorStyles } from '../property-inspector.styles.js';

export class VbToggleGroup extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._options = [];
  }

  connectedCallback() {
    this.render();
  }

  get value() { return this.getAttribute('value'); }
  set value(val) { 
    this.setAttribute('value', val);
    this.render();
  }

  get options() { return this._options; }
  set options(val) {
    this._options = val;
    this.render();
  }

  selectOption(val) {
    this.value = val;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: val },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        :host {
          display: inline-flex;
          background: var(--vb-bg-secondary);
          border-radius: var(--vb-radius-sm);
          padding: 2px;
          gap: 2px;
          border: 1px solid var(--vb-border);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--vb-text-muted);
          border-radius: var(--vb-radius-sm);
          cursor: pointer;
          font-family: inherit;
          font-size: var(--vb-font-size-sm);
          transition: all 0.1s ease;
          min-width: 28px;
          height: 24px;
        }

        .toggle-btn:hover {
          color: var(--vb-text);
          background: var(--vb-bg-hover);
        }

        .toggle-btn.active {
          background: var(--vb-bg-panel);
          color: var(--vb-accent);
          border-color: var(--vb-border);
          box-shadow: var(--vb-shadow-sm);
          font-weight: 500;
        }

        .toggle-btn svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
        }
      </style>

      ${this._options.map(opt => `
        <button 
          class="toggle-btn ${opt.value === this.value ? 'active' : ''}" 
          title="${opt.label || opt.value}"
          onclick="this.getRootNode().host.selectOption('${opt.value}')"
        >
          ${opt.icon ? opt.icon : (opt.label || opt.value)}
        </button>
      `).join('')}
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
}

customElements.define('vb-toggle-group', VbToggleGroup);
