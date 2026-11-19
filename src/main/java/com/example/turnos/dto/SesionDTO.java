package com.example.turnos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SesionDTO {
    private String token;
    private Long id;
    private String username;
    private String nombreCompleto;
    private String rol;
}
