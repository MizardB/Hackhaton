import { useCallback, useState } from 'react';

import { perfilPublico, revocarCredencial, verificarCredencial } from './api.js';

/**
 * Consulta publica de credenciales y perfiles. No requiere sesion: es lo que abre un reclutador.
 *
 * `vigente` no es un campo almacenado: el backend lo deriva de que no exista una revocacion. Una
 * credencial revocada sigue existiendo y conserva su historia, con motivo y momento.
 */
export function useCredenciales() {
  const [credencial, setCredencial] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const verificar = useCallback(async (identificador) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await verificarCredencial(identificador);
      setCredencial(datos);
      return datos;
    } catch (e) {
      setError(e);
      setCredencial(null);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  const verPerfil = useCallback(async (nombrePublico) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await perfilPublico(nombrePublico);
      setPerfil(datos);
      return datos;
    } catch (e) {
      setError(e);
      setPerfil(null);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  /** Solo para una cuenta que represente a la organizacion con permiso de revocacion. */
  const revocar = useCallback(async (identificador, motivo) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await revocarCredencial(identificador, motivo);
      setCredencial(datos);
      return datos;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  return { credencial, perfil, cargando, error, verificar, verPerfil, revocar };
}
