package com.example.turnos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "parametros_sistema")
public class ParametroSistema {
    @Id
    @Column(name = "clave")
    private String clave;

    @Column(name = "valor")
    private String valor;
}
