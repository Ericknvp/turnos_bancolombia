package com.example.turnos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TurnoRegistroDTO {
    @NotNull(message = "El servicio es obligatorio")
    private Long servicioId;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @NotBlank(message = "El nombre del cliente es obligatorio")
    @Size(max = 150, message = "Máximo 150 caracteres")
    private String nombreCliente;
}
