package ferreteria.sistema.ventastornillo.service;


import ferreteria.sistema.ventastornillo.dto.request.DetalleVentaRequest;
import ferreteria.sistema.ventastornillo.dto.request.VentaRequest;
import ferreteria.sistema.ventastornillo.dto.response.VentaResponse;
import ferreteria.sistema.ventastornillo.exception.BusinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.*;
import ferreteria.sistema.ventastornillo.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private DetalleVentaRepository detalleVentaRepository;

    @InjectMocks
    private VentaService ventaService;

    private Cliente cliente;
    private Empleado empleado;
    private Producto producto;
    private Venta venta;
    private VentaRequest ventaRequest;

    @BeforeEach
    void setUp() {
        cliente = Cliente.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Juan")
                .apellidos("Pérez")
                .activo(true)
                .build();

        empleado = Empleado.builder()
                .id(UUID.randomUUID())
                .dni("87654321")
                .nombres("Carlos")
                .apellidos("García")
                .activo(true)
                .build();

        producto = Producto.builder()
                .id(UUID.randomUUID())
                .nombre("Martillo Mecánico")
                .precio(new BigDecimal("80000"))
                .stock(10)
                .activo(true)
                .build();

        venta = Venta.builder()
                .id(UUID.randomUUID())
                .cliente(cliente)
                .empleado(empleado)
                .numeroSerie("00000001")
                .monto(new BigDecimal("160000"))
                .activo(true)
                .build();

        DetalleVentaRequest detalleRequest = DetalleVentaRequest.builder()
                .productoId(producto.getId())
                .cantidad(2)
                .precioVenta(new BigDecimal("80000"))
                .build();

        ventaRequest = VentaRequest.builder()
                .clienteId(cliente.getId())
                .empleadoId(empleado.getId())
                .detalles(Collections.singletonList(detalleRequest))
                .build();
    }

    @Test
    void getVentas_deberiaRetornarListaDeVentas() {
        when(ventaRepository.findAll()).thenReturn(Arrays.asList(venta));
        when(detalleVentaRepository.findByVentaId(any())).thenReturn(Collections.emptyList());

        List<VentaResponse> resultado = ventaService.listarTodos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
    }

    @Test
    void getVentaId_deberiaRetornarVenta() {
        UUID id = venta.getId();
        when(ventaRepository.findById(id)).thenReturn(Optional.of(venta));
        when(detalleVentaRepository.findByVentaId(id)).thenReturn(Collections.emptyList());

        VentaResponse resultado = ventaService.obtenerPorId(id);

        assertNotNull(resultado);
        assertEquals("00000001", resultado.getNumeroSerie());
    }

    @Test
    void getVentaId_deberiaLanzarExcepcionSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(ventaRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            ventaService.obtenerPorId(id);
        });
    }

    @Test
    void createVenta_deberiaGuardarVentaConDetalles() {
        when(clienteRepository.findById(any())).thenReturn(Optional.of(cliente));
        when(empleadoRepository.findById(any())).thenReturn(Optional.of(empleado));
        when(productoRepository.findById(any())).thenReturn(Optional.of(producto));
        when(ventaRepository.findMaxNumeroSerie()).thenReturn(null);
        when(ventaRepository.save(any(Venta.class))).thenReturn(venta);
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);
        when(detalleVentaRepository.saveAll(anyList())).thenReturn(Collections.emptyList());

        VentaResponse resultado = ventaService.crear(ventaRequest);

        assertNotNull(resultado);
        verify(ventaRepository, times(2)).save(any(Venta.class));
        verify(productoRepository, times(1)).save(any(Producto.class));
    }

    @Test
    void createVenta_deberiaLanzarExcepcionSiClienteNoExiste() {
        when(clienteRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            ventaService.crear(ventaRequest);
        });
    }

    @Test
    void createVenta_deberiaLanzarExcepcionSiEmpleadoNoExiste() {
        when(clienteRepository.findById(any())).thenReturn(Optional.of(cliente));
        when(empleadoRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            ventaService.crear(ventaRequest);
        });
    }

    @Test
    void createVenta_deberiaLanzarExcepcionSiStockInsuficiente() {
        producto.setStock(1);
        when(clienteRepository.findById(any())).thenReturn(Optional.of(cliente));
        when(empleadoRepository.findById(any())).thenReturn(Optional.of(empleado));
        when(productoRepository.findById(any())).thenReturn(Optional.of(producto));

        assertThrows(BusinessException.class, () -> {
            ventaService.crear(ventaRequest);
        });
    }

    @Test
    void deleteVenta_deberiaEliminarVenta() {
        UUID id = venta.getId();
        when(ventaRepository.findById(id)).thenReturn(Optional.of(venta));
        doNothing().when(ventaRepository).delete(any(Venta.class));

        ventaService.eliminar(id);

        verify(ventaRepository, times(1)).delete(any(Venta.class));
    }
}
