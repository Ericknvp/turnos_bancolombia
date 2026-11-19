package com.example.turnos.service;

import com.example.turnos.dto.ServicioDTO;
import com.example.turnos.entity.ContadorProporcion;
import com.example.turnos.entity.Servicio;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.exception.RelacionException;
import com.example.turnos.repository.ContadorProporcionRepository;
import com.example.turnos.repository.ServicioRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ContadorProporcionRepository contadorProporcionRepository;

    public List<Servicio> getAll() {
        return servicioRepository.findAll();
    }

    public Servicio getById(Long id) {
        return cargar(id);
    }

    @Transactional
    public Servicio crear(ServicioDTO d) {
        if (servicioRepository.existsByNombre(d.getNombre())) {
            throw new RelacionException("Ya existe un servicio con ese nombre");
        }
        if (servicioRepository.existsByPrefijo(d.getPrefijo())) {
            throw new RelacionException("Ya existe un servicio con ese prefijo");
        }
        Servicio s = new Servicio();
        s.setNombre(d.getNombre());
        s.setPrefijo(d.getPrefijo().toUpperCase());
        s.setDescripcion(d.getDescripcion());
        s.setActivo(d.getActivo() == null || d.getActivo());
        Servicio guardado = servicioRepository.save(s);

        ContadorProporcion contador = new ContadorProporcion();
        contador.setServicio(guardado);
        contador.setFechaOperacion(LocalDate.now());
        contador.setContadorConsecutivoPreferente(0);
        contadorProporcionRepository.save(contador);

        return guardado;
    }

    public Servicio actualizar(Long id, ServicioDTO d) {
        Servicio s = cargar(id);
        if (!s.getNombre().equals(d.getNombre()) && servicioRepository.existsByNombre(d.getNombre())) {
            throw new RelacionException("Ya existe un servicio con ese nombre");
        }
        if (!s.getPrefijo().equalsIgnoreCase(d.getPrefijo()) && servicioRepository.existsByPrefijo(d.getPrefijo())) {
            throw new RelacionException("Ya existe un servicio con ese prefijo");
        }
        s.setNombre(d.getNombre());
        s.setPrefijo(d.getPrefijo().toUpperCase());
        s.setDescripcion(d.getDescripcion());
        if (d.getActivo() != null) {
            s.setActivo(d.getActivo());
        }
        return servicioRepository.save(s);
    }

    public Servicio desactivar(Long id) {
        Servicio s = cargar(id);
        s.setActivo(false);
        return servicioRepository.save(s);
    }

    public Servicio activar(Long id) {
        Servicio s = cargar(id);
        s.setActivo(true);
        return servicioRepository.save(s);
    }

    private Servicio cargar(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado: " + id));
    }
}
