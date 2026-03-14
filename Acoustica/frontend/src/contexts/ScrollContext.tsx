import { createContext, useContext, useRef, RefObject } from "react";

const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement | null>(null);

    return (
        <ScrollContext.Provider value={scrollRef}>
            {children}
        </ScrollContext.Provider>
    );
}

export function useScroll() {
    const scrollContext = useContext(ScrollContext);
    if (!scrollContext) throw new Error("useScrollContainer must be used inside ScrollProvider");
    return scrollContext;
}