package com.example.turnos.service;

import com.example.turnos.dto.ModuloDTO;
import com.example.turnos.entity.Modulo;
import com.example.turnos.entity.Servicio;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.repository.ModuloRepository;
import com.example.turnos.repository.ServicioRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ModuloService {

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public List<Modulo> getAll(Long servicioId) {
        return servicioId != null ? moduloRepository.findByServicioId(servicioId) : moduloRepository.findAll();
    }

    public Modulo getById(Long id) {
        return cargar(id);
    }

    public Modulo crear(ModuloDTO d) {
        Servicio servicio = servicioRepository.findById(d.getServicioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado: " + d.getServicioId()));
        Modulo m = new Modulo();
        m.setCodigo(d.getCodigo());
        m.setNombre(d.getNombre());
        m.setServicio(servicio);
        m.setActivo(d.getActivo() == null || d.getActivo());
        return moduloRepository.save(m);
    }

    public Modulo actualizar(Long id, ModuloDTO d) {
        Modulo m = cargar(id);
        Servicio servicio = servicioRepository.findById(d.getServicioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado: " + d.getServicioId()));
        m.setCodigo(d.getCodigo());
        m.setNombre(d.getNombre());
        m.setServicio(servicio);
        if (d.getActivo() != null) {
            m.setActivo(d.getActivo());
        }
        return moduloRepository.save(m);
    }

    public Modulo desactivar(Long id) {
        Modulo m = cargar(id);
        m.setActivo(false);
        return moduloRepository.save(m);
    }

    public Modulo activar(Long id) {
        Modulo m = cargar(id);
        m.setActivo(true);
        return moduloRepository.save(m);
    }

    private Modulo cargar(Long id) {
        return moduloRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Módulo no encontrado: " + id));
    }
}
