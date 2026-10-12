package ferreteria.sistema.ventastornillo.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleVentaResponse {

    private UUID id;
    private UUID productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precioVenta;
    private BigDecimal subtotal;
}
