import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import '@/components/scrollbar/Scrollbar.css'

export function Scrollbar() {
    const { user } = useAuth();
    const thumbRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const arrowUpRef = useRef<HTMLDivElement>(null);
    const arrowDownRef = useRef<HTMLDivElement>(null);

    const height = user?.user_type === "listener" ? "77vh" : "89vh";

    useEffect(() => {
        const thumb = thumbRef.current;
        const track = trackRef.current;
        const arrowUp = arrowUpRef.current;
        const arrowDown = arrowDownRef.current;

        if (!thumb || !track || !arrowUp || !arrowDown) return;

        const updateThumb = () => {
            const trackHeight = track.clientHeight;
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollable <= 0 || trackHeight === 0) {
                thumb.style.height = "100%";
                thumb.style.top = "0px";
                return;
            }

            const ratio = window.innerHeight / document.documentElement.scrollHeight;
            const thumbHeight = Math.max(Math.round(ratio * trackHeight), 30);
            thumb.style.height = thumbHeight + "px";
            const scrollRatio = window.scrollY / scrollable;
            thumb.style.top = scrollRatio * (trackHeight - thumbHeight) + "px";
        };

        const raf = requestAnimationFrame(updateThumb);
        window.addEventListener("scroll", updateThumb);

        const observer = new MutationObserver(() => {
            window.scrollTo(0, 0);
            updateThumb();
        });
        observer.observe(document.body, { childList: true, subtree: false });

        let isDragging = false;
        let startY = 0;
        let startTop = 0;

        const onMouseDown = (e: MouseEvent) => {
            isDragging = true;
            startY = e.clientY;
            startTop = parseInt(thumb.style.top || "0");
            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) return;
            const maxTop = track.clientHeight - thumb.clientHeight;
            const newTop = Math.min(Math.max(startTop + (e.clientY - startY), 0), maxTop);
            thumb.style.top = newTop + "px";
            window.scrollTo(0, (newTop / maxTop) * scrollable);
        };

        const onMouseUp = () => { isDragging = false; };

        thumb.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        let arrowInterval: ReturnType<typeof setInterval> | null = null;

        const startScroll = (direction: number) => {
            window.scrollBy({ top: direction * 40, behavior: "smooth" });
            arrowInterval = setInterval(() => {
                window.scrollBy({ top: direction * 40, behavior: "smooth" });
            }, 150);
        };

        const stopScroll = () => {
            if (arrowInterval) clearInterval(arrowInterval);
            arrowInterval = null;
        };

        const onUpDown = () => startScroll(-1);
        const onDownDown = () => startScroll(1);

        arrowUp.addEventListener("mousedown", onUpDown);
        arrowDown.addEventListener("mousedown", onDownDown);
        document.addEventListener("mouseup", stopScroll);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", updateThumb);
            observer.disconnect();
            thumb.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            arrowUp.removeEventListener("mousedown", onUpDown);
            arrowDown.removeEventListener("mousedown", onDownDown);
            document.removeEventListener("mouseup", stopScroll);
        };
    }, [height]);

    return (
        <div className="scrollbar" style={{ height }}>
            <div className="scroll_arrow_up" ref={arrowUpRef}>&#9650;</div>
            <div id="scroll_track" ref={trackRef}>
                <div className="thumb" ref={thumbRef} />
            </div>
            <div className="scroll_arrow_down" ref={arrowDownRef}>&#9660;</div>
        </div>
    );
}