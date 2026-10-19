package ferreteria.sistema.ventastornillo.config;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CorrelationIdFilterTest {

    private final CorrelationIdFilter filter = new CorrelationIdFilter();

    private MockHttpServletResponse invokeFilter(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    @Test
    void sinCorrelationIdEnRequest_debeGenerarUnoYDevolverloEnElHeader() throws Exception {
        MockHttpServletResponse response = invokeFilter(new MockHttpServletRequest());

        String correlationId = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);

        assertNotNull(correlationId);
        assertFalse(correlationId.isBlank());
    }

    @Test
    void conCorrelationIdValido_debePropagarlo() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, "test-correlation-id-123");

        MockHttpServletResponse response = invokeFilter(request);

        assertEquals("test-correlation-id-123",
                response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER));
    }

    @Test
    void conCorrelationIdInvalido_debeGenerarUnoEnVezDePropagarlo() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        // Un valor con saltos de linea permitiria inyectar entradas falsas en el log.
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, "id-invalido\r\nmensaje-falso");

        MockHttpServletResponse response = invokeFilter(request);
        String correlationId = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);

        assertNotNull(correlationId);
        assertNotEquals("id-invalido\r\nmensaje-falso", correlationId);
        assertTrue(correlationId.matches("^[A-Za-z0-9\\-]{1,64}$"),
                "El correlation id generado debe cumplir el formato seguro");
    }

    @Test
    void conCorrelationIdDemasiadoLargo_debeGenerarUnoEnVezDePropagarlo() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(CorrelationIdFilter.CORRELATION_ID_HEADER, "a".repeat(500));

        MockHttpServletResponse response = invokeFilter(request);
        String correlationId = response.getHeader(CorrelationIdFilter.CORRELATION_ID_HEADER);

        assertNotNull(correlationId);
        assertNotEquals("a".repeat(500), correlationId);
        assertTrue(correlationId.length() <= 64);
    }

    @Test
    void elCorrelationIdDebeRetirarseDelMDCAlTerminarElRequest() throws Exception {
        invokeFilter(new MockHttpServletRequest());

        assertNull(MDC.get(CorrelationIdFilter.MDC_KEY_CORRELATION_ID),
                "El MDC debe limpiarse para no contaminar el hilo con el siguiente request");
    }
}
