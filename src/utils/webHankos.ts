import QRCode from 'qrcode-svg'
import type { Recipient } from '@/types'

export function generateWebHankoSvg(recipient: Recipient): string {
  const {
    approval,
    first_name,
    first_name_kanji,
    last_name,
    last_name_kanji,
    family_name,
    family_name_kanji,
  } = recipient

  if (!approval) return ''

  const { _id, date } = approval

  const lastName =
    last_name ?? last_name_kanji ?? family_name ?? family_name_kanji ?? ''
  const firstName = first_name ?? first_name_kanji ?? ''
  const fullName = `${lastName} ${firstName}`.trim()
  const approverDisplayedName = fullName.length <= 6 ? fullName : lastName

  const qr = new QRCode({
    content: _id ?? '',
    container: 'none' as const,
    background: '#00000000',
    width: 100,
    height: 100,
    padding: 3,
    join: true,
    color: '#c00000',
    ecl: 'M',
    pretty: false,
  })

  const formattedDate =
    date && 'year' in date ? `${date.year}.${date.month}.${date.day}` : ''

  return `<svg viewBox="0 0 100 150">
    <!-- frame -->
    <rect
      stroke="#c00000"
      stroke-width="2"
      fill-opacity="0.0"
      x="2%"
      y="2%"
      rx="10"
      ry="10"
      width="96%"
      height="96%" />

    <!-- Approver name -->
    <text
      fill="#c00000"
      text-anchor="middle"
      font-family="monospace, monospace"
      font-weight="600"
      font-size="18"
      x="50%"
      y="18%">
      ${approverDisplayedName}
    </text>

    <g transform="translate(0,29)">
      ${qr.svg()}
    </g>

    <!-- date of approval -->
    <text
      fill="#c00000"
      text-anchor="middle"
      font-family="monospace, monospace"
      font-size="14"
      x="50%"
      y="93%">
      ${formattedDate}
    </text>

  </svg>`
}
