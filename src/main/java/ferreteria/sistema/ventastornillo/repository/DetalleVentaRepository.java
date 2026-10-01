package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, UUID> {

}
