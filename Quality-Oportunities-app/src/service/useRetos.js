import { useCallback, useEffect, useState } from 'react';

import { aRetoDeUI, listarRetos, participar, verReto } from './api.js';

/**
 * Catalogo real de retos. Conserva la firma anterior —obtenerRetos() y obtenerRetoPorId(id)— para
 * que las paginas sigan funcionando: la carga ocurre al montar y esas funciones devuelven lo que
 * ya llego. En el primer render la lista esta vacia y se rellena sola.
 *
 * `id` deja de ser un codigo como 'CS-ENG-9042' y pasa a ser el UUID del reto en la base. Todo lo
 * que se construya con el —enlaces, rutas— tiene que usar ese valor.
 */
export function useRetos() {
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    listarRetos({ size: 50 })
      .then((pagina) => {
        if (!vigente) return;
        setRetos(pagina.items.map(aRetoDeUI));
      })
      .catch((e) => vigente && setError(e))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  const obtenerRetos = useCallback(() => retos, [retos]);
  const obtenerRetoPorId = useCallback((id) => retos.find((r) => r.id === id), [retos]);

  /** Detalle completo, con descripcion, criterios y la lista de pruebas. Es asincrono. */
  const obtenerDetalle = useCallback(async (id) => {
    const detalle = await verReto(id);
    return { ...aRetoDeUI(detalle), ...detalle };
  }, []);

  /**
   * Devuelve la participacion. Su `id` es la clave de todo lo que sigue: abrir el editor, guardar
   * y enviar. Si ya existia, el backend responde 409 PARTICIPACION_YA_EXISTE.
   */
  const participarEn = useCallback(async (retoId) => participar(retoId), []);

  return { retos, cargando, error, obtenerRetos, obtenerRetoPorId, obtenerDetalle, participarEn };
}
