package com.example.turnos.config;

import com.example.turnos.entity.Categoria;
import com.example.turnos.entity.ContadorProporcion;
import com.example.turnos.entity.Modulo;
import com.example.turnos.entity.Rol;
import com.example.turnos.entity.Servicio;
import com.example.turnos.entity.Usuario;
import com.example.turnos.repository.CategoriaRepository;
import com.example.turnos.repository.ContadorProporcionRepository;
import com.example.turnos.repository.ModuloRepository;
import com.example.turnos.repository.ServicioRepository;
import com.example.turnos.repository.UsuarioRepository;
import java.time.LocalDate;
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
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        crearUsuario("admin", "Administrador del Sistema", "admin123", Rol.ADMINISTRADOR);
        crearUsuario("operador1", "Juan", "operador123", Rol.OPERADOR);
        crearUsuario("operador2", "María", "operador123", Rol.OPERADOR);

        crearCategoria("Discapacidad", true);
        crearCategoria("Embarazada", true);
        crearCategoria("Adulto mayor", true);
        crearCategoria("Regular", false);

        Servicio caja = crearServicio("Caja", "CAJ", "Atención de caja y retiros");
        Servicio asesoria = crearServicio("Asesoría", "ASE", "Asesoría financiera y productos");

        crearModulo("M01", "Caja 1", caja);
        crearModulo("M02", "Caja 2", caja);
        crearModulo("M03", "Asesoría 1", asesoria);
        crearModulo("M04", "Asesoría 2", asesoria);
    }

    private void crearUsuario(String username, String nombreCompleto, String clave, Rol rol) {
        if (usuarioRepository.existsByUsername(username)) {
            return;
        }
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setNombreCompleto(nombreCompleto);
        u.setPasswordHash(passwordEncoder.encode(clave));
        u.setRol(rol);
        u.setActivo(true);
        usuarioRepository.save(u);
    }

    private void crearCategoria(String nombre, boolean esPreferente) {
        if (categoriaRepository.existsByNombre(nombre)) {
            return;
        }
        Categoria c = new Categoria();
        c.setNombre(nombre);
        c.setEsPreferente(esPreferente);
        categoriaRepository.save(c);
    }

    private Servicio crearServicio(String nombre, String prefijo, String descripcion) {
        if (servicioRepository.existsByPrefijo(prefijo)) {
            return servicioRepository.findAll().stream()
                    .filter(s -> s.getPrefijo().equals(prefijo))
                    .findFirst()
                    .orElseThrow();
        }
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
    }

    private void crearModulo(String codigo, String nombre, Servicio servicio) {
        boolean existe = moduloRepository.findByServicioId(servicio.getId()).stream()
                .anyMatch(m -> m.getCodigo().equals(codigo));
        if (existe) {
            return;
        }
        Modulo m = new Modulo();
        m.setCodigo(codigo);
        m.setNombre(nombre);
        m.setServicio(servicio);
        m.setActivo(true);
        moduloRepository.save(m);
    }
}
