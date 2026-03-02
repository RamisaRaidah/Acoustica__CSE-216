//onboarding.js
import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import MusicPlayer from '/src/components/music_player/music_player.js';

export async function renderOnboarding() {
    console.log('Hello onboarding');
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    MusicPlayer.removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';

    content.style.overflowY = 'auto';
    content.style.overflowX = 'hidden';
    content.style.height = 'auto';

    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';

    content.classList.add('scrollable');
    content.classList.remove('no-scroll');

    console.log('We made it here, scroll bars should be fine, but we know they are not');

    const user = JSON.parse(localStorage.getItem('user'));
    const user_type = user?.user_type;

    console.log('Well, I am still alive');

    let templatePath;
    try {
        
        if (user_type === 'artist') {
            templatePath = '/src/pages/auth/Onboarding/onboarding_artist1.html';
        } else {
            templatePath = '/src/pages/auth/Onboarding/onboarding_listener1.html';
        }

        console.log('user_type:', user_type);
        console.log('templatePath:', templatePath);

        const response = await fetch(templatePath);
        console.log('fetch status:', response.status, response.ok);
        
        const html = await response.text();
        console.log('html length:', html.length);
        console.log('has pfp:', html.includes('id="pfp"'));
        
        content.innerHTML = html;
        console.log('DOM has pfp after inject:', !!document.getElementById('pfp'));

    }catch (error) {
        console.error('Template load error:', error);
        content.innerHTML = '<div class="error">Failed to load onboarding page </div>';
        return;
    }

    const bioTextarea = document.getElementById('bio');
    const bioCounter = document.getElementById('bio-counter');
    bioTextarea.addEventListener('input', () => {
        bioCounter.textContent = `${bioTextarea.value.length}/200`;
    });

    try {
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

    } catch (error) {
        console.error('Failed to load countries/languages:', error);
      
        document.getElementById('country_id').innerHTML = `<option value="">Failed to load</option>`;
        document.getElementById('language_id').innerHTML = `<option value="">Failed to load</option>`;
    }


    console.log('Done with countries and languages');

    
    const form = document.getElementById('onboarding-form');
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('onboarding-btn');
    
    const pfpInput = document.getElementById('pfp');
    const pfpPreview = document.getElementById('pfp-preview');
    const pfpWrapper = document.querySelector('.pfp-wrapper');

    if (pfpInput && pfpPreview && pfpWrapper) {

        pfpWrapper.addEventListener('click', () => {
            pfpInput.click();
        });

        pfpInput.addEventListener('change', (e) => {
            const file = e.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    pfpPreview.src = reader.result;
                };
                reader.readAsDataURL(file);
            }
        });

    } else {
        console.warn("PFP elements missing in DOM");
    }


    form.addEventListener('submit', async (e) => {
        console.log('Ladies and gentlemen, we have gathered here to witness the destruction of my brain');
        e.preventDefault();

        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const formData=new FormData(form);

        console.log('Okkkkk workkkkkk');
        try {
            const response = await api.onboarding(formData);
            console.log('Welp, what happened now');
            if (response && response.message) {
                console.log('Why will you not work now?');

                console.log(document.getElementById('theme').value);
                localStorage.setItem('theme', document.getElementById('theme').value);
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                    document.body.classList.add('dark');
                }
                else {
                    document.body.classList.remove('dark');
                }

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