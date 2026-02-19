import router from './utils/routers.js';
import { renderDashboard } from './pages/dashboard/dashboard.js';
import { renderMusic } from './pages/music_player/music_player.js';

router.register('/dashboard', renderDashboard);
router.register('/music/songs/{id}', renderMusic);

document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();
