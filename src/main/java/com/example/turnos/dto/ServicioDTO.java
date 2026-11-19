package com.example.turnos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ServicioDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "Máximo 100 caracteres")
    private String nombre;

    @NotBlank(message = "El prefijo es obligatorio")
    @Size(max = 10, message = "Máximo 10 caracteres")
    private String prefijo;

    @Size(max = 300, message = "Máximo 300 caracteres")
    private String descripcion;

    private Boolean activo;
}
