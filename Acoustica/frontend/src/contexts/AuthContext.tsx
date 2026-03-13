import React, { createContext, useState, useContext, useEffect } from "react";
import { getProfilePicture } from "@/services/auth";
import default_pfp_img from "@/assets/images/Default_pfp.png";

interface User {
    user_id: string;
    email: string;
    user_type: "listener" | "artist" | "admin";
    onboarding_done: boolean;
    token: string;
}

interface AuthContextType {
    user: User | null;
    profile_picture: string | null;
    signin: (user: User) => void;
    signout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider ({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(
        JSON.parse(localStorage.getItem("user") || "null")
    );
    const [profile_picture, setProfilePicture] = useState<string | null>(null);

    function signin(user: User) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        console.log('Hello I have been summoned by SignIn and user is set');
    }

    function signout() {
        setUser(null);
        console.log('Hello, I had been summoned by sign-out. User shall be gone.')
        localStorage.removeItem("user");
        localStorage.clear();
    }

    function updateUser(updates: Partial<User>) {
        if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        }
    }

    
    useEffect(() => {
        async function fetchProfilePicture() {
            const response = await getProfilePicture();
            setProfilePicture(response ? response.profile_picture_url : default_pfp_img);
        }
        if (user) fetchProfilePicture();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, profile_picture, signin, signout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error("useAuth must be used inside AuthProvider");
    return authContext;
}