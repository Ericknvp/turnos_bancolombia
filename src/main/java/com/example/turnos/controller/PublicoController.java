package com.example.turnos.controller;

import com.example.turnos.dto.TurnoPublicoDTO;
import com.example.turnos.service.PublicoService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/publico")
public class PublicoController {

    @Autowired
    private PublicoService publicoService;

    @GetMapping("/pantalla")
    public List<TurnoPublicoDTO> pantalla() {
        return publicoService.pantalla();
    }
}
