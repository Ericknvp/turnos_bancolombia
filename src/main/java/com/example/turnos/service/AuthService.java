package com.example.turnos.service;

import com.example.turnos.dto.LoginRequestDTO;
import com.example.turnos.dto.SesionDTO;
import com.example.turnos.entity.Usuario;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.repository.UsuarioRepository;
import com.example.turnos.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public SesionDTO login(LoginRequestDTO d) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(d.getUsername(), d.getPassword()));
        Usuario u = usuarioRepository.findByUsername(d.getUsername())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        String token = jwtUtil.generar(u.getUsername(), u.getRol().name());
        return new SesionDTO(token, u.getId(), u.getUsername(), u.getNombreCompleto(), u.getRol().name());
    }
}
