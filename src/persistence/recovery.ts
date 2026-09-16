export interface RecoveryState {
  markdown: string
  mode: 'live-preview' | 'source' | 'preview'
  updatedAt: number
}

export const RECOVERY_KEY = 'markdown-preview:recovery'

export function readRecovery(storage: Storage = localStorage): RecoveryState | null {
  try {
    const value = storage.getItem(RECOVERY_KEY)
    if (!value) return null
    const parsed: unknown = JSON.parse(value)
    if (!isRecoveryState(parsed)) return null
    return parsed
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

function isRecoveryState(value: unknown): value is RecoveryState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<RecoveryState>
  return typeof candidate.markdown === 'string'
    && (candidate.mode === 'live-preview' || candidate.mode === 'source' || candidate.mode === 'preview')
    && typeof candidate.updatedAt === 'number'
}
