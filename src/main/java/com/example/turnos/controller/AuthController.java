package com.example.turnos.controller;

import com.example.turnos.dto.LoginRequestDTO;
import com.example.turnos.dto.SesionDTO;
import com.example.turnos.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public SesionDTO login(@Valid @RequestBody LoginRequestDTO login) {
        return authService.login(login);
    }
}
