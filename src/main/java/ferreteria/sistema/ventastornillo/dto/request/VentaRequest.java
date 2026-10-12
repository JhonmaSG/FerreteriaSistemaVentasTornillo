package ferreteria.sistema.ventastornillo.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaRequest {

    @NotNull(message = "El cliente es obligatorio")
    private UUID clienteId;

    @NotNull(message = "El empleado es obligatorio")
    private UUID empleadoId;

    @NotEmpty(message = "La venta debe tener al menos un detalle")
    private List<DetalleVentaRequest> detalles;
}
