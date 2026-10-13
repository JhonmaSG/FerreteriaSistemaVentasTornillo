package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.EmpleadoRequest;
import ferreteria.sistema.ventastornillo.dto.response.EmpleadoResponse;
import ferreteria.sistema.ventastornillo.exception.BusinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import ferreteria.sistema.ventastornillo.repository.EmpleadoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpleadoServiceTest {

    @Mock
    private EmpleadoRepository empleadoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmpleadoService empleadoService;

    private Empleado empleado;
    private EmpleadoRequest empleadoRequest;

    @BeforeEach
    void setUp() {
        empleado = Empleado.builder()
                .id(UUID.randomUUID())
                .dni("12345678")
                .nombres("Carlos")
                .apellidos("García")
                .telefono("+51 987654321")
                .email("carlos@email.com")
                .username("cgarcia")
                .password("password123")
                .activo(true)
                .build();

        empleadoRequest = EmpleadoRequest.builder()
                .dni("12345678")
                .nombres("Carlos")
                .apellidos("García")
                .telefono("+51 987654321")
                .email("carlos@email.com")
                .username("cgarcia")
                .password("password123")
                .build();
    }

    @Test
    void getEmpleados_deberiaRetornarListaDeEmpleados() {
        when(empleadoRepository.findAll()).thenReturn(Arrays.asList(empleado));

        List<EmpleadoResponse> resultado = empleadoService.getEmpleados();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Carlos", resultado.get(0).getNombres());
    }

    @Test
    void getEmpleadoId_deberiaRetornarEmpleado() {
        UUID id = empleado.getId();
        when(empleadoRepository.findById(id)).thenReturn(Optional.of(empleado));

        EmpleadoResponse resultado = empleadoService.getEmpleadoId(id);

        assertNotNull(resultado);
        assertEquals("Carlos", resultado.getNombres());
    }

    @Test
    void getEmpleadoId_deberiaLanzarExcepcionSiNoExiste() {
        UUID id = UUID.randomUUID();
        when(empleadoRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            empleadoService.getEmpleadoId(id);
        });
    }

    @Test
    void createEmpleado_deberiaGuardarEmpleadoConPasswordEncriptado() {
        when(empleadoRepository.existsByUsername(anyString())).thenReturn(false);
        when(empleadoRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encrypted_password");
        when(empleadoRepository.save(any(Empleado.class))).thenReturn(empleado);

        EmpleadoResponse resultado = empleadoService.createEmpleado(empleadoRequest);

        assertNotNull(resultado);
        assertEquals("Carlos", resultado.getNombres());
        verify(passwordEncoder, times(1)).encode(anyString());
    }

    @Test
    void createEmpleado_deberiaLanzarExcepcionSiUsernameExiste() {
        when(empleadoRepository.existsByUsername(anyString())).thenReturn(true);

        assertThrows(BusinessException.class, () -> {
            empleadoService.createEmpleado(empleadoRequest);
        });
    }

    @Test
    void createEmpleado_deberiaLanzarExcepcionSiEmailExiste() {
        when(empleadoRepository.existsByUsername(anyString())).thenReturn(false);
        when(empleadoRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BusinessException.class, () -> {
            empleadoService.createEmpleado(empleadoRequest);
        });
    }

    @Test
    void updateEmpleado_deberiaModificarEmpleado() {
        UUID id = empleado.getId();
        when(empleadoRepository.findById(id)).thenReturn(Optional.of(empleado));
        when(empleadoRepository.save(any(Empleado.class))).thenReturn(empleado);

        EmpleadoResponse resultado = empleadoService.updateEmpleado(id, empleadoRequest);

        assertNotNull(resultado);
        assertEquals("Carlos", resultado.getNombres());
    }

    @Test
    void deleteEmpleado_deberiaEliminarEmpleado() {
        UUID id = empleado.getId();
        when(empleadoRepository.findById(id)).thenReturn(Optional.of(empleado));
        doNothing().when(empleadoRepository).delete(any(Empleado.class));

        empleadoService.deleteEmpleado(id);

        verify(empleadoRepository, times(1)).delete(any(Empleado.class));
    }
}
