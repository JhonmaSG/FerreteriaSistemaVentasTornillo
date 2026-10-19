package ferreteria.sistema.ventastornillo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Genera o propaga un identificador de correlacion para cada request.
 * El ID queda en el MDC (visible en los logs) y se devuelve en el header
 * X-Correlation-Id para que el cliente pueda reportar el problema.
 *
 * <p>El valor recibido del cliente se valida contra una allowlist antes de
 * usarse: un valor sin sanitizar permitiria inyectar entradas falsas en el log
 * (log injection) o saturar el MDC con un valor enorme.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    public static final String MDC_KEY_CORRELATION_ID = "correlationId";

    /**
     * Solo se aceptan identificadores alfanumericos y guiones, con longitud
     * acotada. Cualquier otro valor se descarta y se genera uno nuevo.
     */
    private static final Pattern SAFE_CORRELATION_ID = Pattern.compile("^[A-Za-z0-9\\-]{1,64}$");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = resolveCorrelationId(request);

        MDC.put(MDC_KEY_CORRELATION_ID, correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY_CORRELATION_ID);
        }
    }

    /**
     * Devuelve el correlation id del header si es seguro, o genera uno nuevo.
     */
    private String resolveCorrelationId(HttpServletRequest request) {
        String header = request.getHeader(CORRELATION_ID_HEADER);

        if (header != null && SAFE_CORRELATION_ID.matcher(header).matches()) {
            return header;
        }

        return UUID.randomUUID().toString();
    }
}
