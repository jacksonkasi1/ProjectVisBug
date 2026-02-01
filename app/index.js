import VisBug from './components/vis-bug/vis-bug.element'
import { metaKey } from './utilities'
// import './lib/react-grab.js' // Loaded separately to avoid build issues
// import './lib/react-grab.css' // Loaded separately

if ('ontouchstart' in document.documentElement)
  document.getElementById('mobile-info').style.display = ''

if (metaKey === 'ctrl')
  [...document.querySelectorAll('kbd')]
    .forEach(node => {
      node.textContent = node.textContent.replace('cmd','ctrl')
      node.textContent = node.textContent.replace('opt','alt')
    })
