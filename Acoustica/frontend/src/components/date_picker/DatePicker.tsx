import '@/components/date_picker/DatePicker.css'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface DatePickerProps {
    name: string;
    required?: boolean;
    placeholder?: string;
    initialValue?: string;
}

export interface DatePickerHandle {
    reset: () => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
}

function parseLocalDate(val: string) {
    if (!val || !val.includes("-")) return null;
    const [y, m, d] = val.split("-").map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m - 1, d);
}

export const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(
    ({ name, required, placeholder = "Select a date", initialValue }, ref) => {
        const today = new Date();

        const [viewMonth, setViewMonth] = useState(today.getMonth());
        const [viewYear, setViewYear] = useState(today.getFullYear());
        const [selected, setSelected] = useState<string>("");
        const [open, setOpen] = useState(false);
        const [mode, setMode] = useState<"day" | "month" | "year">("day");
        const containerRef = useRef<HTMLDivElement>(null);

        const daysInMonth = getDaysInMonth(viewMonth, viewYear);
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
        const yearRange = Array.from({ length: 80 }, (_, i) => today.getFullYear() - i);

        useImperativeHandle(ref, () => ({
            reset() {
                if (initialValue) {
                    const d = parseLocalDate(initialValue);
                    if (d) {
                        setSelected(initialValue);
                        setViewMonth(d.getMonth());
                        setViewYear(d.getFullYear());
                    }
                } else {
                    setSelected("");
                    setViewMonth(today.getMonth());
                    setViewYear(today.getFullYear());
                }
                setOpen(false);
                setMode("day");
            }
        }));

        useEffect(() => {
            function handleClickOutside(e: MouseEvent) {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setOpen(false);
                    setMode("day");
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        useEffect(() => {
            if (initialValue === undefined) return;

            if (initialValue === "") {
                setSelected("");
                setViewMonth(today.getMonth());
                setViewYear(today.getFullYear());
                return;
            }

            const d = parseLocalDate(initialValue);
            if (!d) return;
            setSelected(initialValue);
            setViewMonth(d.getMonth());
            setViewYear(d.getFullYear());
        }, [initialValue]);

        function selectDay(day: number) {
            const mm = String(viewMonth + 1).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            setSelected(`${viewYear}-${mm}-${dd}`);
            setOpen(false);
            setMode("day");
        }

        function prevMonth() {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
        }

        function nextMonth() {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
        }

        function formatDisplay() {
            if (!selected) return placeholder;
            const d = parseLocalDate(selected);
            if (!d) return placeholder;
            return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        }

        const isSelected = (day: number) => {
            if (!selected) return false;
            const d = parseLocalDate(selected);
            if (!d) return false;
            return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
        };

        const isToday = (day: number) =>
            today.getDate() === day &&
            today.getMonth() === viewMonth &&
            today.getFullYear() === viewYear;

        return (
            <div className="datepicker-container" ref={containerRef}>
                <input type="hidden" name={name} value={selected} required={required} />

                <div
                    className={`datepicker-trigger ${open ? "active" : ""} ${!selected ? "placeholder" : ""}`}
                    onClick={() => setOpen(o => !o)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDisplay()}</span>
                    <svg className={`datepicker-chevron ${open ? "rotated" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

                {open && (
                    <div className="datepicker-dropdown">
                        {mode === "day" && (
                            <>
                                <div className="datepicker-header">
                                    <button type="button" className="datepicker-nav" onClick={prevMonth}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <div className="datepicker-header-labels">
                                        <span className="datepicker-month-label" onClick={() => setMode("month")}>
                                            {MONTHS[viewMonth]}
                                        </span>
                                        <span className="datepicker-year-label" onClick={() => setMode("year")}>
                                            {viewYear}
                                        </span>
                                    </div>
                                    <button type="button" className="datepicker-nav" onClick={nextMonth}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="datepicker-weekdays">
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                        <span key={d}>{d}</span>
                                    ))}
                                </div>

                                <div className="datepicker-grid">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <span key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                                        <button
                                            type="button"
                                            key={day}
                                            className={`datepicker-day ${isSelected(day) ? "selected" : ""} ${isToday(day) && !isSelected(day) ? "today" : ""}`}
                                            onClick={() => selectDay(day)}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {mode === "month" && (
                            <div className="datepicker-month-grid">
                                {MONTHS.map((m, i) => (
                                    <button
                                        type="button"
                                        key={m}
                                        className={`datepicker-month-item ${viewMonth === i ? "selected" : ""}`}
                                        onClick={() => { setViewMonth(i); setMode("day"); }}
                                    >
                                        {m.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === "year" && (
                            <div className="datepicker-year-list">
                                {yearRange.map(y => (
                                    <button
                                        type="button"
                                        key={y}
                                        className={`datepicker-year-item ${viewYear === y ? "selected" : ""}`}
                                        onClick={() => { setViewYear(y); setMode("day"); }}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);