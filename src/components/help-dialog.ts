export function connectHelpDialog(dialog: HTMLDialogElement, trigger: HTMLButtonElement): () => void {
  const open = (): void => dialog.showModal()
  const restoreFocus = (): void => trigger.focus()
  const closeFromBackdrop = (event: MouseEvent): void => {
    if (event.target === dialog) dialog.close()
  }
  const handleWindowKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && dialog.open) dialog.close()
  }
  const trapFocus = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !dialog.open) return
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  trigger.addEventListener('click', open)
  dialog.addEventListener('close', restoreFocus)
  dialog.addEventListener('click', closeFromBackdrop)
  dialog.addEventListener('keydown', trapFocus)
  window.addEventListener('keydown', handleWindowKeydown)

  return () => window.removeEventListener('keydown', handleWindowKeydown)
}