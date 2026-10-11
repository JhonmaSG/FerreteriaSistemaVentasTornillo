package ferreteria.sistema.ventastornillo.model.entity;

import ferreteria.sistema.ventastornillo.model.enums.Rol;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "empleado")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 6, max = 11, message = "El DNI debe tener estar entre 6 y 11 caracteres")
    @Column(nullable = false, length = 11, unique = true)
    private String dni;

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 255, message = "Los nombres no puede exceder 255 caracteres")
    @Column(nullable = false, length = 255)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 255, message = "Los apellidos no puede exceder 255 caracteres")
    @Column(nullable = false, length = 255)
    private String apellidos;

    @NotBlank(message = "La dirección es obligatorios")
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    @Column(nullable = false, length = 255)
    private String direccion;

    @Pattern(regexp = "^\\+?[0-9\\s\\-\\(\\)]{7,20}$", message = "Formato de teléfono inválido")
    @Column(length = 20)
    private String telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 5, max = 30, message = "El username debe ser entre 5 y 30 caracteres")
    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @NotBlank(message = "La password es obligatoria")
    @Size(min = 8, message = "La password debe ser de almenos 8 caracteres")
    @Column(nullable = false)
    private String password;

    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private Boolean activo;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime fechaModificacion;
}
