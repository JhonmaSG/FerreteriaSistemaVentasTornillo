package ferreteria.sistema.ventastornillo.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaResponse {

    private UUID id;
    private UUID clienteId;
    private String clienteNombre;
    private UUID empleadoId;
    private String empleadoNombre;
    private String numeroSerie;
    private BigDecimal monto;
    private Boolean activo;
    private List<DetalleVentaResponse> detalles;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}