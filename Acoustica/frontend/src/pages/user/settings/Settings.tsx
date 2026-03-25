import Alert from "@/components/alert/TwoButtonAlert";
import { useTheme } from "@/contexts/ThemeContext";
import "@/pages/user/settings/Settings.css";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
    const { theme, toggleTheme } = useTheme();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [email, setEmail] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate=useNavigate();
    useEffect(() => {
        if (theme === 'dark') setDarkMode(true);
    }, []);

    if (!isOpen) return null;

    return createPortal(
        
        <div className="settings_overlay">
            {showDeleteConfirm && (
                <Alert
                    message="Are you sure you want to delete your account? This action cannot be undone."
                    type="confirm"
                    onConfirm={() => {
                        setShowDeleteConfirm(false);
                        onClose();
                        navigate('/delete/account');
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
            <div className="settings_popup" onClick={e => e.stopPropagation()}>
                <div className="settings_header">
                    <h2 className="settings_title">Settings</h2>
                    <button className="settings_close" onClick={onClose}>✕</button>
                </div>

                <div className="settings_body">
                    <div className="settings_section_label">Account settings</div>
                    <div className="settings_item"
                        onClick={()=>
                            {
                                navigate('/update/account');
                                onClose();
                            }
                        }
                    >
                        <span className="settings_item_text">Update account</span>
                        
                    </div>
                    <div className="settings_item"
                        onClick={()=>
                            {
                                navigate('/change/password');
                                onClose();
                            }
                        }
                    >
                        <span className="settings_item_text">Change password</span>
                    </div>
                    <div className="settings_item" onClick={() => setShowDeleteConfirm(true)}>
                        <span className="settings_item_text settings_danger">Delete account</span>
                    </div>

                    <div className="settings_divider" />

                    <div className="settings_section_label">Application preferences</div>
                    <div className="settings_item">
                        <span className="settings_item_text">Dark mode</span>
                        <button
                            className={`settings_toggle ${darkMode ? 'settings_toggle--on' : 'settings_toggle--off'}`}
                            onClick={() => { toggleTheme(); setDarkMode(m => !m) }}
                        >
                            <span className="settings_toggle_label">{darkMode ? 'On' : 'Off'}</span>
                            <span className="settings_toggle_knob" />
                        </button>
                    </div>
                    <div className="settings_item">
                        <span className="settings_item_text">Notification</span>
                        <button
                            className={`settings_toggle ${notifications ? 'settings_toggle--on' : 'settings_toggle--off'}`}
                            onClick={() => setNotifications(p => !p)}
                        >
                            <span className="settings_toggle_label">{notifications ? 'On' : 'Off'}</span>
                            <span className="settings_toggle_knob" />
                        </button>
                    </div>
                    <div className="settings_item">
                        <span className="settings_item_text">Email</span>
                        <button
                            className={`settings_toggle ${email ? 'settings_toggle--on' : 'settings_toggle--off'}`}
                            onClick={() => setEmail(p => !p)}
                        >
                            <span className="settings_toggle_label">{email ? 'On' : 'Off'}</span>
                            <span className="settings_toggle_knob" />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}