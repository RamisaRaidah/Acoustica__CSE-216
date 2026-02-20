import api from '/src/services/api.js';
import router from '/src/utils/routers.js';
import { removeSidebar } from '/src/components/sidebar/sidebar.js';
import { removeTopbar } from '/src/components/topbar/topbar.js';
import { removeMusicPlayer } from '/src/components/music_player/music_player.js';
import { enterAuthMode } from '/src/utils/helper.js';

export async function renderOnboarding() {
    enterAuthMode();
    const content = document.getElementById('content');

    removeSidebar();
    removeTopbar();
    removeMusicPlayer();

    content.style.marginLeft = '0';
    content.style.marginTop = '0';

    const user = JSON.parse(localStorage.getItem('user'));
    const user_type = user?.user_type;


    const [countries, languages] = await Promise.all([
        api.getCountries(),
        api.getLanguages()
    ]);

    console.log('countries:', countries);
    console.log('languages:', languages);

    const countryOptions = countries.map(c => 
        `<option value="${c.country_id}">${c.country_name}</option>`
    ).join('');

    const languageOptions = languages.map(l => 
        `<option value="${l.language_id}">${l.language_name}</option>`
    ).join('');

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
                    <h1>Set Up Your Profile</h1>
                    <p>Tell us a bit about yourself</p>
                </div>

                <form id="onboarding-form" class="auth-form">

                    <div class="form-group">
                        <label for="bio">Bio</label>
                        <textarea id="bio" placeholder="Tell us about yourself..."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="country_id">Country</label>
                        <select id="country_id">
                            <option value="">Select your country</option>
                            ${countryOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="language_id">Language</label>
                        <select id="language_id">
                            <option value="">Select your language</option>
                            ${languageOptions}
                        </select>
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