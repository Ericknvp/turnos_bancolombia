package com.example.turnos.controller;

import com.example.turnos.dto.ModuloDTO;
import com.example.turnos.entity.Modulo;
import com.example.turnos.entity.Turno;
import com.example.turnos.service.ModuloService;
import com.example.turnos.service.TurnoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/modulos")
public class ModuloController {

    @Autowired
    private ModuloService moduloService;

    @Autowired
    private TurnoService turnoService;

    @GetMapping
    public List<Modulo> getAll(@RequestParam(required = false) Long servicioId) {
        return moduloService.getAll(servicioId);
    }

    @GetMapping("/{id}")
    public Modulo getById(@PathVariable Long id) {
        return moduloService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Modulo crear(@Valid @RequestBody ModuloDTO d) {
        return moduloService.crear(d);
    }

    @PutMapping("/{id}")
    public Modulo actualizar(@PathVariable Long id, @Valid @RequestBody ModuloDTO d) {
        return moduloService.actualizar(id, d);
    }

    @PatchMapping("/{id}/desactivar")
    public Modulo desactivar(@PathVariable Long id) {
        return moduloService.desactivar(id);
    }

    @PatchMapping("/{id}/activar")
    public Modulo activar(@PathVariable Long id) {
        return moduloService.activar(id);
    }

    @PostMapping("/{id}/siguiente")
    public Turno llamarSiguiente(@PathVariable Long id, Authentication auth) {
        return turnoService.llamarSiguiente(id, auth.getName());
    }
}
