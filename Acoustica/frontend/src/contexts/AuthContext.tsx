import React, { createContext, useState, useContext, useEffect } from "react";
import { getMyProfilePicture } from "@/services/user_service/auth";
import default_profile_picture from '@/assets/images/Default_pfp.png';

interface User {
    user_id: number;
    email: string;
    user_type: "listener" | "artist" | "admin";
    onboarding_done: boolean;
    token: string;
    listener_type?: 'free' | 'premium';
}

interface AuthContextType {
    user: User | null;
    profile_picture: string | null;
    signin: (user: User) => void;
    signout: () => void;
    updateUser: (updates: Partial<User>) => void;
    refreshProfilePicture: () => Promise<void>; 
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider ({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<User | null>(
        JSON.parse(localStorage.getItem("user") || "null")
    );
    const [profile_picture, setProfilePicture] = useState<string>(default_profile_picture);

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

    async function refreshProfilePicture() {
        const response = await getMyProfilePicture();
        if (response.profile_picture !== "null") {
            setProfilePicture(response.profile_picture);
        } 
        else {
            setProfilePicture(default_profile_picture);
        }
    }

    useEffect(() => {
        async function fetchProfilePicture() {
            const response = await getMyProfilePicture();
            if(response.profile_picture !== "null"){
                setProfilePicture(response.profile_picture);
            }
            else {
                setProfilePicture(default_profile_picture);
            }
            setLoading(false);
        }
        if (user) fetchProfilePicture();
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, profile_picture, signin, signout, updateUser, refreshProfilePicture, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error("useAuth must be used inside AuthProvider");
    return authContext;
}