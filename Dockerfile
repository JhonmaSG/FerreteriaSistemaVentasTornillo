# syntax=docker/dockerfile:1

# =====================================================================
# Stage 1: Compilacion
# =====================================================================
# Se usa la imagen con Maven solo para construir. Nada de esto llega
# a la imagen final.
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Se copia primero el pom.xml de forma aislada. Mientras el pom no
# cambie, esta capa se reutiliza del cache de Docker y no se vuelve a
# descargar todo el arbol de dependencias.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Reci aqui se copia el codigo fuente.
COPY src ./src

# -DskipTests: los tests se ejecutan en el pipeline de CI, no al construir
# la imagen. En local se pueden correr aparte con "mvn test".
RUN mvn -B -q clean package -DskipTests

# =====================================================================
# Stage 2: Ejecucion
# =====================================================================
# Se usa la variante Alpine (musl libc) en lugar de la variante completa
# (glibc). Reduce la imagen base de ~570MB a ~270MB. El trade-off: algunas
# librerias nativas con binarios precompilados para glibc no funcionarian,
# pero el stack usado aqui (Tomcat, JDBC, PostgreSQL) es puro Java.
FROM eclipse-temurin:17-jre-alpine AS runtime

# curl se usa para el HEALTHCHECK. --no-cache evita cachear los indices
# de apk y el directorio /var/cache queda limpio.
RUN apk add --no-cache curl

# La aplicacion corre con un usuario sin privilegios. Si un atacante
# compromete el contenedor, no puede escalar a root dentro de el.
# En Alpine los comandos son addgroup/adduser, no groupadd/useradd.
RUN addgroup -S -g 1001 appgroup \
    && adduser -S -u 1001 -G appgroup -h /app -s /sbin/nologin appuser

WORKDIR /app

# Solo se copia el JAR final. La imagen no contiene Maven, ni el codigo
# fuente, ni el repositorio de dependencias.
# --chown asigna el propietario en la misma capa: hacerlo con un RUN chown
# posterior crearia una capa extra que duplica los 68MB del JAR.
COPY --from=builder --chown=appuser:appgroup /build/target/*.jar app.jar

USER appuser

EXPOSE 8080

# Metadatos OCI: permiten identificar la imagen, su version y su origen
# sin depender de un registro externo.
LABEL org.opencontainers.image.title="Sistema Ventas API" \
      org.opencontainers.image.description="API REST de ventas - Ferreteria Tornillo" \
      org.opencontainers.image.vendor="FerreteriaTornillo" \
      org.opencontainers.image.version="0.0.1-SNAPSHOT" \
      org.opencontainers.image.source="https://github.com/JhonmaSG/FerreteriaSistemaVentasTornillo" \
      org.opencontainers.image.licenses="MIT"

# MaxRAMPercentage hace que la JVM use el limite de memoria del contenedor
# en lugar del limite de la maquina host. Sin esto, la JVM puede reservar
# memoria que el contenedor no tiene y ser matada por el OOM killer.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=25.0 -Djava.security.egd=file:/dev/./urandom"

# start-period es el tiempo de gracia inicial: la app tarda en arrancar
# (JVM, pool de conexiones, migraciones) y no debe contarse como fallo.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS http://localhost:8080/actuator/health || exit 1

# exec hace que java sea el PID 1 del contenedor, de modo que recibe
# correctamente las senales SIGTERM que envia "docker stop".
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
