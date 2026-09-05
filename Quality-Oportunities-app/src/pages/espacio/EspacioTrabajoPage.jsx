import { useCallback, useEffect, useState } from 'react';

import {
  abrirEspacio,
  enviarEntrega,
  guardarEspacio,
  misParticipaciones,
  participar,
  verReto,
} from '../../service/api.js';

const PLANTILLA = `# Escribe aqui tu solucion.
# El archivo principal del proyecto es main.py.

def procesar(entrada):
    return entrada
`;

/**
 * Editor conectado al backend.
 *
 * Al montar crea la participacion (o recupera la que ya existia) y abre el espacio de trabajo.
 * Guardar NO crea una entrega ni incrementa el numero de intento: eso solo ocurre al enviar.
 *
 * `revision` es control de concurrencia optimista: se envia la revision sobre la que se edito y
 * el servidor rechaza con 409 si otra pestana guardo antes, en vez de pisar el trabajo ajeno.
 */
export default function EspacioTrabajoPage({ retoId, onEnviar, onVolver }) {
  const [reto, setReto] = useState(null);
  const [participacionId, setParticipacionId] = useState(null);
  const [espacio, setEspacio] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [activo, setActivo] = useState(0);
  const [sucio, setSucio] = useState(false);
  const [aviso, setAviso] = useState(null); // { tipo: 'ok'|'error', texto }
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // --- arranque: participacion + espacio + detalle del reto ------------------
  useEffect(() => {
    if (!retoId) return undefined;
    let vigente = true;

    (async () => {
      try {
        const detalle = await verReto(retoId);
        if (vigente) setReto(detalle);

        let participacion;
        try {
          participacion = await participar(retoId);
        } catch (e) {
          // Ya participaba: se recupera la existente en vez de fallar.
          if (e.codigo !== 'PARTICIPACION_YA_EXISTE') throw e;
          const mias = await misParticipaciones();
          participacion = mias.find((p) => p.reto_id === retoId);
        }
        if (!vigente || !participacion) return;
        setParticipacionId(participacion.id);

        const w = await abrirEspacio(participacion.id);
        if (!vigente) return;
        setEspacio(w);
        setArchivos(
          w.archivos.length > 0
            ? w.archivos.map(({ ruta, contenido }) => ({ ruta, contenido }))
            : [{ ruta: 'main.py', contenido: PLANTILLA }],
        );
      } catch (e) {
        if (vigente) setAviso({ tipo: 'error', texto: e.mensaje ?? 'No se pudo abrir el espacio.' });
      } finally {
        if (vigente) setCargando(false);
      }
    })();

    return () => {
      vigente = false;
    };
  }, [retoId]);

  // --- guardar ---------------------------------------------------------------
  const guardar = useCallback(async () => {
    if (!participacionId || !espacio || ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      const actualizado = await guardarEspacio(participacionId, espacio.revision, archivos);
      setEspacio(actualizado);
      setSucio(false);
      setAviso({ tipo: 'ok', texto: `Guardado. Revisión ${actualizado.revision}.` });
    } catch (e) {
      setAviso({
        tipo: 'error',
        texto:
          e.codigo === 'BORRADOR_DESACTUALIZADO'
            ? 'Otra pestaña guardó antes. Recarga para no perder su trabajo.'
            : (e.mensaje ?? 'No se pudo guardar.'),
      });
    } finally {
      setOcupado(false);
    }
  }, [participacionId, espacio, archivos, ocupado]);

  // --- enviar ----------------------------------------------------------------
  const enviar = useCallback(async () => {
    if (!participacionId || ocupado) return;
    setOcupado(true);
    setAviso(null);
    try {
      if (sucio) await guardar();
      // Identificador del intento. Con el evaluador simulado determina el resultado; con el de
      // sandbox lo que se ejecuta es el contenido del espacio de trabajo.
      const commit = Math.random().toString(16).slice(2, 14);
      const aceptada = await enviarEntrega(participacionId, {
        repositorio: reto?.repositorio_base ?? 'https://github.com/demo/reto',
        commit,
      });
      onEnviar?.(aceptada.evaluacion_id, reto?.titulo);
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.mensaje ?? 'No se pudo enviar.' });
    } finally {
      setOcupado(false);
    }
  }, [participacionId, ocupado, sucio, guardar, reto, onEnviar]);

  // Ctrl+S guarda, como en cualquier editor.
  useEffect(() => {
    const alPulsar = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        guardar();
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [guardar]);

  const cambiarContenido = (valor) => {
    setArchivos((previos) => previos.map((a, i) => (i === activo ? { ...a, contenido: valor } : a)));
    setSucio(true);
  };

  const nuevoArchivo = () => {
    const ruta = window.prompt('Nombre del archivo (.py .txt .md .json .csv .toml)');
    if (!ruta) return;
    setArchivos((previos) => [...previos, { ruta, contenido: '' }]);
    setActivo(archivos.length);
    setSucio(true);
  };

  if (!retoId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Selecciona un reto del catálogo</p>
      </div>
    );
  }

  const bloqueado = espacio && !espacio.puede_enviar;

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        <div className="h-16 w-full px-gutter-desktop max-w-container-max mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
            </div>
            <div className="h-4 w-px bg-outline-variant"></div>
            <span className="font-headline-sm text-headline-sm tracking-tight font-bold text-on-surface uppercase">
              Quality Opportunities
            </span>
            <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded bg-surface-container-high text-primary uppercase">
              ESTUDIANTE
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            {espacio && (
              <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
                Revisión {espacio.revision}
                {sucio && <span className="text-tertiary"> · sin guardar</span>}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)]">
        <div className="w-full px-gutter-desktop max-w-container-max mx-auto py-space-xl">
          <div className="flex flex-col w-full gap-space-md">
            <header className="w-full bg-surface-container-low rounded-xl px-space-md py-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <button
                  onClick={onVolver}
                  className="inline-flex items-center gap-space-2xs text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span className="hidden sm:inline">Detalle del reto</span>
                </button>
                <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
                <div className="flex items-center gap-space-xs font-code-sm text-code-sm">
                  <span className="text-on-surface-variant">Retos</span>
                  <span className="text-outline">/</span>
                  <span className="text-on-surface font-semibold truncate max-w-[260px] sm:max-w-none">
                    {reto?.titulo ?? 'Cargando…'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-space-sm">
                <button
                  onClick={guardar}
                  disabled={ocupado || !espacio}
                  className="inline-flex items-center gap-space-2xs bg-surface-container-high hover:bg-surface-bright disabled:opacity-40 text-on-surface px-space-sm py-space-xs rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">save</span>
                  <span className="font-body-sm text-body-sm font-medium hidden sm:inline">Guardar</span>
                </button>
                <button
                  onClick={enviar}
                  disabled={ocupado || !espacio || bloqueado}
                  title={bloqueado ? espacio.motivo_bloqueo : undefined}
                  className="relative inline-flex items-center gap-space-2xs bg-gradient-to-r from-primary-container via-secondary to-tertiary hover:opacity-95 disabled:opacity-40 text-on-primary-fixed font-headline-sm text-body-sm font-bold px-space-md py-space-xs rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">rocket_launch</span>
                  <span>Enviar solución</span>
                </button>
              </div>
            </header>

            {aviso && (
              <div
                className={`rounded-xl px-space-md py-space-sm font-body-sm text-body-sm ${
                  aviso.tipo === 'ok'
                    ? 'bg-surface-container-lowest text-secondary'
                    : 'bg-surface-container-lowest text-error'
                }`}
              >
                {aviso.texto}
              </div>
            )}

            {bloqueado && (
              <div className="rounded-xl px-space-md py-space-sm bg-surface-container-lowest font-body-sm text-body-sm text-tertiary">
                {espacio.motivo_bloqueo}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
              <div className="lg:col-span-8 flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between bg-surface-container-lowest px-space-xs pt-space-xs overflow-x-auto">
                  <div className="flex items-center gap-space-2xs">
                    {archivos.map((a, i) => (
                      <button
                        key={a.ruta}
                        onClick={() => setActivo(i)}
                        className={`flex items-center gap-space-xs px-space-sm py-space-2xs rounded-t-lg font-code-sm text-code-sm transition-colors ${
                          i === activo
                            ? 'bg-surface-container-low text-primary font-medium'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary">code</span>
                        <span>{a.ruta}</span>
                      </button>
                    ))}
                    <button
                      onClick={nuevoArchivo}
                      className="px-space-sm py-space-2xs text-outline hover:text-on-surface font-code-sm text-code-sm"
                      title="Añadir archivo"
                    >
                      +
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-space-sm pr-space-sm text-outline font-label-caps text-label-caps">
                    <span className="text-on-surface-variant">Python</span>
                    <span>·</span>
                    <span>UTF-8</span>
                  </div>
                </div>
                <textarea
                  value={archivos[activo]?.contenido ?? ''}
                  onChange={(e) => cambiarContenido(e.target.value)}
                  spellCheck={false}
                  disabled={cargando}
                  className="w-full min-h-[440px] max-h-[580px] bg-surface-container-low text-on-surface font-mono font-code-sm text-code-sm leading-[1.65rem] p-space-md outline-none resize-none"
                  placeholder={cargando ? 'Abriendo el espacio de trabajo…' : ''}
                />
                <div className="flex items-center justify-between px-space-md py-space-2xs bg-surface-container-lowest font-code-sm text-code-sm text-outline">
                  <span>{archivos.length} archivo(s) · máximo 20</span>
                  <span>
                    {new Blob([archivos.map((a) => a.contenido).join('')]).size} bytes · máximo 1 MiB
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-md">
                <div className="bg-surface-container-low rounded-xl p-space-md shadow-lg flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Pruebas del reto
                    </h2>
                    {reto && (
                      <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-bold">
                        {reto.pruebas_obligatorias} obligatorias
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    {(reto?.pruebas ?? []).map((p) => (
                      <div key={p.id} className="flex items-start gap-space-xs p-space-xs bg-surface-container rounded-lg">
                        <span
                          className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                            p.obligatoria ? 'text-primary' : 'text-outline'
                          }`}
                        >
                          {p.obligatoria ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm font-semibold text-on-surface">{p.nombre}</span>
                          <span className="font-code-sm text-code-sm text-on-surface-variant">
                            {p.condicion_aprobacion}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {reto?.criterios_aceptacion && (
                    <div className="flex flex-col gap-space-2xs pt-space-xs">
                      <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                        Criterios de aceptación
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {reto.criterios_aceptacion}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-space-2xs text-outline font-code-sm text-code-sm">
                    <div className="flex items-center gap-space-2xs">
                      <kbd className="px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface text-[10px] font-mono">
                        ⌘ + S
                      </kbd>
                      <span className="text-body-sm">Guardar</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                      Guardar no es enviar
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Guardar conserva el borrador. Enviar crea un intento oficial y lanza la evaluación.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest">
        <div className="w-full max-w-container-max mx-auto px-gutter-desktop py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="font-code-sm text-code-sm text-outline">© 2026 Quality Opportunities</div>
        </div>
      </footer>
    </div>
  );
}
