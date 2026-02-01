import { inspectorStyles } from '../property-inspector.styles.js';

export class VbSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'step', 'value', 'unit', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  get min() { return parseFloat(this.getAttribute('min')) || 0; }
  get max() { return parseFloat(this.getAttribute('max')) || 100; }
  get step() { return parseFloat(this.getAttribute('step')) || 1; }
  get value() { return parseFloat(this.getAttribute('value')) || 0; }
  get unit() { return this.getAttribute('unit') || ''; }
  get label() { return this.getAttribute('label') || ''; }

  set value(val) {
    this.setAttribute('value', val);
    this.updateVisuals();
  }

  setupEvents() {
    const range = this.shadowRoot.querySelector('input[type="range"]');
    const numberInput = this.shadowRoot.querySelector('input[type="number"]');

    range.addEventListener('input', (e) => {
      this.value = e.target.value;
      this.dispatchChange();
    });

    numberInput.addEventListener('input', (e) => {
      this.value = e.target.value;
      this.dispatchChange();
    });
    
    this.updateVisuals();
  }

  updateVisuals() {
    const range = this.shadowRoot.querySelector('input[type="range"]');
    const numberInput = this.shadowRoot.querySelector('input[type="number"]');
    
    if (range && numberInput) {
      range.value = this.value;
      numberInput.value = this.value;
      
      const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
      range.style.setProperty('--track-fill', `${percent}%`);
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
        }

        .slider-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: var(--vb-bg-secondary);
          border-radius: 2px;
          outline: none;
          margin: 0;
          cursor: pointer;
          position: relative;
        }

        /* Track Fill Hack */
        input[type="range"]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: var(--track-fill, 0%);
          background: var(--vb-accent);
          border-radius: 2px;
          pointer-events: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--vb-bg-panel);
          border: 2px solid var(--vb-accent);
          border-radius: 50%;
          cursor: grab;
          transition: transform 0.1s;
          box-shadow: var(--vb-shadow-sm);
          position: relative;
          z-index: 2;
          margin-top: -4px; /* Center thumb on 4px track */
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: var(--vb-bg-panel);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }

        .value-container {
          display: flex;
          align-items: center;
          background: var(--vb-bg-panel);
          border: 1px solid var(--vb-border);
          border-radius: var(--vb-radius-sm);
          width: 56px;
          flex-shrink: 0;
          position: relative;
          transition: border-color 0.2s;
        }

        .value-container:hover {
          border-color: var(--vb-border-hover);
        }

        .value-container:focus-within {
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
          text-align: right;
          padding: 4px 2px 4px 4px;
          -moz-appearance: textfield;
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
          padding-right: 4px;
          user-select: none;
        }
      </style>

      ${this.label ? `<span class="label" title="${this.label}">${this.label}</span>` : ''}
      
      <div class="slider-container">
        <input type="range" 
          min="${this.min}" 
          max="${this.max}" 
          step="${this.step}" 
          value="${this.value}">
      </div>

      <div class="value-container">
        <input type="number" 
          value="${this.value}"
          min="${this.min}"
          max="${this.max}"
          step="${this.step}">
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

customElements.define('vb-slider', VbSlider);
