import "@/components/alert/Alert.css";
import { useState } from "react";
import logo_img from "@/assets/images/deco/Logo.png";

interface AlertProps {
    message: string;
    type?: 'alert' | 'confirm';
    confirmKey?: string;
    cancelKey?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default function Alert({ message, type = 'alert', confirmKey = 'confirm', cancelKey = 'cancel', onConfirm, onCancel }: AlertProps) {
    const [show, setShow] = useState(true);

    if (!show) return null;

    const handleConfirm = () => {
        setShow(false);
        onConfirm?.();
    };

    const handleCancel = () => {
        setShow(false);
        onCancel?.();
    };

    return (
        <div className="alert-overlay">
            <div className="alert-box">
                <div className="alert-header">
                    <img src={logo_img} alt="logo" className="alert-logo" />
                    <span className="alert-app-name">Acoustica</span>
                </div>
                <div className="alert-divider" />
                <p className="alert-message">{message}</p>
                <div className={`alert-actions ${type === 'confirm' ? 'two-buttons' : ''}`}>
                    {type === 'confirm' ? (
                        <>
                            <button className="alert-cancel" onClick={handleCancel}>{cancelKey}</button>
                            <button className="alert-ok" onClick={handleConfirm}>{confirmKey}</button>
                        </>
                    ) : (
                        <button className="alert-ok" onClick={handleConfirm}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
}