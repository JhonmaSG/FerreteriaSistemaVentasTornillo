package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.ProductoRequest;
import ferreteria.sistema.ventastornillo.dto.response.ProductoResponse;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.Producto;
import ferreteria.sistema.ventastornillo.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto producto;
    private ProductoRequest productoRequest;

    @BeforeEach
    void setUp() {
        producto = Producto.builder()
                .id(UUID.randomUUID())
                .nombre("Martillo Mecánico")
                .precio(new BigDecimal("80000"))
                .stock(10)
                .activo(true)
                .build();

        productoRequest = ProductoRequest.builder()
                .nombre("Martillo Mecánico")
                .precio(new BigDecimal("80000"))
                .stock(10)
                .build();
    }

    @Test
    void getProductos_deberiaRetornarListaDeProductos() {
        when(productoRepository.findAll()).thenReturn(Arrays.asList(producto));

        List<ProductoResponse> resultado = productoService.getProductos();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Martillo Mecánico", resultado.get(0).getNombre());
    }

    @Test
    void getProductoId_deberiaRetornarProducto() {
        UUID id = producto.getId();
        when(productoRepository.findById(id)).thenReturn(Optional.of(producto));

        ProductoResponse resultado = productoService.getProductoId(id);

        assertNotNull(resultado);
        assertEquals("Martillo Mecánico", resultado.getNombre());
    }

    @Test
    void getProductoId_deberiaLanzarExcepcionSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(productoRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productoService.getProductoId(id);
        });
    }

    @Test
    void createProducto_deberiaGuardarProducto() {
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        ProductoResponse resultado = productoService.createProducto(productoRequest);

        assertNotNull(resultado);
        assertEquals("Martillo Mecánico", resultado.getNombre());
        verify(productoRepository, times(1)).save(any(Producto.class));
    }

    @Test
    void updateProducto_deberiaModificarProducto() {
        UUID id = producto.getId();
        when(productoRepository.findById(id)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Producto.class))).thenReturn(producto);

        ProductoResponse resultado = productoService.updateProducto(id, productoRequest);

        assertNotNull(resultado);
        assertEquals("Martillo Mecánico", resultado.getNombre());
    }

    @Test
    void deleteProducto_deberiaEliminarProducto() {
        UUID id = producto.getId();
        when(productoRepository.findById(id)).thenReturn(Optional.of(producto));
        doNothing().when(productoRepository).delete(any(Producto.class));

        productoService.deleteProducto(id);

        verify(productoRepository, times(1)).delete(any(Producto.class));
    }
}
