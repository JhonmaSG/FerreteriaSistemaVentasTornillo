package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.config.JwtAuthenticationFilter;
import ferreteria.sistema.ventastornillo.service.AuthService;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@AutoConfigureMockMvc
//@Disabled("Requiere Docker - ejecutar manualmente cuando esté disponible")
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private AuthService authService;

    @Test
    void accederSinToken_aEndpointProtegido_deberiaRetornar403() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void accederConUsuarioAutenticado_aEndpointProtegido_deberiaRetornar200() throws Exception {
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk());
    }
}
