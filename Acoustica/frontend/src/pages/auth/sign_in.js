import api from '../../services/api.js';
import router from '../../utils/routers.js';
import { removeSidebar } from '../../components/sidebar/sidebar.js';
import { removeTopbar } from '../../components/topbar/topbar.js';
import { removeMusicPlayer } from '../../components/music_player/music_player.js';

export function renderSignIn() {
    const app = document.getElementById('app');
    
    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    const content = document.getElementById('content');
    content.style.marginLeft = '0';
    content.style.marginTop = '0';
    content.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to Acoustica</p>
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
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            errorDiv.textContent = error.message || 'Sign in failed. Please check your credentials.';
            errorDiv.style.display = 'block';
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
}