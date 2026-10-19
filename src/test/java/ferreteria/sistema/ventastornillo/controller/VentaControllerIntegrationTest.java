package ferreteria.sistema.ventastornillo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ferreteria.sistema.ventastornillo.dto.request.DetalleVentaRequest;
import ferreteria.sistema.ventastornillo.dto.request.LoginRequest;
import ferreteria.sistema.ventastornillo.dto.request.VentaRequest;
import ferreteria.sistema.ventastornillo.dto.response.JwtResponse;
import ferreteria.sistema.ventastornillo.dto.response.VentaResponse;
import ferreteria.sistema.ventastornillo.model.entity.Cliente;
import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import ferreteria.sistema.ventastornillo.model.entity.Producto;
import ferreteria.sistema.ventastornillo.repository.ClienteRepository;
import ferreteria.sistema.ventastornillo.repository.EmpleadoRepository;
import ferreteria.sistema.ventastornillo.repository.ProductoRepository;
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

import java.math.BigDecimal;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Test de integracion del flujo completo de venta contra una base de datos
 * PostgreSQL real.
 *
 * <p>Este test existe porque los tests unitarios con mocks NO detectan
 * violaciones de restricciones de la base de datos: un mock de repositorio
 * acepta cualquier entidad, incluso una con monto null cuando la columna es
 * NOT NULL. Ese bug estuvo presente en VentaService y solo aparecio al
 * ejecutar el flujo real contra PostgreSQL.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class VentaControllerIntegrationTest {

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
        registry.add("app.admin.username", () -> "admin");
        registry.add("app.admin.password", () -> "admin123");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    private String token;
    private UUID clienteId;
    private UUID empleadoId;
    private UUID productoId;

    @BeforeEach
    void setUp() {
        LoginRequest login = LoginRequest.builder()
                .username("admin")
                .password("admin123")
                .build();

        ResponseEntity<JwtResponse> response = restTemplate.postForEntity(
                "/api/auth/login", login, JwtResponse.class);
        token = response.getBody().getToken();

        // Valores unicos por test: la base de datos es compartida entre los
        // tests de la clase y dni/email tienen restriccion UNIQUE.
        String sufijo = UUID.randomUUID().toString().substring(0, 8);

        Cliente cliente = Cliente.builder()
                .dni(sufijo)
                .nombres("Cliente")
                .apellidos("Prueba")
                .direccion("Calle 1")
                .email("cliente." + sufijo + "@ventas.com")
                .activo(true)
                .build();
        clienteId = clienteRepository.save(cliente).getId();

        Producto producto = Producto.builder()
                .nombre("Martillo Integracion " + sufijo)
                .precio(new BigDecimal("80000"))
                .stock(10)
                .activo(true)
                .build();
        productoId = productoRepository.save(producto).getId();

        Empleado admin = empleadoRepository.findByUsername("admin").orElseThrow();
        empleadoId = admin.getId();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private VentaRequest buildVentaRequest(int cantidad) {
        DetalleVentaRequest detalle = DetalleVentaRequest.builder()
                .productoId(productoId)
                .cantidad(cantidad)
                .build();

        return VentaRequest.builder()
                .clienteId(clienteId)
                .empleadoId(empleadoId)
                .detalles(Collections.singletonList(detalle))
                .build();
    }

    @Test
    void crearVenta_conDatosValidos_debePersistirCabeceraYDetalles() throws Exception {
        ResponseEntity<VentaResponse> response = restTemplate.exchange(
                "/api/ventas", HttpMethod.POST,
                new HttpEntity<>(objectMapper.writeValueAsString(buildVentaRequest(2)), createHeaders()),
                VentaResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        VentaResponse venta = response.getBody();
        assertNotNull(venta.getMonto(), "El monto no puede ser null: la columna es NOT NULL");
        assertEquals(0, new BigDecimal("160000").compareTo(venta.getMonto()));
        assertEquals(1, venta.getDetalles().size());
        assertEquals(0, new BigDecimal("160000").compareTo(venta.getDetalles().get(0).getSubtotal()));
    }

    @Test
    void crearVenta_debeDescontarElStockDelProducto() throws Exception {
        restTemplate.exchange(
                "/api/ventas", HttpMethod.POST,
                new HttpEntity<>(objectMapper.writeValueAsString(buildVentaRequest(2)), createHeaders()),
                VentaResponse.class);

        Producto actualizado = productoRepository.findById(productoId).orElseThrow();
        assertEquals(8, actualizado.getStock(), "El stock debe quedar 10 - 2");
    }

    @Test
    void crearVenta_conStockInsuficiente_debeRetornar400() throws Exception {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/ventas", HttpMethod.POST,
                new HttpEntity<>(objectMapper.writeValueAsString(buildVentaRequest(999)), createHeaders()),
                String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void crearVenta_conClienteInexistente_debeRetornar404() throws Exception {
        VentaRequest request = VentaRequest.builder()
                .clienteId(UUID.randomUUID())
                .empleadoId(empleadoId)
                .detalles(Collections.singletonList(DetalleVentaRequest.builder()
                        .productoId(productoId)
                        .cantidad(1)
                        .build()))
                .build();

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/ventas", HttpMethod.POST,
                new HttpEntity<>(objectMapper.writeValueAsString(request), createHeaders()),
                String.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
