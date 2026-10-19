package ferreteria.sistema.ventastornillo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ferreteria.sistema.ventastornillo.dto.response.MessageResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita los intentos de login por cliente para mitigar ataques de fuerza bruta.
 *
 * <p>Se ejecuta antes del filtro JWT y de la verificacion de credenciales porque
 * BCrypt es deliberadamente costoso: sin este filtro, cada intento no autorizado
 * consume CPU de la aplicacion.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@RequiredArgsConstructor
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";

    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;

    /**
     * Buckets por cliente. Se purgan periodicamente para evitar que el mapa
     * crezca de forma indefinida (un atacante con IPs distintas lo inflaria).
     */
    private final Map<String, BucketEntry> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !LOGIN_PATH.equals(request.getServletPath());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String clientKey = resolveClientKey(request);
        Bucket bucket = obtainBucket(clientKey);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            long retryAfterSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000 + 1;
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

            MessageResponse body = MessageResponse.builder()
                    .message("Demasiados intentos de login. Intenta nuevamente en "
                            + retryAfterSeconds + " segundos")
                    .build();

            objectMapper.writeValue(response.getOutputStream(), body);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket obtainBucket(String clientKey) {
        BucketEntry entry = buckets.compute(clientKey, (key, existing) -> {
            if (existing == null) {
                return new BucketEntry(newBucket());
            }
            existing.touch();
            return existing;
        });

        return entry.getBucket();
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(properties.getLoginAttempts())
                .refillIntervally(properties.getLoginAttempts(), properties.getLoginWindow())
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * X-Forwarded-For es un header controlado por el cliente: solo debe
     * confiarse cuando la aplicacion esta detras de un proxy o load balancer
     * de confianza que lo sobrescriba. Si no, un atacante evadiria el limite
     * enviando un valor distinto en cada request.
     */
    private String resolveClientKey(HttpServletRequest request) {
        if (properties.isTrustForwardedFor()) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    /**
     * Elimina los buckets de clientes que no han hecho requests dentro de
     * doble ventana de tiempo. Sin esta purga, el mapa creeria de forma
     * indefinida y agotaria la memoria del proceso.
     */
    @Scheduled(fixedDelayString = "${app.rate-limit.cleanup-interval-ms:300000}")
    public void purgeInactiveBuckets() {
        long ttlMillis = properties.getLoginWindow().toMillis() * 2;
        long now = System.currentTimeMillis();

        buckets.entrySet().removeIf(entry ->
                now - entry.getValue().getLastAccessMillis() > ttlMillis);
    }

    /**
     * Restablece todos los buckets a su estado inicial.
     *
     * <p>Visible para testing: el estado del rate limit es compartido en el
     * contexto de Spring, por lo que sin este metodo cada test dependeria del
     * orden de ejecucion de los anteriores.
     */
    void resetAllBuckets() {
        buckets.values().forEach(entry -> entry.getBucket().reset());
    }

    /**
     * Bucket con la marca de tiempo del ultimo acceso.
     */
    private static final class BucketEntry {

        private final Bucket bucket;
        private volatile long lastAccessMillis = System.currentTimeMillis();

        private BucketEntry(Bucket bucket) {
            this.bucket = bucket;
        }

        private Bucket getBucket() {
            return bucket;
        }

        private long getLastAccessMillis() {
            return lastAccessMillis;
        }

        private void touch() {
            this.lastAccessMillis = System.currentTimeMillis();
        }
    }
}
