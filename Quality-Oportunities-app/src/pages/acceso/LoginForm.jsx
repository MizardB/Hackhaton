import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(true);
  const { login, status, error } = useAuthContext();

  useEffect(() => {
    if (status === 'success') {
      onLogin?.();
    }
  }, [status, onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-tertiary rounded-xl opacity-20 group-hover:opacity-35 blur transition duration-500"></div>
      <div className="relative bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden p-space-lg sm:p-space-xl flex flex-col gap-space-lg">
        <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded bg-surface-container-high text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            AUTH_GATEWAY_v2.4
          </span>
          <span className="text-secondary font-code-sm text-code-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            TLS 1.3 256-BIT
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <img
            alt="Quality Opportunities Logo"
            className="h-10 mx-auto mb-space-sm object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XDbkFnd29m5rcC2hWQoTFS_XVbzlMHlSA1gUFSuxK3Yk7kzwD9n46_TqluMwpakP6CA60yumreubjNCOYIxZpUnbRIhWLHR9psR2oK411x9SnVw4_-4amlhDLQapzmF4jvLtgH4MFXw7llJlFZ8MvhSxQR5ta_Hr5Qs7sHmlbrVr9yssg4Y-oJ-zb2M-hTYmInK367ukJ2RYWuU1lhFS6-jQ6GBZFYfHpb0Fn0Uqef5seKjSxvzHPk62Du"
          />
          <h1 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
            ACCESO AL SISTEMA
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
            Ingresa tus credenciales para continuar al entorno de aprendizaje técnico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider flex items-center gap-1" htmlFor="email">
                <span className="material-symbols-outlined text-[14px] text-primary">alternate_email</span>
                CORREO ELECTRÓNICO
              </label>
              <span className="font-code-sm text-code-sm text-outline" id="domain-hint">@qualityopportunities.app</span>
            </div>
            <div className="relative flex items-center">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-code-md text-code-md px-space-md py-3 rounded-lg outline-none transition-all shadow-inner focus:bg-surface-container"
                placeholder="usuario@qualityopportunities.app"
              />
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider flex items-center gap-1" htmlFor="password">
                <span className="material-symbols-outlined text-[14px] text-primary">key</span>
                CONTRASEÑA
              </label>
              <a className="font-code-sm text-code-sm text-primary hover:underline transition-colors" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-code-md text-code-md px-space-md py-3 pr-10 rounded-lg outline-none transition-all shadow-inner focus:bg-surface-container"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface flex items-center transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-2xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                checked={mantenerSesion}
                onChange={(e) => setMantenerSesion(e.target.checked)}
                className="w-4 h-4 rounded bg-surface-container-high accent-primary-container cursor-pointer"
                type="checkbox"
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">Mantener sesión activa</span>
            </label>
            <span className="font-code-sm text-code-sm text-secondary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              NODE_READY
            </span>
          </div>

          <div className="flex flex-col gap-space-sm pt-space-xs">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 px-space-md rounded-lg bg-gradient-to-r from-primary-container via-secondary to-tertiary text-on-primary-container font-headline-sm text-headline-sm font-bold shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2"
            >
              <span>{status === 'loading' ? 'Autenticando...' : 'Ingresar'}</span>
              {status !== 'loading' && (
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
              )}
            </button>
            <button
              type="button"
              className="w-full py-3 px-space-md rounded-lg bg-surface-container-high text-on-surface font-body-md text-body-md font-semibold hover:bg-surface-bright transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
              <span>Crear cuenta</span>
            </button>
          </div>
        </form>

        {error && (
          <p className="text-error text-body-sm font-body-sm text-center">{error}</p>
        )}

        <div className="pt-space-xs flex items-center justify-between font-code-sm text-code-sm text-outline">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
            <span>AUTH_STATUS: READY</span>
          </div>
          <span className="tracking-widest uppercase text-[10px]">PORT: 443_SECURE</span>
        </div>
      </div>
    </div>
  );
}
