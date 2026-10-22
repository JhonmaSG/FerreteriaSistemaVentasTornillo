# Sistema Ventas - Ferreteria Tornillo

![CI](https://github.com/JhonmaSG/FerreteriaSistemaVentasTornillo/actions/workflows/ci.yml/badge.svg)

API REST para la gestión de ventas de una ferretería: clientes, productos, empleados y registro de ventas con control de stock.

Proyecto de portafolio construido como evolución de un sistema legacy (JSP + Servlets + JDBC + MySQL) hacia un stack moderno con Spring Boot.

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 3.5.16 |
| Base de datos | PostgreSQL 16 |
| ORM | Spring Data JPA / Hibernate 6.6 |
| Seguridad | Spring Security 6.5 + JWT (jjwt 0.12.6) |
| Migraciones / Schema | Hibernate `ddl-auto` (pendiente: Flyway) |
| Documentación API | OpenAPI 3 / Swagger UI (springdoc) |
| Rate limiting | Bucket4j 8.21 |
| Observabilidad | Logging estructurado ECS nativo + Actuator |
| Testing | JUnit 5, Mockito, Testcontainers, Spring Boot Test |
| Contenedores | Docker (multi-stage), Docker Compose |
| Build | Maven |

## Arquitectura

Monolito modular con capas:

```
Controller (REST)  →  Service (negocio + transacciones)  →  Repository (JPA)  →  PostgreSQL
```

Contexto de dominio: `Identity` (empleados), `Catalog` (productos), `Sales` (ventas), `CRM` (clientes).

## Requisitos

- Java 17+
- Maven 3.8+ (o usar el wrapper `./mvnw`)
- Docker Desktop (para la ejecución containerizada y los tests de integración)

## Ejecución con Docker (recomendado)

```bash
# 1. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env y completar DB_PASSWORD, JWT_SECRET y ADMIN_PASSWORD

# 2. Levantar la aplicación
docker compose up -d --build

# 3. Ver el estado
docker compose ps
docker compose logs -f app
```

La API queda disponible en `http://localhost:8080` y Swagger UI en `http://localhost:8080/swagger-ui.html`.

**Variables obligatorias** (compose falla de inmediato si faltan):

| Variable | Descripción |
|---|---|
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Clave de firma del JWT (mínimo 48 caracteres) |
| `ADMIN_PASSWORD` | Contraseña del usuario administrador inicial |

Comandos útiles:

```bash
docker compose down          # Detiene los contenedores (conserva los datos)
docker compose down -v       # Detiene y BORRA el volumen de PostgreSQL
docker compose logs -f app   # Sigue los logs de la aplicación
```

## Ejecución local (sin Docker)

```bash
# 1. Crear la base de datos
createdb bd_ventas

# 2. Configurar credenciales
cp .env.example .env

# 3. Ejecutar
./mvnw spring-boot:run
```

## Testing

Los tests están separados por convención de Maven:

| Comando | Qué ejecuta | Requiere Docker |
|---|---|---|
| `./mvnw test` | Solo unitarios (`*Test`) | No |
| `./mvnw verify` | Unitarios + integración (`*IT`) | Sí |

```bash
./mvnw test                                 # Unitarios (rápido, sin Docker)
./mvnw verify                               # Suite completa (unitarios + integración)
./mvnw test -Dtest=ClienteServiceTest       # Un test unitario concreto
./mvnw verify -Dit.test=ClienteControllerIT # Un test de integración concreto
```

**Surefire** ejecuta los `*Test` y **Failsafe** los `*IT`, de modo que `mvn test` nunca falla por no tener Docker levantado. Los tests de integración usan **Testcontainers**: levantan un PostgreSQL real en un contenedor, de modo que se validan las restricciones de la base de datos (NOT NULL, UNIQUE, FK) que los mocks no pueden detectar.

## CI/CD

El pipeline (`.github/workflows/ci.yml`) se ejecuta en cada push a `main` y en cada Pull Request. Los jobs de validación son **bloqueantes**: si fallan, el merge no debería permitirse.

| Job | Qué valida | Bloqueante |
|---|---|---|
| `Build and test` | Compila, corre unitarios y integración con Testcontainers | Sí |
| `Secret scan` | Gitleaks sobre todo el historial de Git | Sí |
| `Dependency scan` | Trivy sobre el fat JAR (CVEs corregibles CRITICAL/HIGH) | Sí |
| `Docker build and image scan` | Construye la imagen y escanea SO + dependencias | Sí |
| `Publish image to GHCR` | Publica la imagen (solo en `main`, nunca en PRs) | — |

**Reproducir el pipeline en local:**

```bash
./mvnw verify
gitleaks detect --source . --verbose --redact
docker build -t ferreteria-tornillo:ci .
```

**Imagen publicada** (solo tras un push a `main`):

```bash
docker pull ghcr.io/jhonmasg/ferreteria-tornillo:latest
docker pull ghcr.io/jhonmasg/ferreteria-tornillo:sha-<commit>
```

La imagen es pública: no requiere `docker login` para descargarla.

**Escaneo de dependencias:** se usa Trivy en modo `rootfs`, no `fs`. El modo `fs` está pensado para lockfiles y no analiza JARs (reporta `0 language-specific files`), lo que produciría un falso negativo. `rootfs` descomprime el fat JAR y revisa cada dependencia de `BOOT-INF/lib`.

**Excepciones de seguridad:** `.trivyignore.yaml` contiene únicamente riesgos verificados como no explotables y **con fecha de caducidad**. Al vencer, el CVE vuelve a bloquear el pipeline y obliga a revisar la decisión. Actualmente hay dos CVEs de Spring Framework 6.2 cuyo parche solo existe en la línea Enterprise 6.2.20; el código vulnerable (XsltView y SSE con fragmentos de vista) no se usa en esta API REST. La ruta de salida es Spring Boot 4.0.x (Framework 7.0.9+).

**Dependabot** (`.github/dependabot.yml`) abre PRs semanales para Maven, GitHub Actions y la imagen Docker. Cada PR pasa por el mismo pipeline antes de poder mergearse.

**Protección de `main` recomendada** (Settings → Branches): exigir Pull Request, exigir que pasen los checks `Build and test`, `Secret scan (Gitleaks)`, `Dependency scan (Trivy)` y `Docker build and image scan`, y prohibir el push directo.

## Autenticación

```bash
# Obtener token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<ADMIN_PASSWORD>"}'

# Usar el token
curl http://localhost:8080/api/clientes \
  -H "Authorization: Bearer <TOKEN>"
```

## Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Autenticación (público) |
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Crear producto |
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/ventas` | Registrar venta (descuenta stock) |
| GET | `/actuator/health` | Estado de la aplicación (público) |

## Seguridad implementada

- Autenticación stateless con JWT (BCrypt para contraseñas).
- Autorización por roles (`ROLE_ADMIN`, `ROLE_VENDEDOR`).
- Rate limiting en el login (5 intentos/minuto por cliente) para mitigar fuerza bruta.
- Validación de entrada con Jakarta Validation.
- Manejo global de errores: el stack trace nunca se expone al cliente.
- Endpoints administrativos separados de los de negocio.
- Contenedor ejecutándose con usuario no-root.
- Secretos fuera del repositorio mediante variables de entorno.

## Observabilidad

- Logs estructurados en formato ECS (JSON) con `correlationId` por request.
- Header `X-Correlation-Id` en todas las respuestas para trazar incidencias.
- Actuator con health checks, probes de liveness/readiness e información de la app.

## Documentación técnica

- **ADRs**: `docs/adr/` — decisiones arquitectónicas con su contexto y trade-offs.
- **Diagramas**: `docs/` — componentes, secuencia y modelo de datos.

## Estructura del proyecto

```
src/main/java/ferreteria/sistema/ventastornillo/
├── config/       Seguridad, JWT, OpenAPI, JPA, rate limiting
├── controller/   Endpoints REST
├── dto/          Contratos de entrada y salida
├── exception/    Excepciones y manejador global
├── model/        Entidades JPA y enums
├── repository/   Repositorios Spring Data JPA
├── security/     UserDetailsService
└── service/      Lógica de negocio
```
