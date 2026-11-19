package com.example.turnos.controller;

import com.example.turnos.dto.ServicioDTO;
import com.example.turnos.entity.Servicio;
import com.example.turnos.service.ServicioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/servicios")
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public List<Servicio> getAll() {
        return servicioService.getAll();
    }

    @GetMapping("/{id}")
    public Servicio getById(@PathVariable Long id) {
        return servicioService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Servicio crear(@Valid @RequestBody ServicioDTO d) {
        return servicioService.crear(d);
    }

    @PutMapping("/{id}")
    public Servicio actualizar(@PathVariable Long id, @Valid @RequestBody ServicioDTO d) {
        return servicioService.actualizar(id, d);
    }

    @PatchMapping("/{id}/desactivar")
    public Servicio desactivar(@PathVariable Long id) {
        return servicioService.desactivar(id);
    }

    @PatchMapping("/{id}/activar")
    public Servicio activar(@PathVariable Long id) {
        return servicioService.activar(id);
    }
}
