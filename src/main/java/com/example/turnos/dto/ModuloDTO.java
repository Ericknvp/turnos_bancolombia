package com.example.turnos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModuloDTO {
    @NotBlank(message = "El código es obligatorio")
    @Size(max = 20, message = "Máximo 20 caracteres")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "Máximo 100 caracteres")
    private String nombre;

    @NotNull(message = "El servicio es obligatorio")
    private Long servicioId;

    private Boolean activo;
}
