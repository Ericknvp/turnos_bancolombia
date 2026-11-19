package com.example.turnos.repository;

import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.HistorialTurno;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HistorialTurnoRepository extends JpaRepository<HistorialTurno, Long> {

    List<HistorialTurno> findByTurnoIdOrderByFechaAsc(Long turnoId);

    @Query("select h from HistorialTurno h where "
         + "(:servicioId is null or h.turno.servicio.id = :servicioId) and "
         + "(:estado is null or h.estadoNuevo = :estado) and "
         + "(:desde is null or h.fecha >= :desde) and "
         + "(:hasta is null or h.fecha <= :hasta)")
    Page<HistorialTurno> buscar(@Param("servicioId") Long servicioId, @Param("estado") EstadoTurno estado,
                                 @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta,
                                 Pageable pageable);
}
