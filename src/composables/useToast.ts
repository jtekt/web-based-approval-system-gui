import { ref } from 'vue'
import type { SnackbarMessage } from 'vuetify/lib/components/VSnackbarQueue/VSnackbarQueue.mjs'

type SnackbarObject = Exclude<SnackbarMessage, string>

// shared state (singleton across app)
const queue = ref<SnackbarMessage[]>([])

export function useToast() {
  function add(message: SnackbarMessage) {
    queue.value.push(message)
  }

  function success(message: string, config: Partial<SnackbarObject> = {}) {
    add({
      text: message,
      color: 'success',
      timeout: 3000,
      ...config,
    })
  }

  function error(message: string, config: Partial<SnackbarObject> = {}) {
    add({
      text: message,
      color: 'error',
      timeout: 4000,
      ...config,
    })
  }

  function info(message: string, config: Partial<SnackbarObject> = {}) {
    add({
      text: message,
      color: 'info',
      timeout: 3000,
      ...config,
    })
  }

  function warning(message: string, config: Partial<SnackbarObject> = {}) {
    add({
      text: message,
      color: 'warning',
      timeout: 3500,
      ...config,
    })
  }

  return {
    queue,
    add,
    success,
    error,
    info,
    warning,
  }
}
