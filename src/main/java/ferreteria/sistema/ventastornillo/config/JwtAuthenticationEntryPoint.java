package ferreteria.sistema.ventastornillo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ferreteria.sistema.ventastornillo.dto.response.MessageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Se ejecuta cuando una request no tiene credenciales validas (no hay token JWT
 * o el token no pudo validarse). Responde 401 Unauthorized con un cuerpo JSON
 * consistente con el resto de la API.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        MessageResponse body = MessageResponse.builder()
                .message("No autenticado: se requiere un token JWT valido")
                .build();

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
