package ferreteria.sistema.ventastornillo.config;

import ferreteria.sistema.ventastornillo.model.entity.Empleado;
import ferreteria.sistema.ventastornillo.model.enums.Rol;
import ferreteria.sistema.ventastornillo.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataLoader {

    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if(empleadoRepository.findByUsername("admin").isEmpty() ) {
                Empleado admin = Empleado.builder()
                        .dni("12345678")
                        .nombres("Admin")
                        .apellidos("Sistema")
                        .direccion("Oficina Central")
                        .email("admin@sistema.com")
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .rol(Rol.ADMIN)
                        .activo(true)
                        .build();
                empleadoRepository.save(admin);
                System.out.println("Usuario admin creado: a**** /a******3");
            }
        };
    }

}
