import api from '/src/services/api.js';
import { loadSidebar } from '/src/components/sidebar/sidebar.js';
import { loadTopbar } from '/src/components/topbar/topbar.js';
import MusicPlayer from '/src/components/music_player/music_player.js';

export async function renderPrivateProfile() {
    const playerState = MusicPlayer.loadPlayerState();
    await Promise.all([
        loadSidebar(),
        loadTopbar(),
        MusicPlayer.loadMusicPlayer(playerState.songId, playerState.title, playerState.artist, playerState.progress, false)
    ]);

    const response = await fetch('/src/pages/profile/private/my_profile.html');
    document.getElementById('content').innerHTML = await response.text();

    if (!document.getElementById('profile-css')) {
        const link = document.createElement('link');
        link.id = 'profile-css';
        link.rel = 'stylesheet';
        link.href = '/src/pages/user/profile/profile.css';
        document.head.appendChild(link);
    }

    try {
        const data = await api.getMyProfile();
        console.log('user_type:', data.user_type);
        console.log('listener_type:', data.listener_type);
        populateProfile(data);
    } catch (e) {
        console.error('Failed to load profile:', e);
    }
}

function populateProfile(data) {
    const DEFAULT_PFP = '/src/assets/images/Default_pfp.png';

    const pfpImg = document.getElementById('profile-pfp');
    pfpImg.src = data.profile_picture_url ?? DEFAULT_PFP;
    pfpImg.onerror = () => { pfpImg.src = DEFAULT_PFP; };


    document.getElementById('profile-name').textContent =
        `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'No name set';
    document.getElementById('profile-badge').innerHTML = `⬤ &nbsp;${data.user_type ?? 'user'}`;
    document.getElementById('profile-bio').textContent = data.bio || 'No bio yet.';


    document.getElementById('field-first-name').innerHTML= val(data.first_name);
    document.getElementById('field-last-name').innerHTML = val(data.last_name);
    document.getElementById('field-gender').innerHTML= val(data.gender);
    document.getElementById('field-dob').innerHTML = formatDate(data.date_of_birth);
    document.getElementById('field-country').innerHTML= val(data.country_name);
    document.getElementById('field-language').innerHTML= val(data.language_name);

    document.getElementById('field-email').innerHTML = val(data.email);
    document.getElementById('field-phone').innerHTML = val(data.phone_number);
    document.getElementById('field-theme').innerHTML = val(data.theme);


    if (data.user_type === 'listener') {
        document.getElementById('role-card-icon').textContent = '🎧';
        document.getElementById('role-card-title').textContent = 'Listener Details';
        document.getElementById('role-card-body').innerHTML = `
            <div class="info-row">
                <span class="info-label">Subscription</span>
                <span class="info-value">
                    <span class="profile-type-badge">${data.listener_type ?? 'free'}</span>
                </span>
            </div>`;

    } else if (data.user_type === 'artist') {
        document.getElementById('role-card-icon').textContent = '🎤';
        document.getElementById('role-card-title').textContent = 'Artist Details';
        document.getElementById('role-card-body').innerHTML = `
            <div class="info-row">
                <span class="info-label">Stage Name</span>
                <span class="info-value">${val(data.stage_name)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bank Account</span>
                <span class="info-value">${val(data.bank_account)}</span>
            </div>`;
    }
}

function val(v) {
    return v
        ? `<span class="info-value">${v}</span>`
        : `<span class="info-value empty">Not set</span>`;
}

function formatDate(iso) {
    if (!iso) return `<span class="info-value empty">Not set</span>`;
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}