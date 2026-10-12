package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VentaRepository extends JpaRepository<Venta, UUID> {

    boolean existsByNumeroSerie(String numeroSerie);

    @Query("SELECT MAX(v.numeroSerie) FROM Venta v")
    String findMaxNumeroSerie();
}
