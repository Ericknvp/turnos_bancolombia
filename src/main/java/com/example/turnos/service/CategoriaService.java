package com.example.turnos.service;

import com.example.turnos.dto.CategoriaDTO;
import com.example.turnos.entity.Categoria;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.exception.RelacionException;
import com.example.turnos.repository.CategoriaRepository;
import com.example.turnos.repository.TurnoRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TurnoRepository turnoRepository;

    public List<Categoria> getAll() {
        return categoriaRepository.findAll();
    }

    public Categoria getById(Long id) {
        return cargar(id);
    }

    public Categoria crear(CategoriaDTO d) {
        if (categoriaRepository.existsByNombre(d.getNombre())) {
            throw new RelacionException("Ya existe una categoría con ese nombre");
        }
        Categoria c = new Categoria();
        c.setNombre(d.getNombre());
        c.setEsPreferente(d.getEsPreferente());
        return categoriaRepository.save(c);
    }

    public Categoria actualizar(Long id, CategoriaDTO d) {
        Categoria c = cargar(id);
        if (!c.getNombre().equals(d.getNombre()) && categoriaRepository.existsByNombre(d.getNombre())) {
            throw new RelacionException("Ya existe una categoría con ese nombre");
        }
        if (c.isEsPreferente() != d.getEsPreferente() && turnoRepository.existsByCategoriaId(id)) {
            throw new RelacionException("No se puede cambiar la prioridad de una categoría con turnos registrados");
        }
        c.setNombre(d.getNombre());
        c.setEsPreferente(d.getEsPreferente());
        return categoriaRepository.save(c);
    }

    private Categoria cargar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + id));
    }
}
