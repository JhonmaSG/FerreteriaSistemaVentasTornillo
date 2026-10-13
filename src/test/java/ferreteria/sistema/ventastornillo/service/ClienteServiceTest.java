package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.ClienteRequest;
import ferreteria.sistema.ventastornillo.dto.response.ClienteResponse;
import ferreteria.sistema.ventastornillo.exception.BusinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.Cliente;
import ferreteria.sistema.ventastornillo.repository.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    private ClienteRequest clienteRequest;

    @BeforeEach
    void setUp() {
        cliente = Cliente.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Juan")
                .apellidos("Pérez")
                .direccion("Av. Principal 123")
                .telefono("+51 987654321")
                .email("juan@email.com")
                .activo(true)
                .build();

        clienteRequest = ClienteRequest.builder()
                .dni("12345678")
                .nombres("Juan")
                .apellidos("Pérez")
                .direccion("Av. Principal 123")
                .telefono("+51 987654321")
                .email("juan@email.com")
                .build();
    }

    @Test
    void getClientes_deberiaRetornarListaDeClientes() {
        when(clienteRepository.findAll()).thenReturn(Arrays.asList(cliente));

        List<ClienteResponse> resultado = clienteService.getClientes();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Juan", resultado.get(0).getNombres());
        verify(clienteRepository, times(1)).findAll();
    }

    @Test
    void getClienteId_deberiaRetornarCliente() {
        UUID id = cliente.getId();
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));

        ClienteResponse resultado = clienteService.getClienteId(id);

        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombres());
        verify(clienteRepository, times(1)).findById(id);
    }

    @Test
    void getClienteId_deberiaLanzarExcepcionSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(clienteRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            clienteService.getClienteId(id);
        });
    }

    @Test
    void createCliente_deberiaGuardarCliente() {
        when(clienteRepository.existsByDni(anyString())).thenReturn(false);
        when(clienteRepository.existsByEmail(anyString())).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        ClienteResponse resultado = clienteService.createCliente(clienteRequest);

        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombres());
        verify(clienteRepository, times(1)).save(any(Cliente.class));
    }

    @Test
    void createCliente_deberiaLanzarExcepcionSiDniExiste() {
        when(clienteRepository.existsByDni(anyString())).thenReturn(true);

        assertThrows(BusinessException.class, () -> {
            clienteService.createCliente(clienteRequest);
        });
    }

    @Test
    void createCliente_deberiaLanzarExcepcionSiEmailExiste() {
        when(clienteRepository.existsByDni(anyString())).thenReturn(false);
        when(clienteRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BusinessException.class, () -> {
            clienteService.createCliente(clienteRequest);
        });
    }

    @Test
    void updateCliente_deberiaModificarCliente() {
        UUID id = cliente.getId();
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        ClienteResponse resultado = clienteService.updateCliente(id, clienteRequest);

        assertNotNull(resultado);
        assertEquals("Juan", resultado.getNombres());
    }

    @Test
    void deleteCliente_deberiaEliminarCliente() {
        UUID id = cliente.getId();
        when(clienteRepository.findById(id)).thenReturn(Optional.of(cliente));
        doNothing().when(clienteRepository).delete(any(Cliente.class));

        clienteService.deleteCliente(id);

        verify(clienteRepository, times(1)).delete(any(Cliente.class));
    }
}
