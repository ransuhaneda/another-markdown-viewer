const MIN_PANE_WIDTH = 240

export function connectSplitPane(
  workspace: HTMLElement,
  handle: HTMLElement,
  isEnabled: () => boolean,
): void {
  const resize = (clientX: number): void => {
    const bounds = workspace.getBoundingClientRect()
    const availableWidth = bounds.width - handle.offsetWidth
    const minimumWidth = Math.min(MIN_PANE_WIDTH, availableWidth * 0.4)
    const editorWidth = Math.min(
      Math.max(clientX - bounds.left, minimumWidth),
      availableWidth - minimumWidth,
    )
    workspace.style.setProperty('--editor-pane-width', `${editorWidth}px`)
    handle.setAttribute('aria-valuenow', String(Math.round((editorWidth / availableWidth) * 100)))
  }

  handle.addEventListener('pointerdown', (event) => {
    if (!isEnabled()) return
    event.preventDefault()
    handle.setPointerCapture(event.pointerId)
    handle.classList.add('is-dragging')
    document.body.classList.add('is-resizing-panes')
    resize(event.clientX)
  })
  handle.addEventListener('pointermove', (event) => {
    if (handle.hasPointerCapture(event.pointerId)) resize(event.clientX)
  })
  handle.addEventListener('pointerup', (event) => {
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId)
    handle.classList.remove('is-dragging')
    document.body.classList.remove('is-resizing-panes')
  })
  handle.addEventListener('keydown', (event) => {
    if (!isEnabled() || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    resize(handle.getBoundingClientRect().left + direction * (event.shiftKey ? 50 : 10))
  })
}