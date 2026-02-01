import { inspectorStyles } from '../property-inspector.styles.js';

export class VbCollapse extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'expanded', 'icon'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  get title() { return this.getAttribute('title') || ''; }
  get expanded() { return this.hasAttribute('expanded'); }
  set expanded(val) {
    if (val) {
      this.setAttribute('expanded', '');
    } else {
      this.removeAttribute('expanded');
    }
  }

  setupEvents() {
    const header = this.shadowRoot.querySelector('.header');
    if (header) {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        this.expanded = !this.expanded;
        this.dispatchEvent(new CustomEvent('toggle', {
          detail: { expanded: this.expanded },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  render() {
    const isExpanded = this.expanded;
    
    this.shadowRoot.innerHTML = `
      <style>
        ${inspectorStyles}
        :host {
          display: block;
          border-bottom: 1px solid var(--vb-border);
        }

        .header {
          display: flex;
          align-items: center;
          padding: var(--vb-spacing-sm);
          cursor: pointer;
          user-select: none;
          background: var(--vb-bg);
          transition: background 0.2s;
        }

        .header:hover {
          background: var(--vb-bg-hover);
        }

        .chevron {
          width: 16px;
          height: 16px;
          margin-right: var(--vb-spacing-xs);
          transition: transform 0.2s ease;
          opacity: 0.7;
        }

        :host([expanded]) .chevron {
          transform: rotate(90deg);
        }

        .title {
          font-size: var(--vb-font-size-sm);
          font-weight: 600;
          flex: 1;
        }

        .content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.2s ease-out;
          background: var(--vb-bg);
        }

        :host([expanded]) .content {
          grid-template-rows: 1fr;
        }

        .inner {
          overflow: hidden;
        }
        
        .inner-padding {
          padding: var(--vb-spacing-sm);
        }
      </style>

      <div class="header">
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="title">${this.title}</span>
        ${this.getAttribute('icon') ? `<span class="icon">${this.getAttribute('icon')}</span>` : ''}
      </div>

      <div class="content">
        <div class="inner">
          <div class="inner-padding">
            <slot></slot>
          </div>
        </div>
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

customElements.define('vb-collapse', VbCollapse);
