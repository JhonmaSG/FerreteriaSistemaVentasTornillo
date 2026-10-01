package ferreteria.sistema.ventastornillo.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cliente")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Cliente {

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
    private String nombre;

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

    @Column(nullable = false)
    private Boolean activo;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime fechaModificacion;
}
