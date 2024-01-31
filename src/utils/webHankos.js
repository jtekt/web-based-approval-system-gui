import QRCode from 'qrcode-svg'

export const generateWebHankoSvg = (recipient) => {
    const { first_name, last_name, approval } = recipient
    const { _id, date } = approval

    const approverDisplayedName =
        `${last_name} ${first_name}`.length <= 6
            ? `${last_name} ${first_name}`
            : last_name

    const qr = new QRCode({
        content: _id,
        container: 'none',
        background: '#00000000',
        width: 100,
        height: 100,
        padding: 2,
        join: true,
        color: '#c00000',
        ecl: 'M',
        pretty: false,
    })

    const { day, month, year } = date
    const formattedDate = `${year}.${month}.${day}`

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

  </svg>
  `
}
