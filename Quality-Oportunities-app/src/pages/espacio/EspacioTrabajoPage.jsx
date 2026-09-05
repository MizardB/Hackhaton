import { useMemo } from 'react';
import { useRetos } from '../../service/useRetos.js';

export default function EspacioTrabajoPage({ retoId, onEnviar, onVolver }) {
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
          <div className="flex flex-col w-full gap-space-md">
            <header className="w-full bg-surface-container-low rounded-xl px-space-md py-space-sm flex flex-col md:flex-row md:items-center justify-between gap-space-sm shadow-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <button onClick={onVolver} className="inline-flex items-center gap-space-2xs text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span className="hidden sm:inline">Detalle del reto</span>
                </button>
                <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
                <div className="flex items-center gap-space-xs font-code-sm text-code-sm">
                  <span className="text-on-surface-variant">Retos</span>
                  <span className="text-outline">/</span>
                  <span className="text-on-surface font-semibold truncate max-w-[260px] sm:max-w-none">{reto.id}: {reto.titulo}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-space-sm">
                <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-sm py-space-2xs rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface">Intento 2 <span className="text-outline font-normal">de 5</span></span>
                </div>
                <button className="inline-flex items-center gap-space-2xs bg-surface-container-high hover:bg-surface-bright text-on-surface px-space-sm py-space-xs rounded-lg transition-all">
                  <span className="material-symbols-outlined text-[18px] text-primary">play_arrow</span>
                  <span className="font-body-sm text-body-sm font-medium hidden sm:inline">Ejecutar pruebas</span>
                </button>
                <button
                  onClick={onEnviar}
                  className="relative inline-flex items-center gap-space-2xs bg-gradient-to-r from-primary-container via-secondary to-tertiary hover:opacity-95 text-on-primary-fixed font-headline-sm text-body-sm font-bold px-space-md py-space-xs rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">rocket_launch</span>
                  <span>Enviar solución</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
              <div className="lg:col-span-8 flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between bg-surface-container-lowest px-space-xs pt-space-xs overflow-x-auto">
                  <div className="flex items-center gap-space-2xs">
                    <div className="flex items-center gap-space-xs bg-surface-container-low text-primary px-space-sm py-space-2xs rounded-t-lg font-code-sm text-code-sm font-medium">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">code</span>
                      <span>engine.rs</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Modificado"></span>
                    </div>
                    <div className="flex items-center gap-space-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface px-space-sm py-space-2xs rounded-t-lg font-code-sm text-code-sm cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                      <span>ring_buffer.rs</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface px-space-sm py-space-2xs rounded-t-lg font-code-sm text-code-sm cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-outline">science</span>
                      <span>tests/benchmark_test.rs</span>
                    </div>
                    <div className="hidden md:flex items-center gap-space-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface px-space-sm py-space-2xs rounded-t-lg font-code-sm text-code-sm cursor-pointer transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-outline">settings</span>
                      <span>Cargo.toml</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-space-sm pr-space-sm text-outline font-label-caps text-label-caps">
                    <span className="text-on-surface-variant">Rust 1.78</span>
                    <span>·</span>
                    <span>UTF-8</span>
                    <span>·</span>
                    <span>SPACES: 4</span>
                  </div>
                </div>
                <div className="relative flex font-code-sm text-code-sm bg-surface-container-low overflow-x-auto min-h-[440px] max-h-[580px] p-space-sm">
                  <div className="select-none flex flex-col text-right pr-space-md text-outline-variant font-mono tracking-tight shrink-0 border-r border-surface-container-high/40">
                    <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
                    <div>6</div><div>7</div><div>8</div><div>9</div><div>10</div>
                    <div>11</div><div>12</div><div>13</div><div>14</div><div>15</div>
                    <div>16</div><div>17</div><div>18</div><div>19</div><div>20</div>
                    <div>21</div><div>22</div><div>23</div><div>24</div><div>25</div>
                    <div>26</div><div>27</div><div>28</div>
                  </div>
                  <div
                    className="pl-space-md pr-space-2xl font-mono leading-[1.65rem] whitespace-pre text-on-surface flex-1"
                    dangerouslySetInnerHTML={{
                      __html: `<div><span class="text-outline">// Quality Opportunities — Ingestion Engine v3 (Lock-free zero alloc harness)</span></div>
<div><span class="text-primary font-semibold">use</span> <span class="text-on-surface">std::sync::atomic::{</span><span class="text-tertiary">AtomicUsize</span>, <span class="text-tertiary">Ordering</span><span class="text-on-surface">};</span></div>
<div><span class="text-primary font-semibold">use</span> <span class="text-on-surface">std::sync::</span><span class="text-tertiary">Arc</span><span class="text-on-surface">;</span></div>
<div><span class="text-primary font-semibold">use</span> <span class="text-on-surface">crate::ring_buffer::</span><span class="text-tertiary">LockFreeRing</span><span class="text-on-surface">;</span></div>
<div> </div>
<div><span class="text-primary font-semibold">#[derive(Debug, Clone)]</span></div>
<div><span class="text-primary font-semibold">pub struct</span> <span class="text-tertiary font-bold">MetricPayload</span> {</div>
<div> <span class="text-primary font-semibold">pub</span> <span class="text-on-surface">tenant_id:</span> <span class="text-tertiary">u64</span>,</div>
<div> <span class="text-primary font-semibold">pub</span> <span class="text-on-surface">timestamp:</span> <span class="text-tertiary">u64</span>,</div>
<div> <span class="text-primary font-semibold">pub</span> <span class="text-on-surface">samples:</span> [<span class="text-tertiary">f64</span>; <span class="text-secondary">8</span>],</div>
<div>}</div>
<div> </div>
<div><span class="text-primary font-semibold">pub struct</span> <span class="text-tertiary font-bold">MetricIngestionEngine</span> {</div>
<div> <span class="text-on-surface">ring:</span> <span class="text-tertiary">Arc</span>&lt;<span class="text-tertiary">LockFreeRing</span>&lt;<span class="text-tertiary">MetricPayload</span>&gt;&gt;,</div>
<div> <span class="text-on-surface">dropped_counter:</span> <span class="text-tertiary">AtomicUsize</span>,</div>
<div> <span class="text-on-surface">max_backpressure_threshold:</span> <span class="text-tertiary">usize</span>,</div>
<div>}</div>
<div> </div>
<div class="bg-surface-container/60 -mx-space-md px-space-md"><span class="text-primary font-semibold">impl</span> <span class="text-tertiary font-bold">MetricIngestionEngine</span> {</div>
<div> <span class="text-primary font-semibold">pub fn</span> <span class="text-secondary font-bold">ingest_batch</span>(&<span class="text-tertiary">self</span>, <span class="text-on-surface">batch:</span> &[<span class="text-tertiary">MetricPayload</span>]) -&gt; <span class="text-tertiary">Result</span>&lt;<span class="text-tertiary">usize</span>, <span class="text-error">&amp;'static str</span>&gt; {</div>
<div> <span class="text-primary font-semibold">let</span> <span class="text-on-surface">current_depth =</span> <span class="text-tertiary">self</span><span class="text-on-surface">.ring.capacity() -</span> <span class="text-tertiary">self</span><span class="text-on-surface">.ring.available();</span></div>
<div> <span class="text-primary font-semibold">if</span> <span class="text-on-surface">current_depth &gt;</span> <span class="text-tertiary">self</span><span class="text-on-surface">.max_backpressure_threshold {</span></div>
<div> <span class="text-tertiary">self</span><span class="text-on-surface">.dropped_counter.fetch_add(batch.len(),</span> <span class="text-tertiary">Ordering</span>::<span class="text-primary">Relaxed</span>);</div>
<div> <span class="text-primary font-semibold">return</span> <span class="text-error font-semibold">Err</span>(<span class="text-secondary">"BACKPRESSURE_QUEUE_SATURATED"</span>);</div>
<div>        }</div>
<div> <span class="text-primary font-semibold">let mut</span> <span class="text-on-surface">pushed =</span> <span class="text-secondary">0</span>;</div>
<div> <span class="text-primary font-semibold">for</span> <span class="text-on-surface">metric</span> <span class="text-primary font-semibold">in</span> <span class="text-on-surface">batch.iter() {</span></div>
<div> <span class="text-primary font-semibold">if</span> <span class="text-tertiary">self</span><span class="text-on-surface">.ring.try_push(*metric).is_ok() { pushed +=</span> <span class="text-secondary">1</span><span class="text-on-surface">; }</span></div>
<div>        }</div>
<div> <span class="text-primary font-semibold">Ok</span>(<span class="text-on-surface">pushed</span>)</div>
<div>    }</div>
<div>}</div>`,
                    }}
                  />
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-space-md">
                <div className="bg-surface-container-low rounded-xl p-space-md shadow-lg flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Requisitos de Ejecución</h2>
                    <span className="font-label-caps text-label-caps px-space-xs py-space-2xs rounded bg-surface-container-high text-primary font-bold">SLO v2.1</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-start gap-space-xs p-space-xs bg-surface-container rounded-lg">
                      <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">check_circle</span>
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">Lock-free RingBuffer</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">Sin mutex ni condvars en el hot-path</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-space-xs p-space-xs bg-surface-container rounded-lg">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5 animate-spin">progress_activity</span>
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm font-semibold text-primary">Manejo de Backpressure Atómico</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">Saturación progresiva con descarte medido</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-space-xs p-space-xs bg-surface-container rounded-lg">
                      <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">radio_button_unchecked</span>
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">Zero Allocations en Heap</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant">0 reallocs durante la ingesta sostenida</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs pt-space-xs">
                    <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">SLOs Auditados</span>
                    <div className="grid grid-cols-3 gap-space-xs">
                      <div className="bg-surface-container-lowest p-space-xs rounded-lg flex flex-col">
                        <span className="font-code-sm text-code-sm text-outline">THROUGHPUT</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-secondary tracking-tight">&gt;1k</span>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">req/s</span>
                      </div>
                      <div className="bg-surface-container-lowest p-space-xs rounded-lg flex flex-col">
                        <span className="font-code-sm text-code-sm text-outline">LATENCIA</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">&lt;50ms</span>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">p95</span>
                      </div>
                      <div className="bg-surface-container-lowest p-space-xs rounded-lg flex flex-col">
                        <span className="font-code-sm text-code-sm text-outline">MEMORIA</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-tertiary tracking-tight">&lt;256</span>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">MB heap</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-space-2xs text-outline font-code-sm text-code-sm">
                    <div className="flex items-center gap-space-2xs">
                      <kbd className="px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface text-[10px] font-mono">⌘ + Enter</kbd>
                      <span className="text-body-sm">Evaluar</span>
                    </div>
                    <div className="flex items-center gap-space-2xs">
                      <kbd className="px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface text-[10px] font-mono">⌘ + S</kbd>
                      <span className="text-body-sm">Guardar</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">memory</span>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">Harness Sintético Carga Realista</span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">50 subtests unitarios + 4 benches multihilo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-surface-container-lowest">
                <div className="flex items-center gap-space-sm px-space-md py-space-sm">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-body-sm text-body-sm font-semibold text-on-surface">1. En cola</span>
                      <span className="font-code-sm text-code-sm text-secondary">0.8s</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">Asignado a pod de cómputo aislado</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-container-high/40 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-body-sm text-body-sm font-bold text-primary">2. En curso</span>
                      <span className="font-label-caps text-label-caps bg-primary-container/20 text-primary px-space-2xs rounded">TESTING</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-on-surface font-medium">Ejecutando suite sintética...</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm px-space-md py-space-sm opacity-40">
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest text-outline flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm font-semibold text-outline">3. Finalizada</span>
                    <span className="font-code-sm text-code-sm text-outline">Calculando puntuación y feedback SLO</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col bg-surface-container-lowest">
                <div className="flex flex-wrap items-center justify-between px-space-md py-space-xs bg-surface-container-high/20">
                  <div className="flex items-center gap-space-xs font-code-sm text-code-sm">
                    <span className="material-symbols-outlined text-[16px] text-outline">terminal</span>
                    <span className="text-on-surface font-medium">TEST_RUNNER_STDOUT</span>
                    <span className="text-outline">/</span>
                    <span className="text-outline-variant">worker-k8s-pod-euw1-88c9</span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <div className="flex items-center gap-space-2xs">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-secondary font-bold">LIVE STREAM</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">12ms lat</span>
                  </div>
                </div>
                <div className="p-space-md font-code-sm text-code-sm font-mono flex flex-col gap-space-2xs text-on-surface max-h-[190px] overflow-y-auto">
                  <div className="flex items-center gap-space-xs text-outline">
                    <span className="text-outline-variant font-bold">[14:32:01]</span>
                    <span className="text-primary font-semibold">[INFO]</span>
                    <span>Compilación en release completada en 1.42s (zero warnings, rustc 1.78.0-nightly)</span>
                  </div>
                  <div className="flex items-center gap-space-xs text-outline">
                    <span className="text-outline-variant font-bold">[14:32:02]</span>
                    <span className="text-tertiary font-semibold">[BENCH]</span>
                    <span>Inicializando generador de carga con 64 hilos concurrentes en CPU affinity mode...</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="text-outline-variant font-bold">[14:32:03]</span>
                    <span className="text-secondary font-semibold">[RUNNER]</span>
                    <span className="text-on-surface">ejecutando prueba 12/50…</span>
                    <span className="px-space-2xs bg-secondary/20 text-secondary font-bold rounded text-[11px]">[PASS]</span>
                    <span className="text-on-surface-variant">Lock-free ring buffer contention test (p95: 18ms, 0 dropped)</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="text-outline-variant font-bold">[14:32:04]</span>
                    <span className="text-primary font-semibold">[RUNNER]</span>
                    <span className="text-on-surface">ejecutando prueba 13/50…</span>
                    <span className="px-space-2xs bg-primary-container/20 text-primary font-bold rounded text-[11px]">[RUNNING]</span>
                    <span className="text-primary-fixed">Ingesta masiva 10,000 events/sec con ráfagas sintéticas...</span>
                  </div>
                </div>
                <div className="px-space-md py-space-xs bg-surface-container flex items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-xs font-code-sm text-code-sm">
                    <span className="text-on-surface font-semibold">Progreso de ejecución:</span>
                    <span className="text-secondary font-bold">12 / 50</span>
                    <span className="text-outline">(24%)</span>
                  </div>
                  <div className="flex-1 max-w-md h-2 bg-surface-container-lowest rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary w-[24%] rounded-full transition-all duration-300"></div>
                  </div>
                  <div className="hidden sm:flex items-center gap-space-2xs font-code-sm text-code-sm text-outline">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span>
                    <span>Tiempo transcurrido: 3.4s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest">
        <div className="w-full max-w-container-max mx-auto px-gutter-desktop py-space-lg flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="font-code-sm text-code-sm text-outline">© 2024 Quality Opportunities</div>
        </div>
      </footer>
    </div>
  );
}
