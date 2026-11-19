# Sistema de turnos con prioridades – Bancolombia

Proyecto final de la asignatura **Cliente-Servidor**. Consiste en el desarrollo de un sistema de atención por turnos que organiza a los usuarios según sus prioridades y el tiempo de espera.

El sistema cuenta con reglas de prioridad, orden de llegada (FIFO), envejecimiento de turnos y una proporción de atención de 3 a 1. También incluye autenticación y control de acceso mediante Spring Security y JWT.

Actualmente, el proyecto cuenta únicamente con el backend. El frontend se desarrollará posteriormente.

## Tecnologías utilizadas

- Java 17
- Spring Boot 3.2.0
- Maven
- MySQL 8
- Spring Security
- Spring Data JPA
- Lombok
- JWT (jjwt 0.12.6)

## Requisitos

- Tener instalado JDK 17.
- Tener MySQL 8 en ejecución.
- Crear una base de datos llamada `turnos_bancolombia`.

## Configuración

Primero, copia el archivo:

`application-secrets.properties.example`

y crea una copia llamada:

`application-secrets.properties`

En este archivo debes configurar el usuario y la contraseña de MySQL, además de la clave JWT.

## Base de datos

Crea la base de datos ejecutando:

```sql
CREATE DATABASE turnos_bancolombia CHARACTER SET utf8mb4;
```

Las tablas y los datos iniciales se crean automáticamente al iniciar el proyecto.

## Cómo ejecutar el proyecto

Puedes abrirlo desde NetBeans y seleccionar **Run Project**, o ejecutarlo desde la terminal con:

```bash
mvn spring-boot:run
```

El backend estará disponible en:

`http://localhost:8080`

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | ADMINISTRADOR |
| operador1 | operador123 | OPERADOR |
| operador2 | operador123 | OPERADOR |

## Funcionamiento

El sistema permite:

- Registrar y consultar turnos.
- Dar prioridad a adultos mayores, embarazadas y personas con discapacidad.
- Aplicar prioridad a turnos regulares que superen los 15 minutos de espera.
- Llamar al siguiente turno desde un módulo.
- Iniciar, finalizar, cancelar y marcar turnos como ausentes.
- Consultar el historial y los indicadores de atención.
- Administrar usuarios, servicios, módulos y categorías.
- Consultar y modificar el tiempo de espera para obtener prioridad.

El acceso a las funciones depende del rol del usuario. Los administradores tienen acceso a la gestión del sistema y los operadores a las funciones de atención.

## Próximas etapas

- Desarrollo del frontend con React y TypeScript.
- Pruebas de los endpoints con Postman o Bruno.
- Documentación de la API con Swagger.

