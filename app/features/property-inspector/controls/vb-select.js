import { inspectorStyles } from '../property-inspector.styles.js';

export class VbSelect extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'placeholder'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._options = [];
    this._isOpen = false;
    this._dropdownElement = null;
    this._backdropElement = null;
    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  disconnectedCallback() {
    this.removeDropdown();
  }

  get value() { return this.getAttribute('value') || ''; }
  set value(val) { this.setAttribute('value', val); }
  
  get options() { return this._options; }
  set options(val) { 
    this._options = val;
    this.render();
    this.setupEvents();
  }

  setupEvents() {
    const trigger = this.shadowRoot.querySelector('.trigger');
    
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    this._escapeHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.closeDropdown();
      }
    };
    document.addEventListener('keydown', this._escapeHandler);
  }

  toggleDropdown() {
    if (this._isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    if (this._isOpen) return;
    this._isOpen = true;
    this.createDropdown();
    
    const trigger = this.shadowRoot.querySelector('.trigger');
    if (trigger) trigger.classList.add('active');
    
    window.addEventListener('scroll', this._handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', this._handleResize, { passive: true });
    document.addEventListener('click', this._handleDocumentClick);
  }

  closeDropdown() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this.removeDropdown();
    
    const trigger = this.shadowRoot.querySelector('.trigger');
    if (trigger) trigger.classList.remove('active');
    
    window.removeEventListener('scroll', this._handleScroll, { capture: true });
    window.removeEventListener('resize', this._handleResize);
    document.removeEventListener('click', this._handleDocumentClick);
  }

  _handleDocumentClick(e) {
    if (!this._isOpen) return;
    
    const path = e.composedPath();
    const isInside = path.includes(this) || (this._dropdownElement && path.includes(this._dropdownElement));
    
    if (!isInside) {
      this.closeDropdown();
    }
  }

  _handleScroll() {
    if (this._isOpen) this.positionDropdown();
  }

  _handleResize() {
    if (this._isOpen) this.positionDropdown();
  }

  createDropdown() {
    this.removeDropdown();

    const dropdown = document.createElement('div');
    dropdown.className = 'vb-select-dropdown visbug-ignore';
    dropdown.setAttribute('data-visbug-ignore', 'true');
    dropdown.setAttribute('data-visbug-ui', 'true');
    
    dropdown.innerHTML = `
      <div class="vb-select-options">
        ${this._options.map(opt => `
          <div class="option ${opt.value === this.value ? 'selected' : ''}" data-value="${opt.value}">
            ${opt.label}
            ${opt.value === this.value ? `
              <svg class="check" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    dropdown.style.cssText = `
      position: fixed;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-y: auto;
      max-height: 240px;
      min-width: 120px;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.1s ease, transform 0.1s ease;
      box-sizing: border-box;
    `;

    const innerStyle = document.createElement('style');
    innerStyle.textContent = `
      .vb-select-options {
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .vb-select-dropdown .option {
        padding: 6px 8px;
        font-size: 12px;
        color: #1a1a1a;
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background 0.1s;
      }
      .vb-select-dropdown .option:hover {
        background: #f5f5f5;
        color: #0d99ff;
      }
      .vb-select-dropdown .option.selected {
        background: #f0f9ff;
        color: #0d99ff;
        font-weight: 500;
      }
      .vb-select-dropdown .check {
        width: 12px;
        height: 12px;
        margin-left: 8px;
        opacity: 0.8;
      }
    `;
    dropdown.appendChild(innerStyle);

    document.body.appendChild(dropdown);
    this._dropdownElement = dropdown;

    requestAnimationFrame(() => {
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'translateY(0)';
    });

    this.positionDropdown();

    dropdown.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(opt.dataset.value);
      });
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  positionDropdown() {
    if (!this._dropdownElement) return;

    const rect = this.getBoundingClientRect();
    const trigger = this.shadowRoot.querySelector('.trigger');
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownRect = this._dropdownElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 4;

    let top = triggerRect.bottom + margin;
    let left = triggerRect.left;
    let width = triggerRect.width;

    if (width < 140) width = 140; 
    this._dropdownElement.style.width = `${width}px`;

    if (top + dropdownRect.height > viewportHeight - margin) {
      top = triggerRect.top - dropdownRect.height - margin;
    }

    if (left + width > viewportWidth - margin) {
      left = viewportWidth - width - margin;
    }

    if (left < margin) {
      left = margin;
    }

    this._dropdownElement.style.top = `${top}px`;
    this._dropdownElement.style.left = `${left}px`;
  }

  removeDropdown() {
    if (this._dropdownElement) {
      this._dropdownElement.remove();
      this._dropdownElement = null;
    }
  }

  selectOption(value) {
    this.value = value;
    this.closeDropdown();
    this.render(); 
    this.setupEvents();
    this.dispatchChange();
  }

  dispatchChange() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const selectedOption = this._options.find(o => o.value === this.value);
    const displayLabel = selectedOption ? selectedOption.label : (this.getAttribute('placeholder') || 'Select...');

    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        :host {
          display: block;
          position: relative;
          width: 100%;
        }

        .trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 4px 8px;
          background: var(--vb-bg-panel);
          border: 1px solid var(--vb-border);
          border-radius: var(--vb-radius-sm);
          color: var(--vb-text);
          font-size: var(--vb-font-size-sm);
          cursor: pointer;
          user-select: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          height: 28px;
        }

        .trigger:hover {
          border-color: var(--vb-border-hover);
        }

        .trigger:focus, .trigger.active {
          outline: none;
          border-color: var(--vb-accent);
          box-shadow: 0 0 0 1px var(--vb-accent);
        }

        .arrow {
          width: 8px;
          height: 8px;
          opacity: 0.5;
          transition: transform 0.2s;
        }
        
        .trigger.active .arrow {
          transform: rotate(180deg);
        }
      </style>

      ${this.getAttribute('label') ? `<div class="label" style="margin-bottom:4px;">${this.getAttribute('label')}</div>` : ''}
      
      <div class="trigger" tabindex="0">
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayLabel}</span>
        <svg class="arrow" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.setupEvents();
    }
  }
}

customElements.define('vb-select', VbSelect);
