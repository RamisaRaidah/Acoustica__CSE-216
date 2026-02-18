import router from './utils/routers.js';
import { loadSidebar } from './components/sidebar/sidebar.js';
import { loadTopbar } from './components/topbar/topbar.js';
import { renderHome } from './pages/home/home.js';
import { renderAssets } from './pages/assets/assets.js';
import { renderMusic } from './pages/music_player/music_player.js';


router.register('/', renderHome);
router.register('/home', renderHome);
router.register('/assets', renderAssets);
router.register('/music/songs/{id}', renderMusic);


document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    router.navigate(e.target.getAttribute('href'));
  }
});

router.init();
// loadSidebar();
loadTopbar();