import api from '../../services/api.js';
import router from '../../utils/routers.js';
import { removeSidebar } from '../../components/sidebar/sidebar.js';
import { removeTopbar } from '../../components/topbar/topbar.js';
import { removeMusicPlayer } from '../../components/music_player/music_player.js';

export function renderOnboarding() {
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';

    const user = JSON.parse(localStorage.getItem('user'));
    const user_type = user?.user_type;

    content.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Set Up Your Profile</h1>
                    <p>Tell us a bit about yourself</p>
                </div>

                <form id="onboarding-form" class="auth-form">

                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea id="bio" placeholder="Tell us about yourself..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="phone_number">Phone Number</label>
                        <input type="tel" id="phone_number" placeholder="e.g. +1234567890" />
                    </div>

                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender">
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="date_of_birth">Date of Birth</label>
                        <input type="date" id="date_of_birth" />
                    </div>

                    <div class="form-group">
                        <label for="app_mode">App Mode</label>
                        <select id="app_mode">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    ${user_type === 'artist' ? `
                        <div class="form-group">
                            <label for="stage_name">Stage Name</label>
                            <input type="text" id="stage_name" placeholder="Your artist name" />
                        </div>
                        <div class="form-group">
                            <label for="bank_account">Bank Account</label>
                            <input type="text" id="bank_account" placeholder="Your bank account number" />
                        </div>
                    ` : ''}

                    <div id="error-message" class="error-message"></div>

                    <button type="submit" class="btn-primary" id="onboarding-btn">
                        Let's Go
                    </button>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById('onboarding-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('onboarding-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const data = {
            bio: document.getElementById('bio').value,
            phone_number: document.getElementById('phone_number').value,
            gender: document.getElementById('gender').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            app_mode: document.getElementById('app_mode').value,
        };

        if (user_type === 'artist') {
            data.stage_name = document.getElementById('stage_name').value;
            data.bank_account = document.getElementById('bank_account').value;
        }

        try {
            const response = await api.onboarding(data);
            if (response && response.message) {
                router.navigate('/dashboard');
            } else {
                throw new Error('Onboarding failed');
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Something went wrong. Please try again.';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = "Let's Go";
        }
    });
}