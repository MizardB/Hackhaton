import { useState } from 'react';

export function useAuth() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const login = async ({ email, password }) => {
    setStatus('loading');
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!email || !password) {
      setError('Ingresa correo y contraseña');
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return { login, status, error };
}
