package ferreteria.sistema.ventastornillo.exception;

import ferreteria.sistema.ventastornillo.dto.response.MessageResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<MessageResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Recurso no encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(MessageResponse.builder().message(ex.getMessage()).build());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<MessageResponse> handleBusinessException(BusinessException ex) {
        log.warn("Regla de negocio violada: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(MessageResponse.builder().message(ex.getMessage()).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            errors.put(fieldName, error.getDefaultMessage());
        });
        log.warn("Validacion fallida en {} campos: {}", errors.size(), errors.keySet());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /**
     * Body JSON malformado o vacio. Spring lanza HttpMessageNotReadableException
     * cuando no puede deserializar el request body. Sin este handler caeria en
     * el handler generico de Exception y responderia 500, cuando en realidad
     * es un error del cliente (400 Bad Request).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<MessageResponse> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Cuerpo de la peticion invalido: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(MessageResponse.builder()
                        .message("El cuerpo de la peticion no tiene un formato JSON valido")
                        .build());
    }

    /**
     * Credenciales incorrectas en el login. Sin este handler, la
     * BadCredentialsException de Spring Security caeria en el handler generico
     * de Exception y el login responderia 500 en vez de 401.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<MessageResponse> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Fallo de autenticacion: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(MessageResponse.builder()
                        .message("Credenciales invalidas")
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGenericException(Exception ex, WebRequest request) {
        log.error("Error no controlado en {}: {}", request.getDescription(false), ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.builder()
                        .message("Error interno del servidor. Contacte al administrador con el correlation id.")
                        .build());
    }
}
