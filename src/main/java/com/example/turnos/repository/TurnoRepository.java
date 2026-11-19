package com.example.turnos.repository;

import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.Turno;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    List<Turno> findByServicioIdAndEstadoOrderByFechaIngresoAscIdAsc(Long servicioId, EstadoTurno estado);

    boolean existsByModuloIdAndEstadoIn(Long moduloId, List<EstadoTurno> estados);

    List<Turno> findByEstadoInOrderByFechaLlamadoDesc(List<EstadoTurno> estados);

    @Query("select coalesce(max(t.consecutivo), 0) from Turno t where t.servicio.id = :servicioId and t.fecha = :fecha")
    int maxConsecutivo(@Param("servicioId") Long servicioId, @Param("fecha") LocalDate fecha);

    @Query("select t from Turno t where "
         + "(:servicioId is null or t.servicio.id = :servicioId) and "
         + "(:estado is null or t.estado = :estado) and "
         + "(:categoriaId is null or t.categoria.id = :categoriaId) and "
         + "(:desde is null or t.fecha >= :desde) and "
         + "(:hasta is null or t.fecha <= :hasta)")
    Page<Turno> buscar(@Param("servicioId") Long servicioId, @Param("estado") EstadoTurno estado,
                        @Param("categoriaId") Long categoriaId, @Param("desde") LocalDate desde,
                        @Param("hasta") LocalDate hasta, Pageable pageable);

    @Query("select count(t) from Turno t where (:servicioId is null or t.servicio.id = :servicioId) "
         + "and t.fecha between :desde and :hasta")
    long contarPorRango(@Param("servicioId") Long servicioId, @Param("desde") LocalDate desde,
                         @Param("hasta") LocalDate hasta);

    @Query("select count(t) from Turno t where (:servicioId is null or t.servicio.id = :servicioId) "
         + "and t.fecha between :desde and :hasta and t.estado = :estado")
    long contarPorRangoYEstado(@Param("servicioId") Long servicioId, @Param("desde") LocalDate desde,
                                @Param("hasta") LocalDate hasta, @Param("estado") EstadoTurno estado);

    @Query(value = "select avg(timestampdiff(minute, t.fecha_ingreso, t.fecha_inicio_atencion)) "
         + "from turnos t where (:servicioId is null or t.servicio_id = :servicioId) "
         + "and t.fecha_operacion between :desde and :hasta and t.fecha_inicio_atencion is not null",
         nativeQuery = true)
    Double promedioEsperaMinutos(@Param("servicioId") Long servicioId, @Param("desde") LocalDate desde,
                                  @Param("hasta") LocalDate hasta);
}
