package com.example.turnos.repository;

import com.example.turnos.entity.ContadorProporcion;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContadorProporcionRepository extends JpaRepository<ContadorProporcion, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ContadorProporcion c where c.servicio.id = :servicioId")
    Optional<ContadorProporcion> buscarParaActualizar(@Param("servicioId") Long servicioId);
}
