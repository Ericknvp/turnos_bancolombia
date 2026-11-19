# Sistema de turnos con prioridades - Bancolombia (backend)

Proyecto final de la asignatura Cliente Servidor. Backend del sistema de atención por turnos con reglas de prioridad, FIFO, envejecimiento y proporción de atención 3 a 1, protegido con Spring Security y JWT.

Por ahora este repositorio contiene **solo el backend**. El frontend se agregará en una etapa posterior.

## Stack y versiones exactas

- Java 17
- Spring Boot 3.2.0 (Web, Data JPA, Validation, Security)
- Maven
- MySQL 8
- Lombok
- jjwt 0.12.6 (JWT)

## Requisitos previos

- JDK 17 instalado
- MySQL 8 corriendo en `localhost:3306` (por ejemplo con XAMPP)
- Una base de datos vacía llamada `turnos_bancolombia`

## Configuración de variables y secretos

Las credenciales de la base de datos y la clave JWT **no están en el repositorio**. Se cargan desde `src/main/resources/application-secrets.properties`, que está excluido por `.gitignore`.

1. Copia el archivo de ejemplo:
   - `src/main/resources/application-secrets.properties.example` → `src/main/resources/application-secrets.properties`
2. Ajusta `spring.datasource.username`, `spring.datasource.password` y `app.jwt.secret` con tus valores reales.

El resto de la configuración (puerto, umbral de envejecimiento, CORS, zona horaria) está en `src/main/resources/application.properties`. La zona horaria usada por el servidor para toda fecha/hora de negocio es `America/Bogota` (`app.turnos.zona-horaria`).

## Crear la base de datos

En phpMyAdmin o por consola de MySQL:

```sql
CREATE DATABASE turnos_bancolombia CHARACTER SET utf8mb4;
```

Las tablas se crean automáticamente al iniciar la aplicación (`spring.jpa.hibernate.ddl-auto=update`) y se siembran datos de prueba (usuarios, categorías, servicios, módulos y turnos ficticios) mediante `DataSeeder`, que corre una sola vez al arrancar si la base está vacía.

## Cómo iniciar el backend

Desde NetBeans: abrir el proyecto y usar "Run Project" (usa `nbactions.xml`, ya configurado con la clase principal `com.example.turnos.TurnosBancolombiaApplication`).

Desde la terminal, con Maven:

```
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

## Cuentas de prueba (creadas por el DataSeeder)

| Usuario     | Contraseña   | Rol            |
|-------------|--------------|----------------|
| admin       | admin123     | ADMINISTRADOR  |
| operador1   | operador123  | OPERADOR       |
| operador2   | operador123  | OPERADOR       |

Login: `POST /api/v1/auth/login` con `{"username": "...", "password": "..."}`, devuelve un JWT a enviar como `Authorization: Bearer <token>` en las rutas protegidas.

## Resumen de endpoints

| Método y ruta                         | Rol autorizado            | Propósito                                  |
|----------------------------------------|---------------------------|---------------------------------------------|
| POST /api/v1/auth/login                | Público                   | Autenticar y devolver un JWT                |
| GET/POST /api/v1/turnos                | ADMINISTRADOR, OPERADOR   | Consultar / registrar turnos                |
| GET /api/v1/turnos/{id}                | ADMINISTRADOR, OPERADOR   | Detalle de un turno                         |
| PATCH /api/v1/turnos/{id}/estado       | ADMINISTRADOR, OPERADOR   | Iniciar, finalizar, cancelar, marcar ausente |
| POST /api/v1/modulos/{id}/siguiente    | ADMINISTRADOR, OPERADOR   | Llamar al siguiente turno del servicio      |
| GET /api/v1/publico/pantalla           | Público                   | Pantalla pública (sin datos personales)     |
| /api/v1/usuarios, /servicios, /modulos, /categorias | ADMINISTRADOR (lectura también OPERADOR en servicios/módulos/categorías) | Administración de catálogos |
| GET /api/v1/historial, /historial/indicadores | ADMINISTRADOR        | Historial filtrable e indicadores           |
| GET/PUT /api/v1/parametros             | ADMINISTRADOR             | Consultar/ajustar el umbral de envejecimiento |

## Reglas de selección implementadas (TurnoService)

- Categorías Discapacidad, Embarazada y Adulto mayor: mismo nivel preferente. Regular es la única sin prioridad.
- Un turno Regular que lleva >= umbral (15 min por defecto) en `EN_ESPERA` compite como preferente sin cambiar su categoría original.
- Dentro de cada conjunto se atiende por fecha de ingreso ascendente y, en empate, por ID ascendente.
- Proporción 3 a 1 por servicio, con contador persistente (`contadores_proporcion`) que sobrevive reinicios y se reinicia por día de operación.
- Numeración (`CAJ-20261118-001`) única por servicio y día, calculada bajo bloqueo pesimista sobre `contadores_proporcion` para evitar duplicados con operadores concurrentes.
- Un módulo no puede recibir un nuevo turno si ya tiene uno `LLAMADO` o `EN_ATENCION`.

## Solución de problemas habituales

- **"Unable to determine Dialect without JDBC metadata" / falla de conexión**: MySQL no está corriendo en el puerto 3306, o la base `turnos_bancolombia` no existe. Verifica el servicio de MySQL y vuelve a intentar.
- **401 en cualquier ruta protegida**: falta el header `Authorization: Bearer <token>` o el token venció (expira en 1 hora, `app.jwt.expiration-ms`). Vuelve a hacer login.
- **403 al administrar usuarios/servicios/módulos**: el usuario autenticado tiene rol OPERADOR; esas rutas de administración son solo para ADMINISTRADOR.
- **409 al llamar siguiente turno**: el módulo ya tiene un turno `LLAMADO` o `EN_ATENCION` pendiente de resolver, o la cola del servicio está vacía.

## Pendiente (próximas etapas)

- Frontend (React + TypeScript según la documentación del proyecto).
- Colección Postman/Bruno con las pruebas P01 a P12.
- Documentación Swagger/OpenAPI.
