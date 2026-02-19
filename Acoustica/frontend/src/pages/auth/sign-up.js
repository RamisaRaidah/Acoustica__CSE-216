import api from '../../services/api.js';
import router from '../../utils/routers.js';
import { removeSidebar } from '../../components/sidebar/sidebar.js';
import { removeTopbar } from '../../components/topbar/topbar.js';
import { removeMusicPlayer } from '../../components/music_player/music_player.js';

export function renderSignUp() {
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';
    content.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Acoustica</p>
                </div>

                <form id="signup-form" class="auth-form">
                    <div class="form-group">
                        <label for="first_name">First Name</label>
                        <input type="text" id="first_name" placeholder="Enter your first name" required />
                    </div>

                    <div class="form-group">
                        <label for="last_name">Last Name</label>
                        <input type="text" id="last_name" placeholder="Enter your last name" required />
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required />
                    </div>

                    <div class="form-group">
                        <label for="user_type">I am a...</label>
                        <select id="user_type">
                            <option value="listener">Listener</option>
                            <option value="artist">Artist</option>
                        </select>
                    </div>

                    <div id="error-message" class="error-message"></div>

                    <button type="submit" class="btn-primary" id="signup-btn">
                        Sign Up
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Already have an account? <a href="/sign-in" data-link>Sign In</a></p>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('signup-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signup-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user_type = document.getElementById('user_type').value;

        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            const response = await api.signUp(email, password, first_name, last_name, user_type);

            if (response && response.user_id) {
                const signInResponse = await api.signIn(email, password);
                localStorage.setItem('token', signInResponse.token);
                localStorage.setItem('user', JSON.stringify({
                    user_id: signInResponse.user_id,
                    email,
                    user_type: signInResponse.user_type
                }));
                router.navigate('/onboarding');
            } else {
                throw new Error('Sign-up failed');
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'Sign up failed. Please try again.';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}