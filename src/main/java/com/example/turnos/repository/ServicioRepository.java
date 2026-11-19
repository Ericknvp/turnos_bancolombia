package com.example.turnos.repository;

import com.example.turnos.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    boolean existsByNombre(String nombre);
    boolean existsByPrefijo(String prefijo);
}
