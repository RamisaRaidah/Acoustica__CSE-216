import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import { removeMusicPlayer } from '/src/components/music_player/music_player.js';
import { enterAuthMode } from '/src/utils/helper.js';

export async function renderOnboarding() {
    //enterAuthMode();
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';

    const user = JSON.parse(localStorage.getItem('user'));
    const user_type = user?.user_type;

   try {
        let templatePath;

        if (user_type === 'artist') {
            templatePath = '/src/pages/auth/Onboarding/onboarding_artist.html';
        } else {
            templatePath = '/src/pages/auth/Onboarding/onboarding_listener.html';
        }

        const response = await fetch(templatePath);
        const html = await response.text();
        content.innerHTML = html;
    } catch (error) {
        console.error('Failed to load sign-in template:', error);
        content.innerHTML = '<div class="error">Failed to load onboarding page </div>';
        return;
    }

    const bioTextarea = document.getElementById('bio');
    const bioCounter = document.getElementById('bio-counter');
    bioTextarea.addEventListener('input', () => {
        bioCounter.textContent = `${bioTextarea.value.length}/200`;
    });

    const [countries, languages] = await Promise.all([
        api.getCountries(),
        api.getLanguages()
    ]);


    document.getElementById('country_id').innerHTML = 
        `<option value="">Select your country</option>` +
        countries.map(c => `<option value="${c.country_id}">${c.country_name}</option>`).join('');

    document.getElementById('language_id').innerHTML = 
        `<option value="">Select your language</option>` +
        languages.map(l => `<option value="${l.language_id}">${l.language_name}</option>`).join('');

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
            country_id: document.getElementById('country_id').value || null,
            language_id: document.getElementById('language_id').value || null,
            phone_number: document.getElementById('phone_number').value,
            gender: document.getElementById('gender').value,
            date_of_birth: document.getElementById('date_of_birth').value || null,
            app_mode: document.getElementById('app_mode').value,
            ...(user_type === 'artist' && {
                stage_name: document.getElementById('stage_name').value,
                bank_account: document.getElementById('bank_account').value,
            })
        };

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