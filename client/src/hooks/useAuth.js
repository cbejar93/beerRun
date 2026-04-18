import { useState } from 'react';

export function useAuth() {
  const [hostToken, setHostToken] = useState(() => sessionStorage.getItem('hostToken'));

  const login = (token) => {
    sessionStorage.setItem('hostToken', token);
    setHostToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem('hostToken');
    setHostToken(null);
  };

  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${hostToken}`,
      },
    });
  };

  return { hostToken, isHost: !!hostToken, login, logout, authFetch };
}
