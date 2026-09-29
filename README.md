# SistemaVentasWeb

Sistema de ventas web construido con Java, Spring Boot 4.0.8 y PostgreSQL.

## Descripción

Proyecto de gestión de ventas que incluye CRUD de clientes, productos, empleados y registro de ventas. Actualmente en proceso de evolución desde una arquitectura tradicional (JSP + Servlets + MySQL) hacia un stack moderno con Spring Boot, Spring Security, JPA y PostgreSQL.

## Estado del proyecto

**Fase actual:** Migración a Spring Boot 4.0.8 + Java 17

### Stack tecnológico

| Componente | Tecnología |
|---|---|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.0.8 |
| Base de datos | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Seguridad | Spring Security + JWT |
| API | REST (en desarrollo) |
| Documentación API | OpenAPI / Swagger |

### Estructura del dominio

- **Clientes:** Gestión de datos de clientes.
- **Productos:** Catálogo de productos con stock.
- **Empleados:** Usuarios del sistema con roles.
- **Ventas:** Registro de ventas con detalle de productos.

## Requisitos

- Java 17+
- Maven 3.8+
- PostgreSQL 14+