package com.example.turnos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UmbralDTO {
    @NotNull(message = "El umbral es obligatorio")
    @Min(value = 1, message = "El umbral debe ser de al menos 1 minuto")
    private Integer umbralEnvejecimientoMinutos;
}
