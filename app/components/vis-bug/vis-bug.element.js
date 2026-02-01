import $          from 'blingblingjs'
import hotkeys    from 'hotkeys-js'

import {
  Handles, Handle, Label, Overlay, Gridlines, Corners,
  Hotkeys, Metatip, Ally, Distance, BoxModel, Grip
} from '../'

import {
  Selectable, Moveable, Padding, Margin, EditText, Font,
  Flex, Search, ColorPicker, BoxShadow, HueShift, MetaTip,
  Guides, Screenshot, Position, Accessibility, draggable, VisBugCopy,
  ChangeTracker, PropertyInspector
} from '../../features/'

import {
  VisBugStyles,
  VisBugLightStyles,
  VisBugDarkStyles
} from '../styles.store'

import { VisBugModel }            from './model'
import * as Icons                 from './vis-bug.icons'
import { provideSelectorEngine }  from '../../features/search'
import { PluginRegistry }         from '../../plugins/_registry'
import {
  metaKey,
  isPolyfilledCE,
  constructibleStylesheetSupport,
  schemeRule
} from '../../utilities/'

export default class VisBug extends HTMLElement {
  constructor() {
    super()

    this.toolbar_model  = VisBugModel
    this.active_tool    = 'move'
    this.$shadow        = this.attachShadow({mode: 'closed'})
    this.applyScheme    = schemeRule(
      this.$shadow,
      VisBugStyles, VisBugLightStyles, VisBugDarkStyles
    )
  }

  static get observedAttributes() {
    return ['color-scheme']
  }

  connectedCallback() {
    this._tutsBaseURL = this.getAttribute('tutsBaseURL') || 'tuts'

    this.setup()

    this.selectorEngine = Selectable(this)
    this.colorPicker    = ColorPicker(this.$shadow, this.selectorEngine)
    this.visBugCopyCleanup = VisBugCopy(this.selectorEngine)

    provideSelectorEngine(this.selectorEngine)

    if (this.propertyInspector && this.propertyInspector.setSelectorEngine) {
      this.propertyInspector.setSelectorEngine(this.selectorEngine)
    }

    this.move()
  }

  disconnectedCallback() {
    this.visBugCopyCleanup && this.visBugCopyCleanup()
    this.deactivate_feature()
    this.cleanup()
    this.selectorEngine.disconnect()
    hotkeys.unbind(
      Object.keys(this.toolbar_model).reduce((events, key) =>
        events += ',' + key, ''))
    hotkeys.unbind(`${metaKey}+/`)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color-scheme')
      this.applyScheme(newValue)
  }

  setup() {
    this.$shadow.innerHTML = this.render()

    this.hasAttribute('color-mode')
      ? this.getAttribute('color-mode')
      : this.setAttribute('color-mode', 'hex')

    this.hasAttribute('color-scheme')
      ? this.getAttribute('color-scheme')
      : this.setAttribute('color-scheme', 'auto')

    this.setAttribute('popover', 'manual')
    this.showPopover && this.showPopover()

    hotkeys(`${metaKey}+z`, e => {
      e.preventDefault()
      ChangeTracker.undo()
    })
    hotkeys(`${metaKey}+shift+z`, e => {
      e.preventDefault()
      ChangeTracker.redo()
    })

    hotkeys(`${metaKey}+/,${metaKey}+.`, e => {
      // Toggle toolbar
      this.$shadow.host.style.display =
        this.$shadow.host.style.display === 'none'
          ? 'block'
          : 'none'
      
      // Also notify PropertyInspector
      if (this.propertyInspector) {
        this.propertyInspector.style.display = this.$shadow.host.style.display
      }
    })

    // Mount Property Inspector to Body (to avoid Shadow DOM transform constraints)
    this.propertyInspector = document.createElement('property-inspector')
    document.body.appendChild(this.propertyInspector)
  }

  cleanup() {
    this.propertyInspector && this.propertyInspector.remove()
    this.hidePopover && this.hidePopover()

    Array.from(document.body.children)
      .filter(node => node.nodeName.includes('VISBUG'))
      .forEach(el => el.remove())

    this.teardown()

    document.querySelectorAll('[data-pseudo-select=true]')
      .forEach(el =>
        el.removeAttribute('data-pseudo-select'))
  }

  onHistoryUpdate({detail}) {
  }

  toolSelected(el) {
    let toolName = el
    
    if (typeof el === 'string') {
      const toolEl = $(`[data-tool="${el}"]`, this.$shadow)[0]
      if (toolEl) {
        el = toolEl
        toolName = el.dataset.tool
      }
    } else if (el && el.dataset) {
      toolName = el.dataset.tool
    }

    if (this.active_tool === toolName || (this.active_tool && this.active_tool.dataset && this.active_tool.dataset.tool === toolName)) {
      return
    }

    if (this.active_tool && this.active_tool.attr) {
      this.active_tool.attr('data-active', null)
    }
    
    this.deactivate_feature && this.deactivate_feature()

    if (el && el.attr) {
      el.attr('data-active', true)
      this.active_tool = el
    } else {
      this.active_tool = toolName
    }
    
    if (this[toolName]) {
      this[toolName]()
    }
  }

  render() {
    return `
      <visbug-hotkeys></visbug-hotkeys>
    `
  }

  demoTip({key, tool, label, description, instruction}) {
    return ''
  }

  move() {
    this.active_tool = 'move'
    this.deactivate_feature = Moveable(this.selectorEngine)
  }

  margin() {
    this.deactivate_feature = Margin(this.selectorEngine)
  }

  padding() {
    this.deactivate_feature = Padding(this.selectorEngine)
  }

  font() {
    this.deactivate_feature = Font(this.selectorEngine)
  }

  text() {
    this.selectorEngine.onSelectedUpdate(EditText)
    this.deactivate_feature = () =>
      this.selectorEngine.removeSelectedCallback(EditText)
  }

  align() {
    this.deactivate_feature = Flex(this.selectorEngine)
  }

  search() {
    this.deactivate_feature = Search($('[data-tool="search"]', this.$shadow))
  }

  boxshadow() {
    this.deactivate_feature = BoxShadow(this.selectorEngine)
  }

  hueshift() {
    this.deactivate_feature = HueShift({
      Color:  this.colorPicker,
      Visbug: this.selectorEngine,
    })
  }

  inspector() {
    this.deactivate_feature = MetaTip(this.selectorEngine)
  }

  accessibility() {
    this.deactivate_feature = Accessibility(this.selectorEngine)
  }

  guides() {
    this.deactivate_feature = Guides(this.selectorEngine)
  }

  screenshot() {
    this.deactivate_feature = Screenshot()
  }

  position() {
    let feature = Position()
    this.selectorEngine.onSelectedUpdate(feature.onNodesSelected)
    this.deactivate_feature = () => {
      this.selectorEngine.removeSelectedCallback(feature.onNodesSelected)
      feature.disconnect()
    }
  }

  execCommand(command) {
    const query = `/${command}`

    if (PluginRegistry.has(query))
      return PluginRegistry.get(query)({
        selected: this.selectorEngine.selection(),
        query
      })

    return Promise.resolve(new Error("Query not found"))
  }

  get activeTool() {
    // Support both toolbar mode (active_tool element) and headless mode (active_tool string)
    if (this.active_tool && this.active_tool.dataset) {
      return this.active_tool.dataset.tool
    }
    return this.active_tool || 'move'
  }
}

customElements.define('vis-bug', VisBug)
