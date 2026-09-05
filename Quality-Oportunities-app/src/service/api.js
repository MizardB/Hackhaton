/**
 * Cliente HTTP de la API de Quality Opportunities.
 *
 * Un solo lugar donde vive la URL base, el token y el formato de error. Las paginas y los hooks
 * llaman a estas funciones y no vuelven a escribir `fetch` nunca.
 *
 * La URL sale de VITE_API_URL. En Vite, una variable solo llega al navegador si su nombre empieza
 * por VITE_, y se lee en tiempo de build: despues de anadirla en Vercel hay que volver a
 * desplegar o seguira valiendo undefined.
 */

export const BASE =
  import.meta.env.VITE_API_URL ?? 'https://quality-opportunities-api.onrender.com';

const CLAVE_TOKEN = 'qo_token';

export const token = {
  leer: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (valor) => localStorage.setItem(CLAVE_TOKEN, valor),
  borrar: () => localStorage.removeItem(CLAVE_TOKEN),
};

/** Error de la API con el codigo estable del backend, para poder ramificar sobre el. */
export class ErrorApi extends Error {
  constructor(codigo, mensaje, estado, detalles) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
    this.detalles = detalles ?? {};
  }
}

async function peticion(ruta, { metodo = 'GET', cuerpo, conToken = true } = {}) {
  const cabeceras = {};
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';

  const jwt = conToken ? token.leer() : null;
  if (jwt) cabeceras.Authorization = `Bearer ${jwt}`;

  let respuesta;
  try {
    respuesta = await fetch(`${BASE}/api/v1${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    // Se llega aqui tambien cuando el navegador bloquea por CORS: el mensaje del navegador
    // habla de red, pero la causa puede ser que el origen no este en la lista del backend.
    throw new ErrorApi('SIN_CONEXION', 'No se pudo contactar con el servidor.', 0);
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const e = datos?.error ?? {};
    throw new ErrorApi(
      e.codigo ?? 'ERROR',
      e.mensaje ?? 'Ocurrio un error inesperado.',
      respuesta.status,
      e.detalles,
    );
  }
  return datos;
}

/* ------------------------------------------------------------------ identidad */

export function registro({ correo, password, nombre, perfil }) {
  return peticion('/auth/registro', {
    metodo: 'POST',
    conToken: false,
    cuerpo: { correo, password, nombre, perfil_estudiante: perfil ?? null },
  });
}

export async function login({ correo, password }) {
  const datos = await peticion('/auth/login', {
    metodo: 'POST',
    conToken: false,
    cuerpo: { correo, password },
  });
  token.guardar(datos.access_token);
  return datos.usuario;
}

export const yo = () => peticion('/auth/yo');
export const miPerfil = () => peticion('/auth/yo/perfil');
export const salir = () => token.borrar();

/* --------------------------------------------------------------------- retos */

export const listarRetos = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return peticion(`/retos${q ? `?${q}` : ''}`, { conToken: false });
};

export const verReto = (retoId) => peticion(`/retos/${retoId}`, { conToken: false });

/* -------------------------------------------------------------- participacion */

export const participar = (retoId) =>
  peticion(`/retos/${retoId}/participaciones`, { metodo: 'POST' });

export const misParticipaciones = () => peticion('/participaciones/mias');
export const verParticipacion = (id) => peticion(`/participaciones/${id}`);

/* ---------------------------------------------------------- espacio de trabajo */

export const abrirEspacio = (participacionId) =>
  peticion(`/participaciones/${participacionId}/workspace`);

/**
 * `revisionBase` es la revision sobre la que se edito, no la siguiente. Si otra pestana guardo
 * antes, el backend responde 409 BORRADOR_DESACTUALIZADO y no sobrescribe nada.
 */
export const guardarEspacio = (participacionId, revisionBase, archivos) =>
  peticion(`/participaciones/${participacionId}/workspace`, {
    metodo: 'PUT',
    cuerpo: { revision_base: revisionBase, archivos },
  });

/* --------------------------------------------------- entregas y evaluaciones */

export const enviarEntrega = (participacionId, { repositorio, commit }) =>
  peticion(`/participaciones/${participacionId}/entregas`, {
    metodo: 'POST',
    cuerpo: { repositorio, commit },
  });

export const historialEntregas = (participacionId) =>
  peticion(`/participaciones/${participacionId}/entregas`);

export const verEvaluacion = (evaluacionId) => peticion(`/evaluaciones/${evaluacionId}`);

export const reevaluar = (entregaId) =>
  peticion(`/entregas/${entregaId}/evaluaciones`, { metodo: 'POST' });

const EN_CURSO = ['PENDIENTE', 'EN_EJECUCION'];

/**
 * Consulta el estado hasta que la evaluacion termina. `alAvanzar` recibe cada respuesta
 * intermedia, que trae `progreso` con pruebas ejecutadas sobre totales: sirve para pintar una
 * barra con datos reales en vez de un porcentaje inventado.
 */
export async function esperarEvaluacion(evaluacionId, alAvanzar, intervaloMs = 800, intentos = 120) {
  for (let i = 0; i < intentos; i += 1) {
    const estado = await verEvaluacion(evaluacionId);
    if (alAvanzar) alAvanzar(estado);
    if (!EN_CURSO.includes(estado.estado_procesamiento)) return estado;
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
  throw new ErrorApi('TIEMPO_AGOTADO', 'La evaluacion tarda mas de lo previsto.', 0);
}

/* ---------------------------------------------------------------- credenciales */

export const verificarCredencial = (identificador) =>
  peticion(`/credenciales/${identificador}`, { conToken: false });

export const revocarCredencial = (identificador, motivo) =>
  peticion(`/credenciales/${identificador}/revocacion`, { metodo: 'POST', cuerpo: { motivo } });

export const perfilPublico = (nombrePublico) =>
  peticion(`/perfiles/${nombrePublico}`, { conToken: false });

/* --------------------------------------------------------------------- estado */

export const salud = () => fetch(`${BASE}/health`).then((r) => r.json());
export const meta = () => peticion('/meta', { conToken: false });

/**
 * Adapta un reto del backend a la forma que ya usan las paginas.
 *
 * Los campos `stack`, `dificultad`, `puntos` y `metrics` de los datos de ejemplo NO existen en el
 * backend, asi que aqui llegan vacios o nulos: inventarlos seria mostrar informacion falsa. Lo que
 * si es real y conviene enseñar es cuantas pruebas tiene el reto y cuantas son obligatorias.
 */
export function aRetoDeUI(reto) {
  const nombreOrg = reto.organizacion?.nombre ?? '';
  return {
    id: reto.id,
    titulo: reto.titulo,
    org: nombreOrg,
    orgIniciales: nombreOrg
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    logo: reto.organizacion?.logo ?? null,
    estado: reto.estado === 'PUBLICADO' ? 'abierto' : 'cerrado',
    pruebasTotales: reto.pruebas_totales,
    pruebasObligatorias: reto.pruebas_obligatorias,
    // El chip que antes mostraba el stack se reutiliza para datos que si existen.
    stack: [`${reto.pruebas_totales} pruebas`, `${reto.pruebas_obligatorias} obligatorias`],
    dificultad: null,
    puntos: null,
    metrics: null,
  };
}
