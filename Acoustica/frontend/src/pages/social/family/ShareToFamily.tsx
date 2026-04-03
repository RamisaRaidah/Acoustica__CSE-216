import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getUserFamily, shareToFamily, UserFamily } from '@/services/social_service/social.ts';
import '@/pages/social/family/ShareToFamily.css';

interface ShareToFamilyPopupProps {
    isOpen: boolean;
    onClose: () => void;
    assetId: number;
}

type Status = 'idle' | 'loading' | 'submitting' | 'success' | 'error';

const MAX_NOTE = 80;

export default function ShareToFamilyPopup({ isOpen, onClose, assetId }: ShareToFamilyPopupProps) {
    const [family, setFamily] = useState<UserFamily | null>(null);
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setNote('');
        setErrorMsg(null);
        setStatus('loading');

        getUserFamily()
            .then(f => {
                setFamily(f);
                setStatus('idle');
            })
            .catch(() => {
                setErrorMsg('Could not load your family. Make sure you have an active subscription.');
                setStatus('error');
            });
    }, [isOpen]);

    async function handleShare() {
        if (!family) return;
        setStatus('submitting');
        setErrorMsg(null);
        try {
            await shareToFamily(family.family_id, assetId, note.trim() || undefined);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 1600);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : 'Failed to share. Please try again.';
            setErrorMsg(msg);
            setStatus('error');
        }
    }

    function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === overlayRef.current) onClose();
    }

    if (!isOpen) return null;

    return createPortal(
        <div
            id="stf-overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div id="stf-container" role="dialog" aria-modal="true">
                <button id="stf-close-btn" onClick={onClose} aria-label="Close">✕</button>

                {/* ── Family badge ── */}
                <div id="stf-family-badge">
                    <svg id="stf-family-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span id="stf-family-name">
                        {status === 'loading' ? 'Loading…' : (family?.family_name ?? 'Family')}
                    </span>
                </div>

                {/* ── Note textarea ── */}
                <div id="stf-note-wrapper">
                    <textarea
                        id="stf-note"
                        placeholder="Share a note (optional)"
                        maxLength={MAX_NOTE}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        disabled={status === 'submitting' || status === 'success' || status === 'loading'}
                        rows={4}
                    />
                    <span id="stf-char-count" className={note.length >= MAX_NOTE ? 'at-limit' : ''}>
                        {note.length}/{MAX_NOTE}
                    </span>
                </div>

                {/* ── Error message ── */}
                {errorMsg && status === 'error' && (
                    <div id="stf-error">{errorMsg}</div>
                )}

                {/* ── Share button ── */}
                <button
                    id="stf-share-btn"
                    onClick={handleShare}
                    disabled={status !== 'idle' && status !== 'error' || !family}
                    className={status === 'success' ? 'success' : ''}
                >
                    {status === 'submitting' && <span className="stf-spinner" />}
                    {status === 'success' ? '✓ Shared!' : 'Share'}
                </button>
            </div>
        </div>,
        document.body
    );
}