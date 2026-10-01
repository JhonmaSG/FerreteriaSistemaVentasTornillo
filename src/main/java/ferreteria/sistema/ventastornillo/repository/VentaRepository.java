package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VentaRepository extends JpaRepository<Venta, UUID> {

    Boolean existsByNumeroSerie(String numeroSerie);
}
