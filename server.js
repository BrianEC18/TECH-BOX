require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a MongoDB');
});

// Modelo de Usuario
const usuarioSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resetToken: String,
    resetTokenExpiration: Date,
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
   Rutas de la API
   ======================== */

// Registro de usuarios
app.post('/api/registro', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ username, password: hashedPassword, email });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const usuario = await Usuario.findOne({ username });
        if (!usuario) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        const isPasswordValid = await bcrypt.compare(password, usuario.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

        const token = jwt.sign({ id: usuario._id, username: usuario.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Solicitar recuperación de contraseña
app.post('/api/recuperar', async (req, res) => {
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
                <a href="http://localhost:${PORT}/reset.html?token=${token}">Restablecer Contraseña</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ mensaje: 'Correo de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

// Restablecer contraseña
app.post('/api/reset/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!usuario) return res.status(400).json({ error: 'Token inválido o expirado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        usuario.password = hashedPassword;
        usuario.resetToken = undefined;
        usuario.resetTokenExpiration = undefined;
        await usuario.save();

        res.status(200).json({ mensaje: 'Contraseña actualizada con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al restablecer contraseña' });
    }
});

// Ruta protegida de ejemplo
app.get('/api/perfil', autenticarToken, (req, res) => {
    res.status(200).json({ mensaje: 'Perfil del usuario', usuario: req.usuario });
});

/* ========================
   Iniciar el Servidor
   ======================== */
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
