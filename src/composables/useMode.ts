import { env } from '@/utils/env'
import { ref, computed, watch } from 'vue'

type Mode = 'ALL' | 'PDF'

const STORAGE_KEY = 'app:mode'

// --- helpers ---
function loadStoredMode(): Mode | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'ALL' || value === 'PDF' ? value : null
}

function saveMode(mode: Mode) {
  localStorage.setItem(STORAGE_KEY, mode)
}

// --- initial state ---
const initialMode: Mode = (() => {
  if (env.VITE_PDF_ONLY) return 'PDF'

  const stored = loadStoredMode()
  if (stored) return stored

  return 'ALL'
})()

const _mode = ref<Mode>(initialMode)

// --- composable ---
export function useMode() {
  const mode = computed({
    get: () => {
      // Always respect env override at read time
      if (env.VITE_PDF_ONLY) return 'PDF'
      return _mode.value
    },
    set: (value: Mode) => {
      // Hard lock
      if (env.VITE_PDF_ONLY) {
        console.log('[mode] Change blocked: VITE_PDF_ONLY is enabled')
        return
      }

      // Toggle gate
      if (!env.VITE_PDF_TOGGLE) {
        console.log('[mode] Change blocked: VITE_PDF_TOGGLE is disabled')
        return
      }

      _mode.value = value
    },
  })

  // Persist only valid, user-controlled changes
  watch(_mode, (value) => {
    if (!env.VITE_PDF_ONLY) {
      saveMode(value)
    }
  })

  return { mode }
}