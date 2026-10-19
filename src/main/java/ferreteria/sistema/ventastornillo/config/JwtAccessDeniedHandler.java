package ferreteria.sistema.ventastornillo.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import ferreteria.sistema.ventastornillo.dto.response.MessageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Se ejecuta cuando el usuario esta autenticado pero no tiene permisos
 * suficientes para el recurso solicitado. Responde 403 Forbidden con un
 * cuerpo JSON consistente con el resto de la API.
 */
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        MessageResponse body = MessageResponse.builder()
                .message("Acceso denegado: no tienes permisos para este recurso")
                .build();

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
