import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import MusicPlayer from '/src/components/music_player/music_player.js';
import { renderOnboarding } from '/src/pages/auth/Onboarding/onboarding.js';
import { exitApp } from '/src/utils/helper.js';

export async function renderSignUp() {
    exitApp();
    
    const page=document.getElementById('page');

    page.style.marginLeft = '0';
    page.style.marginTop = '0';

    page.style.overflowY = 'auto';
    page.style.overflowX = 'hidden';
    page.style.height = 'auto';

    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';

    page.classList.add('scrollable');
    page.classList.remove('no-scroll');
    
    try{
        const response=await fetch('src/pages/auth/Sign_up/sign_up.html');
        const html=await response.text();
        page.innerHTML=html;
       
    }catch(error){
        console.log("Failed to fetch sign up: ", error);
        page.innerHTML='<div class="error">"Failed to load Sign-up page"</div>';
        return;
    }

    const form = document.getElementById('signup-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signup-btn');

    document.getElementById('toggle-password').addEventListener('click', () => {
        const input = document.getElementById('password');
        input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('toggle-password2').addEventListener('click', () => {
        const input = document.getElementById('confirm_password');
        input.type = input.type === 'password' ? 'text' : 'password';
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user_type = document.getElementById('user_type').value;
        const confirm_password = document.getElementById('confirm_password').value;


        if (password !== confirm_password) {
            errorDiv.textContent = 'Passwords do not match.';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
            return;
        }

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
                    email: email,
                    user_type: signInResponse.user_type,
                    onboarding_done: false
                }));
                document.cookie = `jwt=${signInResponse.token}; path=/; SameSite=Strict;`;
                console.log('Sign up and sign in done, going to Onboarding');
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
                setTimeout(type, 70);
            } else if (lineIndex < lines.length - 1) {
                lineIndex++;
                charIndex = 0;
                setTimeout(type, 200); // pause between lines
            } else {
                underline.style.width = '300px';
                setTimeout(() => { typing = false; setTimeout(erase, 1500); }, 500);
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