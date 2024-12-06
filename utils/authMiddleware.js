const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar usuarios mediante JWT.
 * Verifica si el token enviado en los encabezados es válido.
 */
function autenticarToken(req, res, next) {
    const token = req.headers['authorization']; // Token enviado en los encabezados

    if (!token) {
        return res.status(403).json({ error: 'Token requerido para acceder a esta ruta.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado.' });
        }

        req.usuario = usuario; // Añade la información del usuario al objeto `req`
        next();
    });
}

/**
 * Middleware para autorizar roles específicos.
 * Asegura que solo los usuarios con el rol permitido accedan a la ruta.
 * @param {string[]} rolesPermitidos - Lista de roles que tienen acceso.
 */
function autorizarRoles(rolesPermitidos) {
    return (req, res, next) => {
        const usuario = req.usuario;

        if (!usuario || !rolesPermitidos.includes(usuario.role)) {
            return res.status(403).json({ error: 'Acceso denegado: No tienes los permisos necesarios.' });
        }

        next();
    };
}

module.exports = { autenticarToken, autorizarRoles };

router.get('/perfil', autenticarToken, (req, res) => {
    res.status(200).json({ mensaje: 'Perfil del usuario', usuario: req.usuario });
});

router.post('/admin/crear', autenticarToken, autorizarRoles(['admin']), (req, res) => {
    res.status(200).json({ mensaje: 'Ruta de administrador.' });
});

router.get('/usuario', autenticarToken, (req, res) => {
    res.json({ mensaje: 'Datos del usuario.', usuario: req.usuario });
});

router.delete('/admin/eliminar', autenticarToken, autorizarRoles(['admin']), (req, res) => {
    res.json({ mensaje: 'Solo los administradores pueden eliminar.' });
});

