package com.example.turnos.config;

import com.example.turnos.entity.Categoria;
import com.example.turnos.entity.ContadorProporcion;
import com.example.turnos.entity.EstadoTurno;
import com.example.turnos.entity.HistorialTurno;
import com.example.turnos.entity.Modulo;
import com.example.turnos.entity.Rol;
import com.example.turnos.entity.Servicio;
import com.example.turnos.entity.Turno;
import com.example.turnos.entity.Usuario;
import com.example.turnos.repository.CategoriaRepository;
import com.example.turnos.repository.ContadorProporcionRepository;
import com.example.turnos.repository.HistorialTurnoRepository;
import com.example.turnos.repository.ModuloRepository;
import com.example.turnos.repository.ServicioRepository;
import com.example.turnos.repository.TurnoRepository;
import com.example.turnos.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private ContadorProporcionRepository contadorProporcionRepository;

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private HistorialTurnoRepository historialTurnoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private int consecutivoCaja = 0;
    private int consecutivoAsesoria = 0;

    @Override
    @Transactional
    public void run(String... args) {
        Usuario admin = crearUsuario("admin", "Administrador del Sistema", "admin123", Rol.ADMINISTRADOR);
        Usuario operador1 = crearUsuario("operador1", "Ana Ruiz", "operador123", Rol.OPERADOR);
        Usuario operador2 = crearUsuario("operador2", "Carlos Rengifo", "operador123", Rol.OPERADOR);

        Categoria discapacidad = crearCategoria("Discapacidad", true);
        Categoria embarazada = crearCategoria("Embarazada", true);
        Categoria adultoMayor = crearCategoria("Adulto mayor", true);
        Categoria regular = crearCategoria("Regular", false);

        Servicio caja = crearServicio("Caja", "CAJ", "Atención de caja y retiros");
        Servicio asesoria = crearServicio("Asesoría", "ASE", "Asesoría financiera y productos");

        Modulo caja1 = crearModulo("M01", "Caja 1", caja);
        Modulo caja2 = crearModulo("M02", "Caja 2", caja);
        crearModulo("M03", "Asesoría 1", asesoria);
        crearModulo("M04", "Asesoría 2", asesoria);

        if (turnoRepository.count() > 0) {
            return;
        }

        LocalDateTime ahora = LocalDateTime.now();

        crearTurnoEnEspera(caja, discapacidad, "Carlos Pérez", ahora.minusMinutes(5));
        crearTurnoEnEspera(caja, regular, "Ana Torres", ahora.minusMinutes(20));
        crearTurnoEnEspera(caja, embarazada, "Lucía Gómez", ahora.minusMinutes(3));

        crearTurnoLlamado(caja, caja1, adultoMayor, "Jorge Ramírez",
                ahora.minusMinutes(8), ahora.minusMinutes(2), operador1);

        crearTurnoEnAtencion(caja, caja2, regular, "Pedro Díaz",
                ahora.minusMinutes(25), ahora.minusMinutes(10), ahora.minusMinutes(9), operador2);

        crearTurnoFinalizado(caja, caja1, regular, "Marta Ruiz",
                ahora.minusHours(2), ahora.minusMinutes(90), ahora.minusMinutes(85), ahora.minusMinutes(70), operador1);

        crearTurnoCancelado(caja, regular, "Luis Fernández",
                ahora.minusMinutes(40), "El cliente se retiró", operador2);

        crearTurnoAusente(caja, caja2, discapacidad, "Rosa Martínez",
                ahora.minusMinutes(30), ahora.minusMinutes(15), "No se presentó al ser llamado", operador2);

        crearTurnoEnEspera(asesoria, adultoMayor, "Elena Vargas", ahora.minusMinutes(4));
        crearTurnoEnEspera(asesoria, regular, "Andrés Castro", ahora.minusMinutes(2));
    }

    private Usuario crearUsuario(String username, String nombreCompleto, String clave, Rol rol) {
        return usuarioRepository.findByUsername(username).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setUsername(username);
            u.setNombreCompleto(nombreCompleto);
            u.setPasswordHash(passwordEncoder.encode(clave));
            u.setRol(rol);
            u.setActivo(true);
            return usuarioRepository.save(u);
        });
    }

    private Categoria crearCategoria(String nombre, boolean esPreferente) {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getNombre().equalsIgnoreCase(nombre))
                .findFirst()
                .orElseGet(() -> {
                    Categoria c = new Categoria();
                    c.setNombre(nombre);
                    c.setEsPreferente(esPreferente);
                    return categoriaRepository.save(c);
                });
    }

    private Servicio crearServicio(String nombre, String prefijo, String descripcion) {
        return servicioRepository.findAll().stream()
                .filter(s -> s.getPrefijo().equals(prefijo))
                .findFirst()
                .orElseGet(() -> {
                    Servicio s = new Servicio();
                    s.setNombre(nombre);
                    s.setPrefijo(prefijo);
                    s.setDescripcion(descripcion);
                    s.setActivo(true);
                    Servicio guardado = servicioRepository.save(s);

                    ContadorProporcion contador = new ContadorProporcion();
                    contador.setServicio(guardado);
                    contador.setFechaOperacion(LocalDate.now());
                    contador.setContadorConsecutivoPreferente(0);
                    contadorProporcionRepository.save(contador);

                    return guardado;
                });
    }

    private Modulo crearModulo(String codigo, String nombre, Servicio servicio) {
        return moduloRepository.findByServicioId(servicio.getId()).stream()
                .filter(m -> m.getCodigo().equals(codigo))
                .findFirst()
                .orElseGet(() -> {
                    Modulo m = new Modulo();
                    m.setCodigo(codigo);
                    m.setNombre(nombre);
                    m.setServicio(servicio);
                    m.setActivo(true);
                    return moduloRepository.save(m);
                });
    }

    private int siguienteConsecutivo(Servicio servicio) {
        if (servicio.getPrefijo().equals("CAJ")) {
            return ++consecutivoCaja;
        }
        return ++consecutivoAsesoria;
    }

    private String codigo(Servicio servicio, LocalDate fecha, int consecutivo) {
        return servicio.getPrefijo() + "-" + fecha.toString().replace("-", "") + "-" + String.format("%03d", consecutivo);
    }

    private Turno nuevoTurno(Servicio servicio, Categoria categoria, String nombreCliente, LocalDateTime fechaIngreso) {
        int consecutivo = siguienteConsecutivo(servicio);
        Turno t = new Turno();
        t.setServicio(servicio);
        t.setFecha(fechaIngreso.toLocalDate());
        t.setConsecutivo(consecutivo);
        t.setCodigo(codigo(servicio, fechaIngreso.toLocalDate(), consecutivo));
        t.setCategoria(categoria);
        t.setNombreCliente(nombreCliente);
        t.setFechaIngreso(fechaIngreso);
        return t;
    }

    private void registrarHistorial(Turno turno, EstadoTurno anterior, EstadoTurno nuevo, LocalDateTime fecha,
                                      Usuario operador, String motivo) {
        HistorialTurno h = new HistorialTurno();
        h.setTurno(turno);
        h.setEstadoAnterior(anterior);
        h.setEstadoNuevo(nuevo);
        h.setFecha(fecha);
        h.setOperador(operador);
        h.setMotivo(motivo);
        historialTurnoRepository.save(h);
    }

    private void crearTurnoEnEspera(Servicio servicio, Categoria categoria, String nombreCliente,
                                     LocalDateTime fechaIngreso) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.EN_ESPERA);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, null, EstadoTurno.EN_ESPERA, fechaIngreso, null, null);
    }

    private void crearTurnoLlamado(Servicio servicio, Modulo modulo, Categoria categoria, String nombreCliente,
                                    LocalDateTime fechaIngreso, LocalDateTime fechaLlamado, Usuario operador) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.LLAMADO);
        t.setModulo(modulo);
        t.setFechaLlamado(fechaLlamado);
        t.setOperador(operador);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, EstadoTurno.EN_ESPERA, EstadoTurno.LLAMADO, fechaLlamado, operador, null);
    }

    private void crearTurnoEnAtencion(Servicio servicio, Modulo modulo, Categoria categoria, String nombreCliente,
                                       LocalDateTime fechaIngreso, LocalDateTime fechaLlamado,
                                       LocalDateTime fechaInicioAtencion, Usuario operador) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.EN_ATENCION);
        t.setModulo(modulo);
        t.setFechaLlamado(fechaLlamado);
        t.setFechaInicioAtencion(fechaInicioAtencion);
        t.setOperador(operador);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, EstadoTurno.LLAMADO, EstadoTurno.EN_ATENCION, fechaInicioAtencion, operador, null);
    }

    private void crearTurnoFinalizado(Servicio servicio, Modulo modulo, Categoria categoria, String nombreCliente,
                                       LocalDateTime fechaIngreso, LocalDateTime fechaLlamado,
                                       LocalDateTime fechaInicioAtencion, LocalDateTime fechaFin, Usuario operador) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.FINALIZADO);
        t.setModulo(modulo);
        t.setFechaLlamado(fechaLlamado);
        t.setFechaInicioAtencion(fechaInicioAtencion);
        t.setFechaFin(fechaFin);
        t.setOperador(operador);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, EstadoTurno.EN_ATENCION, EstadoTurno.FINALIZADO, fechaFin, operador, null);
    }

    private void crearTurnoCancelado(Servicio servicio, Categoria categoria, String nombreCliente,
                                      LocalDateTime fechaIngreso, String motivo, Usuario operador) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.CANCELADO);
        t.setMotivo(motivo);
        t.setOperador(operador);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, EstadoTurno.EN_ESPERA, EstadoTurno.CANCELADO, fechaIngreso.plusMinutes(5), operador, motivo);
    }

    private void crearTurnoAusente(Servicio servicio, Modulo modulo, Categoria categoria, String nombreCliente,
                                    LocalDateTime fechaIngreso, LocalDateTime fechaLlamado, String motivo, Usuario operador) {
        Turno t = nuevoTurno(servicio, categoria, nombreCliente, fechaIngreso);
        t.setEstado(EstadoTurno.AUSENTE);
        t.setModulo(modulo);
        t.setFechaLlamado(fechaLlamado);
        t.setMotivo(motivo);
        t.setOperador(operador);
        Turno guardado = turnoRepository.save(t);
        registrarHistorial(guardado, EstadoTurno.LLAMADO, EstadoTurno.AUSENTE, fechaLlamado.plusMinutes(3), operador, motivo);
    }
}
