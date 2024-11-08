let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarAlCarrito(producto) {
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  alert(`${producto} ha sido añadido al carrito.`);
}

function cargarCarrito() {
  const carritoItems = document.getElementById("carrito-items");
  carritoItems.innerHTML = "";

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remover";
    removeButton.onclick = () => removerDelCarrito(index);

    li.appendChild(removeButton);
    carritoItems.appendChild(li);
  });
}

function removerDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cargarCarrito();
}

function autenticarUsuario() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "usuario" && password === "1234") {
    alert("Inicio de sesión exitoso");
    location.href = "index.html";
    return false;
  } else {
    alert("Usuario o contraseña incorrectos");
    return false;
  }
}

function buscarProducto() {
  const searchInput = document.getElementById("search-input").value.toLowerCase();
  const productos = document.querySelectorAll(".item");

  productos.forEach(producto => {
    const nombreProducto = producto.querySelector("h3").textContent.toLowerCase();
    producto.style.display = nombreProducto.includes(searchInput) ? "block" : "none";
  });
}

function filtrarPorCategoria(categoria) {
  const productos = document.querySelectorAll(".item");

  productos.forEach(producto => {
    const categoriaProducto = producto.getAttribute("data-categoria");
    producto.style.display = (categoria === "todos" || categoria === categoriaProducto) ? "block" : "none";
  });
}

function filtrarOfertas() {
  filtrarPorCategoria("oferta");
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("carrito-items")) {
    cargarCarrito();
  }
});
