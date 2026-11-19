package com.example.turnos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Data;

@Data
@Entity
@Table(name = "contadores_proporcion")
public class ContadorProporcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "servicio_id", unique = true)
    private Servicio servicio;

    @Column(name = "fecha_operacion")
    private LocalDate fechaOperacion;

    @Column(name = "contador_consecutivo_preferente")
    private int contadorConsecutivoPreferente;
}
