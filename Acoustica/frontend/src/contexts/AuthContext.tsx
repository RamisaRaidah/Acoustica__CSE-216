import React, { createContext, useState, useContext } from "react";

interface User {
    user_id: string;
    email: string;
    user_type: "listener" | "artist" | "admin";
    onboarding_done: boolean;
    token: string;
}

interface AuthContextType {
    user: User | null;
    signin: (user: User) => void;
    signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider ({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(
        JSON.parse(localStorage.getItem("user") || "null")
    );

    function signin(user: User) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
    }

    function signout() {
        setUser(null);
        localStorage.removeItem("user");
    }

    return (
        <AuthContext.Provider value={{ user, signin, signout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error("useAuth must be used inside AuthProvider");
    return authContext;
}