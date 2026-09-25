<template>
  <v-card :loading="loading" variant="text">
    <v-toolbar class="px-4">
      <v-row align="center">
        <v-col cols="auto">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <span v-bind="props">{{ $t('PDF Reader') }}</span>
            </template>
            <span>{{ $t('Click here to place a stamp') }}</span>
          </v-tooltip>
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <v-btn
            type="button"
            icon="mdi-arrow-left"
            :disabled="pageNumber <= 1"
            @click="previousPage"
          />
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
            icon="mdi-arrow-right"
            :disabled="pageNumber >= pageCount"
            @click="nextPage"
          />
        </v-col>

        <v-spacer />

        <v-col cols="auto">
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
                :min="MIN_HANKO_SIZE"
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
        </v-col>
        <v-col cols="auto">
          <v-btn
            variant="text"
            @click="downloadPdf"
            prepend-icon="mdi-download"
            :text="$t('Download')"
          />
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
import { PDFDocument, degrees, type PDFPage } from 'pdf-lib'
import VuePdfEmbed from 'vue-pdf-embed'
import type { Application, Hanko } from '@/types'
import { generateWebHankoSvg } from '@/utils/webHankos'
import api from '@/api'
import { useAuth } from '@jtekt/vuetify-auth'
import { Canvg } from 'canvg'
import { useConfirm, useToast } from '@jtekt/vue-feedback-kit'

const props = defineProps<{
  application: Application
  selectedFileId: string
}>()

const emit = defineEmits<{
  pdf_stamped: []
  reject: []
}>()

const { t } = useI18n()
const { session } = useAuth()
const route = useRoute()
const toast = useToast()
const confirm = useConfirm()

const MIN_HANKO_SIZE = 25

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
  if (!session.value) return null
  return (
    props.application.recipients.find(
      (r) => r?._id === session.value?.user?.id
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

// The pdf.js worker runs from a blob: URL and fetches these itself, so a
// relative URL cannot be resolved there: make them absolute
const pdfjsAssetUrl = (dir: string) =>
  new URL(`${import.meta.env.BASE_URL}pdfjs/${dir}/`, window.location.href).href

const pdfSource = computed(() => {
  if (!shownPdf.value) return null
  // Without CMaps, pdf.js renders no text for non-embedded (e.g. Japanese) fonts
  return {
    data: new Uint8Array(shownPdf.value),
    cMapUrl: pdfjsAssetUrl('cmaps'),
    cMapPacked: true,
    standardFontDataUrl: pdfjsAssetUrl('standard_fonts'),
  }
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

        // Counter-rotate by the page's /Rotate so the hanko appears upright.
        // drawImage rotates around the image's corner: offset it so the
        // hanko stays centred on its position.
        const { rotation } = pageGeometry(page)
        const angle = (rotation * Math.PI) / 180
        const halfW = dims.width / 2
        const halfH = dims.height / 2

        page.drawImage(png, {
          x: h.position.x - (halfW * Math.cos(angle) - halfH * Math.sin(angle)),
          y: h.position.y - (halfW * Math.sin(angle) + halfH * Math.cos(angle)),
          width: dims.width,
          height: dims.height,
          rotate: degrees(rotation),
        })
      }
    } catch (e) {
      console.error('Failed to draw hanko:', e)
    }
  }

  shownPdf.value = await pdfDoc.value.save()
}

/* -----------------------------
 * Page geometry
 *
 * pdf.js shows each page cropped to its CropBox and rotated by its /Rotate.
 * Hanko positions are stored in PDF user space, so clicks are converted.
 * ----------------------------- */
function pageGeometry(page: PDFPage) {
  const box = page.getCropBox()
  const rotation = ((page.getRotation().angle % 360) + 360) % 360
  const sideways = rotation % 180 !== 0
  return {
    box,
    rotation,
    displayWidth: sideways ? box.height : box.width,
  }
}

// u, v: fractions of the displayed page's width and height from its top left
function displayToPdf(page: PDFPage, u: number, v: number) {
  const { box, rotation } = pageGeometry(page)
  const { x, y, width, height } = box
  switch (rotation) {
    case 90:
      return { x: x + v * width, y: y + u * height }
    case 180:
      return { x: x + (1 - u) * width, y: y + v * height }
    case 270:
      return { x: x + (1 - v) * width, y: y + (1 - u) * height }
    default:
      return { x: x + u * width, y: y + (1 - v) * height }
  }
}

function pageCanvas() {
  return pdfContainer.value?.querySelector('canvas') ?? null
}

function clickOnPage(event: MouseEvent) {
  const canvas = pageCanvas()
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const u = (event.clientX - rect.left) / rect.width
  const v = (event.clientY - rect.top) / rect.height
  if (u < 0 || u > 1 || v < 0 || v > 1) return null
  return { u, v }
}

/* -----------------------------
 * Click → stamp
 * ----------------------------- */
async function pdfClicked(event: PointerEvent) {
  if (!currentUserCanStamp.value) return
  if (!pdfDoc.value || !pdfContainer.value) return

  if (hankoScale.value < MIN_HANKO_SIZE / 1000) {
    toast.error(t('Hanko size too small'))
    return
  }

  // Ignore clicks on the padding around the page
  const click = clickOnPage(event)
  if (!click) return

  const ok = await confirm(t('Apply stamp here?'))
  if (!ok) return

  saveHankoSize()

  const page = pdfDoc.value.getPages()[pageNumber.value - 1]

  const newHanko: Hanko = {
    file_id: props.selectedFileId,
    page_number: pageNumber.value - 1,
    position: displayToPdf(page, click.u, click.v),
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
    toast.error(t('Error approving application'))
  }
}

async function updateHankos(body: { attachment_hankos: Hanko[] }) {
  try {
    await api.put(`/applications/${route.params.application_id}/hankos`, body)

    emit('pdf_stamped')
  } catch (err) {
    console.error(err)
    toast.error(t('Error updating stamps'))
  }
}

/* -----------------------------
 * Hover preview
 * ----------------------------- */
function updateNewHankoPosition(event: MouseEvent) {
  if (!pdfDoc.value || !pdfContainer.value) return

  const canvas = pageCanvas()
  if (!canvas) return

  // Same size as the drawn hanko: 1500 PDF units high at scale 1
  const page = pdfDoc.value.getPages()[pageNumber.value - 1]
  const { displayWidth } = pageGeometry(page)
  const pixelsPerUnit = canvas.getBoundingClientRect().width / displayWidth
  const hankoHeight = 1500 * hankoScale.value * pixelsPerUnit

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
