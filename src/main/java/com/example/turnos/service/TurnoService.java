package com.example.turnos.service;

import com.example.turnos.dto.CambioEstadoTurnoDTO;
import com.example.turnos.dto.ConsultaTurnoPublicoDTO;
import com.example.turnos.dto.TurnoRegistroDTO;
import com.example.turnos.entity.AccionTurno;
import com.example.turnos.entity.Categoria;
import com.example.turnos.entity.ContadorProporcion;
import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.Modulo;
import com.example.turnos.entity.Rol;
import com.example.turnos.entity.Servicio;
import com.example.turnos.entity.Turno;
import com.example.turnos.entity.Usuario;
import com.example.turnos.exception.RecursoNoEncontradoException;
import com.example.turnos.exception.RelacionException;
import com.example.turnos.repository.CategoriaRepository;
import com.example.turnos.repository.ContadorProporcionRepository;
import com.example.turnos.repository.ModuloRepository;
import com.example.turnos.repository.ServicioRepository;
import com.example.turnos.repository.TurnoRepository;
import com.example.turnos.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TurnoService {

    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ContadorProporcionRepository contadorProporcionRepository;

    @Autowired
    private HistorialService historialService;

    @Autowired
    private ConfiguracionService configuracionService;

    @Value("${app.turnos.zona-horaria}")
    private String zonaHorariaId;

    private ZoneId zonaHoraria() {
        return ZoneId.of(zonaHorariaId);
    }

    @Transactional
    public Turno registrarTurno(TurnoRegistroDTO d, String operadorUsername) {
        Servicio servicio = servicioRepository.findById(d.getServicioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Servicio no encontrado: " + d.getServicioId()));
        if (!servicio.isActivo()) {
            throw new RelacionException("El servicio está desactivado");
        }
        Categoria categoria = categoriaRepository.findById(d.getCategoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + d.getCategoriaId()));
        Usuario operador = cargarUsuario(operadorUsername);

        obtenerContadorBloqueado(servicio);

        LocalDateTime ahora = LocalDateTime.now(zonaHoraria());
        LocalDate hoy = ahora.toLocalDate();
        int consecutivo = turnoRepository.maxConsecutivo(servicio.getId(), hoy) + 1;

        Turno t = new Turno();
        t.setServicio(servicio);
        t.setFecha(hoy);
        t.setConsecutivo(consecutivo);
        t.setCodigo(generarCodigo(servicio, hoy, consecutivo));
        t.setCategoria(categoria);
        t.setEstado(EstadoTurno.EN_ESPERA);
        t.setNombreCliente(d.getNombreCliente());
        t.setFechaIngreso(ahora);

        Turno guardado = turnoRepository.save(t);
        historialService.registrar(guardado, null, EstadoTurno.EN_ESPERA, operador, null);
        return guardado;
    }

    @Transactional
    public Turno llamarSiguiente(Long moduloId, String operadorUsername) {
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Módulo no encontrado: " + moduloId));
        if (!modulo.isActivo()) {
            throw new RelacionException("El módulo está desactivado");
        }
        Usuario operador = cargarUsuario(operadorUsername);

        Servicio servicio = modulo.getServicio();
        LocalDateTime ahora = LocalDateTime.now(zonaHoraria());
        ContadorProporcion contador = obtenerContadorBloqueado(servicio);
        if (turnoRepository.existsByModuloIdAndEstadoIn(moduloId,
                List.of(EstadoTurno.LLAMADO, EstadoTurno.EN_ATENCION))) {
            throw new RelacionException("El módulo tiene un turno pendiente de resolver");
        }
        if (turnoRepository.existsByOperadorIdAndEstadoIn(operador.getId(),
                List.of(EstadoTurno.LLAMADO, EstadoTurno.EN_ATENCION))) {
            throw new RelacionException("El operador ya tiene un turno activo en otro módulo");
        }
        reiniciarSiCambioDeDia(contador, ahora.toLocalDate());

        int umbralMinutos = configuracionService.obtenerUmbralMinutos();
        LocalDateTime limiteEnvejecimiento = ahora.minusMinutes(umbralMinutos);

        List<Turno> enEspera = turnoRepository.findByServicioIdAndEstadoOrderByFechaIngresoAscIdAsc(
                servicio.getId(), EstadoTurno.EN_ESPERA);

        List<Turno> preferentes = new ArrayList<>();
        List<Turno> regularesSinEnvejecer = new ArrayList<>();
        for (Turno t : enEspera) {
            boolean envejecido = !t.getCategoria().isEsPreferente()
                    && t.getFechaIngreso().isBefore(limiteEnvejecimiento);
            if (t.getCategoria().isEsPreferente() || envejecido) {
                preferentes.add(t);
            } else {
                regularesSinEnvejecer.add(t);
            }
        }

        if (preferentes.isEmpty() && regularesSinEnvejecer.isEmpty()) {
            throw new RecursoNoEncontradoException("No hay turnos en espera en el servicio " + servicio.getNombre());
        }

        Turno elegido;
        boolean elegidoEsPreferente;
        if (!preferentes.isEmpty() && !regularesSinEnvejecer.isEmpty()) {
            if (contador.getContadorConsecutivoPreferente() < 3) {
                elegido = preferentes.get(0);
                elegidoEsPreferente = true;
            } else {
                elegido = regularesSinEnvejecer.get(0);
                elegidoEsPreferente = false;
            }
        } else if (!preferentes.isEmpty()) {
            elegido = preferentes.get(0);
            elegidoEsPreferente = true;
        } else {
            elegido = regularesSinEnvejecer.get(0);
            elegidoEsPreferente = false;
        }

        contador.setContadorConsecutivoPreferente(
                elegidoEsPreferente ? Math.min(contador.getContadorConsecutivoPreferente() + 1, 3) : 0);
        contadorProporcionRepository.save(contador);

        EstadoTurno anterior = elegido.getEstado();
        elegido.setEstado(EstadoTurno.LLAMADO);
        elegido.setModulo(modulo);
        elegido.setFechaLlamado(ahora);
        elegido.setOperador(operador);
        Turno guardado = turnoRepository.save(elegido);
        historialService.registrar(guardado, anterior, EstadoTurno.LLAMADO, operador, null);
        return guardado;
    }

    @Transactional
    public Turno cambiarEstado(Long turnoId, CambioEstadoTurnoDTO d, String operadorUsername) {
        Turno t = turnoRepository.findById(turnoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado: " + turnoId));
        Usuario operador = cargarUsuario(operadorUsername);
        if (operador.getRol() != Rol.ADMINISTRADOR
                && (t.getOperador() == null || !t.getOperador().getId().equals(operador.getId()))) {
            throw new AccessDeniedException("El turno no está asignado a este operador");
        }
        EstadoTurno actual = t.getEstado();
        EstadoTurno nuevo;
        LocalDateTime ahora = LocalDateTime.now(zonaHoraria());

        switch (d.getAccion()) {
            case INICIAR:
                validarTransicion(actual == EstadoTurno.LLAMADO, actual, d.getAccion());
                nuevo = EstadoTurno.EN_ATENCION;
                t.setFechaInicioAtencion(ahora);
                break;
            case FINALIZAR:
                validarTransicion(actual == EstadoTurno.EN_ATENCION, actual, d.getAccion());
                nuevo = EstadoTurno.FINALIZADO;
                t.setFechaFin(ahora);
                break;
            case CANCELAR:
                validarTransicion(actual == EstadoTurno.EN_ESPERA || actual == EstadoTurno.LLAMADO, actual, d.getAccion());
                exigirMotivo(d);
                nuevo = EstadoTurno.CANCELADO;
                t.setMotivo(d.getMotivo());
                break;
            case MARCAR_AUSENTE:
                validarTransicion(actual == EstadoTurno.LLAMADO, actual, d.getAccion());
                exigirMotivo(d);
                nuevo = EstadoTurno.AUSENTE;
                t.setMotivo(d.getMotivo());
                break;
            default:
                throw new IllegalArgumentException("Acción inválida");
        }

        t.setEstado(nuevo);
        Turno guardado = turnoRepository.save(t);
        historialService.registrar(guardado, actual, nuevo, operador, d.getMotivo());
        return guardado;
    }

    public Page<Turno> buscar(Long servicioId, EstadoTurno estado, Long categoriaId,
                               LocalDate desde, LocalDate hasta, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "id"));
        return turnoRepository.buscar(servicioId, estado, categoriaId, desde, hasta, pageable);
    }

    public Turno getById(Long id) {
        return turnoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Turno no encontrado: " + id));
    }

    public List<Turno> obtenerLlamadosYEnAtencion() {
        return turnoRepository.findByEstadoInOrderByFechaLlamadoDesc(
                List.of(EstadoTurno.LLAMADO, EstadoTurno.EN_ATENCION));
    }

    public ConsultaTurnoPublicoDTO obtenerConsultaPublica(String codigo) {
        Turno turno = turnoRepository.findByCodigo(codigo.trim().toUpperCase())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un turno con el código " + codigo));

        Integer posicionEnFila = null;
        Integer tiempoEstimadoMinutos = null;

        if (turno.getEstado() == EstadoTurno.EN_ESPERA) {
            int umbralMinutos = configuracionService.obtenerUmbralMinutos();
            LocalDateTime ahora = LocalDateTime.now(zonaHoraria());
            LocalDateTime limiteEnvejecimiento = ahora.minusMinutes(umbralMinutos);

            boolean turnoEnConjuntoPreferente = turno.getCategoria().isEsPreferente()
                    || turno.getFechaIngreso().isBefore(limiteEnvejecimiento);

            List<Turno> enEspera = turnoRepository.findByServicioIdAndEstadoOrderByFechaIngresoAscIdAsc(
                    turno.getServicio().getId(), EstadoTurno.EN_ESPERA);

            int delante = 0;
            for (Turno t : enEspera) {
                if (t.getId().equals(turno.getId())) {
                    continue;
                }
                boolean envejecido = !t.getCategoria().isEsPreferente()
                        && t.getFechaIngreso().isBefore(limiteEnvejecimiento);
                boolean enConjuntoPreferente = t.getCategoria().isEsPreferente() || envejecido;
                boolean mismoConjunto = enConjuntoPreferente == turnoEnConjuntoPreferente;
                boolean vaAntes = t.getFechaIngreso().isBefore(turno.getFechaIngreso())
                        || (t.getFechaIngreso().isEqual(turno.getFechaIngreso()) && t.getId() < turno.getId());
                if (mismoConjunto && vaAntes) {
                    delante++;
                }
            }
            posicionEnFila = delante;

            Double promedio = turnoRepository.promedioEsperaMinutos(turno.getServicio().getId(),
                    LocalDate.now(zonaHoraria()).minusDays(30), LocalDate.now(zonaHoraria()));
            double minutosPorTurno = promedio != null ? promedio : 5.0;
            tiempoEstimadoMinutos = (int) Math.ceil((delante + 1) * minutosPorTurno);
        }

        return new ConsultaTurnoPublicoDTO(
                turno.getCodigo(),
                turno.getServicio().getNombre(),
                turno.getCategoria().getNombre(),
                turno.getCategoria().isEsPreferente(),
                turno.getEstado().name(),
                turno.getModulo() != null ? turno.getModulo().getNombre() : null,
                posicionEnFila,
                tiempoEstimadoMinutos);
    }

    private Usuario cargarUsuario(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + username));
    }

    private void validarTransicion(boolean valido, EstadoTurno actual, AccionTurno accion) {
        if (!valido) {
            throw new RelacionException("No se puede aplicar " + accion + " a un turno en estado " + actual);
        }
    }

    private void exigirMotivo(CambioEstadoTurnoDTO d) {
        if (d.getMotivo() == null || d.getMotivo().isBlank()) {
            throw new IllegalArgumentException("El motivo es obligatorio para esta acción");
        }
    }

    private ContadorProporcion obtenerContadorBloqueado(Servicio servicio) {
        return contadorProporcionRepository.buscarParaActualizar(servicio.getId()).orElseGet(() -> {
            ContadorProporcion nuevo = new ContadorProporcion();
            nuevo.setServicio(servicio);
            nuevo.setFechaOperacion(LocalDate.now(zonaHoraria()));
            nuevo.setContadorConsecutivoPreferente(0);
            return contadorProporcionRepository.save(nuevo);
        });
    }

    private void reiniciarSiCambioDeDia(ContadorProporcion contador, LocalDate hoy) {
        if (!hoy.equals(contador.getFechaOperacion())) {
            contador.setFechaOperacion(hoy);
            contador.setContadorConsecutivoPreferente(0);
        }
    }

    private String generarCodigo(Servicio servicio, LocalDate fecha, int consecutivo) {
        return servicio.getPrefijo() + "-" + fecha.format(FORMATO_FECHA) + "-" + String.format("%03d", consecutivo);
    }
}
