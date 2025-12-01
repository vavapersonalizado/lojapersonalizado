"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email) => {
    let userData;
    
    // Hardcoded Super User
    if (email === "projetovanvava@gmail.com") {
      userData = {
        email,
        name: "Super Admin",
        role: "admin",
        isSuperUser: true, // Special flag for mode switching
      };
    } else {
      // Mock regular user
      userData = {
        email,
        name: "Cliente Exemplo",
        role: "client",
        isSuperUser: false,
      };
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Redirect based on role
    if (userData.isSuperUser) {
      router.push("/admin/users"); // Default to admin for super user initially
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
