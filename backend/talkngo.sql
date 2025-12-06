-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-12-2025 a las 02:17:22
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
-- Base de datos: `talkngo`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `ID_CATEGORIA` int(11) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `FOTO` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`ID_CATEGORIA`, `NOMBRE`, `FOTO`) VALUES
(1, 'Bagels', 'IMGCATEGORIA1.png'),
(2, 'Drinks', 'IMGCATEGORIA2.png'),
(3, 'Snacks', 'IMGCATEGORIA3.png'),
(4, 'Combos', 'IMGCATEGORIA4.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_orden`
--

CREATE TABLE `detalle_orden` (
  `ID_ORDEN` int(11) NOT NULL,
  `ID_PRODUCTO` int(11) NOT NULL,
  `PRECIO_UNITARIO` decimal(10,2) NOT NULL,
  `CANTIDAD` int(10) NOT NULL,
  `SUBTOTAL` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_orden`
--

INSERT INTO `detalle_orden` (`ID_ORDEN`, `ID_PRODUCTO`, `PRECIO_UNITARIO`, `CANTIDAD`, `SUBTOTAL`) VALUES
(1, 2, 7.00, 2, 14.00),
(1, 3, 10.00, 1, 10.00),
(1, 19, 5.00, 3, 15.00),
(2, 1, 8.00, 1, 8.00),
(2, 8, 3.00, 2, 6.00),
(2, 18, 5.00, 2, 10.00),
(2, 19, 5.00, 1, 5.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `ID_ORDEN` int(11) NOT NULL,
  `ID_USUARIO` int(11) NOT NULL,
  `FECHA` date NOT NULL,
  `TOTAL` decimal(10,2) NOT NULL,
  `ESTADO` enum('activa','terminada') NOT NULL,
  `ID_RECOMPENSA` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`ID_ORDEN`, `ID_USUARIO`, `FECHA`, `TOTAL`, `ESTADO`, `ID_RECOMPENSA`) VALUES
(1, 1698, '2025-12-06', 39.00, 'activa', NULL),
(2, 1699, '2025-12-06', 29.00, 'activa', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `ID_PRODUCTO` int(11) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `DESCRIPCION` varchar(100) DEFAULT NULL,
  `ID_CATEGORIA` int(10) NOT NULL,
  `PRECIO` decimal(10,2) NOT NULL,
  `ESTADO` tinyint(1) NOT NULL,
  `FOTO` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`ID_PRODUCTO`, `NOMBRE`, `DESCRIPCION`, `ID_CATEGORIA`, `PRECIO`, `ESTADO`, `FOTO`) VALUES
(1, 'Golden Bagel', 'Garlic, butter, Italian pasta, gouda cheese, prosciutto and arugula', 1, 8.00, 1, '1764366332146.png'),
(2, 'Bacon Bagel', 'Eggs, bacon and cheese', 1, 7.00, 1, '1764616667283.png'),
(3, 'Salmon Bagel', 'Cream cheese, salmon, cucumber and avocado', 1, 10.00, 1, '1764616699838.png'),
(4, 'Morning Bagel', 'Spicy maple, turkey ham, bacon, and Gouda cheese', 1, 8.00, 1, '1764616736516.png'),
(5, 'Bigol Bagel', 'Chipotle bagel filled with creamy onion filling', 1, 6.00, 1, '1764616771341.png'),
(6, 'Odi Bagel', 'Spicy maple, Gouda cheese, hash browns and crispy chicken', 1, 7.00, 1, '1764616803325.png'),
(7, 'Cold Brew', 'Iced black coffee and vanilla cream', 2, 3.00, 1, '1764618913437.png'),
(8, 'Iced Latte', 'Iced coffee milk based', 2, 3.00, 1, '1764618959428.png'),
(9, 'Mocha', 'Hot coffee with cacao topped with whipped cream', 2, 5.00, 1, '1764618996582.png'),
(10, 'Matcha Frappuccino', 'Milk based matcha frappe', 2, 5.00, 1, '1764619043311.png'),
(11, 'Chai Frappuccino', 'Milk based chai tea', 2, 5.00, 1, '1764619080984.png'),
(12, 'Oreo Frappuccino', 'Oreo Frappe', 2, 5.00, 1, '1764619105390.png'),
(16, 'Bigñets', 'Dessert', 3, 3.00, 1, '1764619244441.png'),
(17, 'Coles', 'Snack', 3, 3.00, 1, '1764619261675.png'),
(18, 'French Fries', 'Fried potatos', 3, 5.00, 1, '1764619285727.png'),
(19, 'Sweet Potato Fries', 'Sweet Potato', 3, 5.00, 1, '1764619317062.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recompensas`
--

CREATE TABLE `recompensas` (
  `ID_RECOMPENSA` int(11) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `DESCRIPCION` varchar(100) NOT NULL,
  `TIPO` enum('ganancia','gratis','porcentaje','2x1','3x2') NOT NULL,
  `PUNTOS` int(10) NOT NULL,
  `VALOR_DESCUENTO` int(50) NOT NULL,
  `ID_PRODUCTO_ASOCIADO` int(11) NOT NULL,
  `ESTADO` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `ID_USUARIO` int(11) NOT NULL,
  `NOMBRE` varchar(100) NOT NULL,
  `CORREO` varchar(100) NOT NULL,
  `PASSWORD` varchar(50) NOT NULL,
  `TIPO_USUARIO` enum('cliente','admin','cocina') NOT NULL,
  `PUNTOS_ACUMULADOS` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`ID_USUARIO`, `NOMBRE`, `CORREO`, `PASSWORD`, `TIPO_USUARIO`, `PUNTOS_ACUMULADOS`) VALUES
(1, 'Vanessa Aguayo', 'vanessa@correo.com', '12345', 'cliente', 0),
(2, 'Invitado', 'guest_1764892541522@invitado.com', '', '', 0),
(1698, 'fer', 'mafer@gmail.com', '123', 'cliente', 0),
(1699, 'Invitado', 'guest_1764983770068@invitado.com', '', 'cliente', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`ID_CATEGORIA`);

--
-- Indices de la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD PRIMARY KEY (`ID_ORDEN`,`ID_PRODUCTO`),
  ADD KEY `fk_detalleorden_producto` (`ID_PRODUCTO`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`ID_ORDEN`),
  ADD KEY `fk_orden_usuario` (`ID_USUARIO`),
  ADD KEY `fk_orden_recompensa` (`ID_RECOMPENSA`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`ID_PRODUCTO`),
  ADD KEY `fk_productos_categoria` (`ID_CATEGORIA`);

--
-- Indices de la tabla `recompensas`
--
ALTER TABLE `recompensas`
  ADD PRIMARY KEY (`ID_RECOMPENSA`),
  ADD KEY `fk_recompensas_producto` (`ID_PRODUCTO_ASOCIADO`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`ID_USUARIO`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `ID_CATEGORIA` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `ID_ORDEN` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `ID_PRODUCTO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `recompensas`
--
ALTER TABLE `recompensas`
  MODIFY `ID_RECOMPENSA` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `ID_USUARIO` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1700;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_orden`
--
ALTER TABLE `detalle_orden`
  ADD CONSTRAINT `fk_detalleorden_orden` FOREIGN KEY (`ID_ORDEN`) REFERENCES `ordenes` (`ID_ORDEN`),
  ADD CONSTRAINT `fk_detalleorden_producto` FOREIGN KEY (`ID_PRODUCTO`) REFERENCES `productos` (`ID_PRODUCTO`);

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_orden_recompensa` FOREIGN KEY (`ID_RECOMPENSA`) REFERENCES `recompensas` (`ID_RECOMPENSA`),
  ADD CONSTRAINT `fk_orden_usuario` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuarios` (`ID_USUARIO`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`ID_CATEGORIA`) REFERENCES `categoria` (`ID_CATEGORIA`);

--
-- Filtros para la tabla `recompensas`
--
ALTER TABLE `recompensas`
  ADD CONSTRAINT `fk_recompensas_producto` FOREIGN KEY (`ID_PRODUCTO_ASOCIADO`) REFERENCES `productos` (`ID_PRODUCTO`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
