const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Usuario = require('../models/Usuario'); // Importa el modelo de usuario
const router = express.Router();

/* ========================
   Middleware
   ======================== */

// Middleware para autenticar JWT
function autenticarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Token requerido' });

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.usuario = usuario;
        next();
    });
}

/* ========================
   Configuración de Nodemailer
   ======================== */
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/* ========================
   Rutas
   ======================== */

// Registro de usuarios
router.post('/registro', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const nuevoUsuario = new Usuario({ username, password, email });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ username, password });
        if (!usuario) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        const token = jwt.sign({ id: usuario._id, username: usuario.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Solicitar recuperación de contraseña
router.post('/recuperar', async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Correo no encontrado' });

        const token = crypto.randomBytes(32).toString('hex');
        usuario.resetToken = token;
        usuario.resetTokenExpiration = Date.now() + 3600000; // 1 hora
        await usuario.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: usuario.email,
            subject: 'Recuperación de contraseña - TECH-BOX',
            html: `
                <p>Has solicitado recuperar tu contraseña. Haz clic en el enlace para continuar:</p>
                <a href="http://localhost:3000/reset.html?token=${token}">Restablecer Contraseña</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ mensaje: 'Correo de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Restablecer contraseña
router.post('/reset/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!usuario) return res.status(400).json({ error: 'Token inválido o expirado' });

        usuario.password = password;
        usuario.resetToken = undefined;
        usuario.resetTokenExpiration = undefined;
        await usuario.save();

        res.status(200).json({ mensaje: 'Contraseña actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
});

// Ruta protegida de ejemplo
router.get('/perfil', autenticarToken, (req, res) => {
    res.status(200).json({ mensaje: 'Perfil del usuario', usuario: req.usuario });
});

/* ========================
   Exportar Rutas
   ======================== */
module.exports = router;

const Usuario = require('../models/Usuario');

const { autenticarToken, autorizarRoles } = require('../utils/authMiddleware');

const { enviarCorreo } = require('../utils/emailService');

router.post('/recuperar', async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Correo no encontrado' });

        const token = crypto.randomBytes(32).toString('hex');
        usuario.resetToken = token;
        usuario.resetTokenExpiration = Date.now() + 3600000; // 1 hora
        await usuario.save();

        const resetLink = `http://localhost:3000/reset.html?token=${token}`;
        const correoHtml = `
            <p>Has solicitado recuperar tu contraseña. Haz clic en el enlace para continuar:</p>
            <a href="${resetLink}">Restablecer Contraseña</a>
        `;

        await enviarCorreo(email, 'Recuperación de contraseña - TECH-BOX', correoHtml);

        res.status(200).json({ mensaje: 'Correo de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

