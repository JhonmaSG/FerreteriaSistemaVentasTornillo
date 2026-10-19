package ferreteria.sistema.ventastornillo.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Configuracion del rate limiting de autenticacion.
 * Los valores por defecto son adecuados para desarrollo; en produccion
 * deben ajustarse segun el perfil de riesgo y el volumen de usuarios.
 *
 * <p>Se registra mediante {@code @EnableConfigurationProperties} en
 * {@link SecurityConfig} para que este disponible en cualquier slice test
 * que cargue la configuracion de seguridad.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    /**
     * Numero maximo de intentos de login permitidos en la ventana de tiempo.
     */
    private int loginAttempts = 5;

    /**
     * Ventana de tiempo en la que se cuentan los intentos.
     */
    private Duration loginWindow = Duration.ofMinutes(1);

    /**
     * Indica si se debe usar el header X-Forwarded-For para identificar al
     * cliente. Solo debe activarse si la aplicacion esta detras de un proxy o
     * load balancer de confianza que sobrescriba ese header.
     *
     * <p>Si se deja en false y la aplicacion esta expuesta directamente, todos
     * los clientes comparten la misma clave (la IP real del socket), lo que
     * hace el limite mas restrictivo pero seguro.
     */
    private boolean trustForwardedFor = false;
}
