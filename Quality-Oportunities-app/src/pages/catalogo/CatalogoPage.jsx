import { useState, useMemo } from 'react';
import { RETOS } from '../../types/reto.js';

const ESTADOS = [
  { clave: 'todos', etiqueta: 'TODOS' },
  { clave: 'abierto', etiqueta: 'ABIERTO' },
  { clave: 'cerrado', etiqueta: 'CERRADO' },
];

export default function CatalogoPage({ onSelectReto }) {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const retosFiltrados = useMemo(() => {
    return RETOS.filter((reto) => {
      const coincideEstado = filtroEstado === 'todos' || reto.estado === filtroEstado;
      const coincideBusqueda =
        busqueda === '' ||
        reto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        reto.stack.some((tech) => tech.toLowerCase().includes(busqueda.toLowerCase())) ||
        reto.org.toLowerCase().includes(busqueda.toLowerCase());
      return coincideEstado && coincideBusqueda;
    });
  }, [filtroEstado, busqueda]);

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
              SKILL HUB
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
          <div className="flex flex-col w-full gap-space-2xl">
            <section className="flex flex-col gap-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-sm py-space-2xs rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)] animate-pulse"></span>
                  <span className="font-label-caps text-label-caps text-secondary tracking-wider uppercase">
                    RETOS_DISPONIBLES // ENTORNO_PRUEBAS
                  </span>
                  <span className="text-outline-variant font-code-sm text-code-sm">/</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">NODE_LATENCY: 12ms</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm text-outline">RUNNER STATUS:</span>
                  <span className="font-code-sm text-code-sm text-primary font-semibold">ONLINE (K8S CLUSTER)</span>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-xl">
                <div className="max-w-3xl flex flex-col gap-space-xs">
                  <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                    Retos de Ingeniería y Arquitectura
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Resuelve problemas reales de infraestructura, optimización y concurrencia validados en
                    tiempo real por telemetría sintética y pruebas de estrés automatizadas.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
                  <div className="flex flex-col bg-surface-container px-space-md py-space-sm rounded-lg min-w-[130px]">
                    <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider">Activos</span>
                    <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                      <span className="font-headline-md text-headline-md text-primary font-bold">42</span>
                      <span className="font-label-caps text-label-caps text-secondary">LIVE</span>
                    </div>
                  </div>
                  <div className="flex flex-col bg-surface-container px-space-md py-space-sm rounded-lg min-w-[130px]">
                    <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider">En Progreso</span>
                    <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                      <span className="font-headline-md text-headline-md text-tertiary font-bold">03</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant">RUN</span>
                    </div>
                  </div>
                  <div className="flex flex-col bg-surface-container px-space-md py-space-sm rounded-lg min-w-[130px]">
                    <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider">Validación</span>
                    <div className="flex items-baseline gap-space-2xs mt-space-2xs">
                      <span className="font-headline-md text-headline-md text-secondary font-bold">94.8%</span>
                      <span className="font-label-caps text-label-caps text-secondary">PASS</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-md">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-high text-on-surface pl-11 pr-20 py-space-sm rounded-lg font-code-md text-code-md placeholder:text-outline focus:outline-none focus:bg-surface-bright focus:shadow-[0_0_16px_rgba(6,182,212,0.25)] transition-all"
                    placeholder="Buscar por tecnología, arquitectura o empresa (ej. Kafka, Redis, p95)..."
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  <div className="absolute right-space-sm top-1/2 -translate-y-1/2 flex items-center gap-1 bg-surface-container-highest px-space-xs py-space-2xs rounded">
                    <span className="font-code-sm text-code-sm text-on-surface-variant font-semibold">⌘K</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs lg:pb-0" id="filter-state-group">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado.clave}
                      onClick={() => setFiltroEstado(estado.clave)}
                      className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-caps text-label-caps transition-all cursor-pointer ${
                        filtroEstado === estado.clave
                          ? 'bg-primary-container text-on-primary-container shadow-sm'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span>{estado.etiqueta}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <span className="font-code-sm text-code-sm text-outline uppercase mr-space-xs">Stack:</span>
                <button className="px-space-sm py-space-2xs rounded font-code-sm text-code-sm bg-surface-container text-primary hover:bg-surface-container-high transition-colors">
                  Backend Engine
                </button>
                <button className="px-space-sm py-space-2xs rounded font-code-sm text-code-sm bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                  Sistemas Distribuidos
                </button>
                <button className="px-space-sm py-space-2xs rounded font-code-sm text-code-sm bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                  DevOps &amp; SRE
                </button>
                <button className="px-space-sm py-space-2xs rounded font-code-sm text-code-sm bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                  Bases de Datos
                </button>
                <button className="px-space-sm py-space-2xs rounded font-code-sm text-code-sm bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                  High-Throughput
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg" id="challenges-grid">
              {retosFiltrados.map((reto) => (
                <article
                  key={reto.id}
                  className={`group flex flex-col justify-between p-space-lg rounded-xl transition-all duration-200 hover:-translate-y-1 ${
                    reto.estado === 'abierto'
                      ? 'bg-surface-container-low hover:bg-surface-container hover:shadow-[0_12px_32px_-8px_rgba(6,182,212,0.18)]'
                      : 'bg-surface-container-low/60 hover:bg-surface-container-low opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span
                        className={`inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded font-label-caps text-label-caps uppercase ${
                          reto.estado === 'abierto'
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-surface-container-highest text-outline'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            reto.estado === 'abierto'
                              ? 'bg-secondary shadow-[0_0_6px_rgba(78,222,163,0.9)]'
                              : 'bg-outline'
                          }`}
                        ></span>
                        {reto.estado === 'abierto' ? 'ABIERTO' : 'CERRADO'}
                      </span>
                      <div className="flex items-center gap-space-xs">
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center font-code-sm text-code-sm text-primary font-bold">
                          {reto.orgIniciales}
                        </div>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">{reto.org}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-space-2xs">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold group-hover:text-primary transition-colors">
                        {reto.titulo}
                      </h2>
                      <span className="font-code-sm text-code-sm text-outline">ID: {reto.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-space-2xs">
                      {reto.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-space-xs py-space-2xs rounded bg-surface-container-high font-code-sm text-code-sm text-on-surface"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col gap-space-2xs">
                      <div className="flex items-center justify-between text-outline font-label-caps text-label-caps uppercase">
                        <span>METRICAS TARGET</span>
                        <span>SLO VALIDATION</span>
                      </div>
                      <div className="font-code-sm text-code-sm text-secondary font-mono tracking-tight break-all">
                        {reto.metrics}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-space-lg mt-space-md">
                    <div className="flex flex-col">
                      <span className="font-code-sm text-code-sm text-outline uppercase">Dificultad</span>
                      <div className="flex items-center gap-space-2xs">
                        <span className="font-code-sm text-code-sm text-error font-bold">{reto.dificultad}</span>
                        <span className="text-outline-variant font-code-sm text-code-sm">//</span>
                        <span className="font-code-sm text-code-sm text-tertiary font-semibold">{reto.puntos} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectReto?.(reto)}
                      className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-code-sm text-code-sm font-semibold text-on-primary-fixed bg-gradient-to-r from-primary via-secondary to-tertiary hover:opacity-95 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Ver reto</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <section className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container-lowest px-space-lg py-space-md rounded-xl">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  Selecciona un reto para ver el detalle y comenzar.
                </span>
              </div>
              <div className="flex items-center gap-space-md">
                <span className="font-code-sm text-code-sm text-outline">LATENCY BUFFER: NORMAL</span>
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
              </div>
            </section>
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
          <div className="font-code-sm text-code-sm text-outline">© 2024 SKILL HUB ACADEMY. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
}
