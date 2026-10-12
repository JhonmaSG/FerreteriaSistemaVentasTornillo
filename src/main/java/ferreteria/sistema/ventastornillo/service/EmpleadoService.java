package ferreteria.sistema.ventastornillo.service;

import ferreteria.sistema.ventastornillo.dto.request.EmpleadoRequest;
import ferreteria.sistema.ventastornillo.dto.response.EmpleadoResponse;
import ferreteria.sistema.ventastornillo.exception.BusinessException;
import ferreteria.sistema.ventastornillo.exception.ResourceNotFoundException;
import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import ferreteria.sistema.ventastornillo.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<EmpleadoResponse> getEmpleados() {
        return empleadoRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpleadoResponse getEmpleadoId(UUID id) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", id));
        return mapToResponse(empleado);
    }

    @Transactional
    public EmpleadoResponse createEmpleado(EmpleadoRequest request) {
        if (empleadoRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Ya existe un empleado con el username: " + request.getUsername());
        }
        if (empleadoRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Ya existe un empleado con el email: " + request.getEmail());
        }

        Empleado empleado = Empleado.builder()
                .dni(request.getDni())
                .nombres(request.getNombre())
                .apellidos(request.getApellidos())
                .telefono(request.getTelefono())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .activo(true)
                .build();

        Empleado guardado = empleadoRepository.save(empleado);
        return mapToResponse(guardado);
    }

    @Transactional
    public EmpleadoResponse updateEmpleado(UUID id, EmpleadoRequest request) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", id));

        empleado.setDni(request.getDni());
        empleado.setNombres(request.getNombre());
        empleado.setApellidos(request.getApellidos());
        empleado.setTelefono(request.getTelefono());
        empleado.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            empleado.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Empleado actualizado = empleadoRepository.save(empleado);
        return mapToResponse(actualizado);
    }

    @Transactional
    public void deleteEmpleado(UUID id) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", "id", id));
        empleadoRepository.delete(empleado);
    }

    private EmpleadoResponse mapToResponse(Empleado empleado) {
        return EmpleadoResponse.builder()
                .id(empleado.getId())
                .dni(empleado.getDni())
                .nombre(empleado.getNombres())
                .apellidos(empleado.getApellidos())
                .telefono(empleado.getTelefono())
                .email(empleado.getEmail())
                .username(empleado.getUsername())
                .activo(empleado.getActivo())
                .fechaCreacion(empleado.getFechaCreacion())
                .fechaModificacion(empleado.getFechaModificacion())
                .build();
    }
}
