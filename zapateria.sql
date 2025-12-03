-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 21:10:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `zapateria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_carrito`
--

CREATE TABLE `tabla_carrito` (
  `ID_CARRITO` int(11) NOT NULL,
  `FECHA_CREACION` date DEFAULT NULL,
  `ESTADO` enum('Activo','Pagado','Cancelado') DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_carrito`
--

INSERT INTO `tabla_carrito` (`ID_CARRITO`, `FECHA_CREACION`, `ESTADO`, `correo`) VALUES
(1, '2025-10-28', 'Activo', 'carlos.gonzalez@email.com'),
(2, '2025-10-28', 'Pagado', 'ana.martinez@email.com'),
(3, '2023-10-20', 'Pagado', 'maria.lopez@email.com'),
(4, '2023-10-21', 'Cancelado', 'jose.fernandez@email.com'),
(5, '2025-10-28', 'Activo', 'lucia.perez@email.com'),
(6, '2025-12-02', 'Activo', 'ana.martinez@email.com'),
(7, '2025-12-02', 'Activo', 'minecraft.pro@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_cliente`
--

CREATE TABLE `tabla_cliente` (
  `nombre` varchar(100) DEFAULT NULL,
  `correo` varchar(100) NOT NULL,
  `FECHA_REGISTRO` date DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL DEFAULT '123456',
  `TELEFONO` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_cliente`
--

INSERT INTO `tabla_cliente` (`nombre`, `correo`, `FECHA_REGISTRO`, `contrasena`, `TELEFONO`) VALUES
('Ana', 'ana.martinez@email.com', '2025-10-28', '123456', NULL),
('Carlos', 'carlos.gonzalez@email.com', '2025-10-28', '123456', NULL),
('Jose', 'jose.fernandez@email.com', '2025-10-28', '123456', NULL),
('Lucia', 'lucia.perez@email.com', '2025-10-28', '123456', NULL),
('Maria', 'maria.lopez@email.com', '2025-10-28', '123456', NULL),
('jorsh', 'minecraft.pro@gmail.com', '2025-12-02', '123456', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_detalle_carrito`
--

CREATE TABLE `tabla_detalle_carrito` (
  `ID_DETALLE` int(11) NOT NULL,
  `ID_CARRITO` int(11) DEFAULT NULL,
  `ID_PRODUCTO` int(11) DEFAULT NULL,
  `CANTIDAD` int(11) DEFAULT NULL,
  `SUBTOTAL` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_detalle_carrito`
--

INSERT INTO `tabla_detalle_carrito` (`ID_DETALLE`, `ID_CARRITO`, `ID_PRODUCTO`, `CANTIDAD`, `SUBTOTAL`) VALUES
(1, 1, 1, 1, 599.90),
(2, 2, 3, 1, 1899.90),
(4, 5, 4, 1, 450.00),
(5, 1, 2, 1, 1200.00),
(6, 2, 2, 1, 1200.00),
(7, 2, 5, 1, 750.00),
(8, 6, 2, 1, 1200.00),
(9, 6, 5, 1, 750.00),
(10, 7, 5, 1, 750.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_detalle_venta`
--

CREATE TABLE `tabla_detalle_venta` (
  `ID_DETALLE_VENTA` int(11) NOT NULL,
  `ID_VENTA` int(11) DEFAULT NULL,
  `ID_PRODUCTO` int(11) DEFAULT NULL,
  `CANTIDAD` int(11) DEFAULT NULL,
  `PRECIO_UNITARIO` decimal(10,2) DEFAULT NULL,
  `SUBTOTAL` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_detalle_venta`
--

INSERT INTO `tabla_detalle_venta` (`ID_DETALLE_VENTA`, `ID_VENTA`, `ID_PRODUCTO`, `CANTIDAD`, `PRECIO_UNITARIO`, `SUBTOTAL`) VALUES
(1, 1, 3, 2, 1899.90, 1899.90),
(2, 2, 5, 10, 750.00, 750.00),
(3, 3, 1, 8, 599.90, 599.90),
(4, 4, 2, 15, 1200.00, 1200.00),
(5, 5, 4, 2, 450.00, 450.00),
(11, 1, 2, 8, 100.00, 800.00);

--
-- Disparadores `tabla_detalle_venta`
--
DELIMITER $$
CREATE TRIGGER `tr_Calcular_Subtotal_Insert` BEFORE INSERT ON `tabla_detalle_venta` FOR EACH ROW BEGIN
    -- Modifica el valor de SUBTOTAL que está a punto de ser insertado
    SET NEW.SUBTOTAL = NEW.CANTIDAD * NEW.PRECIO_UNITARIO;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_empleado`
--

CREATE TABLE `tabla_empleado` (
  `ID_EMPLEADO` int(11) NOT NULL,
  `NOMBRE` varchar(50) DEFAULT NULL,
  `APELLIDO` varchar(50) DEFAULT NULL,
  `CARGO` varchar(50) DEFAULT NULL,
  `CORREO` varchar(100) DEFAULT NULL,
  `FECHA_CONTRATACION` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_empleado`
--

INSERT INTO `tabla_empleado` (`ID_EMPLEADO`, `NOMBRE`, `APELLIDO`, `CARGO`, `CORREO`, `FECHA_CONTRATACION`) VALUES
(1, 'Miguel', 'Torres', 'Vendedor', 'miguel.torres@zapateria.com', '2023-01-15'),
(2, 'Sofia', 'Ramírez', 'Gerente', 'sofia.ramirez@zapateria.com', '2022-05-10'),
(3, 'David', 'Jiménez', 'Reparador', 'david.jimenez@zapateria.com', '2023-03-20'),
(4, 'Carolina', 'Ruiz', 'Reparador', 'elena.ruiz@zapateria.com', '2022-11-01'),
(5, 'Javier', 'Morales', 'Vendedor', 'javier.morales@zapateria.com', '2023-07-30'),
(7, 'Miguel', 'Cruz', 'Vendedor', 'Tilininsano@gmail.com', '2023-03-16'),
(8, 'Kevin', 'Sanchez', 'Cargador', 'Skibidisigma@gmail.com', '2021-03-14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_inventario`
--

CREATE TABLE `tabla_inventario` (
  `ID_INVENTARIO` int(11) NOT NULL,
  `ID_PRODUCTO` int(11) DEFAULT NULL,
  `ID_EMPLEADO` int(11) DEFAULT NULL,
  `TIPO_MOVIMIENTO` enum('Entrada','Salida','Ajuste') DEFAULT NULL,
  `CANTIDAD` int(11) DEFAULT NULL,
  `FECHA_MOVIMIENTO` date DEFAULT NULL,
  `DESCRIPCION` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_inventario`
--

INSERT INTO `tabla_inventario` (`ID_INVENTARIO`, `ID_PRODUCTO`, `ID_EMPLEADO`, `TIPO_MOVIMIENTO`, `CANTIDAD`, `FECHA_MOVIMIENTO`, `DESCRIPCION`) VALUES
(1, 1, 2, 'Entrada', 50, '2023-10-01', 'Pedido inicial a Flexi'),
(2, 2, 2, 'Entrada', 30, '2023-10-01', 'Pedido inicial a Roca Fuerte'),
(3, 3, 2, 'Entrada', 40, '2023-10-02', 'Pedido inicial a Sport Mx'),
(4, 4, 2, 'Entrada', 60, '2023-10-03', 'Pedido inicial a Flexi'),
(5, 5, 2, 'Entrada', 25, '2023-10-04', 'Pedido inicial a Pieles del Norte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_producto`
--

CREATE TABLE `tabla_producto` (
  `ID_PRODUCTO` int(11) NOT NULL,
  `NOMBRE` varchar(100) DEFAULT NULL,
  `MARCA` varchar(50) DEFAULT NULL,
  `TALLA` varchar(10) DEFAULT NULL,
  `COLOR` varchar(30) DEFAULT NULL,
  `PRECIO` decimal(10,2) DEFAULT NULL,
  `STOCK` int(11) DEFAULT NULL,
  `ID_PROVEEDOR` int(11) DEFAULT NULL,
  `DESCRIPCION` text DEFAULT NULL,
  `FECHA_REGISTRO` date DEFAULT NULL,
  `CODIGO_PRODUCTO` varchar(30) DEFAULT NULL,
  `IMAGEN_URL` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_producto`
--

INSERT INTO `tabla_producto` (`ID_PRODUCTO`, `NOMBRE`, `MARCA`, `TALLA`, `COLOR`, `PRECIO`, `STOCK`, `ID_PROVEEDOR`, `DESCRIPCION`, `FECHA_REGISTRO`, `CODIGO_PRODUCTO`, `IMAGEN_URL`) VALUES
(1, 'Zapato Casual Flex', 'Flexi', '27', 'Negro', 599.90, 50, 1, 'Zapato de piel casual', '2025-10-28', 'FLX-CAS-27-NEG', 'https://images.unsplash.com/photo-1560343076-ec4732506337?auto=format&fit=crop&w=800&q=80'),
(2, 'Bota de Piel', 'Roca Fuerte', '28', 'Café', 1200.00, 29, 5, 'Bota de trabajo resistente', '2025-10-28', 'ROC-BOT-28-CAF', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'),
(3, 'Tenis Runner', 'Sport Mx', '26.5', 'Blanco', 1899.90, 39, 4, 'Tenis para correr', '2025-10-28', 'SPM-RUN-26-BLA', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'),
(4, 'Sandalia Verano', 'Flexi', '25', 'Azul', 450.00, 60, 1, 'Sandalia cómoda de playa', '2025-10-28', 'FLX-SAN-25-AZU', 'https://images.unsplash.com/photo-1621251933092-231a4773824c?auto=format&fit=crop&w=800&q=80'),
(5, 'Mocasín Piel', 'Pieles del Norte', '27', 'Miel', 750.00, 24, 2, 'Mocasín de vestir', '2025-10-28', 'PDN-MOC-27-MIE', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_proveedor`
--

CREATE TABLE `tabla_proveedor` (
  `ID_PROVEEDOR` int(11) NOT NULL,
  `NOMBRE_EMPRESA` varchar(100) DEFAULT NULL,
  `REPRESENTANTE` varchar(100) DEFAULT NULL,
  `RFC` varchar(20) DEFAULT NULL,
  `TELEFONO_CONTACTO` varchar(15) DEFAULT NULL,
  `CORREO` varchar(100) DEFAULT NULL,
  `TIPO_PRODUCTO` varchar(100) DEFAULT NULL,
  `FECHA_REGISTRO` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_proveedor`
--

INSERT INTO `tabla_proveedor` (`ID_PROVEEDOR`, `NOMBRE_EMPRESA`, `REPRESENTANTE`, `RFC`, `TELEFONO_CONTACTO`, `CORREO`, `TIPO_PRODUCTO`, `FECHA_REGISTRO`) VALUES
(1, 'ZapatosFlex S.A.', 'Laura Campos', 'ZFL980115ABC', '5512345678', 'ventas@zflex.com', 'Calzado Casual', '2022-01-01'),
(2, 'Pieles del Norte', 'Roberto Díaz', 'PDN010210XYZ', '8112345678', 'contacto@pielnorte.com', 'Bota de Piel', '2022-02-15'),
(3, 'SuelasDuras Corp.', 'Fernando Gil', 'SDC050505DEF', '3312345678', 'admin@suelas.com', 'Suelas y Material', '2022-03-20'),
(4, 'Tenis Sport Mx', 'Monica Solis', 'TSM111111GHI', '5598765432', 'monica.solis@tenismx.com', 'Calzado Deportivo', '2022-04-05'),
(5, 'Botas Roca Fuerte', 'Antonio Banderas', 'BRF900909JKL', '8198765432', 'antonio@botasr.com', 'Bota Industrial', '2022-05-10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_reparacion`
--

CREATE TABLE `tabla_reparacion` (
  `ID_REPARACION` int(11) NOT NULL,
  `ID_EMPLEADO` int(11) DEFAULT NULL,
  `TIPO_REPARACION` varchar(100) DEFAULT NULL,
  `DESCRIPCION` text DEFAULT NULL,
  `COSTO` decimal(10,2) DEFAULT NULL,
  `FECHA_RECEPCION` date DEFAULT NULL,
  `FECHA_ENTREGA` date DEFAULT NULL,
  `ESTADO` enum('Pendiente','En proceso','Terminado') DEFAULT NULL,
  `CODIGO_REPARACION` varchar(30) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_reparacion`
--

INSERT INTO `tabla_reparacion` (`ID_REPARACION`, `ID_EMPLEADO`, `TIPO_REPARACION`, `DESCRIPCION`, `COSTO`, `FECHA_RECEPCION`, `FECHA_ENTREGA`, `ESTADO`, `CODIGO_REPARACION`, `correo`) VALUES
(1, 3, 'Cambio de suela', 'Suela completa tenis', 250.00, '2025-10-28', '2023-11-05', 'Pendiente', 'RP-2023-0001', 'carlos.gonzalez@email.com'),
(2, 4, 'Costura', 'Costura lateral bota', 100.00, '2023-10-20', '2023-10-25', 'Terminado', 'RP-2023-0002', 'ana.martinez@email.com'),
(3, 3, 'Pintura', 'Boleado y pintura zapato negro', 180.00, '2023-10-22', '2023-10-28', 'En proceso', 'RP-2023-0003', 'jose.fernandez@email.com'),
(4, 4, 'Cambio de tapas', 'Tapas tacón mujer', 80.00, '2025-10-28', '2023-11-02', 'Pendiente', 'RP-2023-0004', 'carlos.gonzalez@email.com'),
(5, 3, 'Pegado de suela', 'Suela despegada mocasín', 120.00, '2023-10-23', '2023-10-26', 'En proceso', 'RP-2023-0005', 'lucia.perez@email.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tabla_venta`
--

CREATE TABLE `tabla_venta` (
  `ID_VENTA` int(11) NOT NULL,
  `ID_EMPLEADO` int(11) DEFAULT NULL,
  `FECHA_VENTA` date DEFAULT NULL,
  `TOTAL` decimal(10,2) DEFAULT NULL,
  `METODO_PAGO` enum('Efectivo','Tarjeta') DEFAULT NULL,
  `ESTADO_RETIRO` enum('Pendiente','Retirado') DEFAULT NULL,
  `CODIGO_VENTA` varchar(30) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tabla_venta`
--

INSERT INTO `tabla_venta` (`ID_VENTA`, `ID_EMPLEADO`, `FECHA_VENTA`, `TOTAL`, `METODO_PAGO`, `ESTADO_RETIRO`, `CODIGO_VENTA`, `correo`) VALUES
(1, 1, '2023-10-20', 1899.90, 'Tarjeta', 'Retirado', 'VT-2023-0001', 'maria.lopez@email.com'),
(2, 5, '2023-10-22', 750.00, 'Efectivo', 'Pendiente', 'VT-2023-0002', 'lucia.perez@email.com'),
(3, 1, '2023-10-23', 599.90, 'Tarjeta', 'Retirado', 'VT-2023-0003', 'carlos.gonzalez@email.com'),
(4, 5, '2023-10-24', 1200.00, 'Tarjeta', 'Pendiente', 'VT-2023-0004', 'ana.martinez@email.com'),
(5, 1, '2023-10-25', 450.00, 'Efectivo', 'Retirado', 'VT-2023-0005', 'jose.fernandez@email.com');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tabla_carrito`
--
ALTER TABLE `tabla_carrito`
  ADD PRIMARY KEY (`ID_CARRITO`),
  ADD KEY `fk_carrito_cliente` (`correo`);

--
-- Indices de la tabla `tabla_cliente`
--
ALTER TABLE `tabla_cliente`
  ADD PRIMARY KEY (`correo`);

--
-- Indices de la tabla `tabla_detalle_carrito`
--
ALTER TABLE `tabla_detalle_carrito`
  ADD PRIMARY KEY (`ID_DETALLE`),
  ADD KEY `ID_CARRITO` (`ID_CARRITO`),
  ADD KEY `ID_PRODUCTO` (`ID_PRODUCTO`);

--
-- Indices de la tabla `tabla_detalle_venta`
--
ALTER TABLE `tabla_detalle_venta`
  ADD PRIMARY KEY (`ID_DETALLE_VENTA`),
  ADD KEY `ID_VENTA` (`ID_VENTA`),
  ADD KEY `ID_PRODUCTO` (`ID_PRODUCTO`);

--
-- Indices de la tabla `tabla_empleado`
--
ALTER TABLE `tabla_empleado`
  ADD PRIMARY KEY (`ID_EMPLEADO`);

--
-- Indices de la tabla `tabla_inventario`
--
ALTER TABLE `tabla_inventario`
  ADD PRIMARY KEY (`ID_INVENTARIO`),
  ADD KEY `ID_PRODUCTO` (`ID_PRODUCTO`),
  ADD KEY `ID_EMPLEADO` (`ID_EMPLEADO`);

--
-- Indices de la tabla `tabla_producto`
--
ALTER TABLE `tabla_producto`
  ADD PRIMARY KEY (`ID_PRODUCTO`),
  ADD KEY `ID_PROVEEDOR` (`ID_PROVEEDOR`);

--
-- Indices de la tabla `tabla_proveedor`
--
ALTER TABLE `tabla_proveedor`
  ADD PRIMARY KEY (`ID_PROVEEDOR`);

--
-- Indices de la tabla `tabla_reparacion`
--
ALTER TABLE `tabla_reparacion`
  ADD PRIMARY KEY (`ID_REPARACION`),
  ADD KEY `ID_EMPLEADO` (`ID_EMPLEADO`),
  ADD KEY `fk_reparacion_cliente` (`correo`);

--
-- Indices de la tabla `tabla_venta`
--
ALTER TABLE `tabla_venta`
  ADD PRIMARY KEY (`ID_VENTA`),
  ADD KEY `ID_EMPLEADO` (`ID_EMPLEADO`),
  ADD KEY `fk_venta_cliente` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tabla_carrito`
--
ALTER TABLE `tabla_carrito`
  MODIFY `ID_CARRITO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tabla_detalle_carrito`
--
ALTER TABLE `tabla_detalle_carrito`
  MODIFY `ID_DETALLE` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `tabla_detalle_venta`
--
ALTER TABLE `tabla_detalle_venta`
  MODIFY `ID_DETALLE_VENTA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `tabla_empleado`
--
ALTER TABLE `tabla_empleado`
  MODIFY `ID_EMPLEADO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `tabla_inventario`
--
ALTER TABLE `tabla_inventario`
  MODIFY `ID_INVENTARIO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tabla_producto`
--
ALTER TABLE `tabla_producto`
  MODIFY `ID_PRODUCTO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tabla_proveedor`
--
ALTER TABLE `tabla_proveedor`
  MODIFY `ID_PROVEEDOR` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tabla_reparacion`
--
ALTER TABLE `tabla_reparacion`
  MODIFY `ID_REPARACION` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tabla_venta`
--
ALTER TABLE `tabla_venta`
  MODIFY `ID_VENTA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tabla_carrito`
--
ALTER TABLE `tabla_carrito`
  ADD CONSTRAINT `fk_carrito_cliente` FOREIGN KEY (`correo`) REFERENCES `tabla_cliente` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tabla_detalle_carrito`
--
ALTER TABLE `tabla_detalle_carrito`
  ADD CONSTRAINT `tabla_detalle_carrito_ibfk_1` FOREIGN KEY (`ID_CARRITO`) REFERENCES `tabla_carrito` (`ID_CARRITO`) ON DELETE CASCADE,
  ADD CONSTRAINT `tabla_detalle_carrito_ibfk_2` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `tabla_producto` (`ID_PRODUCTO`);

--
-- Filtros para la tabla `tabla_detalle_venta`
--
ALTER TABLE `tabla_detalle_venta`
  ADD CONSTRAINT `tabla_detalle_venta_ibfk_1` FOREIGN KEY (`ID_VENTA`) REFERENCES `tabla_venta` (`ID_VENTA`) ON DELETE CASCADE,
  ADD CONSTRAINT `tabla_detalle_venta_ibfk_2` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `tabla_producto` (`ID_PRODUCTO`);

--
-- Filtros para la tabla `tabla_inventario`
--
ALTER TABLE `tabla_inventario`
  ADD CONSTRAINT `tabla_inventario_ibfk_1` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `tabla_producto` (`ID_PRODUCTO`),
  ADD CONSTRAINT `tabla_inventario_ibfk_2` FOREIGN KEY (`ID_EMPLEADO`) REFERENCES `tabla_empleado` (`ID_EMPLEADO`);

--
-- Filtros para la tabla `tabla_producto`
--
ALTER TABLE `tabla_producto`
  ADD CONSTRAINT `tabla_producto_ibfk_1` FOREIGN KEY (`ID_PROVEEDOR`) REFERENCES `tabla_proveedor` (`ID_PROVEEDOR`);

--
-- Filtros para la tabla `tabla_reparacion`
--
ALTER TABLE `tabla_reparacion`
  ADD CONSTRAINT `fk_reparacion_cliente` FOREIGN KEY (`correo`) REFERENCES `tabla_cliente` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tabla_reparacion_ibfk_2` FOREIGN KEY (`ID_EMPLEADO`) REFERENCES `tabla_empleado` (`ID_EMPLEADO`);

--
-- Filtros para la tabla `tabla_venta`
--
ALTER TABLE `tabla_venta`
  ADD CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`correo`) REFERENCES `tabla_cliente` (`correo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tabla_venta_ibfk_2` FOREIGN KEY (`ID_EMPLEADO`) REFERENCES `tabla_empleado` (`ID_EMPLEADO`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
