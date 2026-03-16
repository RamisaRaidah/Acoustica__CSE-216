import '@/components/scrollbar/Scrollbar.css'
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useScroll } from "@/contexts/ScrollContext";
import { useLocation } from 'react-router-dom';

export default function Scrollbar() {
    const { user } = useAuth();
    const containerRef = useScroll();
    const location = useLocation();
    const thumbRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const arrowUpRef = useRef<HTMLDivElement>(null);
    const arrowDownRef = useRef<HTMLDivElement>(null);

    const height = user?.user_type === "listener" ? "77vh" : "89vh";

    useEffect(() => {
        const container = containerRef.current;
        const thumb = thumbRef.current;
        const track = trackRef.current;
        const arrowUp = arrowUpRef.current;
        const arrowDown = arrowDownRef.current;

        if (!container || !thumb || !track || !arrowUp || !arrowDown) return;

        const updateThumb = () => {
            const trackHeight = track.clientHeight;
            const scrollable = container.scrollHeight - container.clientHeight;

            if (scrollable <= 0 || trackHeight === 0) {
                thumb.style.height = "100%";
                thumb.style.top = "0px";
                return;
            }

            const ratio = container.clientHeight / container.scrollHeight;
            const thumbHeight = Math.max(Math.round(ratio * trackHeight), 30);
            thumb.style.height = thumbHeight + "px";
            const scrollRatio = container.scrollTop / scrollable;
            thumb.style.top = scrollRatio * (trackHeight - thumbHeight) + "px";
        };

        updateThumb();
        container.addEventListener("scroll", updateThumb);

        const observer = new ResizeObserver(updateThumb);
        observer.observe(container);

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
            const scrollable = container.scrollHeight - container.clientHeight;
            if (scrollable <= 0) return;
            const maxTop = track.clientHeight - thumb.clientHeight;
            const newTop = Math.min(Math.max(startTop + (e.clientY - startY), 0), maxTop);
            thumb.style.top = newTop + "px";
            container.scrollTop = (newTop / maxTop) * scrollable;
        };

        const onMouseUp = () => { isDragging = false; };

        thumb.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        let arrowInterval: ReturnType<typeof setInterval> | null = null;

        const startScroll = (direction: number) => {
            container.scrollBy({ top: direction * 40, behavior: "smooth" });
            arrowInterval = setInterval(() => {
                container.scrollBy({ top: direction * 40, behavior: "smooth" });
            }, 150);
        };

        const stopScroll = () => {
            if (arrowInterval) clearInterval(arrowInterval);
            arrowInterval = null;
        };

        arrowUp.addEventListener("mousedown", () => startScroll(-1));
        arrowDown.addEventListener("mousedown", () => startScroll(1));
        document.addEventListener("mouseup", stopScroll);

        return () => {
            container.removeEventListener("scroll", updateThumb);
            observer.disconnect();
            thumb.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mouseup", stopScroll);
        };
    }, [containerRef, height, location.pathname]);

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