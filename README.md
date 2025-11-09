
# Talkngo 1.0

# Talkngo 1.0 – Documentación de la API REST

**Base URL:** `http://localhost:4000/api`

---

## Índice

1. [Autenticación y Roles](#autenticación-y-roles)  
2. [Endpoints de Usuarios](#endpoints-de-usuarios)  
---

## Autenticación y Roles

### Roles de usuarios

| Rol       | Propósito                     | Áreas de acceso                        |
| --------- | ----------------------------- | -------------------------------------- |
| **cliente** | Usuario final                 | DriveThru, pedidos, recompensas        |
| **cocina**  | Personal de cocina            | Cocina, gestión de órdenes             |
| **admin**   | Administrador del sistema     | Configuración, usuarios, inventario    |

Los tokens JWT se pueden usar para manejar sesiones y determinar el tipo de usuario. La validación se hace en cada endpoint que requiera autorización.

---

## Endpoints de Usuarios

### 1. Registrar usuario

`POST /api/usuarios`

Registra un nuevo usuario de cualquier tipo (cliente, cocina o admin).

|Nombre|Tipo|Obligatorio|Descripcion|
|---|---|---|---|
`NOMBRE`|varchar|Si|Nombre del usuario
`CORREO`|varchar|Si|Correo del usuario
`PASSWORD`|varchar|Si|Contraseña del usuario
`TIPO_USUARIO`|string|Si|Tipo de usuario ('cliente', 'cocina', 'admin')

<details>
<summary>Request body</summary>

```json
{
  "NOMBRE": "Vanessa Aguayo",
  "CORREO": "vanessa@correo.com",
  "PASSWORD": "12345",
  "TIPO_USUARIO": "cliente"
}
```
</details> 

<details> 
<summary>Respuesta 200</summary>

```json
{
  "mensaje": "Usuario cliente registrado",
  "id": 1,
  "NOMBRE": "Vanessa Aguayo",
  "CORREO": "vanessa@correo.com",
  "TIPO_USUARIO": "cliente",
  "PUNTOS_ACUMULADOS": 0
}
```
</details>


### 2. Obtener todos los usuarios (cliente, cocina, admin)

`GET /api/usuarios`

Obtiene todos los usuarios de cualquier tipo (cliente, cocina o admin).

<details> 
<summary>Respuesta 200</summary>

```json
[
    {
        "ID_USUARIO": 1,
        "NOMBRE": "Vanessa Aguayo",
        "CORREO": "vanessa@correo.com",
        "PASSWORD": "12345",
        "TIPO_USUARIO": "cliente",
        "PUNTOS_ACUMULADOS": 0
    }
]
```
</details>

### 3. Obtener todos los usuarios tipo cliente

`GET /api/usuarios/clientes`

Obtiene todos los usuarios clientes.

<details> 
<summary>Respuesta 200</summary>

```json
[
    {
        "ID_USUARIO": 1,
        "NOMBRE": "Vanessa Aguayo",
        "CORREO": "vanessa@correo.com",
        "PUNTOS_ACUMULADOS": 0
    }
]
```
</details>