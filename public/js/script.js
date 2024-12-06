// Variable global para el carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

/* ========================
   Funciones del Carrito
   ======================== */

// Agregar producto al carrito
function agregarAlCarrito(producto) {
    // Producto puede ser un objeto con nombre y precio
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${producto} ha sido añadido al carrito.`);
}

// Cargar productos del carrito en la página
function cargarCarrito() {
    const carritoItems = document.getElementById("carrito-items");
    const totalPriceElement = document.getElementById("total-price");

    carritoItems.innerHTML = '';
    let total = 0;

    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.nombre} - $${item.precio}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remover";
        removeButton.onclick = () => removerDelCarrito(index);

        li.appendChild(removeButton);
        carritoItems.appendChild(li);

        total += item.precio;
    });

    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
}

// Remover producto del carrito
function removerDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarCarrito();
}

// Vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarCarrito();
    alert("El carrito ha sido vaciado.");
}

// Finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    alert("Compra realizada con éxito. ¡Gracias por tu compra!");
    vaciarCarrito();
}

/* ========================
   Funciones de Búsqueda y Filtros
   ======================== */

// Buscar productos
function buscarProducto() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const productos = document.querySelectorAll(".item");

    productos.forEach(producto => {
        const nombreProducto = producto.querySelector("h3").textContent.toLowerCase();
        producto.style.display = nombreProducto.includes(searchInput) ? "block" : "none";
    });
}

// Filtrar productos por categoría
function filtrarPorCategoria(categoria) {
    const productos = document.querySelectorAll(".item");

    productos.forEach(producto => {
        const categoriaProducto = producto.getAttribute("data-categoria");
        producto.style.display = (categoria === "todos" || categoria === categoriaProducto) ? "block" : "none";
    });
}

// Filtrar productos en oferta
function filtrarOfertas() {
    filtrarPorCategoria("oferta");
}

/* ========================
   Funciones de Autenticación
   ======================== */

// Iniciar sesión
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const usernameError = document.getElementById("username-error");
    const passwordError = document.getElementById("password-error");

    if (!username) {
        usernameError.textContent = "El nombre de usuario es obligatorio.";
        return;
    } else {
        usernameError.textContent = "";
    }

    if (!password) {
        passwordError.textContent = "La contraseña es obligatoria.";
        return;
    } else {
        passwordError.textContent = "";
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            alert("Inicio de sesión exitoso");
            window.location.href = "index.html";
        } else {
            alert(data.error || "Credenciales incorrectas.");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Error en el servidor. Intenta más tarde.");
    }
});

/* ========================
   Recuperación de Contraseña
   ======================== */

// Solicitar recuperación de contraseña
document.getElementById('recuperar-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const emailError = document.getElementById("email-error");

    if (!email) {
        emailError.textContent = "El correo es obligatorio.";
        return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Ingresa un correo válido.";
        return;
    } else {
        emailError.textContent = "";
    }

    try {
        const response = await fetch("/api/recuperar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Error al procesar la solicitud.");
        }
    } catch (error) {
        console.error("Error en la recuperación:", error);
        alert("Error en el servidor. Intenta más tarde.");
    }
});

// Restablecer contraseña
document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const passwordError = document.getElementById("password-error");
    const confirmPasswordError = document.getElementById("confirm-password-error");

    if (!password || password.length < 6) {
        passwordError.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    } else {
        passwordError.textContent = "";
    }

    if (password !== confirmPassword) {
        confirmPasswordError.textContent = "Las contraseñas no coinciden.";
        return;
    } else {
        confirmPasswordError.textContent = "";
    }

    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
        alert("Token inválido o ausente. Solicita una nueva recuperación.");
        return;
    }

    try {
        const response = await fetch(`/api/reset/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Contraseña restablecida con éxito. Ahora puedes iniciar sesión.");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Error al restablecer la contraseña.");
        }
    } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        alert("Error en el servidor. Intenta más tarde.");
    }
});

/* ========================
   Inicialización
   ======================== */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("carrito-items")) {
        cargarCarrito();
    }
});

// Registro de nuevo usuario
document.getElementById('registro-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const usernameError = document.getElementById("username-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    // Validaciones
    if (!username) {
        usernameError.textContent = "El nombre de usuario es obligatorio.";
        return;
    } else {
        usernameError.textContent = "";
    }

    if (!email) {
        emailError.textContent = "El correo es obligatorio.";
        return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Ingresa un correo válido.";
        return;
    } else {
        emailError.textContent = "";
    }

    if (!password) {
        passwordError.textContent = "La contraseña es obligatoria.";
        return;
    } else {
        passwordError.textContent = "";
    }

    try {
        const response = await fetch("/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            window.location.href = "login.html"; // Redirigir a la página de inicio de sesión
        } else {
            alert(data.error || "Error al registrar el usuario.");
        }
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Error en el servidor. Intenta más tarde."); // Mensaje de error actualizado
    }
});