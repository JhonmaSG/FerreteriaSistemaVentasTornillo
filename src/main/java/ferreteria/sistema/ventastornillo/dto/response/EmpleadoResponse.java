package ferreteria.sistema.ventastornillo.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoResponse {

    private UUID id;
    private String dni;
    private String nombre;
    private String apellidos;
    private String telefono;
    private String email;
    private String username;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
