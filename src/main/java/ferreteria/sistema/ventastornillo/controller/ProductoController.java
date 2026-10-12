package ferreteria.sistema.ventastornillo.controller;

import ferreteria.sistema.ventastornillo.dto.request.ProductoRequest;
import ferreteria.sistema.ventastornillo.dto.response.ProductoResponse;
import ferreteria.sistema.ventastornillo.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> getProductos() {
        return ResponseEntity.ok(productoService.getProductos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> getProductoId(@PathVariable UUID id) {
        return ResponseEntity.ok(productoService.getProductoId(id));
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> createProducto(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productoService.createProducto(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> updateProducto(
            @PathVariable UUID id,
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.updateProducto(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable UUID id) {
        productoService.deleteProducto(id);
        return ResponseEntity.noContent().build();
    }
}
