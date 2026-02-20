import router from './utils/routers.js';
import { renderDashboard } from './pages/dashboard/dashboard.js';
import { renderMusic } from './pages/music_player/music_player.js';
import { renderSignIn } from './pages/auth/sign_in.js';
import { renderSignUp } from './pages/auth/sign-up.js';
import { renderOnboarding } from './pages/auth/onboarding.js';

router.register('/dashboard', renderDashboard);
router.register('/music/songs/{id}', renderMusic);

router.register('/sign-in',renderSignIn,{publicOnly:true});
router.register('/sign-up',renderSignUp,{publicOnly:true});
router.register('/onboarding',renderOnboarding,{protected:true});

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();
