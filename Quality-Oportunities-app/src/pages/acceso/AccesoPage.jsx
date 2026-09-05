import LoginForm from './LoginForm.jsx';

export default function AccesoPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-between">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(6,182,212,0.12),rgba(19,19,19,0))] opacity-70"></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-space-md sm:p-space-xl">
        <LoginForm onLogin={onLogin} />
      </main>
    </div>
  );
}
