import { useEffect, useState } from 'react';

import { verEvaluacion } from '../../service/api.js';

const EN_CURSO = ['PENDIENTE', 'EN_EJECUCION'];

/**
 * Resultado real de una evaluacion.
 *
 * Recibe `evaluacionId` de la pagina anterior y consulta el estado hasta que termina. Los tres
 * finales posibles se muestran distinto, y el fallo de entorno NO se presenta como una
 * desaprobacion del estudiante.
 */
export default function ResultadoPage({ evaluacionId, tituloReto, onVolver }) {
  const [evaluacion, setEvaluacion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!evaluacionId) return undefined;
    let vigente = true;

    const consultar = async () => {
      try {
        const estado = await verEvaluacion(evaluacionId);
        if (!vigente) return;
        setEvaluacion(estado);
        if (EN_CURSO.includes(estado.estado_procesamiento)) setTimeout(consultar, 800);
      } catch (e) {
        if (vigente) setError(e);
      }
    };
    consultar();

    return () => {
      vigente = false;
    };
  }, [evaluacionId]);

  const enCurso = evaluacion && EN_CURSO.includes(evaluacion.estado_procesamiento);
  const aprobado = evaluacion?.dictamen === 'APROBADO';
  const errorTecnico = evaluacion?.estado_procesamiento === 'ERROR_TECNICO';
  const progreso = evaluacion?.progreso;
  const porcentaje = progreso?.pruebas_totales
    ? Math.round((progreso.pruebas_ejecutadas / progreso.pruebas_totales) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-container-max mx-auto px-gutter-desktop py-space-xl">
        <div className="flex flex-col gap-space-lg">
          <button
            onClick={onVolver}
            className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="font-code-sm text-code-sm">Volver al catálogo</span>
          </button>

          <div className="flex flex-col gap-space-2xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Resultado de la Evaluación
            </h1>
            {tituloReto && (
              <p className="font-body-lg text-body-lg text-on-surface-variant">{tituloReto}</p>
            )}
          </div>

          {error && (
            <div className="bg-surface-container-lowest p-space-md rounded-xl border-l-4 border-error">
              <p className="font-body-sm text-body-sm text-on-surface">{error.mensaje}</p>
            </div>
          )}

          {!evaluacion && !error && (
            <div className="bg-surface-container-lowest p-space-md rounded-xl">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Cargando la evaluación…</p>
            </div>
          )}

          {enCurso && (
            <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-body-sm text-body-sm font-semibold text-primary">
                  {evaluacion.estado_procesamiento === 'PENDIENTE' ? 'En cola' : 'En ejecución'}
                </span>
              </div>
              {progreso && (
                <>
                  <div className="flex items-center gap-space-xs font-code-sm text-code-sm">
                    <span className="text-on-surface font-semibold">Progreso:</span>
                    <span className="text-secondary font-bold">
                      {progreso.pruebas_ejecutadas} / {progreso.pruebas_totales}
                    </span>
                    <span className="text-outline">({porcentaje}%)</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary rounded-full transition-all duration-300"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          )}

          {evaluacion && !enCurso && (
            <>
              <div
                className={`p-space-md rounded-xl flex items-center gap-space-md ${
                  errorTecnico
                    ? 'bg-surface-container-lowest border-l-4 border-tertiary'
                    : aprobado
                      ? 'bg-surface-container-lowest border-l-4 border-secondary'
                      : 'bg-surface-container-lowest border-l-4 border-error'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[32px] ${
                    errorTecnico ? 'text-tertiary' : aprobado ? 'text-secondary' : 'text-error'
                  }`}
                >
                  {errorTecnico ? 'build' : aprobado ? 'verified' : 'cancel'}
                </span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {errorTecnico
                      ? 'No se pudo completar la evaluación'
                      : aprobado
                        ? 'Aprobado'
                        : 'No aprobado'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {/* Un fallo del entorno no es culpa de quien entrego el codigo. */}
                    {errorTecnico
                      ? evaluacion.detalle_error ?? 'Fallo del entorno de ejecución. Se puede reintentar.'
                      : aprobado
                        ? 'La solución superó todas las pruebas obligatorias del reto.'
                        : 'Alguna prueba obligatoria no se cumplió.'}
                  </span>
                </div>
              </div>

              {evaluacion.resultados?.length > 0 && (
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Pruebas ejecutadas
                  </span>
                  {evaluacion.resultados.map((r) => (
                    <div
                      key={r.prueba_id}
                      className="bg-surface-container-lowest p-space-sm rounded-lg flex items-start gap-space-sm"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                          r.condicion_ejecucion !== 'EJECUTADA'
                            ? 'text-outline'
                            : r.aprobada
                              ? 'text-secondary'
                              : 'text-error'
                        }`}
                      >
                        {r.condicion_ejecucion !== 'EJECUTADA'
                          ? 'remove'
                          : r.aprobada
                            ? 'check_circle'
                            : 'cancel'}
                      </span>
                      <div className="flex flex-col flex-1 gap-space-2xs">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                            {r.prueba}
                          </span>
                          <span className="font-label-caps text-label-caps px-space-2xs rounded bg-surface-container-high text-on-surface-variant uppercase">
                            {r.categoria}
                          </span>
                          {r.obligatoria && (
                            <span className="font-label-caps text-label-caps px-space-2xs rounded bg-primary-container/20 text-primary uppercase">
                              obligatoria
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-space-sm font-code-sm text-code-sm text-outline">
                          {r.duracion_ms != null && <span>{r.duracion_ms} ms</span>}
                          {r.valor_observado != null && (
                            <span>
                              {r.valor_observado} {r.unidad}
                            </span>
                          )}
                          {r.condicion_ejecucion !== 'EJECUTADA' && (
                            <span className="text-tertiary">{r.condicion_ejecucion}</span>
                          )}
                        </div>
                        {r.detalle && (
                          <span className="font-code-sm text-code-sm text-on-surface-variant">{r.detalle}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {evaluacion.credencial && (
                <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    Credencial emitida
                  </span>
                  <span className="font-headline-sm text-headline-sm font-bold text-secondary tracking-tight">
                    {evaluacion.credencial.identificador_publico}
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    {evaluacion.credencial.vigente ? 'Vigente' : 'Revocada'} · verificable de forma pública
                  </span>
                </div>
              )}

              {aprobado && !evaluacion.credencial && (
                <div className="bg-surface-container-lowest p-space-md rounded-xl">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Evaluación aprobada; emisión de la credencial pendiente.
                  </p>
                </div>
              )}

              {/* El motor que produjo el resultado viaja siempre: nada afirma una ejecucion que no ocurrio. */}
              <div className="flex flex-wrap items-center gap-space-sm font-code-sm text-code-sm text-outline">
                <span>Motor: {evaluacion.version_evaluador}</span>
                {evaluacion.momento_inicio && evaluacion.momento_fin && (
                  <span>
                    Duración:{' '}
                    {Math.round(
                      (new Date(evaluacion.momento_fin) - new Date(evaluacion.momento_inicio)) / 10,
                    ) / 100}{' '}
                    s
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
