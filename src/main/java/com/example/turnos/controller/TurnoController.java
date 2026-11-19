package com.example.turnos.controller;

import com.example.turnos.dto.CambioEstadoTurnoDTO;
import com.example.turnos.dto.TurnoRegistroDTO;
import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.Turno;
import com.example.turnos.service.TurnoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/turnos")
public class TurnoController {

    @Autowired
    private TurnoService turnoService;

    @GetMapping
    public Page<Turno> buscar(@RequestParam(required = false) Long servicioId,
                               @RequestParam(required = false) EstadoTurno estado,
                               @RequestParam(required = false) Long categoriaId,
                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "20") int size) {
        return turnoService.buscar(servicioId, estado, categoriaId, desde, hasta, page, size);
    }

    @GetMapping("/{id}")
    public Turno getById(@PathVariable Long id) {
        return turnoService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Turno registrar(@Valid @RequestBody TurnoRegistroDTO d, Authentication auth) {
        return turnoService.registrarTurno(d, auth.getName());
    }

    @PatchMapping("/{id}/estado")
    public Turno cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambioEstadoTurnoDTO d, Authentication auth) {
        return turnoService.cambiarEstado(id, d, auth.getName());
    }
}
