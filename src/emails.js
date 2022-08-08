const application_is_rejected = (application) => {
    return !!application.recipients.find(recipient => recipient.refusal)
}

const generate_email_to_recipient_body = (application, recipient) =>
`${recipient.display_name} 様

申請マネージャーの通知メールです。

申請を提出しました。

申請者: ${application.applicant.display_name}
タイプ: ${application.type}
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}

確認お願いします。`

const generate_email_to_recipient = (application, recipient) =>
`mailto:${recipient.email_address}
?subject=[申請マネージャ] ${application.type}
&body=${encodeURIComponent(generate_email_to_recipient_body(application, recipient))}`

const generate_email_to_applicant_body = (application) =>
`${application.applicant.display_name} 様

申請マネージャーの通知メールです。

申請の承認が${application_is_rejected(application) ? '却下' : '完了'}されました。

申請者: ${application.applicant.display_name}
タイプ: ${application.type}
件名: ${application.title}
提出先URL: ${window.location.origin}/applications/${application._id}

確認お願いします。`

const generate_email_to_applicant = (application) =>
`mailto:${application.applicant.email_address}
?subject=[申請マネージャ] ${application.type}
&body=${encodeURIComponent(generate_email_to_applicant_body(application))}`

export {
    generate_email_to_applicant,
    generate_email_to_recipient,
}