package com.example.turnos.service;

import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.HistorialTurno;
import com.example.turnos.entity.Turno;
import com.example.turnos.entity.Usuario;
import com.example.turnos.repository.HistorialTurnoRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class HistorialService {

    @Autowired
    private HistorialTurnoRepository historialTurnoRepository;

    public void registrar(Turno turno, EstadoTurno anterior, EstadoTurno nuevo, Usuario operador, String motivo) {
        HistorialTurno h = new HistorialTurno();
        h.setTurno(turno);
        h.setEstadoAnterior(anterior);
        h.setEstadoNuevo(nuevo);
        h.setFecha(LocalDateTime.now());
        h.setOperador(operador);
        h.setMotivo(motivo);
        historialTurnoRepository.save(h);
    }

    public Page<HistorialTurno> buscar(Long servicioId, EstadoTurno estado, LocalDateTime desde, LocalDateTime hasta,
                                        int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "fecha"));
        return historialTurnoRepository.buscar(servicioId, estado, desde, hasta, pageable);
    }

    public List<HistorialTurno> porTurno(Long turnoId) {
        return historialTurnoRepository.findByTurnoIdOrderByFechaAsc(turnoId);
    }
}
