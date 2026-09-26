import type { DocumentState, ViewMode, WorkspaceLayout } from '../state/document-state'

export type RecoveryState = DocumentState
type StoredRecoveryState = Omit<RecoveryState, 'mode'> & { mode: ViewMode | 'live-preview' }

export const RECOVERY_KEY = 'markdown-preview:recovery'

export function readRecovery(storage: Storage = localStorage): RecoveryState | null {
  try {
    const value = storage.getItem(RECOVERY_KEY)
    if (!value) return null
    const parsed: unknown = JSON.parse(value)
    if (!isRecoveryState(parsed)) return null
    const { mode, ...state } = parsed
    return { ...state, mode: mode === 'live-preview' ? 'source' : mode }
  } catch {
    return null
  }
}

export function writeRecovery(state: RecoveryState, storage: Storage = localStorage): boolean {
  try {
    storage.setItem(RECOVERY_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearRecovery(storage: Storage = localStorage): void {
  try {
    storage.removeItem(RECOVERY_KEY)
  } catch {
    // Continue editing in memory when storage is unavailable.
  }
}

function isRecoveryState(value: unknown): value is StoredRecoveryState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StoredRecoveryState>
  return typeof candidate.markdown === 'string'
    && isViewMode(candidate.mode)
    && isWorkspaceLayout(candidate.layout)
    && isNonNegativeInteger(candidate.cursorPosition)
    && isNonNegativeNumber(candidate.editorScrollTop)
    && isNonNegativeNumber(candidate.previewScrollTop)
    && typeof candidate.updatedAt === 'number'
}

function isViewMode(value: unknown): value is ViewMode {
  return value === 'live-preview' || value === 'source' || value === 'preview'
}

function isWorkspaceLayout(value: unknown): value is WorkspaceLayout {
  return value === 'editor' || value === 'split' || value === 'preview'
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}
