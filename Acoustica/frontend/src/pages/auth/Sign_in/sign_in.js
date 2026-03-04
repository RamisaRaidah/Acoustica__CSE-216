import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { exitApp } from '/src/utils/helper.js';

export async function renderSignIn() {
    exitApp();

    const page = document.getElementById('page');
    page.style.marginLeft = '0';
    page.style.marginTop = '0';
    page.style.padding = '0';
    page.style.overflow = 'hidden';
    page.style.height = '100vh';
    document.body.style.overflow = 'hidden';

    try {
        console.log('Here we go, sign-in!!');
        const response = await fetch('/src/pages/auth/Sign_in/sign_in.html');
        console.log('Response:', response);
        const html = await response.text();
        console.log('HTML length:', html.length);
        console.log('HTML preview:', html.substring(0, 200));
        page.innerHTML = html;
        page.classList.remove('scrollable');
        page.classList.add('no-scroll');
    } catch (error) {
        console.error('Failed to load sign-in template:', error);
        page.innerHTML = '<div class="error">Failed to load sign-in page</div>';
        return;
    }


    const form = document.getElementById('signin-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signin-btn');

    document.getElementById('toggle-password').addEventListener('click', () => {
        const input = document.getElementById('password');
        input.type = input.type === 'password' ? 'text' : 'password';
    });

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
                    user_type: response.user_type,
                    onboarding_done: response.onboarding_done
                }));
                document.cookie = `jwt=${response.token}; path=/; SameSite=Strict;`;
                localStorage.setItem('theme', response.theme); 
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                    document.body.classList.add('dark');
                }
                else {
                    document.body.classList.remove('dark');
                }

                console.log('Signed in successfully');
                if (response.onboarding_completed) {
                    router.navigate('/dashboard');
                } else {
                    router.navigate('/onboarding');
                }   
                
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