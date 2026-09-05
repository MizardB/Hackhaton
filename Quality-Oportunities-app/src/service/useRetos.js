import { RETOS } from '../types/reto.js';

export function useRetos() {
  const obtenerRetos = () => RETOS;
  const obtenerRetoPorId = (id) => RETOS.find((reto) => reto.id === id);

  return { obtenerRetos, obtenerRetoPorId };
}
