package com.example.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TurnoPublicoDTO {
    private String codigo;
    private String servicio;
    private String modulo;
    private String estado;
    private String categoria;
    private boolean esPreferente;
}
