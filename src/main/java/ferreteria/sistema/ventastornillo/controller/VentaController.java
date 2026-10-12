package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.dto.request.VentaRequest;
import ferreteria.sistema.ventastornillo.dto.response.VentaResponse;
import ferreteria.sistema.ventastornillo.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    public ResponseEntity<List<VentaResponse>> getVentas() {
        return ResponseEntity.ok(ventaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponse> getVentaId(@PathVariable UUID id) {
        return ResponseEntity.ok(ventaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<VentaResponse> createVenta(@Valid @RequestBody VentaRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ventaService.crear(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenta(@PathVariable UUID id) {
        ventaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
