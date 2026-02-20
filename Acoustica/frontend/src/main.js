import router from '/src/utils/routers.js';
import { renderSignIn } from '/src/pages/auth/Sign-in/sign_in.js';
import { renderSignUp } from '/src/pages/auth/Sign-up/sign-up.js';
import { renderOnboarding } from '/src/pages/auth/Onboarding/onboarding.js';
import { renderDashboard } from '/src/pages/user/dashboard/dashboard.js';
import { renderUploadSong } from '/src/pages/music/upload_song/upload_song.js';

router.register('/sign-in', renderSignIn, { publicOnly: true });
router.register('/sign-up', renderSignUp, { publicOnly: true });
router.register('/onboarding', renderOnboarding, { protected: true });
router.register('/dashboard', renderDashboard, { protected: true });
router.register('/music/upload-song', renderUploadSong, { protected: true });

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();
