package com.example.turnos.controller;

import com.example.turnos.dto.UmbralDTO;
import com.example.turnos.service.ConfiguracionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/parametros")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    @GetMapping
    public UmbralDTO obtener() {
        UmbralDTO d = new UmbralDTO();
        d.setUmbralEnvejecimientoMinutos(configuracionService.obtenerUmbralMinutos());
        return d;
    }

    @PutMapping
    public UmbralDTO actualizar(@Valid @RequestBody UmbralDTO d) {
        UmbralDTO respuesta = new UmbralDTO();
        respuesta.setUmbralEnvejecimientoMinutos(configuracionService.actualizarUmbral(d.getUmbralEnvejecimientoMinutos()));
        return respuesta;
    }
}
