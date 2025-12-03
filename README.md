# Calzado del Pueblo - Proyecto Zapatería

Tienda en línea de calzado con:
- Catálogo de productos
- Carrito de compras con base de datos
- Registro / Login de usuarios
- Mis pedidos
- Reparaciones y cotizaciones

## Requisitos

- XAMPP (Apache + MySQL)
- Navegador web moderno (Chrome, Edge, etc.)

## Instalación (pasos para correr en tu PC)

1. Clonar o descargar este repositorio:

   - Opción 1 (recomendado, con Git):

     ```bash
     git clone https://github.com/TU_USUARIO/zapateria-calzado-del-pueblo.git
     ```

   - Opción 2: Descargar ZIP:

     - Botón verde **Code** → **Download ZIP**
     - Descomprimir el ZIP

2. Copiar la carpeta del proyecto a la carpeta `htdocs` de XAMPP:

   Ejemplo en Windows:

   ```text
   C:\xampp\htdocs\zapateria-calzado-del-pueblo

    Crear la base de datos en MySQL:

        Abrir XAMPP, iniciar Apache y MySQL

        Ir a http://localhost/phpmyadmin

    Crear una nueva base de datos llamada zapateria

    Ir a la base de datos zapateria → pestaña Importar

    Seleccionar el archivo zapateria.sql que viene en este repositorio

    Dar clic en Continuar

Configurar la conexión a la base de datos (archivo db.php):

Asegurarse de que estos datos coincidan con su instalación de XAMPP:

$host = 'localhost';
$db   = 'zapateria';
$user = 'root';
$pass = '';        

Ejecutar la aplicación:

    Abrir el navegador y entrar a:

        http://localhost/zapateria-calzado-del-pueblo/index.html

Notas

    Se requiere tener Apache y MySQL corriendo en XAMPP.

    Si algo falla con la base de datos, revisar:

        Nombre de la BD (zapateria)

        Usuario / contraseña en db.php

        Que el archivo zapateria.sql se haya importado sin errores.


(Obviamente) Cambiar `https://github.com/TU_USUARIO/zapateria-calzado-del-pueblo.git` por la URL real.

---
