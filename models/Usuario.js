const mongoose = require('mongoose');

// Definir esquema de Usuario
const usuarioSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Correo electrónico no válido'] 
    },
    resetToken: { 
        type: String 
    },
    resetTokenExpiration: { 
        type: Date 
    }
}, { 
    timestamps: true // Agrega campos de createdAt y updatedAt automáticamente
});

// Exportar el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);
