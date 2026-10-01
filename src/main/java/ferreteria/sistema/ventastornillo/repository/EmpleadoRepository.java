package ferreteria.sistema.ventastornillo.repository;

import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmpleadoRepository extends JpaRepository<Empleado, UUID> {

    Optional<Empleado> findByDni(String dni);

    Optional<Empleado> findByUsername(String username);

    Optional<Empleado> findByEmail(String email);

    Boolean existsByDni(String dni);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
}
