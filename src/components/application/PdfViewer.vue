<template>
  <v-card :loading="loading" variant="text">
    <v-toolbar class="px-4">
      <v-row align="center">
        <v-col cols="4">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <span v-bind="props">{{ $t('PDF Reader') }}</span>
            </template>
            <span>{{ $t('Click here to place a stamp') }}</span>
          </v-tooltip>
        </v-col>
  
        <v-col cols="4" class="d-flex justify-center align-center">
          <v-btn
            type="button"
            icon
            :disabled="pageNumber <= 1"
            @click="previousPage"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-menu open-on-hover>
            <template #activator="{ props }">
              <v-btn type="button" variant="text" v-bind="props"
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
          <v-btn
            type="button"
            icon
            :disabled="pageNumber >= pageCount"
            @click="nextPage"
          >
            <v-icon>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
  
        <v-col cols="4">
          <v-menu
            v-if="currentUserCanStamp"
            :close-on-content-click="false"
            open-on-hover
            location="bottom end"
            offset="8"
          >
            <template #activator="{ props }">
              <v-btn density="comfortable" class="mr-2" v-bind="props">
                <v-icon start>mdi-resize</v-icon>
                {{ $t('Stamp size') }}
              </v-btn>
            </template>
  
            <v-card min-width="260" class="pa-4" elevation="6" rounded="lg">
              <!-- Header -->
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-subtitle-2 font-weight-medium">
                  {{ $t('Stamp size') }}
                </span>
                <v-chip size="small" color="primary" variant="tonal">
                  {{ hankoScaleSlider }}
                </v-chip>
              </div>
  
              <!-- Slider -->
              <v-slider
                v-model.number="hankoScaleSlider"
                min="1"
                max="100"
                step="1"
                hide-details
                thumb-label
                color="primary"
              />
  
              <!-- Optional quick presets -->
              <div class="d-flex justify-space-between mt-3">
                <v-btn
                  size="x-small"
                  variant="text"
                  @click="hankoScaleSlider = 25"
                  >25%</v-btn
                >
                <v-btn
                  size="x-small"
                  variant="text"
                  @click="hankoScaleSlider = 50"
                  >50%</v-btn
                >
                <v-btn
                  size="x-small"
                  variant="text"
                  @click="hankoScaleSlider = 75"
                  >75%</v-btn
                >
                <v-btn
                  size="x-small"
                  variant="text"
                  @click="hankoScaleSlider = 100"
                  >100%</v-btn
                >
              </div>
            </v-card>
          </v-menu>
  
          <v-btn variant="text" @click="downloadPdf">
            <v-icon>mdi-download</v-icon>
            <span>{{ $t('Download') }}</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-toolbar>

    <div v-if="!loadError" class="pdf_container" ref="pdfContainer">
      <vue-pdf-embed
        v-if="pdfSource"
        :source="pdfSource"
        :page="pageNumber"
        @loaded="onPdfLoaded"
      />
      <div
        class="new_hanko_overlay"
        @mouseleave="hideNewHanko"
        @mousemove="updateNewHankoPosition"
        @click="pdfClicked"
      />
      <div
        v-if="currentUserCanStamp"
        :style="newHankoStyle"
        class="new_hanko"
      />
    </div>

    <div
      v-else
      class="text-error text-center pa-5 text-h6"
      v-html="loadError"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PDFDocument } from 'pdf-lib'
import VuePdfEmbed from 'vue-pdf-embed'
import type { Application, Hanko } from '@/types'
import { generateWebHankoSvg } from '@/utils/webHankos'
import api from '@/api'
import { useAuth } from '@/composables/useAuth'
import { Canvg } from 'canvg'

const props = defineProps<{
  application: Application
  selectedFileId: string
}>()

const emit = defineEmits<{
  pdf_stamped: []
  reject: []
}>()

const { t } = useI18n()
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
const shownPdf = ref<Uint8Array | undefined>(undefined)
const filename = ref<string | null>(null)
const pdfContainer = ref<HTMLElement | null>(null)
const hankoScaleSlider = ref(35)
const newHankoStyle = ref<{
  left: string
  top: string
  height: string
  width: string
  borderRadius: string
  borderWidth: string
  visibility: 'hidden' | 'visible'
}>({
  left: '0px',
  top: '0px',
  height: '0px',
  width: '0px',
  borderRadius: '0px',
  borderWidth: '0px',
  visibility: 'hidden',
})

/* -----------------------------
 * Computed
 * ----------------------------- */
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

const pdfSource = computed(() => {
  return shownPdf.value ? { data: new Uint8Array(shownPdf.value) } : null
})

/* -----------------------------
 * Lifecycle
 * ----------------------------- */

watch(
  [() => props.selectedFileId, () => props.application],
  async ([fileId]) => {
    restoreHankoSize()

    if (fileId) {
      await viewPdf(fileId)
    }
  },
  {
    immediate: true,
    deep: true,
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

  try {
    const { data, headers } = await api.get<ArrayBuffer>(
      `/applications/${route.params.application_id}/files/${fileId}`,
      { responseType: 'arraybuffer' }
    )

    const contentDisposition = headers['content-disposition']
    if (contentDisposition) {
      const raw = contentDisposition.split('=')[1]?.split(';')[0]
      if (raw) filename.value = decodeURI(raw)
    }

    await loadPdf(data)
  } catch (e) {
    console.error('Load PDF', e)
    shownPdf.value = undefined
    filename.value = null
    pageNumber.value = 1
    loadError.value = t('Failed to download file')
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
    loadError.value = t('This file cannot be opened')
  }
}

/* -----------------------------
 * Hanko rendering
 * ----------------------------- */
async function svgToPngDataUrl(svgString: string) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 1000
  canvas.height = 1500

  const v = Canvg.fromString(context!, svgString)
  await v.render()

  return canvas.toDataURL('image/png')
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
        hankos = JSON.parse(hankos) as Hanko[]
      } catch (e) {
        console.error(e)
        continue
      }
    }

    const filtered = hankos?.filter((h) => h.file_id === props.selectedFileId)
    if (!filtered.length) continue

    try {
      const svg = generateWebHankoSvg(recipient)
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
async function pdfClicked(event: PointerEvent) {
  if (!currentUserCanStamp.value) return
  if (!pdfDoc.value || !pdfContainer.value) return
  if (!confirm(t('Apply stamp here?'))) return

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
    hankos = JSON.parse(hankos) as Hanko[]
  }

  hankos.push(newHanko)
  updateHankos({ attachment_hankos: hankos })
}

/* -----------------------------
 * API actions
 * ----------------------------- */
async function approveApplication(body: { attachment_hankos: Hanko[] }) {
  try {
    await api.post(`/applications/${route.params.application_id}/approve`, body)

    emit('pdf_stamped')
  } catch (err) {
    console.error(err)
    alert(t('Error approving application'))
  }
}

async function updateHankos(body: { attachment_hankos: Hanko[] }) {
  try {
    await api.put(`/applications/${route.params.application_id}/hankos`, body)

    emit('pdf_stamped')
  } catch (err) {
    console.error(err)
    alert(t('Error updating stamps'))
  }
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

  newHankoStyle.value.left = `calc(${ex}px - ${0.5 * 0.75 * hankoHeight * 0.94}px)`
  newHankoStyle.value.top = `calc(${ey}px - ${0.5 * hankoHeight}px)`
  newHankoStyle.value.height = `${hankoHeight}px`
  newHankoStyle.value.width = `${0.75 * hankoHeight * 0.94}px`
  newHankoStyle.value.borderRadius = `${0.1 * hankoHeight}px`
  newHankoStyle.value.borderWidth = `${0.03 * hankoHeight}px`
  newHankoStyle.value.visibility = 'visible'
}

function hideNewHanko() {
  newHankoStyle.value.visibility = 'hidden'
}

/* -----------------------------
 * Download
 * ----------------------------- */
function downloadPdf() {
  if (!shownPdf.value) return

  const buffer = new Uint8Array(shownPdf.value).buffer

  const blob = new Blob([buffer], {
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
  background: #d6d6d6;
  padding: 24px 16px;
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
