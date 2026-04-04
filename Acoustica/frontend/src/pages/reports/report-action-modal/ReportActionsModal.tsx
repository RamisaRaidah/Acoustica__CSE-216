import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { handleUserReport } from '@/services/social_service/posts.ts';
import '@/pages/reports/report-action-modal/ReportActionsModal.css';

interface ReportActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: number;
    onSuccess: (reportId: number) => void;
}

export default function ReportActionsModal({ isOpen, onClose, reportId, onSuccess }: ReportActionsModalProps) {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setNote('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    async function handleAction(action: 'dismiss' | 'remove_content') {
        setSubmitting(true);
        setError('');
        try {
            await handleUserReport(reportId, { action, note: note.trim() || undefined });
            onSuccess(reportId);
            onClose();
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return createPortal(
        <div
            className="ram-overlay"
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="ram-modal">

                <div className="ram-header">
                    <span className="ram-gear">⚙</span>
                    <span className="ram-title">Actions</span>
                </div>

                <textarea
                    className="ram-textarea"
                    placeholder="Share a note"
                    value={note}
                    rows={4}
                    onChange={e => setNote(e.target.value)}
                />

                {error && <p className="ram-error">{error}</p>}

                <div className="ram-buttons">
                    <button
                        className="ram-btn ram-btn--dismiss"
                        onClick={() => handleAction('dismiss')}
                        disabled={submitting}
                    >
                        {submitting ? <span className="ram-spinner" /> : 'Dismiss'}
                    </button>
                    <button
                        className="ram-btn ram-btn--remove"
                        onClick={() => handleAction('remove_content')}
                        disabled={submitting}
                    >
                        {submitting ? <span className="ram-spinner" /> : 'Remove Content'}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}