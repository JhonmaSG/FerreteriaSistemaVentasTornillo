package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {

    Boolean existsByNombre(String nombre);
}
