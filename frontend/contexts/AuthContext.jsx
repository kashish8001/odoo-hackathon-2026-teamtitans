"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, setAuthToken, removeAuthToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authApi.getCurrentUser();
                setUser(userData);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (
            typeof window !== "undefined" &&
            localStorage.getItem("access_token")
        ) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const response = await authApi.login(email, password);

            if (response.access_token) {
                setAuthToken(response.access_token);

                try {
                    const userData = await authApi.getCurrentUser();
                    setUser(userData);
                } catch (err) {
                    // Backend may not have /auth/me yet
                    setUser({ email });
                }
            }

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
        authApi.logout();
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

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}