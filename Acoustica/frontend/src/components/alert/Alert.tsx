import "@/components/alert/Alert.css";
import { useState } from "react";
import logo_img from "@/assets/images/deco/Logo.png";

interface AlertProps {
    message: string;
}

export function Alert({ message }: AlertProps) {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <div className="alert-overlay" onClick={() => setShow(false)}>
            <div className="alert-box" onClick={e => e.stopPropagation()}>
                <div className="alert-header">
                    <img src={logo_img} alt="logo" className="alert-logo" />
                    <span className="alert-app-name">Acoustica</span>
                </div>
                <div className="alert-divider" />
                <p className="alert-message">{message}</p>
                <div className="alert-actions">
                    <button className="alert-ok" onClick={() => setShow(false)}>OK</button>
                </div>
            </div>
        </div>
    );
}