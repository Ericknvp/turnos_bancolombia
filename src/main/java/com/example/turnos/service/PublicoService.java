package com.example.turnos.service;

import com.example.turnos.dto.TurnoPublicoDTO;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PublicoService {

    @Autowired
    private TurnoService turnoService;

    public List<TurnoPublicoDTO> pantalla() {
        return turnoService.obtenerLlamadosYEnAtencion().stream()
                .map(t -> new TurnoPublicoDTO(
                        t.getCodigo(),
                        t.getServicio().getNombre(),
                        t.getModulo() != null ? t.getModulo().getNombre() : null,
                        t.getEstado().name()))
                .collect(Collectors.toList());
    }
}
