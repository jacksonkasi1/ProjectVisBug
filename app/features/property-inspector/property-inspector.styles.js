export const inspectorStyles = `
  :host {
    /* Light Theme Palette */
    --vb-bg: #f5f5f5;
    --vb-bg-panel: #ffffff;
    --vb-bg-secondary: #f0f0f0;
    --vb-bg-hover: #f5f5f5;
    --vb-bg-active: #e6e6e6;
    
    --vb-border: #e5e5e5;
    --vb-border-hover: #d4d4d4;
    --vb-border-active: #0d99ff;
    
    --vb-text: #1a1a1a;
    --vb-text-muted: #666666;
    --vb-text-disabled: #a3a3a3;
    
    --vb-accent: #0d99ff;
    --vb-accent-hover: #007acc;
    --vb-accent-text: #ffffff;
    
    --vb-danger: #ff4d4f;
    --vb-success: #34c759;
    --vb-warning: #faad14;

    --vb-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    --vb-font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace;
    
    --vb-font-size-xs: 10px;
    --vb-font-size-sm: 11px;
    --vb-font-size-md: 12px;
    --vb-font-size-lg: 14px;
    
    --vb-spacing-xs: 4px;
    --vb-spacing-sm: 8px;
    --vb-spacing-md: 12px;
    --vb-spacing-lg: 16px;
    --vb-spacing-xl: 24px;
    
    --vb-radius-sm: 4px;
    --vb-radius-md: 6px;
    --vb-radius-lg: 8px;
    
    --vb-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --vb-shadow-md: 0 1px 3px rgba(0,0,0,0.1);
    --vb-shadow-lg: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    
    --vb-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    display: block;
    font-family: var(--vb-font-family);
    color: var(--vb-text);
    box-sizing: border-box;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  /* Utility Classes */
  .row {
    display: flex;
    align-items: center;
    gap: var(--vb-spacing-sm);
  }

  .col {
    display: flex;
    flex-direction: column;
    gap: var(--vb-spacing-xs);
  }

  .label {
    font-size: var(--vb-font-size-md);
    color: var(--vb-text-muted);
    font-weight: 400;
    user-select: none;
  }

  .value {
    font-size: var(--vb-font-size-sm);
    color: var(--vb-text);
  }

  .icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
    opacity: 0.8;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #d1d1d1;
    border-radius: 4px;
    border: 2px solid var(--vb-bg-panel);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #b0b0b0;
  }
  
  /* Focus styles */
  :focus-visible {
    outline: 2px solid var(--vb-accent);
    outline-offset: 1px;
  }
`;

