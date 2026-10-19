package ferreteria.sistema.ventastornillo.config;

import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import ferreteria.sistema.ventastornillo.model.enums.Rol;
import ferreteria.sistema.ventastornillo.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Crea el usuario administrador inicial en el primer arranque.
 *
 * <p>Las credenciales NO estan hardcodeadas: se leen de las variables de
 * entorno ADMIN_USERNAME y ADMIN_PASSWORD. Si ADMIN_PASSWORD no esta
 * definida, no se crea el usuario, de modo que un despliegue sin secrets
 * configurados no deja una cuenta administrativa con password conocida.
 */
@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:}")
    private String adminUsername;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (adminUsername.isBlank() || adminPassword.isBlank()) {
                System.out.println("No se crea el usuario admin: faltan ADMIN_USERNAME o ADMIN_PASSWORD");
                return;
            }

            if (empleadoRepository.findByUsername(adminUsername).isEmpty()) {
                Empleado admin = Empleado.builder()
                        .dni("12345678")
                        .nombres("Admin")
                        .apellidos("Sistema")
                        .direccion("Oficina Central")
                        .email("admin@sistema.com")
                        .username(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .rol(Rol.ADMIN)
                        .activo(true)
                        .build();
                empleadoRepository.save(admin);
                System.out.println("Usuario admin creado: " + adminUsername);
            }
        };
    }

}
