import type { Application, Recipient, User } from '@/types'

function applicationIsRejected(application: Application): boolean {
  return application.recipients.some((r) => !!r.refusal)
}

function generateEmailToRecipientBody(
  application: Application,
  recipient: User
): string {
  return `${recipient.display_name} 様

申請マネージャーの通知メールです。

申請を提出しました。

申請者: ${application.applicant.display_name}
タイプ: ${application.type}
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}

確認お願いします。`
}

export function generateEmailToRecipient(
  application: Application,
  recipient: User
): string {
  return `mailto:${recipient.email_address}?subject=[申請マネージャ] ${
    application.type
  }&body=${encodeURIComponent(
    generateEmailToRecipientBody(application, recipient)
  )}`
}

function generateEmailToApplicantBody(application: Application): string {
  const status = applicationIsRejected(application) ? '却下' : '完了'
  return `${application.applicant.display_name} 様

申請マネージャーの通知メールです。

申請の承認が${status}されました。

申請者: ${application.applicant.display_name}
タイプ: ${application.type}
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}

確認お願いします。`
}

export function generateEmailToApplicant(application: Application): string {
  return `mailto:${
    application.applicant.email_address
  }?subject=[申請マネージャ] ${application.type}&body=${encodeURIComponent(
    generateEmailToApplicantBody(application)
  )}`
}
