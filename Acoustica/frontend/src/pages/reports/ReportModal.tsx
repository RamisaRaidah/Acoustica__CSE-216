import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createReport } from '@/services/social_service/posts.ts';
import '@/pages/reports/ReportModal.css';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetId: number;
}

export default function ReportModal({ isOpen, onClose, assetId }: ReportModalProps) {
    const [text, setText] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            setText('');
            setImage(null);
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

    async function handleSubmit() {
        if (!text.trim()) {
            setError('Please write something before submitting.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await createReport(assetId, { text: text.trim(), image: image ?? undefined });
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
            className="rm-overlay"
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className="rm-modal">

                <p className="rm-description">
                    Something wrong with this content? Let us know and our team will look into it.
                </p>

                <textarea
                    className="rm-textarea"
                    placeholder="Share a note"
                    value={text}
                    rows={5}
                    onChange={e => setText(e.target.value)}
                />

                <label className="rm-file-label">
                    <input
                        type="file"
                        accept="image/*"
                        className="rm-file-input"
                        onChange={e => setImage(e.target.files?.[0] ?? null)}
                    />
                    {image ? `📎 ${image.name}` : 'Attach an image (optional)'}
                </label>

                {error && <p className="rm-error">{error}</p>}

                <button
                    className="rm-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <span className="rm-spinner" /> : 'Report'}
                </button>

            </div>
        </div>,
        document.body
    );
}