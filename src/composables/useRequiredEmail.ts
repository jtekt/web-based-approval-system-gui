import { ref, watch } from 'vue'

export interface RequiredEmailItem {
  applicationId: string
  createdAt: number
}

const STORAGE_KEY = 'required-emails'

const requiredEmails = ref<RequiredEmailItem[]>([])

export function useRequiredEmail() {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: RequiredEmailItem[] = JSON.parse(raw)

        // Deduplicate by applicationId
        const map = new Map<string, RequiredEmailItem>()

        for (const item of parsed) {
          // keep the latest (or first, depending on your preference)
          map.set(item.applicationId, item)
        }

        requiredEmails.value = Array.from(map.values())
      }
    } catch (e) {
      console.error('Failed to load required emails', e)
      requiredEmails.value = []
    }
  }

  watch(
    requiredEmails,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  function add(applicationId: string) {
    const exists = requiredEmails.value.some(
      (item) => item.applicationId === applicationId
    )

    if (exists) return // prevent duplicate

    requiredEmails.value.push({
      applicationId,
      createdAt: Date.now(),
    })
  }

  function remove(applicationId: string) {
    requiredEmails.value = requiredEmails.value.filter(
      (item) => item.applicationId !== applicationId
    )
  }

  load()

  return {
    requiredEmails,
    add,
    remove,
  }
}
