package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.Producto;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductoRepository extends CrudRepository<Producto, UUID> {

    Boolean existsByNombre(String nombre);
}
