import { useMemo } from 'react';
import { useRetos } from '../../service/useRetos.js';

export default function ResultadoPage({ retoId, onVolver }) {
  const { obtenerRetoPorId } = useRetos();
  const reto = useMemo(() => obtenerRetoPorId(retoId), [retoId, obtenerRetoPorId]);

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

          <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
            Resultado de la Evaluación
          </h1>
          {reto && (
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {reto.titulo}
            </p>
          )}

          <div className="bg-surface-container-lowest p-space-md rounded-xl">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Aquí se mostrará el resultado de la evaluación de tu entrega.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
