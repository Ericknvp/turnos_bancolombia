package com.example.turnos.repository;

import com.example.turnos.entity.Modulo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Long> {
    List<Modulo> findByServicioId(Long servicioId);
}
