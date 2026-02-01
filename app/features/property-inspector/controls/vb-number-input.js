import { inspectorStyles } from '../property-inspector.styles.js';

export class VbNumberInput extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'step', 'value', 'unit', 'label', 'placeholder'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  get min() { return this.hasAttribute('min') ? parseFloat(this.getAttribute('min')) : null; }
  get max() { return this.hasAttribute('max') ? parseFloat(this.getAttribute('max')) : null; }
  get step() { return parseFloat(this.getAttribute('step')) || 1; }
  get value() { return parseFloat(this.getAttribute('value')) || 0; }
  get unit() { return this.getAttribute('unit') || ''; }
  get label() { return this.getAttribute('label') || ''; }
  get placeholder() { return this.getAttribute('placeholder') || ''; }

  set value(val) {
    this.setAttribute('value', val);
    this.updateVisuals();
  }

  setupEvents() {
    const numberInput = this.shadowRoot.querySelector('input[type="number"]');
    
    if (!numberInput) return;

    numberInput.addEventListener('input', (e) => {
      this.value = e.target.value;
      this.dispatchChange();
    });

    numberInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.increment();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.decrement();
      }
    });
    
    this.updateVisuals();
  }

  increment() {
    const newVal = this.value + this.step;
    if (this.max !== null && newVal > this.max) return;
    this.value = newVal;
    this.dispatchChange();
  }

  decrement() {
    const newVal = this.value - this.step;
    if (this.min !== null && newVal < this.min) return;
    this.value = newVal;
    this.dispatchChange();
  }

  updateVisuals() {
    const numberInput = this.shadowRoot.querySelector('input[type="number"]');
    if (numberInput && numberInput.value != this.value) {
      numberInput.value = this.value;
    }
  }

  dispatchChange() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value, unit: this.unit },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        :host {
          display: flex;
          align-items: center;
          gap: var(--vb-spacing-sm);
          width: 100%;
          height: 28px;
        }

        .label {
          width: 60px;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: var(--vb-font-size-md);
          color: var(--vb-text-muted);
        }

        .input-container {
          flex: 1;
          display: flex;
          align-items: center;
          background: var(--vb-bg-panel);
          border: 1px solid var(--vb-border);
          border-radius: var(--vb-radius-sm);
          height: 100%;
          position: relative;
          transition: border-color 0.2s;
        }

        .input-container:hover {
          border-color: var(--vb-border-hover);
        }

        .input-container:focus-within {
          border-color: var(--vb-accent);
          box-shadow: 0 0 0 1px var(--vb-accent);
        }

        input[type="number"] {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--vb-text);
          font-family: var(--vb-font-family-mono);
          font-size: var(--vb-font-size-sm);
          padding: 4px 8px;
          -moz-appearance: textfield;
          height: 100%;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"]:focus {
          outline: none;
        }

        .unit {
          font-size: var(--vb-font-size-xs);
          color: var(--vb-text-muted);
          padding-right: 8px;
          user-select: none;
          border-left: 1px solid transparent;
          height: 16px;
          display: flex;
          align-items: center;
        }
      </style>

      ${this.label ? `<span class="label" title="${this.label}">${this.label}</span>` : ''}
      
      <div class="input-container">
        <input type="number" 
          value="${this.value}"
          ${this.min !== null ? `min="${this.min}"` : ''}
          ${this.max !== null ? `max="${this.max}"` : ''}
          step="${this.step}"
          placeholder="${this.placeholder}">
        ${this.unit ? `<span class="unit">${this.unit}</span>` : ''}
      </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'value') {
      this.updateVisuals();
    } else {
      this.render();
      this.setupEvents();
      this.updateVisuals();
    }
  }
}

customElements.define('vb-number-input', VbNumberInput);
