"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, setAuthToken, removeAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@teamtitans.com",
        role: "admin"
    });
    const [loading, setLoading] = useState(false);

    // Initial mock login check
    useEffect(() => {
        if (typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
            setAuthToken('mock-jwt-token-12345');
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const response = await authApi.login(email, password);
            setUser({
                first_name: "John",
                last_name: "Doe",
                email: email || "john.doe@teamtitans.com",
                role: "admin"
            });
            return response;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData) => {
        return authApi.register(userData);
    }, []);

    const logout = useCallback(() => {
        removeAuthToken();
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
