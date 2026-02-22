import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import { removeMusicPlayer } from '/src/components/music_player/music_player.js';
import { enterAuthMode } from '/src/utils/helper.js';

export function renderSignIn() {
    //enterAuthMode();
    const app = document.getElementById('app');
    
    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    const content = document.getElementById('content');
    content.style.marginLeft = '0';
    content.style.marginTop = '0';
    content.style.padding = '0';
    content.innerHTML = `
        <div class="auth-container">
            <div class="auth-logo">
                <img src="/src/assets/images/Logo.png" id="logo" alt="Aaaa logoooo" >
                <img src="/src/assets/images/auth/name_2.png" id="acoustica" alt="Acoustica">
            </div>

            <div class="auth-left">
                <p class="typewriter" id="typewriter"></p>
                <div class="auth-underline"></div>
            </div>

            <div class="auth-card">
                <div class="auth-header">
                    <h1>Welcome Back!</h1>
                </div>

                <form id="signin-form" class="auth-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required 
                            placeholder="Enter your password"
                        />
                    </div>

                    <div class="auth-forgot-pass"><a href="/forgot-pass" data-link>Forgot your password?</a> </div>

                    <div id="error-message" class="error-message"></div>

                    <button type="submit" class="btn-primary" id="signin-btn">
                        Sign In
                    </button>
                </form>

                <div class="auth-footer">
                    <p>Don't have an account? <a href="/sign-up" data-link>Sign Up</a></p>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('signin-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signin-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        errorDiv.textContent = '';
        errorDiv.style.display = 'none';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            const response = await api.signIn(email, password);
            
            if (response && response.token) {
            
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify({
                    user_id: response.user_id,
                    email: email,
                    user_type: response.user_type
                }));

                console.log('Signed in successfully');
                router.navigate('/dashboard');
            } else if (response && response.error) {
                throw new Error(response.error);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            errorDiv.textContent = error.message || 'Invalid credentials.';
            errorDiv.style.display = 'block';
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });


    const lines = ["Let the", "rhythm of", "your life soar"];
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