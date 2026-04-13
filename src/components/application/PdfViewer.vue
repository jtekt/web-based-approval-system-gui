<template>
  <v-card variant="outlined" :loading="loading">
    <v-toolbar flat>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <span v-bind="props">PDF Reader</span>
        </template>
        <span>ハンコを押したい所をクリックしてください</span>
      </v-tooltip>

      <v-spacer />

      <v-btn icon :disabled="pageNumber <= 1" @click="previousPage">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-menu open-on-hover>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props"
            >{{ pageNumber }}/{{ pageCount }}</v-btn
          >
        </template>
        <v-list>
          <v-list-item
            v-for="p in pageCount"
            :key="p"
            :title="String(p)"
            @click="pageNumber = p"
          />
        </v-list>
      </v-menu>
      <v-btn icon :disabled="pageNumber >= pageCount" @click="nextPage">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>

      <v-spacer />

      <v-menu
        v-if="currentUserCanStamp"
        :close-on-content-click="false"
        open-on-hover
      >
        <template #activator="{ props }">
          <v-btn variant="text" class="mr-2" v-bind="props">
            <v-icon>mdi-resize</v-icon>
            <span>{{ $t('Stamp size') }}</span>
          </v-btn>
        </template>
        <v-card>
          <v-sheet class="pt-16 px-5">
            <v-slider
              v-model.number="hankoScaleSlider"
              min="1"
              max="100"
              step="2"
              thumb-label="always"
            />
          </v-sheet>
        </v-card>
      </v-menu>

      <v-btn variant="text" @click="downloadPdf">
        <v-icon>mdi-download</v-icon>
        <span>{{ $t('Download') }}</span>
      </v-btn>
    </v-toolbar>
    <v-divider />

    <div
      v-if="shownPdf"
      class="pdf_container"
      ref="pdfContainer"
      @click="pdfClicked"
    >
      <vue-pdf-embed
        :source="{ data: shownPdf }"
        :page="pageNumber"
        @loaded="onPdfLoaded"
      />
      <div
        class="new_hanko_overlay"
        @mouseleave="hideNewHanko"
        @mousemove="updateNewHankoPosition"
      />
      <div
        v-if="currentUserCanStamp"
        :style="newHankoStyle"
        class="new_hanko"
      />
    </div>

    <div
      v-if="loadError"
      class="text-error text-center pa-5 text-h6"
      v-html="loadError"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PDFDocument } from 'pdf-lib'
import VuePdfEmbed from 'vue-pdf-embed'
import type { Application, Recipient, Hanko } from '@/types'
import { generateWebHankoSvg } from '@/utils/webHankos'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  application: Application
  selectedFileId: string
}>()

const emit = defineEmits<{
  pdf_stamped: []
  reject: []
}>()

const { currentUser } = useAuth()
const route = useRoute()

/* -----------------------------
 * Core state
 * ----------------------------- */
const loading = ref(false)
const loadError = ref<string | null>(null)
const pageNumber = ref(1)
const pageCount = ref(1)
const pdfDoc = ref<PDFDocument | null>(null)
const shownPdf = ref<Uint8Array | null>(null)
const filename = ref<string | null>(null)
const pdfContainer = ref<HTMLElement | null>(null)
const hankoScaleSlider = ref(35)
const newHankoStyle = ref<Record<string, string>>({
  visibility: 'hidden',
})

/* -----------------------------
 * Computed
 * ----------------------------- */
const applicationId = computed(() => route.params.application_id as string)

const userAsRecipient = computed(() => {
  if (!currentUser.value) return null
  return (
    props.application.recipients.find(
      (r) => r?._id === currentUser.value?._id
    ) ?? null
  )
})

const currentRecipient = computed(() => {
  return (
    props.application.recipients.find((r) => !r.approval && !r.refusal) ?? null
  )
})

const applicationHasRefusal = computed(() =>
  props.application.recipients.some((r) => r.refusal)
)

const currentUserCanStamp = computed(() => {
  if (!userAsRecipient.value) return false
  if (applicationHasRefusal.value) return false

  const currentFlowIndex = currentRecipient.value
    ? currentRecipient.value.submission.flow_index
    : props.application.recipients.length

  return userAsRecipient.value.submission.flow_index <= currentFlowIndex
})

const hankoScale = computed(() => hankoScaleSlider.value / 1000)

/* -----------------------------
 * Lifecycle
 * ----------------------------- */
onMounted(() => {
  restoreHankoSize()
  if (props.selectedFileId) viewPdf(props.selectedFileId)
})

watch(
  () => props.selectedFileId,
  (id) => {
    if (id) viewPdf(id)
  }
)

/* -----------------------------
 * Hanko size persistence
 * ----------------------------- */
function restoreHankoSize() {
  const saved = localStorage.getItem('hanko_size')
  if (saved) hankoScaleSlider.value = Number(saved)
}

function saveHankoSize() {
  localStorage.setItem('hanko_size', String(hankoScaleSlider.value))
}

/* -----------------------------
 * Pagination
 * ----------------------------- */
function nextPage() {
  if (pageNumber.value < pageCount.value) pageNumber.value++
}

function previousPage() {
  if (pageNumber.value > 1) pageNumber.value--
}

function onPdfLoaded(pdf: { numPages: number }) {
  pageCount.value = pdf.numPages
}

/* -----------------------------
 * PDF loading
 * ----------------------------- */
async function viewPdf(fileId: string) {
  loading.value = true
  shownPdf.value = null
  filename.value = null
  pageNumber.value = 1

  try {
    const { data, headers } = await api.get<ArrayBuffer>(
      `/applications/${applicationId.value}/files/${fileId}`,
      { responseType: 'arraybuffer' }
    )

    const contentDisposition = headers['content-disposition']
    if (contentDisposition) {
      const raw = contentDisposition.split('=')[1]?.split(';')[0]
      if (raw) filename.value = decodeURI(raw)
    }

    await loadPdf(data)
  } catch {
    loadError.value = 'Failed to download file from server'
  } finally {
    loading.value = false
  }
}

async function loadPdf(buffer: ArrayBuffer) {
  loadError.value = null
  try {
    pdfDoc.value = await PDFDocument.load(buffer)
    await loadPdfHankos()
  } catch {
    loadError.value = 'This file cannot be opened'
  }
}

/* -----------------------------
 * Hanko rendering
 * ----------------------------- */
function svgToPngDataUrl(svgString: string): Promise<string> {
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1000
      canvas.height = 1500
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.src = url
  })
}

async function loadPdfHankos() {
  if (!pdfDoc.value) return
  const pages = pdfDoc.value.getPages()

  const recipientsWithApprovals = props.application.recipients.filter(
    (r) => !!r.approval
  )

  for (const recipient of recipientsWithApprovals) {
    let hankos = recipient.approval?.attachment_hankos
    if (!hankos) continue

    if (typeof hankos === 'string') {
      try {
        hankos = JSON.parse(hankos)
      } catch {
        continue
      }
    }

    const filtered = hankos?.filter(
      (h: Hanko) => h.file_id === props.selectedFileId
    )
    if (!filtered.length) continue

    try {
      const svg = generateWebHankoSvg(recipient as Recipient)
      const pngUrl = await svgToPngDataUrl(svg)
      const base64 = pngUrl.split(',')[1]
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))

      const png = await pdfDoc.value.embedPng(bytes)

      for (const h of filtered) {
        const page = pages[h.page_number]
        if (!page) continue

        const scale = h.scale ?? hankoScale.value
        const dims = png.scale(scale)

        page.drawImage(png, {
          x: h.position.x - dims.width / 2,
          y: h.position.y - dims.height / 2,
          width: dims.width,
          height: dims.height,
        })
      }
    } catch (e) {
      console.error('Failed to draw hanko:', e)
    }
  }

  shownPdf.value = await pdfDoc.value.save()
}

/* -----------------------------
 * Click → stamp
 * ----------------------------- */
async function pdfClicked(event: MouseEvent) {
  if (!currentUserCanStamp.value) return
  if (!pdfDoc.value || !pdfContainer.value) return
  if (!confirm('Apply Hanko here?')) return

  saveHankoSize()

  const page = pdfDoc.value.getPages()[pageNumber.value - 1]
  const { width, height } = page.getSize()

  const wrapperWidth = pdfContainer.value.offsetWidth
  const wrapperHeight = pdfContainer.value.offsetHeight

  const posX = width * (event.offsetX / wrapperWidth)
  const posY = height - height * (event.offsetY / wrapperHeight)

  const newHanko: Hanko = {
    file_id: props.selectedFileId,
    page_number: pageNumber.value - 1,
    position: { x: posX, y: posY },
    scale: hankoScale.value,
    date: new Date().toISOString(),
  }

  const approval = userAsRecipient.value?.approval

  if (!approval) {
    approveApplication({ attachment_hankos: [newHanko] })
    return
  }

  let hankos = approval.attachment_hankos ?? []
  if (typeof hankos === 'string') {
    hankos = JSON.parse(hankos)
  }

  hankos.push(newHanko)
  updateHankos({ attachment_hankos: hankos })
}

/* -----------------------------
 * API actions
 * ----------------------------- */
function approveApplication(body: { attachment_hankos: Hanko[] }) {
  api
    .post(`/applications/${applicationId.value}/approve`, body)
    .then(() => emit('pdf_stamped'))
    .catch((err) => {
      console.error(err)
      alert('Error approving application')
    })
}

function updateHankos(body: { attachment_hankos: Hanko[] }) {
  api
    .put(`/applications/${applicationId.value}/hankos`, body)
    .then(() => emit('pdf_stamped'))
    .catch((err) => {
      console.error(err)
      alert('Error updating hankos')
    })
}

/* -----------------------------
 * Hover preview
 * ----------------------------- */
function updateNewHankoPosition(event: MouseEvent) {
  if (!pdfDoc.value || !pdfContainer.value) return

  const page = pdfDoc.value.getPages()[pageNumber.value - 1]
  const { height } = page.getSize()

  const wrapperHeight = pdfContainer.value.offsetHeight
  const hankoHeight = (1500 * hankoScale.value * wrapperHeight) / height

  const ex = event.offsetX
  const ey = event.offsetY

  newHankoStyle.value = {
    left: `calc(${ex}px - ${0.5 * 0.75 * hankoHeight * 0.94}px)`,
    top: `calc(${ey}px - ${0.5 * hankoHeight}px)`,
    height: `${hankoHeight}px`,
    width: `${0.75 * hankoHeight * 0.94}px`,
    borderRadius: `${0.1 * hankoHeight}px`,
    borderWidth: `${0.03 * hankoHeight}px`,
  }
}

function hideNewHanko() {
  newHankoStyle.value = { visibility: 'hidden' }
}

/* -----------------------------
 * Download
 * ----------------------------- */
function downloadPdf() {
  if (!shownPdf.value) return

  const blob = new Blob([shownPdf.value], {
    type: 'application/pdf',
  })

  const name = filename.value ?? `${props.selectedFileId}.pdf`

  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
}
</script>
<style scoped>
.pdf_container {
  position: relative;
}

.new_hanko {
  position: absolute;
  z-index: 2;
  border: 3px solid #c00000;
}

.new_hanko_overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  cursor: pointer;
}
</style>
