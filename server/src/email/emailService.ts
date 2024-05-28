import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export async function sendEmail(to: string, subject: string, html: string, text: string) {
    const smtpTransport = nodemailer.createTransport({
        service: "Outlook365",
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            ciphers: "SSLv3"
        }
    });

    const mailOptions: Mail.Options = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: html,
        text: text
    };

    await smtpTransport.sendMail(mailOptions);
}