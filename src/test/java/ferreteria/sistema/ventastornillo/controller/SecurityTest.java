package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.config.JwtAuthenticationFilter;
import ferreteria.sistema.ventastornillo.config.RateLimitProperties;
import ferreteria.sistema.ventastornillo.dto.response.ClienteResponse;
import ferreteria.sistema.ventastornillo.service.AuthService;
import ferreteria.sistema.ventastornillo.service.ClienteService;
import ferreteria.sistema.ventastornillo.service.EmpleadoService;
import ferreteria.sistema.ventastornillo.service.ProductoService;
import ferreteria.sistema.ventastornillo.service.VentaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@AutoConfigureMockMvc
@EnableConfigurationProperties(RateLimitProperties.class)
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private ClienteService clienteService;

    @MockitoBean
    private ProductoService productoService;

    @MockitoBean
    private EmpleadoService empleadoService;

    @MockitoBean
    private VentaService ventaService;

    @Test
    void accederSinToken_aEndpointProtegido_deberiaRetornar401() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accederConTokenInvalido_aEndpointProtegido_deberiaRetornar401() throws Exception {
        mockMvc.perform(get("/api/clientes")
                        .header("Authorization", "Bearer token.invalido.firma"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void accederConUsuarioAutenticado_aEndpointProtegido_deberiaRetornar200() throws Exception {
        when(clienteService.getClientes()).thenReturn(Collections.<ClienteResponse>emptyList());

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk());
    }
}
