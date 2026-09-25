import {
  ArrowDownUp,
  CircleAlert,
  CircleHelp,
  Code,
  Columns2,
  Eye,
  Info,
  FileDown,
  FilePlus,
  FolderOpen,
  Maximize2,
  Lightbulb,
  Minimize2,
  OctagonAlert,
  PanelLeft,
  PanelRight,
  Redo2,
  Save,
  Trash,
  TriangleAlert,
  Undo2,
  X,
  type IconNode,
} from 'lucide'

const icons: Record<string, IconNode> = {
  'arrow-down-up': ArrowDownUp,
  'circle-alert': CircleAlert,
  'circle-help': CircleHelp,
  code: Code,
  'columns-2': Columns2,
  eye: Eye,
  info: Info,
  'file-down': FileDown,
  'file-plus': FilePlus,
  'folder-open': FolderOpen,
  lightbulb: Lightbulb,
  'maximize-2': Maximize2,
  'minimize-2': Minimize2,
  'octagon-alert': OctagonAlert,
  'panel-left': PanelLeft,
  'panel-right': PanelRight,
  save: Save,
  trash: Trash,
  'triangle-alert': TriangleAlert,
  'undo-2': Undo2,
  'redo-2': Redo2,
  x: X,
}

export function mountIcons(container: ParentNode): void {
  container.querySelectorAll<HTMLElement>('[data-lucide]').forEach((placeholder) => {
    const icon = icons[placeholder.dataset.lucide ?? '']
    if (!icon) return
    const svg = createIcon(icon)
    svg.classList.add(...placeholder.classList)
    placeholder.replaceWith(svg)
  })
}

function createIcon(icon: IconNode): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const attributes = {
    xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true',
  }
  Object.entries(attributes).forEach(([name, value]) => svg.setAttribute(name, value))
  icon.forEach(([tag, iconAttributes]) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(iconAttributes).forEach(([name, value]) => {
      if (value !== undefined) element.setAttribute(name, String(value))
    })
    svg.append(element)
  })
  return svg
}