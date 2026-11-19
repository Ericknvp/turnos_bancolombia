package com.example.turnos.service;

import com.example.turnos.dto.UsuarioDTO;
import com.example.turnos.entity.Usuario;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.exception.RelacionException;
import com.example.turnos.repository.UsuarioRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }

    public Usuario getById(Long id) {
        return cargar(id);
    }

    public Usuario crear(UsuarioDTO d) {
        if (d.getPassword() == null || d.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria para crear un usuario");
        }
        if (usuarioRepository.existsByUsername(d.getUsername())) {
            throw new RelacionException("El username ya está en uso");
        }
        Usuario u = new Usuario();
        u.setUsername(d.getUsername());
        u.setNombreCompleto(d.getNombreCompleto());
        u.setPasswordHash(passwordEncoder.encode(d.getPassword()));
        u.setRol(d.getRol());
        u.setActivo(d.getActivo() == null || d.getActivo());
        return usuarioRepository.save(u);
    }

    public Usuario actualizar(Long id, UsuarioDTO d) {
        Usuario u = cargar(id);
        if (!u.getUsername().equals(d.getUsername()) && usuarioRepository.existsByUsername(d.getUsername())) {
            throw new RelacionException("El username ya está en uso");
        }
        u.setUsername(d.getUsername());
        u.setNombreCompleto(d.getNombreCompleto());
        u.setRol(d.getRol());
        if (d.getActivo() != null) {
            u.setActivo(d.getActivo());
        }
        if (d.getPassword() != null && !d.getPassword().isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(d.getPassword()));
        }
        return usuarioRepository.save(u);
    }

    public Usuario desactivar(Long id) {
        Usuario u = cargar(id);
        u.setActivo(false);
        return usuarioRepository.save(u);
    }

    public Usuario activar(Long id) {
        Usuario u = cargar(id);
        u.setActivo(true);
        return usuarioRepository.save(u);
    }

    private Usuario cargar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + id));
    }
}
