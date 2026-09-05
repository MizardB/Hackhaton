import { useMemo } from 'react';
import { useRetos } from '../../service/useRetos.js';

export default function DetalleRetoPage({ retoId, onIniciar, onVolver }) {
  const { obtenerRetoPorId } = useRetos();
  const reto = useMemo(() => obtenerRetoPorId(retoId), [retoId, obtenerRetoPorId]);

  if (!reto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface-variant">Selecciona un reto del catálogo</p>
      </div>
    );
  }

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
          <nav className="hidden lg:flex items-center gap-space-md">
            <a className="transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg px-space-sm py-space-xs" data-path="overview" href="#">
              Overview
            </a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="curriculum" href="#">
              Curriculum
            </a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="projects" href="#">
              Projects
            </a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors px-space-sm py-space-xs" data-path="certifications" href="#">
              Certifications
            </a>
          </nav>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
              <span className="font-code-sm text-code-sm text-on-surface font-medium">Alex Mercer</span>
              <span className="text-outline font-code-sm text-code-sm hidden md:inline">·</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant hidden md:inline">
                Senior Backend Engineer
              </span>
            </div>
            <a className="flex items-center gap-space-2xs bg-surface-container-high hover:bg-surface-bright text-on-surface hover:text-on-surface px-space-sm py-space-xs rounded-lg transition-colors" data-path="cv-preview" href="#">
              <span className="font-label-caps text-label-caps uppercase">Mi CV</span>
              <span className="material-symbols-outlined text-[16px] text-primary">open_in_new</span>
            </a>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)]">
        <div className="w-full px-gutter-desktop max-w-container-max mx-auto py-space-xl">
          <div className="flex flex-col w-full text-on-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-lg">
              <div className="flex items-center gap-space-xs text-body-sm font-body-sm flex-wrap">
                <button onClick={onVolver} className="inline-flex items-center gap-space-2xs text-primary hover:text-primary-fixed transition-colors font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Volver a retos
                </button>
                <span className="text-outline font-code-sm text-code-sm">/</span>
                <span className="text-on-surface-variant font-code-sm text-code-sm">Retos de Ingeniería</span>
                <span className="text-outline font-code-sm text-code-sm">/</span>
                <span className="text-primary font-code-sm text-code-sm bg-surface-container-high px-space-2xs py-0.5 rounded">{reto.id}</span>
              </div>
              <div className="flex items-center gap-space-xs self-start md:self-auto bg-surface-container-low px-space-sm py-space-2xs rounded-lg shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span className="font-code-sm text-code-sm text-secondary tracking-wider font-semibold">TEST_HARNESS_READY</span>
                <span className="text-outline-variant font-code-sm text-code-sm">|</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">RUNNER: K8S-POD-EUW1</span>
                <span className="text-outline-variant font-code-sm text-code-sm">|</span>
                <span className="font-code-sm text-code-sm text-primary">LIVE TELEMETRY</span>
              </div>
            </div>

            <div className="relative bg-surface-container-low rounded-xl p-space-lg md:p-space-xl shadow-md overflow-hidden mb-space-xl">
              <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container/20 text-secondary font-code-sm text-code-sm font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    ABIERTO
                  </span>
                  <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-lg bg-surface-container-high text-tertiary-fixed font-code-sm text-code-sm font-semibold">
                    <span className="material-symbols-outlined text-[15px]">bolt</span>
                    {reto.dificultad} // {reto.puntos} PTS
                  </span>
                  <span className="px-space-sm py-space-2xs rounded-lg bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
                    ID: {reto.id}
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight max-w-4xl">
                  {reto.titulo}
                </h1>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary font-headline-sm font-bold shadow-inner">
                      {reto.orgIniciales}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">{reto.org}</span>
                      </div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">Infraestructura Distribuida</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-2xs">
                    {reto.stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-code-sm text-code-sm px-space-sm py-space-2xs rounded bg-surface-container-high text-on-surface font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start mb-space-3xl">
              <div className="lg:col-span-8 flex flex-col gap-space-xl">
                <section className="bg-surface-container-low rounded-xl p-space-lg shadow-sm">
                  <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-lowest -mx-space-lg -mt-space-lg p-space-md rounded-t-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
                      <span className="font-label-caps text-label-caps text-primary uppercase">01 // ESPECIFICACIÓN DEL PROBLEMA</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">SPEC-REV: 2.1.0-STABLE</span>
                  </div>
                  <div className="flex flex-col gap-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed">
                    <p>
                      El pipeline actual de ingesta de métricas presenta <strong className="text-on-surface">saturación de buffer</strong> y latencias p95 inaceptables bajo picos de tráfico. Tu objetivo es reescribir el subsistema de procesamiento implementando buffers libres de sincronización pesada y estrategias de agregación en memoria para micro-lotes asíncronos.
                    </p>
                    <div className="bg-surface-container-lowest rounded-lg p-space-md overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between pb-space-2xs text-outline font-code-sm text-code-sm">
                        <span>ARQUITECTURA DEL FLUJO OBJETIVO</span>
                        <span className="text-secondary font-semibold">ZERO-COPY DATA PATH</span>
                      </div>
                      <pre className="font-code-md text-code-md text-primary font-medium tracking-tight">
{`Event Source -> Ingestion RingBuffer -> Micro-batch Worker -> ClickHouse Engine
         |                      |                      |
         v                      |                      v
Backpressure Ctr <- Adaptive Drain Rate Feedback Loop -----`}
                      </pre>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-xl p-space-lg shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm mb-space-md bg-surface-container-lowest -mx-space-lg -mt-space-lg p-space-md rounded-t-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
                      <span className="font-label-caps text-label-caps text-secondary uppercase">02 // CRITERIOS DE ACEPTACIÓN</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-primary font-semibold">3 / 5 VALIDACIONES COMPLETADAS (60%)</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mb-space-lg">
                    <div className="bg-gradient-to-r from-primary via-secondary to-tertiary h-full rounded-full w-3/5 transition-all duration-500"></div>
                  </div>
                  <div className="flex flex-col gap-space-sm">
                    <div className="group flex items-start gap-space-sm p-space-sm bg-surface-container rounded-lg transition-all hover:bg-surface-container-high">
                      <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[16px] font-bold">check</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface">Manejo de backpressure reactivo ante demoras en el flush</span>
                        <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-secondary/10 text-secondary font-semibold w-fit mt-0.5">SUITE v1 · PASSED (14ms)</span>
                      </div>
                    </div>
                    <div className="group flex items-start gap-space-sm p-space-sm bg-surface-container rounded-lg transition-all hover:bg-surface-container-high">
                      <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[16px] font-bold">check</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface">Serialización binaria ultra-eficiente sin overhead</span>
                        <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-secondary/10 text-secondary font-semibold w-fit mt-0.5">ALLOC BENCH · PASSED (0 allocs)</span>
                      </div>
                    </div>
                    <div className="group flex items-start gap-space-sm p-space-sm bg-surface-container rounded-lg transition-all hover:bg-surface-container-high">
                      <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[16px] font-bold">check</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface">Recuperación automática y persistencia en disco de búfer local</span>
                        <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-secondary/10 text-secondary font-semibold w-fit mt-0.5">WAL SYNC · PASSED (30s drop)</span>
                      </div>
                    </div>
                    <div className="group flex items-start gap-space-sm p-space-sm bg-surface-container rounded-lg transition-all hover:bg-surface-container-high">
                      <div className="w-5 h-5 rounded bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                        <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface">Eliminación de contención de locks en hilos concurrentes</span>
                        <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-tertiary/10 text-tertiary-fixed font-semibold w-fit mt-0.5">EN EVALUACIÓN</span>
                      </div>
                    </div>
                    <div className="group flex items-start gap-space-sm p-space-sm bg-surface-container rounded-lg transition-all hover:bg-surface-container-high opacity-85">
                      <div className="w-5 h-5 rounded bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-outline"></span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-body-md text-body-md font-medium text-on-surface">Tasa de descarte de paquetes 0% garantizada</span>
                        <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-surface-container-highest text-outline font-semibold w-fit mt-0.5">CHAOS-RUNNER PENDIENTE</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-xl p-space-lg shadow-sm">
                  <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-lowest -mx-space-lg -mt-space-lg p-space-md rounded-t-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
                      <span className="font-label-caps text-label-caps text-primary uppercase">03 // AMBIENTE DE EJECUCIÓN LOCAL & HARNESS CLI</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-secondary">REGISTRY AUTH: ACTIVE</span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    <div>
                      <label className="font-code-sm text-code-sm text-on-surface-variant mb-space-2xs block">IMAGEN DOCKER BASE DEL ENTORNO DE PRUEBAS:</label>
                      <div className="flex items-center justify-between bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-inner">
                        <code className="font-code-md text-code-md text-primary truncate select-all">docker pull registry.qualityopportunities.tech/challenges/{reto.id}:latest</code>
                      </div>
                    </div>
                    <div>
                      <label className="font-code-sm text-code-sm text-on-surface-variant mb-space-2xs block">ENV VARIABLES PRE-CONFIGURADAS:</label>
                      <div className="bg-surface-container-lowest p-space-md rounded-lg font-code-sm text-code-sm text-on-surface-variant flex flex-col gap-space-2xs">
                        <div className="flex items-center justify-between">
                          <span><span className="text-primary font-semibold">CLICKHOUSE_HOST</span>=tcp://clickhouse-cluster.test:9000</span>
                          <span className="text-outline font-code-sm">Internal VPC</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span><span className="text-primary font-semibold">BUFFER_FLUSH_INTERVAL_MS</span>=50</span>
                          <span className="text-outline font-code-sm">Hard Max 100ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span><span className="text-primary font-semibold">MAX_RING_CAPACITY_BYTES</span>=268435456</span>
                          <span className="text-outline font-code-sm">256MB Static Ring</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-xl">
                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md">
                  <div className="flex items-center justify-between pb-space-sm mb-space-md bg-surface-container-lowest -mx-space-lg -mt-space-lg p-space-md rounded-t-xl">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[20px]">analytics</span>
                      <span className="font-label-caps text-label-caps text-secondary uppercase">SLOS AUDITADOS</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <div className="flex flex-col gap-space-md">
                    <div className="bg-surface-container p-space-md rounded-lg">
                      <div className="flex items-center justify-between mb-space-2xs">
                        <span className="font-code-sm text-code-sm text-outline uppercase font-semibold">THROUGHPUT MÍNIMO</span>
                        <span className="font-code-sm text-code-sm text-secondary font-bold">ACTUAL: 1,840 req/s</span>
                      </div>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">&gt; 1,000</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">req/s (Target: &gt; 2.5k)</span>
                      </div>
                      <div className="mt-space-xs w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: '74%' }}></div>
                      </div>
                    </div>
                    <div className="bg-surface-container p-space-md rounded-lg">
                      <div className="flex items-center justify-between mb-space-2xs">
                        <span className="font-code-sm text-code-sm text-outline uppercase font-semibold">LATENCIA P95 / P99</span>
                        <span className="font-code-sm text-code-sm text-primary font-bold">p95: 38ms</span>
                      </div>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">p95 &lt; 50</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">ms (p99 &lt; 120 ms)</span>
                      </div>
                      <div className="mt-space-xs text-body-sm font-code-sm text-secondary flex items-center gap-space-2xs">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Cumple el umbral SLO en carga continua</span>
                      </div>
                    </div>
                    <div className="bg-surface-container p-space-md rounded-lg">
                      <div className="flex items-center justify-between mb-space-2xs">
                        <span className="font-code-sm text-code-sm text-outline uppercase font-semibold">CONSUMO DE MEMORIA</span>
                        <span className="font-code-sm text-code-sm text-secondary font-bold">142 MB</span>
                      </div>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">&lt; 256</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">MB (Zero Leak Policy)</span>
                      </div>
                      <div className="mt-space-xs w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                    <div className="bg-surface-container p-space-md rounded-lg">
                      <div className="flex items-center justify-between mb-space-2xs">
                        <span className="font-code-sm text-code-sm text-outline uppercase font-semibold">TIEMPO DE RECUPERACIÓN (MTTR)</span>
                        <span className="font-code-sm text-code-sm text-tertiary-fixed font-bold">2.1s</span>
                      </div>
                      <div className="flex items-baseline gap-space-2xs">
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">&lt; 3</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">segundos tras desconexión</span>
                      </div>
                    </div>
                    <div className="pt-space-xs flex items-center justify-between text-outline font-code-sm text-code-sm">
                      <span>AUDITORÍA: K6 SYNTHETIC v2.8</span>
                      <span className="text-primary font-semibold">SAMPLING 100%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xl">
                  <div className="flex items-center justify-between pb-space-sm mb-space-md">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">rocket_launch</span>
                      <span className="font-label-caps text-label-caps text-primary uppercase">ESTADO DE ACCIÓN</span>
                    </div>
                    <span className="font-code-sm text-code-sm px-space-2xs py-0.5 rounded bg-surface-container-high text-on-surface">VISTA: ACTIVA</span>
                  </div>
                  <div className="flex flex-col gap-space-sm">
                    <button
                      onClick={onIniciar}
                      className="w-full py-space-md px-space-lg rounded-xl font-body-md font-bold text-surface-container-lowest bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-95 transition-all flex items-center justify-center gap-space-xs shadow-lg"
                    >
                      <span>Ir a mi espacio de trabajo</span>
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                    <button className="w-full py-space-sm px-space-md rounded-lg font-body-md text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[18px]">developer_mode</span>
                        <span>Abrir en Web IDE / Codespace</span>
                      </div>
                      <span className="material-symbols-outlined text-outline text-[16px]">chevron_right</span>
                    </button>
                    <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between text-outline font-code-sm text-code-sm">
                        <span>CLI CLIENT PULL</span>
                        <span className="text-primary font-semibold">v1.4.2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="font-code-sm text-code-sm text-secondary truncate">qualityopportunities challenge fetch {reto.id}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-lg p-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm shadow-inner text-outline font-code-sm text-code-sm">
              <div className="flex items-center gap-space-md flex-wrap">
                <span className="flex items-center gap-space-2xs text-secondary font-medium">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                  SYS NODE: EUR-WEST3-PROD
                </span>
                <span>//</span>
                <span className="text-on-surface-variant">HARNESS_STATUS: <strong className="text-on-surface">READY</strong></span>
                <span>//</span>
                <span className="text-on-surface-variant">TELEMETRY LATENCY: <strong className="text-primary font-code-sm">12ms</strong></span>
              </div>
              <div>
                <span>© 2025 Quality Opportunities CORE ARCHITECTURE // ENGINE RUNNER v4.2</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest">
        <div className="w-full max-w-container-max mx-auto px-gutter-desktop py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-space-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">SYS NODE: EUR-WEST3-PROD</span>
            </div>
            <span className="text-outline-variant font-code-sm text-code-sm">/</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">PORTAL V2.4.9</span>
          </div>
          <div className="font-code-sm text-code-sm text-outline">© 2024 Quality Opportunities ACADEMY. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}
