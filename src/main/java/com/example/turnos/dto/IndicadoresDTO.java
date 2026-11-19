package com.example.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IndicadoresDTO {
    private long turnosEmitidos;
    private long finalizados;
    private long cancelados;
    private long ausentes;
    private double promedioEsperaMinutos;
}
