package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.dto.request.ClienteRequest;
import ferreteria.sistema.ventastornillo.dto.request.LoginRequest;
import ferreteria.sistema.ventastornillo.dto.response.ClienteResponse;
import ferreteria.sistema.ventastornillo.dto.response.JwtResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
//@Disabled("Requiere Docker - ejecutar manualmente cuando esté disponible")
class ClienteControllerIntegrationTest {

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

    private String token;

    @BeforeEach
    void setUp() {
        LoginRequest login = LoginRequest.builder()
                .username("admin")
                .password("admin123")
                .build();

        ResponseEntity<JwtResponse> response = restTemplate.postForEntity(
                "/api/auth/login", login, JwtResponse.class);

        token = response.getBody().getToken();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    @Test
    void listarClientes_conTokenValido_deberiaRetornar200() {
        HttpEntity<Void> request = new HttpEntity<>(createHeaders());

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/clientes", HttpMethod.GET, request, String.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void listarClientes_sinToken_deberiaRetornar403() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/clientes", String.class);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void crearCliente_conTokenValido_deberiaRetornar201() {
        ClienteRequest cliente = ClienteRequest.builder()
                .dni("87654321")
                .nombres("María")
                .apellidos("López")
                .direccion("Av. Secundaria 456")
                .email("maria@email.com")
                .build();

        HttpEntity<ClienteRequest> request = new HttpEntity<>(cliente, createHeaders());

        ResponseEntity<ClienteResponse> response = restTemplate.postForEntity(
                "/api/clientes", request, ClienteResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("María", response.getBody().getNombres());
    }

    @Test
    void crearCliente_conDniDuplicado_deberiaRetornar400() {
        ClienteRequest cliente = ClienteRequest.builder()
                .dni("12345678")
                .nombres("Juan")
                .apellidos("Pérez")
                .direccion("Av. Principal 123")
                .email("juan2@email.com")
                .build();

        HttpEntity<ClienteRequest> request = new HttpEntity<>(cliente, createHeaders());

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/clientes", request, String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
