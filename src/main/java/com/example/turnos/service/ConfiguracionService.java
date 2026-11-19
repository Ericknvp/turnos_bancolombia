package com.example.turnos.service;

import com.example.turnos.entity.ParametroSistema;
import com.example.turnos.repository.ParametroSistemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracionService {

    private static final String CLAVE_UMBRAL = "umbral_envejecimiento_minutos";
    private static final String VALOR_POR_DEFECTO = "15";

    @Autowired
    private ParametroSistemaRepository parametroSistemaRepository;

    public int obtenerUmbralMinutos() {
        return Integer.parseInt(parametroSistemaRepository.findById(CLAVE_UMBRAL)
                .map(ParametroSistema::getValor)
                .orElseGet(() -> crearPorDefecto().getValor()));
    }

    public int actualizarUmbral(int minutos) {
        ParametroSistema p = parametroSistemaRepository.findById(CLAVE_UMBRAL).orElseGet(this::crearPorDefecto);
        p.setValor(String.valueOf(minutos));
        parametroSistemaRepository.save(p);
        return minutos;
    }

    private ParametroSistema crearPorDefecto() {
        ParametroSistema p = new ParametroSistema();
        p.setClave(CLAVE_UMBRAL);
        p.setValor(VALOR_POR_DEFECTO);
        return parametroSistemaRepository.save(p);
    }
}
