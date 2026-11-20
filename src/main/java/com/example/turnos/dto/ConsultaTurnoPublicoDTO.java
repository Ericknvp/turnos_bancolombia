package com.example.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConsultaTurnoPublicoDTO {
    private String codigo;
    private String servicio;
    private String categoria;
    private boolean esPreferente;
    private String estado;
    private String modulo;
    private Integer posicionEnFila;
    private Integer tiempoEstimadoMinutos;
}
