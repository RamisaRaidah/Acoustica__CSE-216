import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import { removeMusicPlayer } from '/src/components/music_player/music_player.js';
import { enterAuthMode } from '/src/utils/helper.js';
import { renderOnboarding } from '/src/pages/auth/Onboarding/onboarding.js';

export function renderSignUp() {
    //enterAuthMode();
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';
    content.innerHTML = `
        <div class="auth-container">
            <div class="auth-logo">
                <img src="/src/assets/images/Logo.png" id="logo" alt="logo">
                <img src="/src/assets/images/auth/name_2.png" id="acoustica" alt="Acoustica">
            </div>

            <div class="auth-left">
                <p class="typewriter" id="typewriter"></p>
                <div class="auth-underline"></div>
            </div>

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
               await renderOnboarding();
               //router.navigate('/onboarding');
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

    const lines = ["Discover", "your", "new favourites"];
    const el = document.getElementById('typewriter');
    const underline = document.querySelector('.auth-underline');
    let lineIndex = 0;
    let charIndex = 0;
    let typing = true;

    function type() {
        const currentText = lines.slice(0, lineIndex).join('\n') + 
                            (lineIndex < lines.length ? '\n' + lines[lineIndex].slice(0, charIndex) : '');
        
        el.innerText = currentText.trimStart();

        if (typing) {
            if (charIndex < lines[lineIndex].length) {
                charIndex++;
                setTimeout(type, 80);
            } else if (lineIndex < lines.length - 1) {
                lineIndex++;
                charIndex = 0;
                setTimeout(type, 200); // pause between lines
            } else {
                underline.style.width = '300px';
                setTimeout(() => { typing = false; setTimeout(erase, 2000); }, 500);
            }
        }
    }

    function erase() {
        if (charIndex > 0) {
            charIndex--;
            const currentText = lines.slice(0, lineIndex).join('\n') + '\n' + lines[lineIndex].slice(0, charIndex);
            el.innerText = currentText.trimStart();
            underline.style.width = (charIndex / lines[lineIndex].length * 300) + 'px';
            setTimeout(erase, 40);
        } else if (lineIndex > 0) {
            lineIndex--;
            charIndex = lines[lineIndex].length;
            setTimeout(erase, 200);
        } else {
            underline.style.width = '0';
            typing = true;
            lineIndex = 0;
            charIndex = 0;
            setTimeout(type, 500);
        }
    }

    type();
}