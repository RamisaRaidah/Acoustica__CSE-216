import { useAuth } from "@/contexts/AuthContext";
import { useMusic } from "@/contexts/MusicContext";
import { useState, useEffect } from "react";

export default function AppLoader({ children }: { children: React.ReactNode }) {
    const { loading: authLoading } = useAuth();
    const { loading: musicLoading } = useMusic();
    const [fadeOut, setFadeOut] = useState(false);
    const [done, setDone] = useState(false);

    const isLoading = authLoading || musicLoading;

    useEffect(() => {
        if (!isLoading) {
            setFadeOut(true);
            const t = setTimeout(() => setDone(true), 500); 
            return () => clearTimeout(t);
        }
    }, [isLoading]);

    if (done) return <>{children}</>;

    return (
        <>
            <div style={{ visibility: "hidden", position: "absolute", pointerEvents: "none" }}>
                {children}
            </div>

            <div style={{
                position: "fixed", inset: 0, zIndex: 9999,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-color)",  
                opacity: fadeOut ? 0 : 1,
                transition: "opacity 0.5s ease",
                pointerEvents: fadeOut ? "none" : "all"
            }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary-color)" }}>
                    Acoustica
                </div>
            </div>
        </>
    );
}