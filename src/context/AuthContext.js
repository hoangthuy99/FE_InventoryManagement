import { createContext, useContext, useState } from "react";
import { Redirect } from "react-router-dom";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const getTokenInfo = () => {
    return JSON.parse(token);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, getTokenInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Middleware
export const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  let exp = 0;

  if (token) {
    const { expiration } = JSON.parse(token);
    exp = expiration;
  }

  return token && exp > Date.now() ? (
    children
  ) : (
    <Redirect from="/" to="/login" />
  );
};

export const LoginSuccessRoute = ({ children }) => {
  const { token } = useAuth();
  let exp = 0;

  if (token) {
    const { expiration } = JSON.parse(token);
    exp = expiration;
  }

  return token && exp > Date.now() ? (
    <Redirect from="/" to="/app/dashboard" />
  ) : (
    children
  );
};
