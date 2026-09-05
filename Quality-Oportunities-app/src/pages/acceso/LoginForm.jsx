import { useState, useEffect } from 'react';
import { useAuth } from '../../service/useAuth.js';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, status, error } = useAuth();

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-4xl font-bold text-on-surface font-headline">
          ACCESO AL SISTEMA
        </h1>
        <p className="text-sm text-on-surface-variant font-body">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider" htmlFor="email">
          CORREO ELECTRÓNICO
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-sm px-4 py-3 rounded-lg outline-none transition-all shadow-inner focus:bg-surface-container"
          placeholder="usuario@dominio.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider" htmlFor="password">
          CONTRASEÑA
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-sm px-4 py-3 pr-10 rounded-lg outline-none transition-all shadow-inner focus:bg-surface-container"
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

      {error && (
        <p className="text-error text-sm font-body">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 px-4 rounded-lg bg-primary-container text-on-primary-container text-lg font-semibold font-headline shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? 'Autenticando...' : 'Ingresar'}
      </button>
    </form>
  );
}
