import { createTransport, TransportOptions, Transporter } from "nodemailer"
import Mail from "nodemailer/lib/mailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"
const nodemailer = require("nodemailer")

const options: SMTPTransport.Options = {
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_AUTH_USER,
    pass: process.env.SMTP_AUTH_PASSWORD,
  },
  from: process.env.SMTP_AUTH_USER,
}

export class MailSender {
  private smtpTrans: Transporter<SMTPTransport.SentMessageInfo>
  private static instance: MailSender | null

  private constructor() {
    this.smtpTrans = createTransport(options)
  }

  static getInstance() {
    return this.instance ?? new MailSender()
  }

  static killConnection() {
    if (this.instance) {
      this.instance.smtpTrans.close()
      this.instance = null
    }
  }

  sendMail = (mail: Mail.Options) => {
    return this.smtpTrans.sendMail(mail)
  }
}
