package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.DetalleVentaRequest;
import ferreteria.sistema.ventastornillo.dto.request.VentaRequest;
import ferreteria.sistema.ventastornillo.dto.response.DetalleVentaResponse;
import ferreteria.sistema.ventastornillo.dto.response.VentaResponse;
import ferreteria.sistema.ventastornillo.exception.BusinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.*;
import ferreteria.sistema.ventastornillo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    @Transactional(readOnly = true)
    public List<VentaResponse> getVentas() {
        return ventaRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VentaResponse getVentaId(UUID id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", "id", id));
        return mapToResponse(venta);
    }

    @Transactional
    public VentaResponse createVenta(VentaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", "id", request.getClienteId()));

        Empleado empleado = empleadoRepository.findById(request.getEmpleadoId())
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", request.getEmpleadoId()));

        Venta venta = Venta.builder()
                .cliente(cliente)
                .empleado(empleado)
                .numeroSerie(generarNumeroSerie())
                .activo(true)
                .build();

        // El total y los detalles se calculan ANTES de persistir la cabecera.
        // Si se guardara la venta con el monto null, la columna "monto"
        // (NOT NULL) rechazaria el INSERT. Ademas, al tener la cabecera el
        // cascade ALL, los detalles se persisten en la misma operacion.
        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal montoTotal = BigDecimal.ZERO;

        for (DetalleVentaRequest detReq : request.getDetalles()) {
            Producto producto = productoRepository.findById(detReq.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", detReq.getProductoId()));

            if (producto.getStock() < detReq.getCantidad()) {
                throw new BusinessException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            BigDecimal precioVenta = detReq.getPrecioVenta() != null
                    ? detReq.getPrecioVenta()
                    : producto.getPrecio();

            BigDecimal subtotal = precioVenta.multiply(BigDecimal.valueOf(detReq.getCantidad()));

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(detReq.getCantidad())
                    .precioVenta(precioVenta)
                    .subtotal(subtotal)
                    .build();

            detalles.add(detalle);
            venta.getDetalles().add(detalle);
            montoTotal = montoTotal.add(subtotal);

            producto.setStock(producto.getStock() - detReq.getCantidad());
            productoRepository.save(producto);
        }

        venta.setMonto(montoTotal);

        // Con cascade = ALL en la relacion, la cabecera y sus detalles se
        // guardan en una sola operacion transaccional.
        Venta ventaGuardada = ventaRepository.save(venta);

        return mapToResponse(ventaGuardada);
    }

    @Transactional
    public void deleteVenta(UUID id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", "id", id));
        ventaRepository.delete(venta);
    }

    private String generarNumeroSerie() {
        String max = ventaRepository.findMaxNumeroSerie();
        if (max == null) {
            return "00000001";
        }
        int next = Integer.parseInt(max) + 1;
        return String.format("%08d", next);
    }

    private VentaResponse mapToResponse(Venta venta) {
        List<DetalleVentaResponse> detalles = detalleVentaRepository.findByVentaId(venta.getId())
                .stream()
                .map(d -> DetalleVentaResponse.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoNombre(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioVenta(d.getPrecioVenta())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return VentaResponse.builder()
                .id(venta.getId())
                .clienteId(venta.getCliente().getId())
                .clienteNombre(venta.getCliente().getNombres() + " " + venta.getCliente().getApellidos())
                .empleadoId(venta.getEmpleado().getId())
                .empleadoNombre(venta.getEmpleado().getNombres() + " " + venta.getEmpleado().getApellidos())
                .numeroSerie(venta.getNumeroSerie())
                .monto(venta.getMonto())
                .activo(venta.getActivo())
                .detalles(detalles)
                .fechaCreacion(venta.getFechaCreacion())
                .fechaModificacion(venta.getFechaModificacion())
                .build();
    }
}
