import type { Application, User } from '@/types'
import { env } from './env'

// Get the app title from environment variable
const APP_TITLE = env.VITE_APP_TITLE
const IS_PDF_ONLY = !!env.VITE_PDF_ONLY

function applicationIsRejected(application: Application): boolean {
  return application.recipients.some((r) => !!r.refusal)
}

function generateEmailToRecipientBody(
  application: Application,
  recipient: User
): string {
  let body = `${recipient.display_name} 様
${APP_TITLE}の通知メールです。
申請を提出しました。
申請者: ${application.applicant.display_name}`

  // For PDF version, include truncated title and applicant comment
  if (IS_PDF_ONLY) {
    let applicant_comment = ''
    let application_title = application.title

    // Safely access form_data with proper type checking
    if (application.form_data?.[1]) {
      const formItem = application.form_data[1]
      // Check if it's an object with a value property
      if (typeof formItem === 'object' && 'value' in formItem) {
        applicant_comment = String(formItem.value || '')
      }

      if (application_title.length + applicant_comment.length > 50) {
        applicant_comment = applicant_comment
          .replace(/\r?\n/g, '')
          .substring(0, 30)
        applicant_comment = applicant_comment + '(以下省略)'
        application_title = application.title.substring(0, 20)
        application_title = application_title + '(以下省略)'
      }
    }

    body += `
件名: ${application_title}
提出先URL: ${window.location.origin}/applications/${application._id}`

    // Only add applicant comment if it exists
    if (applicant_comment) {
      body += `
申請者コメント: ${applicant_comment}`
    }
  } else {
    // Normal version
    body += `
タイプ: ${application.type}
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}`
  }

  body += `
確認お願いします。`

  return body
}

export function generateEmailToRecipient(
  application: Application,
  recipient: User
): string {
  const subject = IS_PDF_ONLY
    ? `[${APP_TITLE}] ${application.title}`
    : `[${APP_TITLE}] ${application.type}`

  return `mailto:${recipient.email_address}?subject=${subject}&body=${encodeURIComponent(
    generateEmailToRecipientBody(application, recipient)
  )}`
}

function generateEmailToApplicantBody(application: Application): string {
  const status = applicationIsRejected(application) ? '却下' : '完了'

  return `${application.applicant.display_name} 様
${APP_TITLE}の通知メールです。
申請の承認が${status}されました。
申請者: ${application.applicant.display_name}${
    IS_PDF_ONLY
      ? ''
      : `
タイプ: ${application.type}`
  }
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}
確認お願いします。`
}

export function generateEmailToApplicant(application: Application): string {
  let subject = `[${APP_TITLE}]`

  if (IS_PDF_ONLY) {
    const status = applicationIsRejected(application) ? '[却下]' : '[承認]'
    subject += ` ${status} ${application.title}`
  } else {
    subject += ` ${application.type}`
  }

  return `mailto:${
    application.applicant.email_address
  }?subject=${subject}&body=${encodeURIComponent(
    generateEmailToApplicantBody(application)
  )}`
}
