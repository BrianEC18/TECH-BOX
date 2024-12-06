const nodemailer = require('nodemailer');

/**
 * Configuración del transporte de Nodemailer.
 * Usa las credenciales del archivo .env para la autenticación.
 */
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Cambiar según el proveedor de correo
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Enviar un correo electrónico.
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {string} html - Contenido HTML del correo.
 * @returns {Promise<void>} - Promesa que se resuelve cuando el correo se envía.
 */
async function enviarCorreo(to, subject, html) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${to}`);
    } catch (error) {
        console.error(`Error al enviar el correo a ${to}:`, error);
        throw new Error('No se pudo enviar el correo. Intenta más tarde.');
    }
}

module.exports = { enviarCorreo };
