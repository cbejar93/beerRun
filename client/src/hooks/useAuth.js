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

  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${hostToken}`,
      },
    });
    if (res.status === 401) {
      logout();
    }
    return res;
  };

  return { hostToken, isHost: !!hostToken, login, logout, authFetch };
}
