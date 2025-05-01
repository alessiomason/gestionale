import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import {OAuth2Client} from "google-auth-library";

// Nodemailer guide at https://nodemailer.com/smtp/oauth2/
// followed guide at https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1#
// additional step at https://github.com/nodemailer/nodemailer/issues/266#issuecomment-542791806
export async function sendEmail(to: string, subject: string, html: string, text: string) {
    const oauth2Client = new OAuth2Client(
        process.env.EMAIL_CLIENT_ID,
        process.env.EMAIL_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.EMAIL_REFRESH_TOKEN
    });
    const accessToken = (await oauth2Client.getAccessToken()).token;

    const smtpTransport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            clientId: process.env.EMAIL_CLIENT_ID,
            clientSecret: process.env.EMAIL_CLIENT_SECRET,
            refreshToken: process.env.EMAIL_REFRESH_TOKEN,
            accessToken: accessToken ?? undefined   // if null, set undefined
        },
        tls: {
            rejectUnauthorized: false
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