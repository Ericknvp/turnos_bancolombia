package com.example.turnos.dto;

import com.example.turnos.entity.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioDTO {
    @NotBlank(message = "El username es obligatorio")
    @Size(max = 50, message = "Máximo 50 caracteres")
    private String username;

    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150, message = "Máximo 150 caracteres")
    private String nombreCompleto;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    private Boolean activo;
}
