package com.example.turnos.service;

import com.example.turnos.dto.IndicadoresDTO;
import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.repository.TurnoRepository;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IndicadorService {

    @Autowired
    private TurnoRepository turnoRepository;

    public IndicadoresDTO calcular(Long servicioId, LocalDate desde, LocalDate hasta) {
        LocalDate d = desde != null ? desde : LocalDate.now();
        LocalDate h = hasta != null ? hasta : LocalDate.now();

        long emitidos = turnoRepository.contarPorRango(servicioId, d, h);
        long finalizados = turnoRepository.contarPorRangoYEstado(servicioId, d, h, EstadoTurno.FINALIZADO);
        long cancelados = turnoRepository.contarPorRangoYEstado(servicioId, d, h, EstadoTurno.CANCELADO);
        long ausentes = turnoRepository.contarPorRangoYEstado(servicioId, d, h, EstadoTurno.AUSENTE);
        Double promedio = turnoRepository.promedioEsperaMinutos(servicioId, d, h);

        return new IndicadoresDTO(emitidos, finalizados, cancelados, ausentes, promedio != null ? promedio : 0.0);
    }
}
