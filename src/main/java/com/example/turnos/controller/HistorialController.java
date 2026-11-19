package com.example.turnos.controller;

import com.example.turnos.dto.IndicadoresDTO;
import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.HistorialTurno;
import com.example.turnos.service.HistorialService;
import com.example.turnos.service.IndicadorService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/historial")
public class HistorialController {

    @Autowired
    private HistorialService historialService;

    @Autowired
    private IndicadorService indicadorService;

    @GetMapping
    public Page<HistorialTurno> buscar(@RequestParam(required = false) Long servicioId,
                                        @RequestParam(required = false) EstadoTurno estado,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return historialService.buscar(servicioId, estado, desde, hasta, page, size);
    }

    @GetMapping("/indicadores")
    public IndicadoresDTO indicadores(@RequestParam(required = false) Long servicioId,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return indicadorService.calcular(servicioId, desde, hasta);
    }
}
