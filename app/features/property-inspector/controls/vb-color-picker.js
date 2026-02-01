import { inspectorStyles } from '../property-inspector.styles.js';

export class VbColorPicker extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'show-alpha'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._value = '#000000';
    this._h = 0;
    this._s = 0;
    this._v = 0;
    this._isOpen = false;
    this._popoverElement = null;
    this._backdropElement = null;
    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleOutsideClick = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  disconnectedCallback() {
    this.removePopover();
  }

  get value() { return this.getAttribute('value') || '#000000'; }
  set value(val) { this.setAttribute('value', val); }

  setupEvents() {
    const swatch = this.shadowRoot.querySelector('.swatch');
    const hexLabel = this.shadowRoot.querySelector('.hex-label');

    const toggle = (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.togglePopover();
    };

    swatch.addEventListener('click', toggle);
    hexLabel.addEventListener('click', toggle);
    
    this._escapeHandler = (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.closePopover();
      }
    };
    document.addEventListener('keydown', this._escapeHandler);
  }

  togglePopover() {
    if (this._isOpen) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  openPopover() {
    if (this._isOpen) return;
    this._isOpen = true;
    this.createPopover();
    
    window.addEventListener('scroll', this._handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', this._handleResize, { passive: true });
    window.addEventListener('click', this._handleOutsideClick, { capture: true });
  }

  closePopover() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this.removePopover();
    
    window.removeEventListener('scroll', this._handleScroll, { capture: true });
    window.removeEventListener('resize', this._handleResize);
    window.removeEventListener('click', this._handleOutsideClick, { capture: true });
  }

  _handleOutsideClick(e) {
    const isInsideComponent = this.contains(e.target);
    const isInsidePopover = this._popoverElement && this._popoverElement.contains(e.target);
    
    if (!isInsideComponent && !isInsidePopover) {
      this.closePopover();
    }
  }

  _handleScroll() {
    if (this._isOpen) this.positionPopover();
  }

  _handleResize() {
    if (this._isOpen) this.positionPopover();
  }

  createPopover() {
    this.removePopover();

    const popover = document.createElement('div');
    popover.className = 'vb-color-popover visbug-ignore';
    popover.setAttribute('data-visbug-ignore', 'true');
    popover.setAttribute('data-visbug-ui', 'true');
    
    // Initialize HSV from current value
    const hsv = hexToHsv(this.value);
    this._h = hsv.h;
    this._s = hsv.s;
    this._v = hsv.v;

    popover.innerHTML = `
      <div class="vb-color-popover-inner">
        <div class="saturation-area">
          <div class="saturation-white">
            <div class="saturation-black"></div>
            <div class="saturation-dragger"></div>
          </div>
        </div>
        <div class="hue-slider">
          <div class="hue-dragger"></div>
        </div>
        <div class="input-row">
          <div class="hex-prefix">#</div>
          <input type="text" value="${this.value.replace('#', '')}" spellcheck="false">
        </div>
        <div class="presets">
          ${this.getPresets().map(c => `
            <div class="preset-swatch" style="background-color: ${c}" data-color="${c}" title="${c}"></div>
          `).join('')}
        </div>
      </div>
    `;

    popover.style.cssText = `
      position: fixed;
      width: 240px;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      padding: 12px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      box-sizing: border-box;
    `;

    const innerStyle = document.createElement('style');
    innerStyle.textContent = `
      .vb-color-popover-inner {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .vb-color-popover .saturation-area {
        width: 100%;
        height: 150px;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
        cursor: crosshair;
        background-color: hsl(${this._h}, 100%, 50%);
      }
      .vb-color-popover .saturation-white {
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, #fff, rgba(255,255,255,0));
      }
      .vb-color-popover .saturation-black {
        width: 100%;
        height: 100%;
        background: linear-gradient(to top, #000, rgba(0,0,0,0));
      }
      .vb-color-popover .saturation-dragger {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3);
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .vb-color-popover .hue-slider {
        width: 100%;
        height: 12px;
        position: relative;
        border-radius: 6px;
        background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
        cursor: pointer;
      }
      .vb-color-popover .hue-dragger {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 0 2px rgba(0,0,0,0.6);
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .vb-color-popover .input-row {
        display: flex;
        align-items: center;
        background: #f5f5f5;
        border: 1px solid #e5e5e5;
        border-radius: 6px;
        padding: 0 8px;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .vb-color-popover .input-row:focus-within {
        border-color: #0d99ff;
        box-shadow: 0 0 0 2px rgba(13, 153, 255, 0.2);
        background: #ffffff;
      }
      .vb-color-popover .hex-prefix {
        color: #888;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 12px;
        user-select: none;
      }
      .vb-color-popover input[type="text"] {
        flex: 1;
        background: none;
        border: none;
        color: #1a1a1a;
        padding: 8px 4px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 12px;
        outline: none;
        text-transform: uppercase;
      }
      .vb-color-popover .presets {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 6px;
        margin-top: 4px;
      }
      .vb-color-popover .preset-swatch {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid rgba(0,0,0,0.1);
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .vb-color-popover .preset-swatch:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 1;
        position: relative;
      }
    `;
    popover.appendChild(innerStyle);

    document.body.appendChild(popover);
    this._popoverElement = popover;

    requestAnimationFrame(() => {
      popover.style.opacity = '1';
      popover.style.transform = 'translateY(0)';
      this.updateVisuals();
    });

    this.positionPopover();
    this.setupPopoverEvents(popover);
  }

  setupPopoverEvents(popover) {
    const textInput = popover.querySelector('input[type="text"]');
    const presets = popover.querySelectorAll('.preset-swatch');
    const saturationArea = popover.querySelector('.saturation-area');
    const hueSlider = popover.querySelector('.hue-slider');

    // Saturation/Brightness Drag
    const handleSaturationDrag = (e) => {
      const rect = saturationArea.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      this._s = (x / rect.width) * 100;
      this._v = 100 - (y / rect.height) * 100;

      this.updateColorFromHsv();
    };

    const onSaturationMouseDown = (e) => {
      handleSaturationDrag(e);
      window.addEventListener('mousemove', onSaturationMouseMove);
      window.addEventListener('mouseup', onSaturationMouseUp);
    };

    const onSaturationMouseMove = (e) => {
      handleSaturationDrag(e);
    };

    const onSaturationMouseUp = () => {
      window.removeEventListener('mousemove', onSaturationMouseMove);
      window.removeEventListener('mouseup', onSaturationMouseUp);
    };

    saturationArea.addEventListener('mousedown', onSaturationMouseDown);

    // Hue Drag
    const handleHueDrag = (e) => {
      const rect = hueSlider.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      
      this._h = (x / rect.width) * 360;
      
      this.updateColorFromHsv();
    };

    const onHueMouseDown = (e) => {
      handleHueDrag(e);
      window.addEventListener('mousemove', onHueMouseMove);
      window.addEventListener('mouseup', onHueMouseUp);
    };

    const onHueMouseMove = (e) => {
      handleHueDrag(e);
    };

    const onHueMouseUp = () => {
      window.removeEventListener('mousemove', onHueMouseMove);
      window.removeEventListener('mouseup', onHueMouseUp);
    };

    hueSlider.addEventListener('mousedown', onHueMouseDown);

    // Text Input
    textInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        this.value = val;
        const hsv = hexToHsv(val);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
        this.updateVisuals(false);
        this.dispatchChange();
      }
    });

    textInput.addEventListener('change', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        this.value = val;
        const hsv = hexToHsv(val);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
        textInput.value = val.replace('#', '');
        this.updateVisuals();
        this.dispatchChange();
      } else {
        textInput.value = this.value.replace('#', '');
      }
    });

    // Presets
    presets.forEach(preset => {
      preset.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = e.target.dataset.color;
        this.value = color;
        const hsv = hexToHsv(color);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
        textInput.value = color.replace('#', '');
        this.updateVisuals();
        this.dispatchChange();
      });
    });

    popover.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    textInput.focus();
    textInput.select();
  }

  updateColorFromHsv() {
    const rgb = hsvToRgb(this._h, this._s, this._v);
    this.value = rgbToHex(rgb.r, rgb.g, rgb.b);
    this.updateVisuals(false);
    this.dispatchChange();
  }

  getPresets() {
    return [
      '#000000', '#FFFFFF', '#F44336', '#E91E63', 
      '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107'
    ];
  }

  positionPopover() {
    if (!this._popoverElement) return;

    const rect = this.getBoundingClientRect();
    const popoverRect = this._popoverElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 8;

    let top = rect.bottom + margin;
    let left = rect.left;

    if (top + popoverRect.height > viewportHeight - margin) {
      top = rect.top - popoverRect.height - margin;
    }

    if (left + popoverRect.width > viewportWidth - margin) {
      left = viewportWidth - popoverRect.width - margin;
    }

    if (left < margin) {
      left = margin;
    }

    if (top < margin) {
      top = margin;
    }

    this._popoverElement.style.top = `${top}px`;
    this._popoverElement.style.left = `${left}px`;
  }

  removePopover() {
    if (this._popoverElement) {
      this._popoverElement.remove();
      this._popoverElement = null;
    }
  }

  updateVisuals(updateInput = true) {
    const swatch = this.shadowRoot.querySelector('.swatch-color');
    const hexLabel = this.shadowRoot.querySelector('.hex-label');
    
    if (swatch) swatch.style.backgroundColor = this.value;
    if (hexLabel) hexLabel.textContent = this.value.toUpperCase();
    
    if (this._popoverElement) {
      const textInput = this._popoverElement.querySelector('input[type="text"]');
      const saturationArea = this._popoverElement.querySelector('.saturation-area');
      const saturationDragger = this._popoverElement.querySelector('.saturation-dragger');
      const hueDragger = this._popoverElement.querySelector('.hue-dragger');
      
      if (updateInput && textInput && textInput !== document.activeElement) {
        textInput.value = this.value.replace('#', '');
      }

      const currentRgb = hsvToRgb(this._h, this._s, this._v);
      const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
      
      if (currentHex.toLowerCase() !== this.value.toLowerCase()) {
        const hsv = hexToHsv(this.value);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
      }

      if (saturationArea) {
        saturationArea.style.backgroundColor = `hsl(${this._h}, 100%, 50%)`;
      }

      if (saturationDragger) {
        saturationDragger.style.left = `${this._s}%`;
        saturationDragger.style.top = `${100 - this._v}%`;
        saturationDragger.style.backgroundColor = this.value;
      }

      if (hueDragger) {
        hueDragger.style.left = `${(this._h / 360) * 100}%`;
        hueDragger.style.backgroundColor = `hsl(${this._h}, 100%, 50%)`;
      }
    }
  }

  dispatchChange() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
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
          position: relative;
          width: 100%;
        }

        .swatch {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: 1px solid var(--vb-border);
          cursor: pointer;
          overflow: hidden;
          background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #ccc 75%), 
                            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .swatch:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          border-color: var(--vb-accent);
        }

        .swatch:active {
          transform: scale(0.98);
        }

        .swatch-color {
          width: 100%;
          height: 100%;
          background-color: ${this.value};
        }

        .hex-label {
          font-family: var(--vb-font-family-mono);
          font-size: var(--vb-font-size-sm);
          color: var(--vb-text);
          cursor: pointer;
          user-select: none;
          padding: 4px 8px;
          border-radius: var(--vb-radius-sm);
          transition: background 0.15s, color 0.15s;
          border: 1px solid transparent;
        }
        
        .hex-label:hover {
          background: var(--vb-bg-hover);
          color: var(--vb-accent);
          border-color: var(--vb-border);
        }
      </style>

      <div class="swatch" title="Click to pick color">
        <div class="swatch-color"></div>
      </div>
      <span class="hex-label">${this.value.toUpperCase()}</span>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'value') {
      this.updateVisuals();
    }
  }
}

// Color Utils
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h, s, v) {
  h = h / 360;
  s = s / 100;
  v = v / 100;
  
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function hexToHsv(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, v: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

customElements.define('vb-color-picker', VbColorPicker);
