package com.example.turnos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "servicios")
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nombre", unique = true)
    private String nombre;

    @Column(name = "prefijo", unique = true, length = 10)
    private String prefijo;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "activo")
    private boolean activo = true;
}
