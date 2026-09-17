import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("devpilot_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("devpilot_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("devpilot_token", res.data.token);
    setUser(res.data.user);
  };
  const signup = async (name, email, password) => {
    const res = await api.post("/auth/signup", { name, email, password });
    return res.data;
  };
  const completeVerification = (userData, token) => {
    localStorage.setItem("devpilot_token", token);
    setUser(userData);
  };
  const resendVerification = async (email) => {
    const res = await api.post("/auth/resend-verification", { email });
    return res.data;
  };
  const logout = () => { localStorage.removeItem("devpilot_token"); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, completeVerification, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
