package com.example.turnos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "turnos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"servicio_id", "fecha_operacion", "consecutivo_dia"})
})
public class Turno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "codigo", unique = true, length = 40)
    private String codigo;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "fecha_operacion")
    private LocalDate fecha;

    @Column(name = "consecutivo_dia")
    private int consecutivo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoTurno estado = EstadoTurno.EN_ESPERA;

    @Column(name = "nombre_cliente")
    private String nombreCliente;

    @Column(name = "fecha_ingreso")
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_llamado")
    private LocalDateTime fechaLlamado;

    @Column(name = "fecha_inicio_atencion")
    private LocalDateTime fechaInicioAtencion;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @ManyToOne
    @JoinColumn(name = "modulo_id")
    private Modulo modulo;

    @ManyToOne
    @JoinColumn(name = "operador_id")
    private Usuario operador;

    @Column(name = "motivo_final")
    private String motivo;
}
