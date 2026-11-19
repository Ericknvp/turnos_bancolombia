package com.example.turnos.dto;

import com.example.turnos.entity.AccionTurno;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambioEstadoTurnoDTO {
    @NotNull(message = "La acción es obligatoria")
    private AccionTurno accion;

    @Size(max = 300, message = "Máximo 300 caracteres")
    private String motivo;
}
