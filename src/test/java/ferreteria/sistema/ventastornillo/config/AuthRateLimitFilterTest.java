package ferreteria.sistema.ventastornillo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ferreteria.sistema.ventastornillo.dto.request.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthRateLimitFilterTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("test_db")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthRateLimitFilter authRateLimitFilter;

    private String payload;

    @BeforeEach
    void setUp() throws Exception {
        // El estado del rate limit es compartido en el contexto de Spring.
        // Se reinicia para que cada test parta de un estado conocido.
        authRateLimitFilter.resetAllBuckets();

        LoginRequest login = LoginRequest.builder()
                .username("admin")
                .password("password-incorrecta")
                .build();

        payload = objectMapper.writeValueAsString(login);
    }

    private ResponseEntity<String> postLogin() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        return restTemplate.exchange(
                "/api/auth/login", HttpMethod.POST, new HttpEntity<>(payload, headers), String.class);
    }

    @Test
    void alExcederElLimite_debeRetornar429ConRetryAfter() {
        int maxAttempts = 5;

        // Los intentos dentro del limite se rechazan por credenciales invalidas (401).
        for (int i = 0; i < maxAttempts; i++) {
            ResponseEntity<String> response = postLogin();
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                    "El intento " + (i + 1) + " deberia fallar por credenciales invalidas");
        }

        // El intento siguiente excede el limite y debe ser bloqueado.
        ResponseEntity<String> blocked = postLogin();

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, blocked.getStatusCode());
        assertTrue(blocked.getHeaders().containsKey("Retry-After"),
                "La respuesta 429 debe incluir el header Retry-After");
    }

    @Test
    void endpointDistintoAlLogin_noDebeSerAfectadoPorElRateLimit() {
        for (int i = 0; i < 10; i++) {
            ResponseEntity<String> response = restTemplate.getForEntity("/api/clientes", String.class);
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                    "Un endpoint protegido sin token debe responder 401, nunca 429");
        }
    }

    @Test
    void loginConCredencialesInvalidas_debeRetornar401YNo500() {
        ResponseEntity<String> response = postLogin();

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
                "Las credenciales invalidas son un fallo de autenticacion (401), no un error del servidor (500)");
    }

    @Test
    void loginConJsonMalformado_debeRetornar400YNo500() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/auth/login", HttpMethod.POST,
                new HttpEntity<>("{esto-no-es-json", headers), String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(),
                "Un body malformado es un error del cliente (400), no del servidor (500)");
    }
}
