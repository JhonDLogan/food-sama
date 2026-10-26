-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS foodsama_db;
USE foodsama_db;

-- 1. Tabla de Negocios (Extraída de acceso.html y la configuración de index.html)
CREATE TABLE negocios (
    id_negocio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_negocio VARCHAR(70) NOT NULL,
    nombre_propietario VARCHAR(70) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, -- Se debe almacenar encriptada (ej. bcrypt)
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías (Extraída de los "filter-tabs" en menu.html)
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    id_negocio INT NOT NULL,
    nombre_categoria VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON DELETE CASCADE
);

-- 3. Tabla de Productos (Extraída de "public-products" y "Mi menú")
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_negocio INT NOT NULL,
    id_categoria INT,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    imagen_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- 4. Tabla de Clientes (Extraída de la sección "Clientes" en index.html)
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Pedidos (Extraída del carrito de menu.html y "Pedidos" en index.html)
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_negocio INT NOT NULL,
    id_cliente INT,
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') DEFAULT 'pendiente',
    total DECIMAL(10, 2) NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
);

-- 6. Tabla de Detalle de Pedidos (Para relacionar qué productos van en cada pedido)
CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- 7. Tabla de Comprobantes (Extraída de la sección "Comprobantes" en index.html)
CREATE TABLE comprobantes (
    id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_negocio INT NOT NULL,
    tipo_comprobante ENUM('factura', 'recibo') DEFAULT 'recibo',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_negocio) REFERENCES negocios(id_negocio) ON DELETE CASCADE
);