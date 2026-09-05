import LoginForm from './LoginForm.jsx';

export default function AccesoPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.12),rgba(19,19,19,0))] opacity-70"></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-space-md sm:p-space-xl">
        <div className="flex flex-col w-full">
          <div className="relative w-full max-w-container-max mx-auto flex flex-col items-center justify-center py-space-xl sm:py-space-2xl">
            <div className="absolute -top-16 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-1/2 -right-32 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <LoginForm onLogin={onLogin} />
          </div>
          <div className="mt-space-lg flex items-center gap-space-lg text-on-surface-variant font-code-sm text-code-sm">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">speed</span>
              <span>LATENCIA: 14ms</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lan</span>
              <span>CLUSTER: EU-WEST-1</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-space-md text-center border-t border-outline-variant/20 bg-surface-container-lowest/50 backdrop-blur-sm">
        <div className="max-w-container-max mx-auto px-gutter-mobile sm:px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline">STATUS:</span>
            <span className="flex items-center gap-1.5 font-code-sm text-code-sm text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              NODE_ONLINE
            </span>
          </div>
          <div className="font-code-sm text-code-sm text-outline">© 2025 Quality Opportunities CORE. ALL PROTOCOLS SECURE.</div>
          <div className="flex items-center gap-space-md">
            <a className="font-code-sm text-code-sm text-on-surface-variant hover:text-primary transition-colors" data-path="system-status" href="#">
              TELEMETRY
            </a>
            <a className="font-code-sm text-code-sm text-on-surface-variant hover:text-primary transition-colors" data-path="legal-protocol" href="#">
              SECURITY
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
