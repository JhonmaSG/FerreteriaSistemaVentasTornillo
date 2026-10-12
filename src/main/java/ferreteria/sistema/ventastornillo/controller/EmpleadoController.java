package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.dto.request.EmpleadoRequest;
import ferreteria.sistema.ventastornillo.dto.response.EmpleadoResponse;
import ferreteria.sistema.ventastornillo.service.EmpleadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    public ResponseEntity<List<EmpleadoResponse>> listarTodos() {
        return ResponseEntity.ok(empleadoService.getEmpleados());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoResponse> obtenerPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(empleadoService.getEmpleadoId(id));
    }

    @PostMapping
    public ResponseEntity<EmpleadoResponse> crear(@Valid @RequestBody EmpleadoRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(empleadoService.createEmpleado(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EmpleadoRequest request) {
        return ResponseEntity.ok(empleadoService.updateEmpleado(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        empleadoService.deleteEmpleado(id);
        return ResponseEntity.noContent().build();
    }
}