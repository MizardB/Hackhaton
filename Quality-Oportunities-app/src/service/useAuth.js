import { useCallback, useEffect, useState } from 'react';

import { login as entrar, registro as crearCuenta, salir as cerrar, token, yo } from './api.js';

/**
 * Sesion real contra la API. Conserva la firma anterior —login({ email, password }), status,
 * error— para que LoginForm siga funcionando sin cambios.
 *
 * No hay rol global: la misma cuenta puede tener perfil de estudiante y representar a una
 * organizacion a la vez. Por eso se exponen `esEstudiante` y `representaciones` por separado, en
 * lugar de un unico campo `rol`.
 */
export function useAuth() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Si ya hay token guardado, se recupera la sesion al montar.
  useEffect(() => {
    if (!token.leer()) return;
    yo()
      .then((u) => {
        setUsuario(u);
        setStatus('success');
      })
      .catch(() => {
        cerrar();
        setUsuario(null);
      });
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      setError('Ingresa correo y contrasena');
      setStatus('error');
      return null;
    }
    setStatus('loading');
    setError(null);
    try {
      const u = await entrar({ correo: email, password });
      setUsuario(u);
      setStatus('success');
      return u;
    } catch (e) {
      // El backend devuelve el mensaje ya redactado para la persona.
      setError(e.mensaje ?? 'No se pudo iniciar sesion');
      setStatus('error');
      return null;
    }
  }, []);

  const registro = useCallback(async ({ email, password, nombre, perfil }) => {
    setStatus('loading');
    setError(null);
    try {
      await crearCuenta({ correo: email, password, nombre, perfil });
      return await login({ email, password });
    } catch (e) {
      setError(e.mensaje ?? 'No se pudo crear la cuenta');
      setStatus('error');
      return null;
    }
  }, [login]);

  const logout = useCallback(() => {
    cerrar();
    setUsuario(null);
    setStatus('idle');
  }, []);

  return {
    login,
    registro,
    logout,
    status,
    error,
    usuario,
    autenticado: usuario !== null,
    esEstudiante: usuario?.tiene_perfil_estudiante ?? false,
    representaciones: usuario?.representaciones ?? [],
  };
}
