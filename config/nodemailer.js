// sendGrid.js
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, message }) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // correo verificado en SendGrid
    subject,
    html: `<p>${message}</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Correo enviado correctamente');
  } catch (error) {
    console.error('Error enviando correo:', error.response?.body || error);
    throw error;
  }
}
