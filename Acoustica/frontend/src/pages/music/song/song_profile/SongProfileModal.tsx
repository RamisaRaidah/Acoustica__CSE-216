import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SongProfile from '@/pages/music/song/song_profile/SongProfile';

export default function SongProfileModal() {
    const navigate = useNavigate();

    return createPortal(
        <div
            className="song_modal_overlay"
            onClick={() => navigate(-1)}
        >
            <div
                className="song_modal_popup"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="song_modal_close"
                    onClick={() => navigate(-1)}
                >
                    ✕
                </button>
                <SongProfile />
            </div>
        </div>,
        document.body
    );
}