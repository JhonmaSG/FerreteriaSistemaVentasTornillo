package ferreteria.sistema.ventastornillo;

import org.springframework.boot.SpringApplication;

public class TestVentastornilloApplication {

	public static void main(String[] args) {
		SpringApplication.from(VentastornilloApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
